import { Job, Employer, JobApplication, JobSeeker, User, Skill } from "../models/index.js";
import { Op } from "sequelize";

export const getJobApplicants = async (req, res) => {
  try {
    const { job_id } = req.params;
    const { status } = req.query;

    const employer = await Employer.findOne({ where: { user_id: req.user.user_id } });
    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    const job = await Job.findOne({
      where: {
        job_id: job_id,
        employer_id: employer.employer_id
      }
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found or unauthorized" });
    }

    const where = { job_id: job_id };
    if (status) {
      where.status = status;
    }

    const applications = await JobApplication.findAll({
      where,
      include: [
        {
          model: JobSeeker,
          include: [
            {
              model: User,
              attributes: ['user_id', 'name', 'email', 'phone', 'profile_image']
            },
            {
              model: Skill,
              as: 'skills',
              through: { attributes: ['proficiency_level'] }
            }
          ]
        }
      ],
      order: [['applied_at', 'DESC']]
    });

    return res.json({ applications });

  } catch (error) {
    console.error("Get job applicants error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAllApplicants = async (req, res) => {
  try {
    const { status } = req.query;

    const employer = await Employer.findOne({ where: { user_id: req.user.user_id } });
    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    const jobs = await Job.findAll({
      where: { employer_id: employer.employer_id },
      attributes: ['job_id']
    });

    const jobIds = jobs.map(j => j.job_id);

    const where = { job_id: { [Op.in]: jobIds } };
    if (status) {
      where.status = status;
    }

    const applications = await JobApplication.findAll({
      where,
      include: [
        {
          model: Job,
          attributes: ['job_id', 'title', 'location']
        },
        {
          model: JobSeeker,
          include: [
            {
              model: User,
              attributes: ['user_id', 'name', 'email', 'phone', 'profile_image']
            },
            {
              model: Skill,
              as: 'skills',
              through: { attributes: ['proficiency_level'] }
            }
          ]
        }
      ],
      order: [['applied_at', 'DESC']]
    });

    return res.json({ applications });

  } catch (error) {
    console.error("Get all applicants error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getApplicantDetails = async (req, res) => {
  try {
    const { application_id } = req.params;

    const employer = await Employer.findOne({ where: { user_id: req.user.user_id } });
    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    const application = await JobApplication.findOne({
      where: { application_id: application_id },
      include: [
        {
          model: Job,
          where: { employer_id: employer.employer_id },
          attributes: ['job_id', 'title', 'description', 'location']
        },
        {
          model: JobSeeker,
          include: [
            {
              model: User,
              attributes: ['user_id', 'name', 'email', 'phone', 'profile_image']
            },
            {
              model: Skill,
              as: 'skills',
              through: { attributes: ['proficiency_level'] }
            }
          ]
        }
      ]
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found or unauthorized" });
    }

    return res.json({ application });

  } catch (error) {
    console.error("Get applicant details error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { application_id } = req.params;
    const { status } = req.body;

    if (!['pending', 'shortlisted', 'rejected', 'hired'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const employer = await Employer.findOne({ where: { user_id: req.user.user_id } });
    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    const application = await JobApplication.findOne({
      where: { application_id: application_id },
      include: [
        {
          model: Job,
          where: { employer_id: employer.employer_id }
        }
      ]
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found or unauthorized" });
    }

    await application.update({ status });

    return res.json({
      message: `Application status updated to ${status}`,
      application
    });

  } catch (error) {
    console.error("Update application status error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const shortlistApplicant = async (req, res) => {
  try {
    const { application_id } = req.params;

    const employer = await Employer.findOne({ where: { user_id: req.user.user_id } });
    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    const application = await JobApplication.findOne({
      where: { application_id: application_id },
      include: [
        {
          model: Job,
          where: { employer_id: employer.employer_id }
        }
      ]
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found or unauthorized" });
    }

    await application.update({ status: 'shortlisted' });

    return res.json({
      message: "Applicant shortlisted successfully",
      application
    });

  } catch (error) {
    console.error("Shortlist applicant error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const rejectApplicant = async (req, res) => {
  try {
    const { application_id } = req.params;

    const employer = await Employer.findOne({ where: { user_id: req.user.user_id } });
    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    const application = await JobApplication.findOne({
      where: { application_id: application_id },
      include: [
        {
          model: Job,
          where: { employer_id: employer.employer_id }
        }
      ]
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found or unauthorized" });
    }

    await application.update({ status: 'rejected' });

    return res.json({
      message: "Applicant rejected",
      application
    });

  } catch (error) {
    console.error("Reject applicant error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const hireApplicant = async (req, res) => {
  try {
    const { application_id } = req.params;

    const employer = await Employer.findOne({ where: { user_id: req.user.user_id } });
    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    const application = await JobApplication.findOne({
      where: { application_id: application_id },
      include: [
        {
          model: Job,
          where: { employer_id: employer.employer_id }
        }
      ]
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found or unauthorized" });
    }

    await application.update({ status: 'hired' });

    return res.json({
      message: "Applicant hired successfully",
      application
    });

  } catch (error) {
    console.error("Hire applicant error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getApplicantStats = async (req, res) => {
  try {
    const employer = await Employer.findOne({ where: { user_id: req.user.user_id } });
    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    const jobs = await Job.findAll({
      where: { employer_id: employer.employer_id },
      attributes: ['job_id']
    });

    const jobIds = jobs.map(j => j.job_id);

    const total = await JobApplication.count({
      where: { job_id: { [Op.in]: jobIds } }
    });

    const pending = await JobApplication.count({
      where: { job_id: { [Op.in]: jobIds }, status: 'pending' }
    });

    const shortlisted = await JobApplication.count({
      where: { job_id: { [Op.in]: jobIds }, status: 'shortlisted' }
    });

    const rejected = await JobApplication.count({
      where: { job_id: { [Op.in]: jobIds }, status: 'rejected' }
    });

    const hired = await JobApplication.count({
      where: { job_id: { [Op.in]: jobIds }, status: 'hired' }
    });

    return res.json({
      stats: {
        total_applications: total,
        pending,
        shortlisted,
        rejected,
        hired
      }
    });

  } catch (error) {
    console.error("Get applicant stats error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};