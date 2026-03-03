import { AIJobMatch, Employer, Job, JobApplication, JobRequiredSkill, JobSeeker, Skill, User } from "../models/index.js";

// Create / Register Employer Profile
const createEmployer = async (req, res) => {
    console.log('Creating employer profile with data:', req.body);
    try {
        const {
            company_name,
            business_type,
            registration_number,
            registered_country,
            address,
            document_type
        } = req.body;

        // Check if user already has employer profile
        const existing = await Employer.findOne({ where: { user_id: req.user.user_id } });
        if (existing) {
            return res.status(400).json({ message: 'Employer profile already exists' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'At least one document is required' });
        }

        // Collect all uploaded Cloudinary URLs
        const documents = req.files.map(file => file.path);

        const employer = await Employer.create({
            user_id: req.user.user_id,
            company_name,
            business_type,
            registration_number,
            registered_country,
            address,
            document_type,
            document_urls: documents
        });

        const user = await User.findByPk(req.user.user_id);
        if (!user.roles.includes("employer")) {
            const updatedRoles = [...user.roles, "employer"];
            user.set("roles", updatedRoles);
            await user.save();
        }

        return res.status(201).json({ message: 'Employer profile created', employer });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Get Employer Profile
// const getEmployerProfile = async (req, res) => {
//     try {
//         const employer = await Employer.findOne({
//             where: { user_id: req.user.user_id }
//         });

//         if (!employer) {
//             return res.status(404).json({ message: 'Employer profile not found' });
//         }

//         return res.json(employer);
//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({ message: 'Server error' });
//     }
// };

const getEmployerProfile = async (req, res) => {
    try {
        const userId = req.user?.user_id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const profile = await Employer.findOne({
            where: { user_id: userId },
            include: [
                {
                    model: User,
                    attributes: { exclude: ["password_hash"] }
                }
            ]
        });

        if (!profile) return res.status(404).json({ message: "Employer profile not found" });

        return res.json(profile); // now profile.User contains full user info
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Update Employer Profile (before verification)
const updateEmployerProfile = async (req, res) => {
    try {
        const employer = await Employer.findOne({ where: { user_id: req.user.user_id } });
        if (!employer) return res.status(404).json({ message: 'Employer profile not found' });
        console.log('Current employer profile:', employer);

        // Only allow update if not verified
        if (employer.verification_status === 'verified') {
            return res.status(403).json({ message: 'Cannot update verified profile' });
        }

        const updatedFields = req.body; // Should validate fields in real scenario
        await employer.update(updatedFields);

        return res.json({ message: 'Employer profile updated', employer });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Admin Verification of Employer
const verifyEmployer = async (req, res) => {
    try {
        const { employer_id } = req.params;
        const { status, note } = req.body; // status = 'verified' or 'rejected'

        const employer = await Employer.findByPk(employer_id);
        if (!employer) return res.status(404).json({ message: 'Employer not found' });

        employer.verification_status = status;
        employer.verified_at = new Date();
        employer.verified_by = req.user.user_id; // Admin user
        employer.verification_note = note;

        await employer.save();

        return res.json({ message: 'Employer verification updated', employer });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// List all verified employers (public endpoint)
const listVerifiedEmployers = async (req, res) => {
    try {
        const employers = await Employer.findAll({
            where: { verification_status: 'verified' }
        });
        return res.json(employers);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getAICandidates = async (req, res) => {
    try {
        const { job_id } = req.params;

        // Verify the job belongs to this employer
        const employer = await Employer.findOne({ where: { user_id: req.user.user_id } });
        if (!employer) return res.status(404).json({ message: "Employer profile not found" });

        const job = await Job.findOne({
            where: { job_id, employer_id: employer.employer_id },
        });
        if (!job) return res.status(404).json({ message: "Job not found" });

        // Fetch all applications with jobseeker profile + skills + AI score
        const applications = await JobApplication.findAll({
            where: { job_id },
            include: [
                {
                    model: JobSeeker,
                    include: [
                        { model: User, attributes: ["name", "email", "profile_image"] },
                        {
                            model: Skill,
                            as: "skills",
                            through: { attributes: ["proficiency_level"] },
                        },
                    ],
                },
            ],
            order: [["applied_at", "DESC"]],
        });

        // Fetch any existing AI match scores for this job
        const aiScores = await AIJobMatch.findAll({ where: { job_id } });
        const scoreMap = {};
        for (const s of aiScores) {
            scoreMap[s.jobseeker_id] = parseFloat(s.match_score || 0);
        }

        // Get skills required for this job (via JobRequiredSkill join table)
        const reqSkills = await JobRequiredSkill.findAll({ where: { job_id } });
        const reqSkillIds = new Set(reqSkills.map(r => r.skill_id));

        // Also parse skills_required text field as fallback
        let reqSkillNames = new Set();
        if (job.skills_required) {
            try {
                const arr = JSON.parse(job.skills_required);
                arr.forEach(s => reqSkillNames.add(s.toLowerCase().trim()));
            } catch {
                job.skills_required.split(",").forEach(s => reqSkillNames.add(s.toLowerCase().trim()));
            }
        }

        // Build candidate list with scores
        const candidates = applications.map(app => {
            const js = app.JobSeeker;
            if (!js) return null;

            const jsid = js.jobseeker_id;
            let match_score = scoreMap[jsid]; // from AI

            // Fallback: compute skill-overlap score if no AI score
            if (match_score == null) {
                const mySkillIds = new Set((js.skills || []).map(s => s.skill_id));
                const mySkillNames = new Set((js.skills || []).map(s => s.skill_name?.toLowerCase()));

                let overlap = 0;
                let total = reqSkillIds.size + reqSkillNames.size;

                if (total === 0 && js.skills?.length > 0) {
                    // No required skills specified — score based on total skills (max 80%)
                    match_score = Math.min(80, js.skills.length * 10);
                } else {
                    reqSkillIds.forEach(id => { if (mySkillIds.has(id)) overlap++; });
                    reqSkillNames.forEach(name => { if (mySkillNames.has(name)) overlap++; });
                    match_score = total > 0 ? Math.round((overlap / Math.max(total, 1)) * 100) : 0;
                }
            }

            return {
                application_id: app.application_id,
                jobseeker_id: jsid,
                status: app.status,
                applied_at: app.applied_at,
                cover_letter: app.cover_letter,
                match_score,
                name: js.User?.name || "Unknown",
                email: js.User?.email,
                profile_image: js.User?.profile_image,
                years_of_experience: js.years_of_experience,
                current_location: js.current_location,
                skills: (js.skills || []).map(s => ({
                    skill_id: s.skill_id,
                    skill_name: s.skill_name,
                    proficiency_level: s.JobSeekerSkill?.proficiency_level,
                })),
            };
        }).filter(Boolean);

        // Sort by match_score descending (AI-ranked)
        candidates.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

        return res.json({
            candidates,
            job: { job_id: job.job_id, title: job.title, status: job.status },
            total: candidates.length,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

export {
    createEmployer,
    getEmployerProfile,
    updateEmployerProfile,
    verifyEmployer,
    listVerifiedEmployers,
    getAICandidates
}
