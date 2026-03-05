import axios from 'axios';
import { Job, JobSeeker, TrainingCourse, JobSeekerSkill, Skill, AIJobMatch, Trainer, User, CourseSkill, CourseEnrollment } from '../models/index.js';
import { Op } from 'sequelize';

const FREE_CHECK_LIMIT = parseInt(process.env.AI_FREE_LIMIT || '5', 10);
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const analyzeJobMatch = async (req, res) => {
  const { job_id, jobseeker_id } = req.params;

  try {
    const job = await Job.findByPk(job_id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const seeker = await JobSeeker.findByPk(jobseeker_id, {
      include: [{
        model: Skill,
        as: 'skills',
        through: { model: JobSeekerSkill, attributes: [] },
      }],
    });
    if (!seeker) return res.status(404).json({ message: 'JobSeeker not found' });

    if (!seeker.is_premium && seeker.ai_checks_used >= FREE_CHECK_LIMIT) {
      return res.status(403).json({
        message: 'Free AI check limit reached',
        limit_reached: true,
        checks_used: seeker.ai_checks_used,
        checks_limit: FREE_CHECK_LIMIT,
      });
    }

    let jobSkills = [];
    if (job.skills_required) {
      try { jobSkills = JSON.parse(job.skills_required); }
      catch { jobSkills = job.skills_required.split(',').map(s => s.trim()); }
    }
    const seekerSkills = (seeker.skills || []).map(s => s.skill_name);

    const courses = await TrainingCourse.findAll({
      attributes: [
        'course_id',
        'title',
        'description',
        'difficulty',
        'price',
        'language'
      ],
      include: [
        {
          model: Skill,
          as: "Skills",
          attributes: ["skill_name"],
          through: { model: CourseSkill, attributes: [] }
        },
        {
          model: Trainer,
          attributes: ['trainer_id', 'organization_name', 'verification_status'],
          include: [
            {
              model: User,
              attributes: ['name', 'profile_image']
            }
          ]
        }
      ]
    });

    const coursesPayload = courses.map(course => ({
      course_id: course.course_id,
      title: course.title,
      description: course.description || '',
      difficulty: course.difficulty || null,
      price: course.price != null ? parseFloat(course.price) : null,
      language: course.language || null,
      skills: (course.Skills || []).map(s => s.skill_name),
    }));

    const payload = {
      jobDescription: job.description || '',
      skillDescription: job.skill_description || '',
      skills_required: jobSkills,
      seekerDescription: seeker.skill_description || '',
      seekerSkills,
      courses: coursesPayload,
    };

    const response = await axios.post(`${AI_SERVICE_URL}/analyze-match`, payload);
    const aiResult = response.data;
    console.log('AI analysis result:', JSON.stringify(aiResult, null, 2));

    const suggestedIds = (aiResult.suggested_courses || []).map(c => c.course_id);

    let enrichedSuggestedCourses = [];
    if (suggestedIds.length > 0) {
      const dbCourses = await TrainingCourse.findAll({
        where: { course_id: { [Op.in]: suggestedIds } },
        include: [
          { model: Skill, through: { model: CourseSkill, attributes: [] } },
          {
            model: Trainer,
            attributes: ['trainer_id', 'organization_name', 'verification_status'],
            include: [{ model: User, attributes: ['name', 'profile_image'] }],
          },
        ],
      });

      const dbMap = Object.fromEntries(dbCourses.map(c => [c.course_id, c.toJSON()]));

      enrichedSuggestedCourses = aiResult.suggested_courses
        .filter(c => dbMap[c.course_id])
        .map(c => ({
          ...dbMap[c.course_id],
          relevance_score: c.relevance_score,
          covers_skills: c.covers_skills,
        }));
    }

    const matchScore = aiResult.match_score ?? null;

    await AIJobMatch.upsert(
      {
        job_id: parseInt(job_id),
        jobseeker_id: parseInt(jobseeker_id),
        match_score: matchScore,
        missing_skills: aiResult.missing_skills || [],
        matched_skills: aiResult.matched_skills || [],
        can_apply: aiResult.can_apply ?? null,
        generated_at: new Date(),
      },
      { conflictFields: ['job_id', 'jobseeker_id'] }
    );

    await seeker.increment('ai_checks_used', { by: 1 });
    await seeker.reload();

    return res.json({
      ...aiResult,
      match_score: matchScore,
      suggested_courses: enrichedSuggestedCourses,
      checks_used: seeker.ai_checks_used,
      checks_limit: FREE_CHECK_LIMIT,
      checks_remaining: seeker.is_premium
        ? null
        : Math.max(0, FREE_CHECK_LIMIT - seeker.ai_checks_used),
      is_premium: seeker.is_premium,
    });

  } catch (err) {
    console.error('analyzeJobMatch error:', err.message);
    return res.status(500).json({ message: 'Error analyzing job match' });
  }
};

export {
  analyzeJobMatch
}