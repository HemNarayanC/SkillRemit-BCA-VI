import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp, BookOpen, Target, Zap, Loader2, AlertCircle,
  RefreshCw, BarChart2, Tag, ChevronRight, Award, Lightbulb,
} from "lucide-react";
import { getMyTrainerCourses } from "../../../api/trainerApi.js";
import { getTrainerEnrollments } from "../../../api/enrollmentApi.js";

// ── Helpers ───────────────────────────────────────────────────────────────────
const pct = (n, t) => t > 0 ? Math.round((n / t) * 100) : 0;

// ── Progress Bar ──────────────────────────────────────────────────────────────
const Bar = ({ val, max, color = "bg-indigo-500" }) => (
  <div className="flex items-center gap-3">
    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${pct(val, max)}%` }} />
    </div>
    <span className="text-xs font-bold text-slate-600 w-6 text-right">{val}</span>
  </div>
);

// ── Skill Chip ────────────────────────────────────────────────────────────────
const SkillChip = ({ name, count, rank }) => {
  const colors = [
    "bg-indigo-50 text-indigo-700 border-indigo-200",
    "bg-violet-50 text-violet-700 border-violet-200",
    "bg-blue-50 text-blue-700 border-blue-200",
    "bg-teal-50 text-teal-700 border-teal-200",
    "bg-emerald-50 text-emerald-700 border-emerald-200",
  ];
  const cls = colors[rank % colors.length];
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-xl border ${cls} text-sm font-semibold`}>
      <span>{name}</span>
      <span className="text-xs font-bold opacity-70 ml-2">{count} course{count !== 1 ? "s" : ""}</span>
    </div>
  );
};

// ── Enrollment-derived insights ───────────────────────────────────────────────
const deriveInsights = (courses, enrollments) => {
  // Skill → how many courses you offer
  const skillCoursesMap = {};
  for (const course of courses) {
    for (const skill of (course.Skills || [])) {
      const key = skill.skill_name;
      skillCoursesMap[key] = (skillCoursesMap[key] || 0) + 1;
    }
  }

  // Skill → total enrollments across courses that teach it
  const skillEnrollMap = {};
  const enrollCountById = {};
  for (const e of enrollments) {
    const cid = e.TrainingCourse?.course_id;
    if (!cid) continue;
    enrollCountById[cid] = (enrollCountById[cid] || 0) + 1;
  }
  for (const course of courses) {
    const count = enrollCountById[course.course_id] || course.enrollment_count || 0;
    for (const skill of (course.Skills || [])) {
      const key = skill.skill_name;
      skillEnrollMap[key] = (skillEnrollMap[key] || 0) + count;
    }
  }

  // Top skills by coverage
  const topCoverage = Object.entries(skillCoursesMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  // Top skills by demand (enrollment-weighted)
  const topDemand = Object.entries(skillEnrollMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  // Per-course demand ranking
  const courseRanking = courses
    .map((c) => ({
      ...c,
      _enroll: enrollCountById[c.course_id] || c.enrollment_count || 0,
    }))
    .sort((a, b) => b._enroll - a._enroll)
    .slice(0, 6);

  return { topCoverage, topDemand, courseRanking, skillCoursesMap, skillEnrollMap };
};

// ── Main ──────────────────────────────────────────────────────────────────────
const SkillDemand = () => {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(0);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [cData, eData] = await Promise.all([
        getMyTrainerCourses(),
        getTrainerEnrollments(),
      ]);
      setCourses(cData?.courses || []);
      setEnrollments(eData?.enrollments || []);
    } catch (e) {
      setError(e?.message || "Failed to load insights.");
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
    </div>
  );

  if (error) return (
    <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
      <AlertCircle className="w-5 h-5 flex-shrink-0" /><span className="text-sm flex-1">{error}</span>
      <button onClick={load} className="text-xs font-bold underline flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Retry</button>
    </div>
  );

  const { topCoverage, topDemand, courseRanking, skillEnrollMap } = deriveInsights(courses, enrollments);

  const maxCoverage = Math.max(...topCoverage.map((s) => s.count), 1);
  const maxDemand = Math.max(...topDemand.map((s) => s.count), 1);
  const maxEnroll = Math.max(...courseRanking.map((c) => c._enroll), 1);

  const totalSkills = new Set(courses.flatMap((c) => (c.Skills || []).map((s) => s.skill_name))).size;
  const totalEnroll = enrollments.length;
  const activeCourses = courses.filter((c) => c.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Skill Demand Insights</h2>
          <p className="text-sm text-slate-400 mt-0.5">Based on your courses and learner enrollment activity</p>
        </div>
        <button onClick={() => setRefresh((k) => k + 1)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, label: "Active Courses", val: activeCourses, color: "text-indigo-500", bg: "bg-indigo-50" },
          { icon: Tag, label: "Unique Skills", val: totalSkills, color: "text-violet-500", bg: "bg-violet-50" },
          { icon: TrendingUp, label: "Enrollments", val: totalEnroll, color: "text-emerald-500", bg: "bg-emerald-50" },
          { icon: Award, label: "Courses", val: courses.length, color: "text-amber-500", bg: "bg-amber-50" },
        ].map(({ icon: Icon, label, val, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}><Icon className={`w-5 h-5 ${color}`} /></div>
            <div><p className="text-xs text-slate-400">{label}</p><p className="text-2xl font-bold text-slate-800">{val}</p></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Skills you teach */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Tag className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Skills You Teach</h3>
              <p className="text-[11px] text-slate-400">Ranked by course coverage</p>
            </div>
          </div>
          {topCoverage.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No skills tagged yet.</p>
          ) : (
            <div className="space-y-3">
              {topCoverage.map((s, i) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-700">{s.name}</span>
                    <span className="text-[11px] text-slate-400">{s.count} course{s.count !== 1 ? "s" : ""}</span>
                  </div>
                  <Bar val={s.count} max={maxCoverage} color="bg-indigo-400" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Most enrolled skills */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">High-Demand Skills</h3>
              <p className="text-[11px] text-slate-400">Ranked by enrollment volume</p>
            </div>
          </div>
          {topDemand.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No enrollment data yet.</p>
          ) : (
            <div className="space-y-3">
              {topDemand.map((s, i) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-700">{s.name}</span>
                    <span className="text-[11px] text-slate-400">{s.count} enrolled</span>
                  </div>
                  <Bar val={s.count} max={maxDemand} color="bg-emerald-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top courses by enrollment */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Course Popularity Ranking</h3>
            <p className="text-[11px] text-slate-400">Most enrolled courses</p>
          </div>
        </div>
        {courseRanking.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No courses yet.</p>
        ) : (
          <div className="space-y-4">
            {courseRanking.map((c, i) => (
              <div key={c.course_id} className="flex items-center gap-4">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-slate-100 text-slate-500" : i === 2 ? "bg-orange-50 text-orange-500" : "bg-slate-50 text-slate-400"}`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-semibold text-slate-700 truncate pr-4">{c.title}</p>
                    <span className="text-xs font-bold text-slate-500 flex-shrink-0">{c._enroll} enrolled</span>
                  </div>
                  <Bar val={c._enroll} max={maxEnroll} color={i === 0 ? "bg-amber-400" : "bg-slate-300"} />
                  {c.Skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {c.Skills.slice(0, 3).map((s) => (
                        <span key={s.skill_id} className="text-[10px] bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded-full font-medium">{s.skill_name}</span>
                      ))}
                      {c.Skills.length > 3 && <span className="text-[10px] text-slate-400">+{c.Skills.length - 3}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skill gap tip */}
      {topCoverage.length > 0 && (
        <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-white border border-violet-100 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <p className="font-bold text-violet-800 text-sm">Tip: Grow Your Reach</p>
            <p className="text-xs text-violet-600 mt-1 leading-relaxed">
              Your top skill <strong>"{topCoverage[0]?.name}"</strong> has the most course coverage.
              Consider creating courses on skills you don't currently teach to attract a broader learner base.
              Skills with high enrollment demand signal the strongest market opportunity.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillDemand;