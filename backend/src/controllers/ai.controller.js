import axios from 'axios';
import { Job, JobSeeker, TrainingCourse, JobSeekerSkill, Skill } from '../models/index.js';

export const analyzeJobMatch = async (req, res) => {
  const { job_id, jobseeker_id } = req.params;

  try {
    const job = await Job.findByPk(job_id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    let jobSkills = [];
    if (job.skills_required) {
      try {
        jobSkills = JSON.parse(job.skills_required);
      } catch {
        jobSkills = job.skills_required.split(',').map(s => s.trim());
      }
    }

    const seeker = await JobSeeker.findByPk(jobseeker_id, {
      include: [
        {
          model: Skill,
          as: 'skills',
          through: { model: JobSeekerSkill },
        },
      ],
    });
    if (!seeker) return res.status(404).json({ message: 'JobSeeker not found' });

    const seekerSkills = (seeker.skills || []).map(skill => skill.skill_name);

    const courses = await TrainingCourse.findAll({
      include: [
        {
          model: Skill,
          as: 'Skills',
        },
      ],
    });

    const coursesPayload = (courses || []).map(course => ({
      title: course.title,
      skills: (course.Skills || []).map(s => s.skill_name),
    }));

    const payload = {
      jobDescription: job.description,
      skillDescription: job.skill_description || '',
      skills_required: jobSkills,
      seekerDescription: seeker.skill_description || '',
      seekerSkills: seekerSkills,
      courses: coursesPayload,
    };

    console.log(JSON.stringify(payload, null, 2));

    const response = await axios.post('http://localhost:8000/analyze-match', payload);

    return res.json(response.data);

  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: 'Error analyzing job match' });
  }
};
