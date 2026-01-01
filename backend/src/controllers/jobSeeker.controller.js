import { JobSeeker, JobSeekerSkill, Skill } from "../models/index.js";


// CREATE JOBSEEKER PROFILE
const createJobSeekerProfile = async (req, res) => {
  // console.log("Job Seeker Profile Creation", req.body);
  try {
    const userId = req.user.user_id;

    const {
      current_location,
      remittance_district,
      skill_description,
      years_of_experience,
      skills // [{ skill_id, proficiency_level }]
    } = req.body;

    // Prevent duplicate profile
    const existingProfile = await JobSeeker.findOne({ where: { user_id: userId } });
    if (existingProfile) {
      return res.status(400).json({ message: "JobSeeker profile already exists." });
    }

    // Handle uploaded documents/images
    let documentUrls = null;
    if (req.files && req.files.length > 0) {
      documentUrls = req.files.map(file => file.path); // Cloudinary URLs
    }

    // Create profile
    const jobSeeker = await JobSeeker.create({
      user_id: userId,
      current_location,
      remittance_district,
      skill_description,
      years_of_experience,
      document_urls: documentUrls
    });

    // Insert skills
    // console.log('Received skills:', req.body.skills);
    let skillsArray = [];
    if (req.body.skills) {
      try {
        skillsArray = typeof req.body.skills === 'string' ? JSON.parse(req.body.skills) : req.body.skills;
      } catch (err) {
        console.error('Error parsing skills:', err);
        skillsArray = [];
      }
    }

    console.log('Skills array:', skillsArray);

    if (skillsArray.length > 0) {
      const records = skillsArray.map(skill => ({
        jobseeker_id: jobSeeker.jobseeker_id,
        skill_id: skill.skill_id,
        proficiency_level: skill.proficiency_level || 'basic'
      }));
      await JobSeekerSkill.bulkCreate(records);
    }


    return res.status(201).json({
      message: "JobSeeker profile created successfully",
      profile: jobSeeker
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error." });
  }
};

// GET JOBSEEKER PROFILE
const getJobSeekerProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const profile = await JobSeeker.findOne({
      where: { user_id: userId },
      include: [
        {
          model: Skill,
          as: 'skills',
          through: { attributes: ['proficiency_level'] }
        }
      ]
    });

    if (!profile) return res.status(404).json({ message: "Profile not found." });

    return res.json(profile);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error." });
  }
};

export {
  createJobSeekerProfile,
  getJobSeekerProfile
}