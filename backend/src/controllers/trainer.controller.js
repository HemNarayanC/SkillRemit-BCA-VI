import {
    Trainer, TrainingCourse, CourseSkill, Skill, User,
} from "../models/index.js";
import { Op } from "sequelize";

// ── helpers ──────────────────────────────────────────────────
const includeUser = [{ model: User, attributes: ["name", "email", "phone", "profile_image"] }];
const includeCourseSkills = [{ model: Skill, through: { attributes: [] } }];

// ── CREATE trainer profile ────────────────────────────────────
const createTrainerProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const existing = await Trainer.findOne({ where: { user_id: userId } });
        if (existing) {
            return res.status(400).json({ message: "Trainer profile already exists." });
        }

        const { organization_name, contact_info } = req.body;
        if (!organization_name || !contact_info) {
            return res.status(400).json({ message: "Organization name and contact info are required." });
        }

        const trainer = await Trainer.create({
            user_id: userId,
            organization_name,
            contact_info,
            verified: false,
        });

        const user = await User.findByPk(userId);
        console.log("User roles before update:", user.roles, user.roles.length);
        if (!user.roles.includes("trainer")) {
            const updatedRoles = [...user.roles, "trainer"];
            user.set("roles", updatedRoles);
            await user.save();
        }

        return res.status(201).json({ message: "Trainer profile created.", trainer });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error." });
    }
};

// ── GET trainer profile ───────────────────────────────────────
const getTrainerProfile = async (req, res) => {
    try {
        const trainer = await Trainer.findOne({
            where: { user_id: req.user.user_id },
            include: includeUser,
        });
        if (!trainer) return res.status(404).json({ message: "Trainer profile not found." });
        return res.json(trainer);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error." });
    }
};

// ── UPDATE trainer profile ────────────────────────────────────
const updateTrainerProfile = async (req, res) => {
    try {
        const trainer = await Trainer.findOne({ where: { user_id: req.user.user_id } });
        if (!trainer) return res.status(404).json({ message: "Trainer profile not found." });

        const { organization_name, contact_info } = req.body;
        await trainer.update({ organization_name, contact_info });

        return res.json({ message: "Trainer profile updated.", trainer });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error." });
    }
};

// ── LIST verified trainers (public) ──────────────────────────
const listVerifiedTrainers = async (req, res) => {
    try {
        const trainers = await Trainer.findAll({
            where: { verified: true },
            include: [{ model: User, attributes: ["name", "profile_image"] }],
        });
        return res.json({ trainers });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error." });
    }
};

// ── ADMIN: verify trainer ─────────────────────────────────────
const verifyTrainer = async (req, res) => {
    try {
        const { trainer_id } = req.params;
        const { verification_status } = req.body;

        if (!['pending', 'verified', 'rejected'].includes(verification_status)) {
            return res.status(400).json({ message: "Invalid verification status." });
        }

        const trainer = await Trainer.findByPk(trainer_id);
        if (!trainer) {
            return res.status(404).json({ message: "Trainer not found." });
        }

        await trainer.update({ verification_status });

        return res.status(200).json({
            message: "Trainer verification updated.",
            trainer
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error." });
    }
};

// ── GET trainer's courses ─────────────────────────────────────
const getTrainerCourses = async (req, res) => {
    try {
        const trainer = await Trainer.findOne({ where: { user_id: req.user.user_id } });
        if (!trainer) return res.status(404).json({ message: "Trainer profile not found." });

        const courses = await TrainingCourse.findAll({
            where: { trainer_id: trainer.trainer_id },
            include: includeCourseSkills,
            order: [["course_id", "DESC"]],
        });

        return res.json({ courses });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error." });
    }
};

// ── CREATE course ─────────────────────────────────────────────
const createCourse = async (req, res) => {
    try {
        const trainer = await Trainer.findOne({
            where: { user_id: req.user.user_id }
        });

        if (!trainer) {
            return res.status(404).json({ message: "Trainer profile not found." });
        }

        const {
            title,
            description,
            difficulty,
            duration,
            price,
            language,
            skill_ids
        } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Course title is required." });
        }

        // Create course
        const course = await TrainingCourse.create({
            trainer_id: trainer.trainer_id,
            title,
            description: description || null,
            difficulty: difficulty || null,
            duration: duration || null,
            price: price !== undefined ? parseFloat(price) : null,
            language: language || "en",
            enrollment_count: 0,   // default
            is_active: true        // default
        });

        // Attach skills
        if (Array.isArray(skill_ids) && skill_ids.length > 0) {
            const courseSkills = skill_ids.map(skill_id => ({
                course_id: course.course_id,
                skill_id
            }));

            await CourseSkill.bulkCreate(courseSkills, {
                ignoreDuplicates: true
            });
        }

        // Fetch full course with skills
        const fullCourse = await TrainingCourse.findByPk(course.course_id, {
            include: includeCourseSkills
        });

        return res.status(201).json({
            message: "Course created successfully.",
            course: fullCourse
        });

    } catch (err) {
        console.error("Create course error:", err);
        return res.status(500).json({ message: "Server error." });
    }
};

// ── UPDATE course ─────────────────────────────────────────────
const updateCourse = async (req, res) => {
    try {
        const { course_id } = req.params;
        const trainer = await Trainer.findOne({ where: { user_id: req.user.user_id } });
        if (!trainer) return res.status(404).json({ message: "Trainer profile not found." });

        const course = await TrainingCourse.findOne({
            where: { course_id, trainer_id: trainer.trainer_id },
        });
        if (!course) return res.status(404).json({ message: "Course not found." });

        const { title, description, difficulty, duration, price, language } = req.body;
        await course.update({ title, description, difficulty, duration, price, language });

        return res.json({ message: "Course updated.", course });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error." });
    }
};

// ── DELETE course ─────────────────────────────────────────────
const deleteCourse = async (req, res) => {
    try {
        const { course_id } = req.params;
        const trainer = await Trainer.findOne({ where: { user_id: req.user.user_id } });
        if (!trainer) return res.status(404).json({ message: "Trainer profile not found." });

        const course = await TrainingCourse.findOne({
            where: { course_id, trainer_id: trainer.trainer_id },
        });
        if (!course) return res.status(404).json({ message: "Course not found." });

        await CourseSkill.destroy({ where: { course_id } });
        await course.destroy();

        return res.json({ message: "Course deleted." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error." });
    }
};

// ── ADD skill to course ───────────────────────────────────────
const addCourseSkill = async (req, res) => {
    try {
        const { course_id } = req.params;
        const { skill_id } = req.body;
        await CourseSkill.findOrCreate({ where: { course_id, skill_id } });
        return res.json({ message: "Skill added to course." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error." });
    }
};

// ── REMOVE skill from course ──────────────────────────────────
const removeCourseSkill = async (req, res) => {
    try {
        const { course_id, skill_id } = req.params;
        await CourseSkill.destroy({ where: { course_id, skill_id } });
        return res.json({ message: "Skill removed from course." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error." });
    }
};

// ── PUBLIC: list all courses (with filters) ───────────────────
const listPublicCourses = async (req, res) => {
    try {
        const { difficulty, language, skill_id, limit = 20, offset = 0 } = req.query;
        const where = {};
        if (difficulty) where.difficulty = difficulty;
        if (language) where.language = language;

        const include = [
            { model: Skill, through: { attributes: [] } },
            { model: Trainer, include: [{ model: User, attributes: ["name"] }] },
        ];

        const { count, rows } = await TrainingCourse.findAndCountAll({
            where,
            include,
            limit: Math.min(parseInt(limit), 50),
            offset: parseInt(offset),
            order: [["course_id", "DESC"]],
        });

        // Filter by skill post-query if needed (Sequelize junction through filter is complex)
        let courses = rows;
        if (skill_id) {
            courses = rows.filter(c => c.Skills?.some(s => s.skill_id == skill_id));
        }

        return res.json({ courses, total: count });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error." });
    }
};

const listAllTrainers = async (req, res) => {
    try {
        const { status } = req.query;

        // Build where clause
        const where = {};

        if (status && status !== "all") {
            where.verification_status = status;  // ✅ ENUM filtering
        }

        // Fetch trainers with associated User
        const trainers = await Trainer.findAll({
            where: where,
            include: [
                {
                    model: User,
                    as: 'User', // Make sure association is defined: Trainer.belongsTo(User, { foreignKey: 'user_id', as: 'User' })
                    attributes: ['user_id', 'name', 'email', 'phone', 'is_verified', 'created_at']
                }
            ],
            order: [['trainer_id', 'ASC']]
        });

        res.json(trainers); // Return as array of objects with User nested
    } catch (error) {
        console.error('List Trainers Error:', error);
        res.status(500).json({ message: 'Failed to fetch trainers' });
    }
};

export {
    createTrainerProfile,
    getTrainerProfile,
    updateTrainerProfile,
    listVerifiedTrainers,
    verifyTrainer,
    getTrainerCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    addCourseSkill,
    removeCourseSkill,
    listPublicCourses,
    listAllTrainers
}