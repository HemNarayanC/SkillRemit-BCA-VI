import { useState } from "react";
import {
  X, CheckCircle2, GraduationCap, Loader2, Award,
  Sparkles, BookOpen, DollarSign, Lock, Unlock,
  ShieldCheck, AlertTriangle, ArrowRight, BadgeCheck,
} from "lucide-react";
import { confirmCourseCompletion } from "../../api/enrollmentApi";

/**
 * ConfirmCourseModal — shared by BOTH jobseeker and trainer.
 *
 * Props:
 *   enrollment  — full enrollment object
 *   role        — "jobseeker" | "trainer"
 *   onClose     — () => void
 *   onSuccess   — (apiResult) => void
 */
const ConfirmCourseModal = ({ enrollment, role, onClose, onSuccess }) => {
  const [step,   setStep]   = useState("review"); // review | loading | done | error
  const [result, setResult] = useState(null);
  const [errMsg, setErrMsg] = useState("");
  const [agreed, setAgreed] = useState(false);

  const txn       = enrollment?.CourseEnrollmentTransaction;
  const course    = enrollment?.TrainingCourse;
  const seeker    = enrollment?.JobSeeker;
  const isTrainer = role === "trainer";
  const isPaid    = !!txn;

  const otherConfirmed = isTrainer
    ? !!enrollment?.seeker_confirmed
    : !!enrollment?.trainer_confirmed;

  const npr = (p) => p != null ? `NPR ${(p / 100).toLocaleString("en-NP")}` : "—";

  const handleSubmit = async () => {
    setStep("loading");
    try {
      const res = await confirmCourseCompletion(enrollment.enrollment_id);
      setResult(res);
      setStep("done");
      onSuccess?.(res);
    } catch (e) {
      setErrMsg(e?.message || "Something went wrong. Please try again.");
      setStep("error");
    }
  };

  const isFullyComplete = result?.status === "completed";

  // ── DONE ──────────────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <Backdrop onClose={onClose}>
        <Sheet>
          <div className="h-1.5 w-full rounded-t-2xl bg-gradient-to-r from-emerald-400 to-teal-500" />
          <div className="p-8 flex flex-col items-center text-center gap-5">
            {isFullyComplete ? (
              <>
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
                    <GraduationCap className="w-10 h-10 text-emerald-500" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800">
                    {isTrainer ? "Escrow Released! 💰" : "Course Completed! 🎓"}
                  </h2>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-xs mx-auto">
                    {isTrainer
                      ? `Both confirmations received. NPR ${result?.trainer_payout_npr?.toLocaleString()} is being transferred to your account.`
                      : "Both parties confirmed. Certificate issued and skills added to your profile!"}
                  </p>
                </div>
                {!isTrainer && result?.skills_added?.length > 0 && (
                  <div className="w-full bg-violet-50 border border-violet-100 rounded-xl p-4 text-left">
                    <p className="text-xs font-bold text-violet-700 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Skills Added to Your Profile
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.skills_added.map((sk) => (
                        <span key={sk} className="text-[11px] font-semibold px-2.5 py-1 bg-violet-100 text-violet-700 rounded-full">{sk}</span>
                      ))}
                    </div>
                  </div>
                )}
                {!isTrainer && result?.certificate_url && (
                  <a href={result.certificate_url} target="_blank" rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 rounded-xl text-sm font-bold transition-colors">
                    <Award className="w-4 h-4" /> Download Certificate
                  </a>
                )}
                {isTrainer && result?.trainer_payout_npr != null && (
                  <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-emerald-600 font-semibold">Payout Initiated</p>
                      <p className="text-lg font-extrabold text-emerald-700">NPR {result.trainer_payout_npr.toLocaleString()}</p>
                    </div>
                    <Unlock className="w-5 h-5 text-emerald-400 ml-auto" />
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-blue-50 border-2 border-blue-200 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800">Confirmation Recorded ✓</h2>
                  <p className="text-sm text-slate-500 mt-1.5 leading-relaxed max-w-xs mx-auto">
                    {isTrainer
                      ? "Saved. Escrow releases as soon as the learner also confirms."
                      : "Saved. Escrow releases as soon as the trainer also confirms."}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <FlowPill label="Seeker"  done={!!enrollment?.seeker_confirmed || !isTrainer} />
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                  <FlowPill label="Trainer" done={!!enrollment?.trainer_confirmed || isTrainer} />
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                  <FlowPill label="Escrow Released" pending />
                </div>
              </>
            )}
            <button onClick={onClose}
              className="w-full mt-2 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-colors">
              {isFullyComplete ? "Done" : "Close — I'll wait"}
            </button>
          </div>
        </Sheet>
      </Backdrop>
    );
  }

  // ── ERROR ─────────────────────────────────────────────────────────────────
  if (step === "error") {
    return (
      <Backdrop onClose={onClose}>
        <Sheet>
          <div className="h-1.5 w-full rounded-t-2xl bg-red-500" />
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800">Confirmation Failed</h3>
                <p className="text-sm text-slate-500 mt-0.5">{errMsg}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setStep("review"); setAgreed(false); }}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold">Try Again</button>
              <button onClick={onClose}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold">Cancel</button>
            </div>
          </div>
        </Sheet>
      </Backdrop>
    );
  }

  // ── REVIEW / LOADING ──────────────────────────────────────────────────────
  return (
    <Backdrop onClose={step === "loading" ? undefined : onClose}>
      <Sheet>
        <div className="h-1.5 w-full rounded-t-2xl bg-gradient-to-r from-indigo-500 to-blue-400" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
              <BadgeCheck className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="text-base font-extrabold text-slate-800">
              {isTrainer ? "Confirm Course Completion" : "Mark Course as Complete"}
            </h2>
          </div>
          {step !== "loading" && (
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

          {/* Course info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{course?.title || "—"}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {isTrainer
                  ? `Learner: ${seeker?.User?.name || "—"}`
                  : `Trainer: ${course?.Trainer?.User?.name || "—"}`}
              </p>
            </div>
          </div>

          {/* Instant-release alert */}
          {otherConfirmed && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-amber-700 leading-snug">
                {isTrainer
                  ? "⚡ Learner already confirmed — your confirmation releases escrow immediately!"
                  : "⚡ Trainer already confirmed — your confirmation completes the course right now!"}
              </p>
            </div>
          )}

          {/* Dual-confirmation status */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Dual-Confirmation Required</p>
            <div className="flex items-center gap-2 flex-wrap">
              <FlowPill label="Seeker"  done={!!enrollment?.seeker_confirmed} />
              <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
              <FlowPill label="Trainer" done={!!enrollment?.trainer_confirmed} />
              <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
              <FlowPill label="Escrow Released" done={!!txn?.escrow_released} />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Both the learner and trainer must confirm before escrow funds release to the trainer.
            </p>
          </div>

          {/* What happens */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">What happens when you confirm</p>
            <div className="space-y-2.5">
              {isTrainer ? (
                <>
                  <WhatRow icon={CheckCircle2} color="text-emerald-500" bg="bg-emerald-50"
                    text={otherConfirmed ? "Escrow funds release immediately to your registered account" : "Confirmation recorded — escrow releases when learner also confirms"} />
                  {isPaid && <WhatRow icon={DollarSign} color="text-emerald-500" bg="bg-emerald-50" text={`You receive ${npr(txn?.trainer_payout_paisa)} (80% of the course fee)`} />}
                  <WhatRow icon={Award}       color="text-amber-500"  bg="bg-amber-50"  text="Completion certificate issued to the learner automatically" />
                  <WhatRow icon={Sparkles}    color="text-violet-500" bg="bg-violet-50" text="Course skills added to the learner's profile at basic level" />
                </>
              ) : (
                <>
                  <WhatRow icon={CheckCircle2} color="text-blue-500"   bg="bg-blue-50"   text={otherConfirmed ? "Escrow releases to trainer immediately — course marked complete!" : "Confirmation recorded — escrow releases when trainer also confirms"} />
                  {isPaid && <WhatRow icon={Lock}      color="text-amber-500"  bg="bg-amber-50"  text={`${npr(txn?.amount_paisa)} held in escrow releases to trainer after both confirm`} />}
                  <WhatRow icon={Sparkles}    color="text-violet-500" bg="bg-violet-50" text="Course skills automatically added to your profile at basic level" />
                  <WhatRow icon={Award}       color="text-amber-500"  bg="bg-amber-50"  text="Downloadable completion certificate is generated for you" />
                </>
              )}
            </div>
          </div>

          {/* Escrow split */}
          {isPaid && (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Escrow Breakdown</p>
              </div>
              <div className="divide-y divide-slate-100">
                <SplitRow label="Total Paid by Learner"  val={npr(txn.amount_paisa)} />
                <SplitRow label="Platform Fee (20%)"     val={`−${npr(txn.platform_fee_paisa)}`} red />
                <SplitRow label="Trainer Payout (80%)"   val={npr(txn.trainer_payout_paisa)} green bold />
              </div>
            </div>
          )}

          {/* Acknowledgement */}
          <label className="flex items-start gap-3 cursor-pointer select-none p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400 flex-shrink-0 cursor-pointer" />
            <span className="text-xs text-slate-600 leading-relaxed">
              {isTrainer
                ? "I confirm this learner has successfully completed all course requirements and deserves their completion certificate."
                : "I confirm I have fully completed this course and consent to the escrow payment being released to the trainer."}
            </span>
          </label>

          {/* Actions */}
          <div className="flex gap-2.5">
            <button onClick={handleSubmit} disabled={step === "loading" || !agreed}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-700 text-white">
              {step === "loading"
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Confirming…</>
                : <><CheckCircle2 className="w-4 h-4" />{isTrainer ? "Confirm & Release Escrow" : "Confirm Course Completion"}</>}
            </button>
            {step !== "loading" && (
              <button onClick={onClose}
                className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition-colors">
                Cancel
              </button>
            )}
          </div>
        </div>
      </Sheet>
    </Backdrop>
  );
};

const Backdrop = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)" }}
    onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
    {children}
  </div>
);
const Sheet = ({ children }) => (
  <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">{children}</div>
);
const WhatRow = ({ icon: Icon, color, bg, text }) => (
  <div className="flex items-start gap-2.5">
    <div className={`w-6 h-6 rounded-lg ${bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
      <Icon className={`w-3.5 h-3.5 ${color}`} />
    </div>
    <p className="text-xs text-slate-600 leading-relaxed">{text}</p>
  </div>
);
const SplitRow = ({ label, val, red, green, bold }) => (
  <div className="flex justify-between items-center px-4 py-2.5">
    <span className="text-xs text-slate-500">{label}</span>
    <span className={`font-bold ${bold ? "text-sm" : "text-xs"} ${red ? "text-red-400" : green ? "text-emerald-600" : "text-slate-700"}`}>{val}</span>
  </div>
);
const FlowPill = ({ label, done, pending }) => (
  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all ${
    done ? "bg-emerald-50 text-emerald-600 border-emerald-200"
    : pending ? "bg-amber-50 text-amber-500 border-amber-200"
    : "bg-slate-50 text-slate-400 border-slate-200"}`}>
    {done ? "✓" : "○"} {label}
  </span>
);

export default ConfirmCourseModal;