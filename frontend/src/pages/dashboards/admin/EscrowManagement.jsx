import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck, Flag, LogOut, CheckCircle2, Clock, XCircle, Loader2, RefreshCw, ChevronDown, ChevronUp, AlertCircle, DollarSign, TrendingUp, Search, BookOpen, ArrowRight, CheckCheck, Ban,
} from "lucide-react";
import {
  adminGetAllEnrollments,
  adminGetDisputedEnrollments,
  adminGetAbandonedEnrollments,
  adminReleaseEscrow,
} from "../../../api/adminApi";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const npr = (p) => p != null ? `NPR ${Number(p).toLocaleString("en-NP")}` : "—";
const fmt = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtTime = (d) => d ? new Date(d).toLocaleString("en-NP", { dateStyle: "medium", timeStyle: "short" }) : "—";

const STATUS_META = {
  pending: { label: "Pending", dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50" },
  active: { label: "Active", dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50" },
  completed: { label: "Completed", dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  abandoned: { label: "Abandoned", dot: "bg-slate-400", text: "text-slate-600", bg: "bg-slate-50" },
  disputed: { label: "Disputed", dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
  refunded: { label: "Refunded", dot: "bg-teal-500", text: "text-teal-700", bg: "bg-teal-50" },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, val, sub, color, bg, gradient }) => (
  <div className={`rounded-2xl p-5 ${gradient || "bg-white border border-slate-100"} shadow-sm`}>
    <div className="flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${gradient ? "text-white" : "text-slate-800"}`}>{val}</p>
        {sub && <p className={`text-[11px] mt-0.5 ${gradient ? "text-white/70" : "text-slate-400"}`}>{sub}</p>}
      </div>
    </div>
  </div>
);

// ─── Decision Modal ───────────────────────────────────────────────────────────
const DecisionModal = ({ enrollment, onClose, onDone, showToast }) => {
  const [decision, setDecision] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("choose"); // choose | confirm | done
  const [result, setResult] = useState(null);

  const course = enrollment?.TrainingCourse;
  const seeker = enrollment?.JobSeeker?.User;
  const trainer = enrollment?.TrainingCourse?.Trainer?.User;
  const txn = enrollment?.CourseEnrollmentTransaction;

  const handleSubmit = async () => {
    if (!decision) return;
    setLoading(true);
    try {
      const res = await adminReleaseEscrow(enrollment.enrollment_id, decision, notes);
      setResult(res);
      setStep("done");
      showToast(res.message || "Decision applied.", "success");
      onDone();
    } catch (e) {
      showToast(e?.message || "Action failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-white" />
            <h3 className="font-bold text-white text-sm">Admin Escrow Decision</h3>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Enrollment summary */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span className="font-semibold text-slate-800 text-sm">{course?.title || "—"}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-slate-400">Learner:</span> <span className="font-semibold text-slate-700 ml-1">{seeker?.name || "—"}</span></div>
              <div><span className="text-slate-400">Trainer:</span> <span className="font-semibold text-slate-700 ml-1">{trainer?.name || "—"}</span></div>
              <div><span className="text-slate-400">Total Paid:</span> <span className="font-semibold text-slate-700 ml-1">{npr(txn?.amount_paisa ? txn.amount_paisa / 100 : null)}</span></div>
              <div><span className="text-slate-400">Trainer Gets:</span> <span className="font-semibold text-emerald-600 ml-1">{npr(txn?.trainer_payout_paisa ? txn.trainer_payout_paisa / 100 : null)}</span></div>
              <div className="col-span-2"><span className="text-slate-400">Status:</span>
                <span className={`ml-1 font-bold text-xs px-2 py-0.5 rounded-full ${STATUS_META[enrollment.status]?.bg} ${STATUS_META[enrollment.status]?.text}`}>
                  {enrollment.status}
                </span>
              </div>
              {enrollment.dispute_reason && (
                <div className="col-span-2"><span className="text-slate-400">Dispute reason:</span> <span className="text-red-600 ml-1 italic">"{enrollment.dispute_reason}"</span></div>
              )}
            </div>
          </div>

          {step === "choose" && (
            <>
              <p className="text-sm font-semibold text-slate-700">Choose a resolution:</p>
              <div className="space-y-3">
                <button
                  onClick={() => setDecision("release_to_trainer")}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${decision === "release_to_trainer" ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${decision === "release_to_trainer" ? "bg-emerald-100" : "bg-slate-100"}`}>
                      <CheckCheck className={`w-4 h-4 ${decision === "release_to_trainer" ? "text-emerald-600" : "text-slate-500"}`} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800">Release to Trainer</p>
                      <p className="text-xs text-slate-500 mt-0.5">Trainer receives {npr(txn?.trainer_payout_paisa ? txn.trainer_payout_paisa / 100 : null)}. Course marked complete.</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setDecision("refund_to_seeker")}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${decision === "refund_to_seeker" ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${decision === "refund_to_seeker" ? "bg-blue-100" : "bg-slate-100"}`}>
                      <ArrowRight className={`w-4 h-4 ${decision === "refund_to_seeker" ? "text-blue-600" : "text-slate-500"}`} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800">Refund to Learner</p>
                      <p className="text-xs text-slate-500 mt-0.5">Learner refunded {npr(txn?.amount_paisa ? txn.amount_paisa / 100 : null)}. No payout to trainer.</p>
                    </div>
                  </div>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Admin Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reason for this decision, evidence reviewed…"
                  rows={3}
                  className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setStep("confirm")}
                  disabled={!decision}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold disabled:opacity-40 transition-colors"
                >
                  Continue
                </button>
                <button onClick={onClose} className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            </>
          )}

          {step === "confirm" && (
            <>
              <div className={`rounded-xl p-4 border ${decision === "release_to_trainer" ? "bg-emerald-50 border-emerald-200" : "bg-blue-50 border-blue-200"}`}>
                <p className="text-sm font-bold mb-1 text-slate-800">Confirm: {decision === "release_to_trainer" ? "Release to Trainer" : "Refund to Learner"}</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  This action is <strong>irreversible</strong>. The escrow will be{" "}
                  {decision === "release_to_trainer"
                    ? `released to trainer (${npr(txn?.trainer_payout_paisa ? txn.trainer_payout_paisa / 100 : null)}).`
                    : `refunded to the learner (${npr(txn?.amount_paisa ? txn.amount_paisa / 100 : null)}).`}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSubmit} disabled={loading}
                  className={`flex-1 py-2.5 text-white rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 transition-colors ${decision === "release_to_trainer" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"}`}>
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {decision === "release_to_trainer" ? "Confirm — Release Escrow" : "Confirm — Issue Refund"}
                </button>
                <button onClick={() => setStep("choose")} className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50">
                  Back
                </button>
              </div>
            </>
          )}

          {step === "done" && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <p className="font-bold text-slate-800 text-base">{result?.message || "Done!"}</p>
              {result?.trainer_payout_npr && <p className="text-sm text-emerald-600 mt-1">Trainer payout: {npr(result.trainer_payout_npr)}</p>}
              {result?.refund_amount_npr && <p className="text-sm text-blue-600 mt-1">Refund: {npr(result.refund_amount_npr)}</p>}
              <button onClick={onClose} className="mt-5 px-8 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 transition-colors">
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Enrollment Row ───────────────────────────────────────────────────────────
const EnrollmentRow = ({ enrollment, onAction, showToast }) => {
  const [open, setOpen] = useState(false);

  const txn = enrollment.CourseEnrollmentTransaction;
  const course = enrollment.TrainingCourse;
  const seeker = enrollment.JobSeeker?.User;
  const trainer = enrollment.TrainingCourse?.Trainer?.User;
  const meta = STATUS_META[enrollment.status] || STATUS_META.active;

  return (
    <>
      <tr
        className="border-b border-slate-50 hover:bg-slate-50/50 cursor-pointer transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 text-sm truncate max-w-[180px]">{course?.title || "—"}</p>
              <p className="text-[11px] text-slate-400">#{enrollment.enrollment_id}</p>
            </div>
          </div>
        </td>
        <td className="px-5 py-4">
          <p className="text-sm text-slate-700 font-medium">{seeker?.name || "—"}</p>
          <p className="text-[11px] text-slate-400">{seeker?.email}</p>
        </td>
        <td className="px-5 py-4">
          <p className="text-sm text-slate-700 font-medium">{trainer?.name || "—"}</p>
        </td>
        <td className="px-5 py-4">
          {txn ? (
            <div>
              <p className="text-sm font-bold text-slate-800">{npr(txn.amount_paisa / 100)}</p>
              <p className={`text-[11px] font-semibold ${txn.escrow_released ? "text-emerald-600" : "text-amber-600"}`}>
                {txn.escrow_released ? "🔓 Released" : "🔒 In Escrow"}
              </p>
            </div>
          ) : (
            <span className="text-[11px] text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full font-semibold">Free</span>
          )}
        </td>
        <td className="px-5 py-4">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${meta.bg} ${meta.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>
        </td>
        <td className="px-5 py-4 text-sm text-slate-400">{fmt(enrollment.enrolled_at || enrollment.created_at)}</td>
        <td className="px-5 py-4">
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {["disputed", "abandoned"].includes(enrollment.status) && txn && (
              <button
                onClick={() => onAction(enrollment)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Resolve
              </button>
            )}
            {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </td>
      </tr>

      {/* Expanded detail row */}
      {open && (
        <tr className="bg-slate-50/50">
          <td colSpan={7} className="px-5 py-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Seeker Confirmed</p>
                <span className={`text-xs font-bold ${enrollment.seeker_confirmed ? "text-emerald-600" : "text-slate-400"}`}>
                  {enrollment.seeker_confirmed ? "✓ Yes" : "Pending"}
                </span>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Trainer Confirmed</p>
                <span className={`text-xs font-bold ${enrollment.trainer_confirmed ? "text-emerald-600" : "text-slate-400"}`}>
                  {enrollment.trainer_confirmed ? "✓ Yes" : "Pending"}
                </span>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Platform Fee (20%)</p>
                <span className="text-xs font-bold text-slate-700">{npr(txn?.platform_fee_paisa ? txn.platform_fee_paisa / 100 : null)}</span>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Trainer Payout (80%)</p>
                <span className="text-xs font-bold text-emerald-700">{npr(txn?.trainer_payout_paisa ? txn.trainer_payout_paisa / 100 : null)}</span>
              </div>
              {enrollment.dispute_reason && (
                <div className="col-span-4">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Dispute Reason</p>
                  <p className="text-xs text-red-600 italic bg-red-50 px-3 py-2 rounded-lg border border-red-100">"{enrollment.dispute_reason}"</p>
                </div>
              )}
              {enrollment._days_until_auto_release != null && (
                <div className="col-span-4">
                  <p className={`text-xs font-semibold ${enrollment._overdue ? "text-red-600" : "text-amber-600"} flex items-center gap-1.5`}>
                    <Clock className="w-3.5 h-3.5" />
                    {enrollment._overdue
                      ? "Auto-release OVERDUE — escrow will release to trainer automatically"
                      : `Auto-releases in ${enrollment._days_until_auto_release} day(s) (${fmt(enrollment._auto_release_date)})`}
                  </p>
                </div>
              )}
              {txn?.paid_at && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Paid At</p>
                  <span className="text-xs text-slate-600">{fmtTime(txn.paid_at)}</span>
                </div>
              )}
              {txn?.escrow_released_at && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Escrow Released At</p>
                  <span className="text-xs text-emerald-600">{fmtTime(txn.escrow_released_at)}</span>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const EscrowManagement = () => {
  const [tab, setTab] = useState("all"); // all | disputed | abandoned
  const [enrollments, setEnrollments] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      let data;
      if (tab === "disputed") {
        data = await adminGetDisputedEnrollments();
        setEnrollments(data.enrollments || []);
      } else if (tab === "abandoned") {
        data = await adminGetAbandonedEnrollments();
        setEnrollments(data.enrollments || []);
      } else {
        data = await adminGetAllEnrollments(filterStatus ? { status: filterStatus } : {});
        setEnrollments(data.enrollments || []);
        setSummary(data.summary || {});
      }
    } catch (e) {
      setError(e?.message || "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, [tab, filterStatus, refreshKey]);

  useEffect(() => { load(); }, [load]);

  const filtered = enrollments.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.TrainingCourse?.title?.toLowerCase().includes(q) ||
      e.JobSeeker?.User?.name?.toLowerCase().includes(q) ||
      e.TrainingCourse?.Trainer?.User?.name?.toLowerCase().includes(q) ||
      String(e.enrollment_id).includes(q)
    );
  });

  const TABS = [
    { key: "all", label: "All Enrollments", icon: BookOpen, count: summary.total },
    { key: "disputed", label: "Disputes", icon: Flag, count: summary.disputed, alert: true },
    { key: "abandoned", label: "Abandoned", icon: LogOut, count: summary.abandoned },
  ];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl
          ${toast.type === "error" ? "bg-red-500 text-white" : toast.type === "warn" ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"}`}>
          {toast.type === "error" ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Escrow & Payment Management</h2>
          <p className="text-sm text-slate-400 mt-0.5">Review disputes, abandoned enrollments, and release escrow funds</p>
        </div>
        <button onClick={() => setRefreshKey((k) => k + 1)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Summary stats — only on "all" tab */}
      {tab === "all" && Object.keys(summary).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={DollarSign} label="Funds in Escrow" val={`NPR ${Number(summary.escrow_held_npr || 0).toLocaleString()}`} color="text-amber-500" bg="bg-amber-50" />
          <StatCard icon={TrendingUp} label="Released to Date" val={`NPR ${Number(summary.escrow_released_npr || 0).toLocaleString()}`} color="text-emerald-500" bg="bg-emerald-50" />
          <StatCard icon={Flag} label="Active Disputes" val={summary.disputed || 0} color="text-red-500" bg="bg-red-50" />
          <StatCard icon={LogOut} label="Abandoned" val={summary.abandoned || 0} color="text-slate-500" bg="bg-slate-50" />
        </div>
      )}

      {/* Escrow flow info banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-white border border-blue-100 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <p className="font-bold text-blue-800 text-sm">Escrow Policy Summary</p>
          <p className="text-xs text-blue-600 mt-1 leading-relaxed">
            Payments are held in escrow after Khalti verification. Funds release when <strong>both parties confirm</strong> completion.
            If a learner <strong>abandons</strong> the course, escrow auto-releases to the trainer after <strong>7 days</strong> unless a dispute is raised.
            <strong> Disputes</strong> freeze escrow and require admin review. Admin can release to trainer or refund to learner.
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setSearch(""); setFilterStatus(""); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.count != null && (
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${t.alert && t.count > 0 ? "bg-red-100 text-red-600" : "bg-slate-200 text-slate-600"}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by course, learner, trainer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        {tab === "all" && (
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">All Statuses</option>
            {["pending", "active", "completed", "abandoned", "disputed", "refunded"].map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm flex-1">{error}</span>
          <button onClick={load} className="text-xs font-bold underline flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-16 text-center">
          <CheckCircle2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No enrollments found for this view.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                {["Course", "Learner", "Trainer", "Amount", "Status", "Date", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <EnrollmentRow
                  key={e.enrollment_id}
                  enrollment={e}
                  onAction={(enr) => setSelectedEnrollment(enr)}
                  showToast={showToast}
                />
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-slate-50 text-xs text-slate-400">
            Showing {filtered.length} enrollment{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {/* Decision modal */}
      {selectedEnrollment && (
        <DecisionModal
          enrollment={selectedEnrollment}
          onClose={() => setSelectedEnrollment(null)}
          onDone={() => { setSelectedEnrollment(null); setRefreshKey((k) => k + 1); }}
          showToast={showToast}
        />
      )}
    </div>
  );
};

export default EscrowManagement;