import { Job, Employer } from '../models/index.js';
// Create a new job
export const createJob = async (req, res) => {
  try {
    const employer = await Employer.findOne({ where: { user_id: req.user.user_id } });
    if (!employer || employer.verification_status !== 'verified') {
      return res.status(403).json({ message: 'Employer not verified or profile missing' });
    }

    const { title, description, location, salary_min, salary_max, skills_required } = req.body;
    const image = req.file ? req.file.path : null;

    const job = await Job.create({
      employer_id: employer.employer_id,
      title,
      description,
      location,
      salary_min,
      salary_max,
      image,
      skills_required
    });

    return res.status(201).json({ message: 'Job created', job });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get all jobs posted by logged-in employer
export const getEmployerJobs = async (req, res) => {
  try {
    const employer = await Employer.findOne({ where: { user_id: req.user.user_id } });
    if (!employer) return res.status(404).json({ message: 'Employer profile not found' });

    const jobs = await Job.findAll({ where: { employer_id: employer.employer_id } });
    return res.json(jobs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update job (only by owner)
export const updateJob = async (req, res) => {
  try {
    const { job_id } = req.params;
    const employer = await Employer.findOne({ where: { user_id: req.user.user_id } });
    if (!employer) return res.status(404).json({ message: 'Employer profile not found' });

    const job = await Job.findOne({ where: { job_id, employer_id: employer.employer_id } });
    if (!job) return res.status(404).json({ message: 'Job not found or not yours' });

    const { title, description, location, salary_min, salary_max, image, skills_required } = req.body;

    await job.update({
      title: title || job.title,
      description: description || job.description,
      location: location || job.location,
      salary_min: salary_min || job.salary_min,
      salary_max: salary_max || job.salary_max,
      image: image || job.image,
      skills_required: skills_required || job.skills_required
    });
    return res.json({ message: 'Job updated', job });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Close a job
export const closeJob = async (req, res) => {
  try {
    const { job_id } = req.params;
    const employer = await Employer.findOne({ where: { user_id: req.user.user_id } });
    if (!employer) return res.status(404).json({ message: 'Employer profile not found' });

    const job = await Job.findOne({ where: { job_id, employer_id: employer.employer_id } });
    if (!job) return res.status(404).json({ message: 'Job not found or not yours' });

    job.status = 'closed';
    await job.save();

    return res.json({ message: 'Job closed', job });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Public: List all open jobs
export const listOpenJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({ where: { status: 'open' } });
    return res.json(jobs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
