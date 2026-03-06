import { useState, useEffect } from "react";
import {
  Brain, Plus, TrendingUp, Users, Briefcase,
  CheckCircle, Clock, XCircle, ArrowUpRight,
  Loader2, AlertCircle, Crown, Sparkles
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { getEmployerDashboard } from "../../../api/employerApi.js";
import { getApplicantStats } from "../../../api/applicationsApi.js";
import { getEmployerJobs } from "../../../api/jobApi.js";
import { getPremiumStatus } from "../../../api/premiumApi.js";
import { getMyHiringFees } from "../../../api/hiringApi.js";

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";
import PremiumUpgrade from "../../../components/modals/PremiumUpgrade";

const STAT_CONFIGS = [
  { key: "total_jobs", label: "Active Jobs", icon: Briefcase, colorClass: "text-blue-700", bgClass: "bg-blue-50", iconBg: "bg-blue-100" },
  { key: "total_applications", label: "Total Applications", icon: Users, colorClass: "text-violet-700", bgClass: "bg-violet-50", iconBg: "bg-violet-100" },
  { key: "shortlisted", label: "Shortlisted", icon: TrendingUp, colorClass: "text-amber-700", bgClass: "bg-amber-50", iconBg: "bg-amber-100" },
  { key: "hired", label: "Hired", icon: CheckCircle, colorClass: "text-green-700", bgClass: "bg-green-50", iconBg: "bg-green-100" },
];

// Build 6-month chart from real API data
function buildChartData(transactions = [], dashboardMonthly = []) {
  // Prefer dashboard monthly stats if the backend returns them
  if (dashboardMonthly && dashboardMonthly.length > 0) {
    return dashboardMonthly.map(m => ({
      month: m.month,
      applications: Number(m.applications) || 0,
      hired: Number(m.hired) || 0,
    }));
  }

  // Fall back: build from hiring fee transaction timestamps
  const now = new Date();
  const monthMap = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("default", { month: "short" });
    monthMap[key] = { month: label, applications: 0, hired: 0 };
  }

  for (const txn of transactions) {
    if (txn.status !== "completed") continue;
    const d = new Date(txn.hired_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (monthMap[key]) monthMap[key].hired += 1;
  }

  return Object.values(monthMap);
}

export default function EmployerDashboard({ onNavigate }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [premiumStatus, setPremiumStatus] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = async () => {
    try {
      const [dashRes, statRes, jobRes, feesRes] = await Promise.allSettled([
        getEmployerDashboard(),
        getApplicantStats(),
        getEmployerJobs(),
        getMyHiringFees(),
      ]);

      const d = dashRes.status === "fulfilled" ? dashRes.value || {} : {};
      const s = statRes.status === "fulfilled" ? statRes.value?.stats || {} : {};
      const j = jobRes.status === "fulfilled" ? (Array.isArray(jobRes.value) ? jobRes.value : []) : [];
      const fees = feesRes.status === "fulfilled" ? feesRes.value : { transactions: [], summary: null };

      const chartData = buildChartData(fees?.transactions || [], d?.monthly_stats || []);

      setStats({
        total_jobs: j.filter(x => x.status !== "closed").length,
        total_applications: s.total_applications || d.total_applications || 0,
        shortlisted: s.shortlisted || d.shortlisted || 0,
        hired: s.hired || d.hired || 0,
        pending: s.pending || 0,
        rejected: s.rejected || 0,
        chartData,
        hiringFeesSummary: fees?.summary || null,
      });
      setJobs(j.slice(0, 5));
    } catch {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    setStatusLoading(true);
    getPremiumStatus(user?.current_role || "employer")
      .then(setPremiumStatus)
      .catch(() => {})
      .finally(() => setStatusLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  if (error) return (
    <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
      <AlertCircle className="w-5 h-5" />{error}
    </div>
  );

  const isPremium = premiumStatus?.is_premium ?? false;
  const checksUsed = premiumStatus?.ai_checks_used ?? 0;
  const checksLimit = premiumStatus?.ai_checks_limit ?? 5;

  return (
    <>
      <div className="space-y-6">

        {/* ── Premium status banner ── */}
        <div className={`rounded-2xl border px-5 py-4 flex items-center justify-between gap-4 ${
          isPremium ? "bg-amber-50 border-amber-200"
          : checksUsed >= checksLimit ? "bg-red-50 border-red-200"
          : "bg-slate-50 border-slate-200"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              isPremium ? "bg-amber-100 border-amber-300" : "bg-white border-slate-200"
            }`}>
              {isPremium
                ? <Crown className="w-4 h-4 text-amber-600" />
                : <Brain className="w-4 h-4 text-slate-500" />
              }
            </div>
            {statusLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            ) : isPremium ? (
              <div>
                <p className="text-sm font-bold text-amber-800">Premium Active</p>
                <p className="text-xs text-amber-600">Unlimited AI candidate screenings</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-bold text-slate-800">
                  AI Checks: {checksUsed} / {checksLimit} used
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        checksUsed >= checksLimit ? "bg-red-500"
                        : checksUsed >= 3 ? "bg-amber-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${Math.min(100, (checksUsed / checksLimit) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400">
                    {checksUsed >= checksLimit ? "Limit reached" : `${checksLimit - checksUsed} remaining`}
                  </span>
                </div>
              </div>
            )}
          </div>
          {!isPremium && (
            <button
              onClick={() => setShowUpgrade(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Upgrade to Premium
            </button>
          )}
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STAT_CONFIGS.map(({ key, label, icon: Icon, bgClass, colorClass, iconBg }) => (
            <div key={key} className={`${bgClass} rounded-2xl p-5 border border-white/80 shadow-sm`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${colorClass}`} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">{label}</p>
                  <p className={`text-2xl font-extrabold ${colorClass}`}>{stats?.[key] ?? 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Chart + Application status ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-slate-800">Hiring Overview</h3>
                <p className="text-xs text-slate-400 mt-0.5">Applications vs Hires — last 6 months</p>
              </div>
              <button
                onClick={() => onNavigate("analytics")}
                className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline"
              >
                Full Report <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.chartData || []} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="applications" fill="#dbeafe" radius={[6, 6, 0, 0]} name="Applications" />
                  <Bar dataKey="hired" fill="#2563eb" radius={[6, 6, 0, 0]} name="Hired" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-3 justify-end">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <div className="w-3 h-3 rounded bg-blue-100" /> Applications
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <div className="w-3 h-3 rounded bg-blue-600" /> Hired
              </div>
            </div>

            {/* Hiring fees summary strip */}
            {stats?.hiringFeesSummary && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500">
                <span>Total hires: <strong className="text-slate-700">{stats.hiringFeesSummary.total_hires ?? 0}</strong></span>
                <span>Fees paid: <strong className="text-green-700">Rs. {(stats.hiringFeesSummary.paid_fee_npr ?? 0).toLocaleString()}</strong></span>
                {(stats.hiringFeesSummary.pending_fee_npr ?? 0) > 0 && (
                  <span>Pending: <strong className="text-amber-600">Rs. {stats.hiringFeesSummary.pending_fee_npr.toLocaleString()}</strong></span>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Application Status</h3>
            <div className="space-y-3">
              {[
                { label: "Pending", value: stats?.pending, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
                { label: "Shortlisted", value: stats?.shortlisted, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50" },
                { label: "Hired", value: stats?.hired, icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
                { label: "Rejected", value: stats?.rejected, icon: XCircle, color: "text-red-400", bg: "bg-red-50" },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className={`flex items-center justify-between p-3 ${bg} rounded-xl`}>
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="text-sm font-semibold text-slate-700">{label}</span>
                  </div>
                  <span className={`text-lg font-extrabold ${color}`}>{value ?? 0}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => onNavigate("applicants")}
              className="w-full mt-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200 transition-colors"
            >
              View All Applicants →
            </button>
          </div>
        </div>

        {/* ── AI Candidates promo ── */}
        <div className="bg-slate-900 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white leading-tight">
                AI-Powered Candidate Matching
              </h3>
              <p className="text-white/60 text-sm mt-0.5">
                Rank applicants by skill match score instantly
              </p>
              <p className="text-white/40 text-xs mt-1">
                {isPremium
                  ? "Unlimited analyses — Premium active"
                  : `Free tier: ${checksLimit - checksUsed} of ${checksLimit} checks remaining`}
              </p>
            </div>
          </div>
          {!isPremium && (
            <button
              onClick={() => setShowUpgrade(true)}
              className="px-5 py-2.5 border border-white/25 text-white/80 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors shrink-0"
            >
              Upgrade to Premium
            </button>
          )}
        </div>

        {/* ── Recent jobs table ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">Recent Job Posts</h3>
            <div className="flex gap-2">
              <button onClick={() => onNavigate("my-jobs")} className="text-xs text-blue-600 font-semibold hover:underline">
                View All
              </button>
              <button
                onClick={() => onNavigate("post-job")}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
              >
                <Plus className="w-3 h-3" /> Post New Job
              </button>
            </div>
          </div>
          {jobs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No jobs yet.{" "}
              <button onClick={() => onNavigate("post-job")} className="text-blue-600 font-semibold hover:underline">
                Post your first job →
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Job Title", "Location", "Salary", "Status", "Applicants", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.job_id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-800 text-sm">{job.title}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-sm">{job.location || "—"}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-sm">
                      {job.salary_min && job.salary_max
                        ? `Rs. ${Number(job.salary_min).toLocaleString()} – ${Number(job.salary_max).toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        job.status === "open" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        {job.status === "open" ? "Active" : job.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-slate-700">{job.applicants_count ?? 0}</td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => onNavigate("ai-candidates")}
                        className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline"
                      >
                        <Brain className="w-3 h-3" /> AI Match
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* ── Modals ── */}
      {showUpgrade && (
        <PremiumUpgrade
          role={user?.current_role || "employer"}
          onClose={() => setShowUpgrade(false)}
        />
      )}
    </>
  );
}