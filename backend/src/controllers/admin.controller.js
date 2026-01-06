import { Employer, Job, Skill } from "../models/index.js";

// Get all employers (optionally filtered by verification status)
const listAllEmployers = async (req, res) => {
  try {
    const { status } = req.query; // optional: pending / verified / rejected
    const where = status ? { verification_status: status } : {};

    const employers = await Employer.findAll({ where });
    return res.json(employers);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Verify or reject employer
const verifyEmployer = async (req, res) => {
  try {
    const { employer_id } = req.params;
    const { status, note } = req.body; // status: verified / rejected

    const employer = await Employer.findByPk(employer_id);
    if (!employer) return res.status(404).json({ message: 'Employer not found' });

    employer.verification_status = status;
    employer.verified_at = new Date();
    employer.verified_by = req.user.user_id; // Admin ID
    employer.verification_note = note;

    await employer.save();
    return res.json({ message: 'Employer verification updated', employer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get all jobs (optional filter by status)
const listAllJobs = async (req, res) => {
  try {
    const { status } = req.query; // optional: open / closed
    const where = status ? { status } : {};

    const jobs = await Job.findAll({ where });
    return res.json(jobs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

//create and add the skill
const addSkill = async (req, res) => {
  try {
    const { name } = req.body;
    const skill = await Skill .create({ name });
    return res.status(201).json({ message: 'Skill added', skill });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export {
  listAllEmployers,
  verifyEmployer,
  listAllJobs,
  addSkill
}