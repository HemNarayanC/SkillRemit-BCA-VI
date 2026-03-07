import { Op } from "sequelize";
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

        const isPremium = employer.is_premium || false;
        const checksUsed = employer.ai_checks_used || 0;
        const AI_FREE_LIMIT = parseInt(process.env.AI_FREE_LIMIT || "5", 10);

        // Block if free-tier limit reached
        if (!isPremium && checksUsed >= AI_FREE_LIMIT) {
            return res.status(403).json({
                limit_reached: true,
                ai_checks_used: checksUsed,
                ai_checks_limit: AI_FREE_LIMIT,
                is_premium: false,
                message: `Free tier limit of ${AI_FREE_LIMIT} reached. Upgrade to Premium.`,
            });
        }

        const job = await Job.findOne({ where: { job_id, employer_id: employer.employer_id } });
        if (!job) return res.status(404).json({ message: "Job not found" });

        // Fetch applications, skills, AI scores (existing logic)
        const applications = await JobApplication.findAll({ 
            where: { job_id },
            include: [
                { model: JobSeeker, include: [
                    { model: User, attributes: ["name","email","profile_image"] },
                    { model: Skill, as:"skills", through:{ attributes:["proficiency_level"] } },
                ]},
            ],
            order: [["applied_at","DESC"]],
        });

        const aiScores = await AIJobMatch.findAll({ where: { job_id } });
        const scoreMap = {};
        for (const s of aiScores) scoreMap[s.jobseeker_id] = parseFloat(s.match_score || 0);

        const reqSkills = await JobRequiredSkill.findAll({ where: { job_id } });
        const reqSkillIds = new Set(reqSkills.map(r => r.skill_id));

        let reqSkillNames = new Set();
        if (job.skills_required) {
            try { JSON.parse(job.skills_required).forEach(s=>reqSkillNames.add(s.toLowerCase().trim())); }
            catch { job.skills_required.split(",").forEach(s=>reqSkillNames.add(s.toLowerCase().trim())); }
        }

        const candidates = applications.map(app => {
            const js = app.JobSeeker;
            if (!js) return null;

            let match_score = scoreMap[js.jobseeker_id];
            if (match_score == null) {
                const myIds = new Set((js.skills||[]).map(s=>s.skill_id));
                const myNames = new Set((js.skills||[]).map(s=>s.skill_name?.toLowerCase()));
                let overlap=0, total=reqSkillIds.size+reqSkillNames.size;

                if(total===0 && js.skills?.length>0) match_score=Math.min(80,js.skills.length*10);
                else {
                    reqSkillIds.forEach(id=>{if(myIds.has(id))overlap++;});
                    reqSkillNames.forEach(n=>{if(myNames.has(n))overlap++;});
                    match_score=total>0 ? Math.round((overlap/Math.max(total,1))*100) : 0;
                }
            }

            return {
                application_id: app.application_id,
                jobseeker_id: js.jobseeker_id,
                status: app.status,
                applied_at: app.applied_at,
                cover_letter: app.cover_letter,
                match_score,
                name: js.User?.name || "Unknown",
                email: js.User?.email,
                profile_image: js.User?.profile_image,
                years_of_experience: js.years_of_experience,
                current_location: js.current_location,
                skills: (js.skills||[]).map(s=>({ skill_id:s.skill_id, skill_name:s.skill_name, proficiency_level:s.JobSeekerSkill?.proficiency_level })),
            };
        }).filter(Boolean);

        candidates.sort((a,b)=>(b.match_score||0)-(a.match_score||0));

        // **Increment AI checks for free-tier**
        if (!isPremium) await employer.increment("ai_checks_used");

        return res.json({
            candidates,
            job: { job_id: job.job_id, title: job.title, status: job.status },
            total: candidates.length,
            ai_checks_used: employer.ai_checks_used + 1, // updated count
            ai_checks_limit: AI_FREE_LIMIT,
            is_premium: isPremium,
            limit_reached: false
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

const getEmployerDashboard = async (req, res) => {
  try {
    const userId   = req.user.user_id;
    const employer = await Employer.findOne({ where: { user_id: userId } });
    if (!employer) return res.status(404).json({ message: "Employer profile not found" });

    const eid = employer.employer_id;

    const [jobs, totalApps, shortlisted, hired, rejected, recentApplicants] = await Promise.all([
      Job.count({ where: { employer_id: eid, status: { [Op.ne]: "closed" } } }),
      // total applications across all employer jobs
      JobApplication.count({
        include: [{ model: Job, where: { employer_id: eid }, attributes: [] }]
      }),
      JobApplication.count({
        where: { status: "shortlisted" },
        include: [{ model: Job, where: { employer_id: eid }, attributes: [] }]
      }),
      JobApplication.count({
        where: { status: "hired" },
        include: [{ model: Job, where: { employer_id: eid }, attributes: [] }]
      }),
      JobApplication.count({
        where: { status: "rejected" },
        include: [{ model: Job, where: { employer_id: eid }, attributes: [] }]
      }),
      // Recent 5 applicants
      JobApplication.findAll({
        limit: 5,
        order: [["applied_at", "DESC"]],
        include: [
          { model: Job, where: { employer_id: eid }, attributes: ["title"] },
          {
            model: JobSeeker,
            include: [{ model: User, attributes: ["name", "email", "profile_image"] }]
          }
        ]
      }),
    ]);

    return res.json({
      profile: { company_name: employer.company_name },
      total_jobs: jobs,
      total_applications: totalApps,
      shortlisted,
      hired,
      rejected,
      pending: totalApps - shortlisted - hired - rejected,
      recent_applicants: recentApplicants.map(a => ({
        application_id: a.application_id,
        status:         a.status,
        applied_at:     a.applied_at,
        job_title:      a.Job?.title,
        name:           a.JobSeeker?.User?.name,
        email:          a.JobSeeker?.User?.email,
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


const getHiringAnalytics = async (req, res) => {
  try {
    const employer = await getEmp(req.user.user_id);
    if (!employer) return res.status(404).json({ message: "Not found" });
    const jobs = await Job.findAll({ where: { employer_id: employer.employer_id } });
    const jobIds = jobs.map(j=>j.job_id);
    if (!jobIds.length) return res.json({ funnelStats:{}, monthly:[], byJob:[] });
    const allApps = await JobApplication.findAll({ where: { job_id: { [Op.in]: jobIds } } });
    const funnelStats = { applied:allApps.length, pending:allApps.filter(a=>a.status==="pending").length, shortlisted:allApps.filter(a=>a.status==="shortlisted").length, hired:allApps.filter(a=>a.status==="hired").length, rejected:allApps.filter(a=>a.status==="rejected").length };
    const sixAgo = new Date(); sixAgo.setMonth(sixAgo.getMonth()-5); sixAgo.setDate(1);
    const monthly = await JobApplication.findAll({
      where: { job_id: { [Op.in]: jobIds }, applied_at: { [Op.gte]: sixAgo } },
      attributes: [[sequelize.fn("DATE_FORMAT", sequelize.col("applied_at"), "%Y-%m"), "month"],[sequelize.fn("COUNT", sequelize.col("application_id")), "applications"],[sequelize.literal("SUM(CASE WHEN status='hired' THEN 1 ELSE 0 END)"), "hired"],[sequelize.literal("SUM(CASE WHEN status='shortlisted' THEN 1 ELSE 0 END)"), "shortlisted"]],
      group: [sequelize.fn("DATE_FORMAT", sequelize.col("applied_at"), "%Y-%m")],
      order: [[sequelize.fn("DATE_FORMAT", sequelize.col("applied_at"), "%Y-%m"), "ASC"]], raw: true,
    });
    const byJob = jobs.map(j => { const ja=allApps.filter(a=>a.job_id===j.job_id); return { job_id:j.job_id, title:j.title, status:j.status, applied:ja.length, shortlisted:ja.filter(a=>a.status==="shortlisted").length, hired:ja.filter(a=>a.status==="hired").length, rejected:ja.filter(a=>a.status==="rejected").length }; });
    return res.json({ funnelStats, monthly, byJob });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
};

const requestPremiumUpgrade = async (req, res) => {
  try {
    const employer = await getEmp(req.user.user_id);
    if (!employer) return res.status(404).json({ message: "Not found" });
    if (employer.is_premium) return res.json({ message: "Already premium", is_premium: true });
    await employer.update({ is_premium: true });
    return res.json({ message: "Upgraded to premium", is_premium: true });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
};

export {
    createEmployer,
    getEmployerProfile,
    updateEmployerProfile,
    verifyEmployer,
    listVerifiedEmployers,
    getAICandidates,
    getEmployerDashboard,
    getHiringAnalytics,
    requestPremiumUpgrade
}
