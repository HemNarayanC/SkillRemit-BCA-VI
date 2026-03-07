import { useState, useEffect } from "react";
import { Sparkles, Check, X, Send, Lock, Zap, ExternalLink, BookOpen } from "lucide-react";
import { analyzeJobMatch } from "../../api/jobApi.js";
import PremiumUpgrade from "./PremiumUpgrade.jsx";
import { getPremiumStatus } from "../../api/premiumApi.js";
import { enrollInCourse } from "../../api/enrollmentApi.js";  // ← uses your shared axios instance
import { useNavigate } from "react-router-dom";

const AIMatchModal = ({ job, jobseekerId, onClose, onProceedApply }) => {
  const navigate = useNavigate();

  const [step, setStep] = useState("intro"); // intro | loading | result | locked
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [checksUsed, setChecksUsed] = useState(null);
  const [checksLimit, setChecksLimit] = useState(null);
  const [checksRemaining, setChecksRemaining] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showPremium, setShowPremium] = useState(false);

  // Per-course enrollment state: { [course_id]: 'idle' | 'loading' | 'enrolled' | 'redirecting' }
  const [courseStates, setCourseStates] = useState({});

  const usageLoaded = checksUsed !== null && checksLimit !== null;
  const isLocked = !isPremium && usageLoaded && checksRemaining === 0;

  // ── fetch usage on open ───────────────────────────────────────────────────
  useEffect(() => {
    if (!jobseekerId) {
      setChecksUsed(0); setChecksLimit(5); setChecksRemaining(5);
      return;
    }
    getPremiumStatus()
      .then((data) => {
        setChecksUsed(data.ai_checks_used ?? 0);
        setChecksLimit(data.ai_checks_limit ?? 5);
        setChecksRemaining(
          data.ai_checks_remaining ?? Math.max(0, (data.ai_checks_limit ?? 5) - (data.ai_checks_used ?? 0))
        );
        setIsPremium(data.is_premium ?? false);
        if (data.limit_reached) setStep("locked");
      })
      .catch(() => {
        setChecksUsed(0); setChecksLimit(5); setChecksRemaining(5);
      });
  }, [jobseekerId]);

  const runCheck = async () => {
    if (isLocked) { setStep("locked"); return; }
    setStep("loading");
    setError("");
    try {
      const data = await analyzeJobMatch(job.job_id, jobseekerId);

      if (data.checks_used != null) setChecksUsed(data.checks_used);
      if (data.checks_limit != null) setChecksLimit(data.checks_limit);
      if (data.checks_remaining != null) setChecksRemaining(data.checks_remaining);
      else if (data.checks_used != null && data.checks_limit != null) {
        setChecksRemaining(Math.max(0, data.checks_limit - data.checks_used));
      }
      if (data.is_premium != null) setIsPremium(data.is_premium);

      await new Promise((r) => setTimeout(r, 1200));
      setResult(data);
      setStep("result");
    } catch (err) {
      if (err?.limit_reached || err?.status === 403) {
        setChecksRemaining(0);
        setStep("locked");
        return;
      }
      setError(err?.message || "Something went wrong. Please try again.");
      setStep("intro");
    }
  };

  const handleCourseClick = async (course) => {
    const courseId = course.course_id;
    setCourseStates(s => ({ ...s, [courseId]: 'loading' }));

    try {
      const data = await enrollInCourse(courseId);

      if (data.is_free || data.status === 'active') {
        setCourseStates(s => ({ ...s, [courseId]: 'enrolled' }));
        onClose();
        navigate('/jobseeker/my-courses');
      } else if (data.payment_url) {
        setCourseStates(s => ({ ...s, [courseId]: 'redirecting' }));
        window.open(data.payment_url, '_blank');
        // Reset after a moment so card stays clickable if they return
        setTimeout(() => setCourseStates(s => ({ ...s, [courseId]: 'idle' })), 1500);
      }
    } catch (err) {
      // 400 with enrollment_status means already enrolled → just go to my-courses
      if (err?.enrollment_status) {
        setCourseStates(s => ({ ...s, [courseId]: 'enrolled' }));
        onClose();
        navigate('/jobseeker/my-courses');
        return;
      }
      setCourseStates(s => ({ ...s, [courseId]: 'idle' }));
      alert(err?.message || 'Could not initiate enrollment. Please try again.');
    }
  };

  const matchedSkills = result?.matched_skills ?? [];
  const missingSkills = result?.missing_skills ?? [];
  const suggestedCourses = result?.suggested_courses ?? [];
  const score = result?.match_score ?? 0;
  const canApply = result?.can_apply ?? false;

  if (showPremium) {
    return <PremiumUpgrade role="jobseeker" onClose={() => setShowPremium(false)} />;
  }

  return (
    <Overlay onClose={onClose}>
      <div className="bg-[#080f1e] border border-[#1e2d45] rounded-2xl w-full max-w-[540px] max-h-[90vh] overflow-y-auto shadow-[0_40px_100px_rgba(0,0,0,0.6)]">

        {/* Header */}
        <div className="bg-gradient-to-br from-[#1e1b4b] to-[#2e1065] px-7 py-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={15} className="text-indigo-300" />
                <span className="text-indigo-300 font-bold text-[11px] tracking-widest uppercase">
                  AI Eligibility Checker
                </span>
              </div>
              <div className="text-white font-extrabold text-xl mb-1">
                Are you eligible for this job?
              </div>
              <div className="text-indigo-200 text-sm">
                Role: <strong className="text-white">{job.title}</strong>{" "}
                · {job.Employer?.company_name}
              </div>
            </div>
            <CloseBtn onClose={onClose} />
          </div>
        </div>

        <div className="p-7">

          {/* ── LOCKED ── */}
          {step === "locked" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-amber-950 border-2 border-amber-600 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7 text-amber-400" />
              </div>
              <div className="text-amber-400 font-extrabold text-xl mb-2">Free Checks Exhausted</div>
              <div className="text-slate-400 text-sm leading-7 mb-6">
                You've used all <strong className="text-white">{checksLimit ?? 5} free</strong> AI eligibility
                checks. Upgrade to Premium for unlimited checks.
              </div>
              <div className="bg-[#111827] border border-[#1e2d45] rounded-xl p-5 mb-6 text-left space-y-3">
                {["Unlimited AI eligibility checks", "Priority application visibility", "Detailed skill gap reports", "Course recommendations with discounts"]
                  .map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                      <Check size={14} className="text-green-400 flex-shrink-0" /> {f}
                    </div>
                  ))}
              </div>
              <button
                onClick={() => setShowPremium(true)}
                className="w-full py-3.5 rounded-xl text-[15px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-center gap-2 hover:opacity-90 transition border-none cursor-pointer mb-3"
              >
                <Zap size={15} /> Upgrade to Premium
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl text-sm font-semibold bg-transparent border border-[#1e2d45] text-slate-500 hover:text-slate-300 transition cursor-pointer"
              >
                Maybe Later
              </button>
            </div>
          )}

          {/* ── INTRO ── */}
          {step === "intro" && (
            <div>
              <p className="text-slate-400 text-sm leading-7 mb-6">
                Our AI will analyze your profile against the job requirements and give
                you an instant eligibility score before you apply.
              </p>
              <div className="flex flex-col gap-3 mb-6">
                {[["Your skills vs required skills", "⚡"], ["Experience level compatibility", "📊"], ["Missing skills & training suggestions", "🎓"]]
                  .map(([label, emoji]) => (
                    <div key={label} className="flex items-center gap-4 px-4 py-3 bg-[#111827] rounded-xl border border-[#1e2d45]">
                      <div className="w-9 h-9 rounded-lg bg-[#1e1b4b] flex items-center justify-center text-base flex-shrink-0">{emoji}</div>
                      <span className="text-slate-300 text-sm">{label}</span>
                    </div>
                  ))}
              </div>

              {!isPremium && (
                <div className="bg-[#111827] border border-[#1e2d45] rounded-xl px-5 py-4 mb-5">
                  {checksUsed === null ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-3 w-24 bg-slate-700 rounded" />
                      <div className="h-7 w-16 bg-slate-700 rounded" />
                      <div className="h-1.5 w-full bg-slate-700 rounded-full mt-3" />
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <div className="text-slate-400 text-xs mb-1">Free AI Checks</div>
                          <div className="text-white font-extrabold text-2xl">
                            {checksRemaining}
                            <span className="text-slate-500 text-sm font-normal"> / {checksLimit ?? 5} remaining</span>
                          </div>
                        </div>
                        {checksRemaining > 0
                          ? <span className="text-green-400 font-semibold text-xs">✓ Available</span>
                          : <span className="text-amber-400 font-semibold text-xs">⚠ Limit Reached</span>}
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${((checksUsed ?? 0) / (checksLimit ?? 5)) * 100}%`,
                            background: checksRemaining === 0 ? "#f59e0b" : "#6366f1",
                          }}
                        />
                      </div>
                      <div className="text-slate-600 text-xs mt-2">{checksUsed} of {checksLimit ?? 5} free checks used</div>
                    </>
                  )}
                </div>
              )}

              {isPremium && (
                <div className="bg-amber-900/20 border border-amber-800/50 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
                  <Zap size={14} className="text-amber-400" />
                  <span className="text-amber-300 text-sm font-semibold">Premium — Unlimited AI checks</span>
                </div>
              )}

              {error && (
                <div className="text-red-400 text-sm px-4 py-3 bg-red-950 rounded-lg mb-4 border border-red-900">{error}</div>
              )}

              {isLocked ? (
                <button
                  onClick={() => setShowPremium(true)}
                  className="w-full py-3.5 rounded-xl text-[15px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-center gap-2 hover:opacity-90 transition border-none cursor-pointer"
                >
                  <Lock size={15} /> Upgrade to Continue
                </button>
              ) : (
                <button
                  onClick={runCheck}
                  className="w-full py-3.5 rounded-xl text-[15px] font-bold bg-gradient-to-r from-indigo-500 to-violet-500 text-white flex items-center justify-center gap-2 hover:opacity-90 transition border-none cursor-pointer"
                >
                  <Sparkles size={15} /> Run AI Eligibility Check
                </button>
              )}
            </div>
          )}

          {/* ── LOADING ── */}
          {step === "loading" && (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-full border-4 border-slate-800 border-t-indigo-500 animate-spin mx-auto mb-5" />
              <div className="text-slate-100 font-bold text-base mb-2">Analyzing your profile…</div>
              <div className="text-slate-500 text-sm">Comparing skills, experience, and job requirements</div>
            </div>
          )}

          {/* ── RESULT ── */}
          {step === "result" && result && (
            <div>
              <div className="flex justify-center mb-6">
                <ScoreRing score={score} canApply={canApply} />
              </div>

              {!isPremium && (
                <div className={`text-center text-xs font-semibold mb-4 px-3 py-1.5 rounded-full w-fit mx-auto ${checksRemaining === 0
                  ? "text-amber-400 bg-amber-900/30 border border-amber-800"
                  : "text-slate-500 bg-slate-800/50"}`}>
                  {checksRemaining === 0
                    ? "⚠ No free checks remaining — upgrade for more"
                    : `${checksRemaining} free check${checksRemaining !== 1 ? "s" : ""} remaining`}
                </div>
              )}

              <div className={`rounded-xl px-4 py-3 mb-5 text-sm font-semibold text-center border ${canApply
                ? "bg-green-950 border-green-800 text-green-400"
                : "bg-red-950 border-red-900 text-red-400"}`}>
                {canApply
                  ? "✅ You meet the minimum requirements for this role."
                  : "⚠️ You may not meet all requirements — consider upskilling first."}
              </div>

              {/* Matched / Missing skills */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-green-950 border border-green-900 rounded-xl p-4">
                  <div className="text-green-300 font-bold text-[11px] tracking-wider mb-3 uppercase">✓ Matched</div>
                  {matchedSkills.length > 0 ? matchedSkills.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2 text-green-400 text-sm">
                      <Check size={12} /> {s}
                    </div>
                  )) : <div className="text-green-700 text-xs">No matched skills detected</div>}
                </div>
                <div className="bg-red-950 border border-red-900 rounded-xl p-4">
                  <div className="text-red-300 font-bold text-[11px] tracking-wider mb-3 uppercase">✗ Missing</div>
                  {missingSkills.length > 0 ? missingSkills.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2 text-red-400 text-sm">
                      <X size={12} /> {s}
                    </div>
                  )) : <div className="text-red-700 text-xs">No missing skills</div>}
                </div>
              </div>

              {/* ── Suggested Courses (clickable) ─────────────────────────────── */}
              {suggestedCourses.length > 0 && (
                <div className="mb-6">
                  <div className="text-slate-500 font-bold text-[11px] tracking-wider uppercase mb-3">
                    🎓 Recommended Training — click to enroll
                  </div>
                  {suggestedCourses.map((course) => {
                    const cState = courseStates[course.course_id] || 'idle';
                    const isLoading = cState === 'loading';
                    const isRedirecting = cState === 'redirecting';
                    const isEnrolled = cState === 'enrolled';
                    const isFree = !course.price || parseFloat(course.price) === 0;

                    return (
                      <button
                        key={course.course_id}
                        onClick={() => !isLoading && !isRedirecting && !isEnrolled && handleCourseClick(course)}
                        disabled={isLoading || isRedirecting || isEnrolled}
                        className={`
                          w-full text-left bg-[#111827] border rounded-xl px-4 py-3 mb-2
                          transition-all duration-200 cursor-pointer group
                          ${isEnrolled
                            ? 'border-green-700 opacity-80 cursor-default'
                            : isLoading || isRedirecting
                              ? 'border-[#1e2d45] opacity-60 cursor-wait'
                              : 'border-[#1e2d45] hover:border-indigo-500 hover:bg-[#0d1526]'
                          }
                        `}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            {/* Title */}
                            <div className="text-slate-200 font-semibold text-sm group-hover:text-white transition truncate">
                              {course.title}
                            </div>

                            {/* Meta row */}
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              {course.difficulty && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 capitalize">
                                  {course.difficulty}
                                </span>
                              )}
                              {course.language && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 uppercase">
                                  {course.language}
                                </span>
                              )}
                              {isFree ? (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-900/50 text-green-400 border border-green-800 font-bold">
                                  FREE
                                </span>
                              ) : (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-900/50 text-indigo-300 border border-indigo-800 font-bold">
                                  NPR {parseFloat(course.price).toLocaleString()}
                                </span>
                              )}
                            </div>

                            {/* Covers which missing skills */}
                            {course.covers_skills?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {course.covers_skills.map((skill, i) => (
                                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400 border border-emerald-800">
                                    ✓ {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Right-side CTA */}
                          <div className="flex-shrink-0 flex items-center pt-0.5">
                            {isEnrolled ? (
                              <span className="text-green-400 text-xs font-bold flex items-center gap-1">
                                <Check size={13} /> Enrolled
                              </span>
                            ) : isLoading ? (
                              <div className="w-4 h-4 border-2 border-slate-600 border-t-indigo-400 rounded-full animate-spin" />
                            ) : isRedirecting ? (
                              <span className="text-indigo-400 text-xs font-semibold flex items-center gap-1">
                                <ExternalLink size={13} /> Opening…
                              </span>
                            ) : isFree ? (
                              <span className="text-indigo-400 text-xs font-semibold flex items-center gap-1 group-hover:text-indigo-300">
                                <BookOpen size={13} /> Enroll free
                              </span>
                            ) : (
                              <span className="text-indigo-400 text-xs font-semibold flex items-center gap-1 group-hover:text-indigo-300">
                                <ExternalLink size={13} /> Pay & Enroll
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                {!isPremium && checksRemaining === 0 ? (
                  <>
                    <button
                      onClick={onClose}
                      className="flex-1 py-3 rounded-xl text-sm font-semibold bg-transparent border border-[#1e2d45] text-slate-500 hover:text-slate-300 transition cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => setShowPremium(true)}
                      className="flex-[2] py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-center gap-2 hover:opacity-90 transition cursor-pointer border-none"
                    >
                      <Zap size={13} /> Upgrade to Premium
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={onClose}
                      className="flex-1 py-3 rounded-xl text-sm font-semibold bg-transparent border border-[#1e2d45] text-slate-500 hover:text-slate-300 transition cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      onClick={onProceedApply}
                      className="flex-[2] py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center gap-2 hover:opacity-90 transition cursor-pointer border-none"
                    >
                      <Send size={13} /> Proceed to Apply
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Overlay>
  );
};

export default AIMatchModal;

// ── Score Ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score, canApply }) {
  const size = 120, strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = ((score || 0) / 100) * circumference;
  const color = score >= 70 ? "#4ade80" : score >= 50 ? "#facc15" : "#f87171";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1e293b" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={`${filled} ${circumference}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }} />
      </svg>
      <div className="absolute text-center">
        <div className="font-extrabold text-xl text-white">{Math.round(score)}%</div>
        <div className="text-[10px] font-semibold" style={{ color }}>
          {canApply ? "Eligible" : "Low Match"}
        </div>
      </div>
    </div>
  );
}

function Overlay({ onClose, children }) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[1000] p-5"
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function CloseBtn({ onClose }) {
  return (
    <button
      onClick={onClose}
      className="bg-white/10 border border-white/20 rounded-lg text-white cursor-pointer px-3 py-1 text-lg leading-none hover:bg-white/20 transition"
    >
      ×
    </button>
  );
}