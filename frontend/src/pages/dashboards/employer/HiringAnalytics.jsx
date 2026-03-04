import { useState, useEffect } from "react";
import {
  BarChart2, TrendingUp, Users, CheckCircle,
  Star, Loader2, Briefcase, Target,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";
import { getApplicantStats } from "../../../api/applicationsApi.js";
import { getEmployerJobs } from "../../../api/jobApi.js";

const PIE_COLORS = {
  Pending: "#f59e0b",
  Shortlisted: "#3b82f6",
  Hired: "#22c55e",
  Rejected: "#ef4444",
};

// Custom tooltip for bar chart
const JobTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0",
      borderRadius: 10, padding: "10px 14px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)", fontSize: 12,
    }}>
      <p style={{ fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: <span style={{ color: "#0f172a" }}>{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const HiringAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.allSettled([
      getApplicantStats(),
      getEmployerJobs(),
    ]).then(([statsRes, jobsRes]) => {
      if (statsRes.status === "fulfilled") setStats(statsRes.value?.stats || statsRes.value);
      if (jobsRes.status === "fulfilled") {
        // normalise: API may return array directly or { jobs: [] }
        const raw = jobsRes.value;
        setJobs(Array.isArray(raw) ? raw : raw?.jobs || []);
      }
    }).catch(() => setError("Failed to load analytics."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  if (error) return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex gap-3 text-red-600 text-sm font-semibold">
      {error}
    </div>
  );

  const total = stats?.total_applications || 0;
  const shortlisted = stats?.shortlisted || 0;
  const hired = stats?.hired || 0;
  const rejected = stats?.rejected || 0;
  const pending = stats?.pending || 0;
  const conversionRate = total > 0 ? Math.round((hired / total) * 100) : 0;

  // Pie — only show slices with value > 0
  const pieData = [
    { name: "Pending", value: pending },
    { name: "Shortlisted", value: shortlisted },
    { name: "Hired", value: hired },
    { name: "Rejected", value: rejected },
  ].filter(d => d.value > 0);

  const jobsBarData = [...jobs]
    .sort((a, b) => (b.applicants_count || 0) - (a.applicants_count || 0))
    .slice(0, 8)
    .map(j => ({
      name: j.title?.length > 18 ? j.title.slice(0, 18) + "…" : (j.title || "Untitled"),
      applicants: j.applicants_count || 0,
      status: j.status,
      fullTitle: j.title,
      location: j.location,
    }));

  // Funnel stages
  const funnelStages = [
    { label: "Applications Received", value: total, pct: 100, colorBar: "#3b82f6", colorBg: "#dbeafe" },
    { label: "Shortlisted", value: shortlisted, pct: total > 0 ? Math.round(shortlisted / total * 100) : 0, colorBar: "#7c3aed", colorBg: "#ede9fe" },
    { label: "Hired", value: hired, pct: total > 0 ? Math.round(hired / total * 100) : 0, colorBar: "#22c55e", colorBg: "#dcfce7" },
  ];

  const hasAnyData = total > 0 || jobs.length > 0;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800">Hiring Analytics</h2>
        <p className="text-sm text-slate-500 mt-0.5">Live data from your hiring pipeline</p>
      </div>

      {/* ── KPI cards ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Applications", value: total, icon: Users, bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700", sub: "text-blue-500" },
          { label: "Shortlisted", value: shortlisted, icon: Star, bg: "bg-violet-50", border: "border-violet-100", text: "text-violet-700", sub: "text-violet-500" },
          { label: "Hired", value: hired, icon: CheckCircle, bg: "bg-green-50", border: "border-green-100", text: "text-green-700", sub: "text-green-500" },
          { label: "Conversion Rate", value: `${conversionRate}%`, icon: TrendingUp, bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700", sub: "text-amber-500" },
        ].map(({ label, value, icon: Icon, bg, border, text, sub }) => (
          <div key={label} className={`${bg} border ${border} rounded-2xl p-5`}>
            <Icon className={`w-5 h-5 ${text} mb-2`} />
            <p className={`text-2xl font-extrabold ${text}`}>{value}</p>
            <p className={`text-xs font-semibold ${sub} mt-0.5`}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Pie + Bar grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Status Breakdown Pie */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-1">Application Status Breakdown</h3>
          <p className="text-xs text-slate-400 mb-4">All applications across your jobs</p>
          {pieData.length === 0 ? (
            <EmptyChart message="No applications yet" />
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={52} outerRadius={80}
                    paddingAngle={3} dataKey="value"
                    label={({ name, percent }) =>
                      `${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={PIE_COLORS[entry.name] || "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 10, fontSize: 12, border: "1px solid #e2e8f0" }}
                    formatter={(value, name) => [value, name]}
                  />
                  <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Mini legend with counts */}
          {pieData.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { label: "Pending", value: pending, color: "bg-amber-400" },
                { label: "Shortlisted", value: shortlisted, color: "bg-blue-500" },
                { label: "Hired", value: hired, color: "bg-green-500" },
                { label: "Rejected", value: rejected, color: "bg-red-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${color} shrink-0`} />
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className="text-xs font-bold text-slate-700 ml-auto">{value}</span>
                  <span className="text-xs text-slate-400">
                    ({total > 0 ? Math.round(value / total * 100) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Applications per Job — REAL applicants_count */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-1">Applicants per Job</h3>
          <p className="text-xs text-slate-400 mb-4">
            Real-time counts from your {jobs.length} posted job{jobs.length !== 1 ? "s" : ""}
          </p>
          {jobsBarData.length === 0 ? (
            <EmptyChart message="No jobs posted yet" />
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={jobsBarData}
                  layout="vertical"
                  margin={{ left: 4, right: 24, top: 4, bottom: 4 }}
                  barSize={16}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis
                    type="number"
                    axisLine={false} tickLine={false}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    allowDecimals={false}
                  />
                  <YAxis
                    dataKey="name" type="category"
                    axisLine={false} tickLine={false}
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    width={90}
                  />
                  <Tooltip content={<JobTooltip />} />
                  <Bar
                    dataKey="applicants"
                    name="Applicants"
                    fill="#3b82f6"
                    radius={[0, 6, 6, 0]}
                    background={{ fill: "#f1f5f9", radius: [0, 6, 6, 0] }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Job list summary below chart */}
          {jobs.length > 0 && (
            <div className="mt-4 space-y-2">
              {jobs
                .sort((a, b) => (b.applicants_count || 0) - (a.applicants_count || 0))
                .slice(0, 4)
                .map(job => (
                  <div key={job.job_id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{job.title}</p>
                      {job.location && (
                        <p className="text-[10px] text-slate-400">{job.location}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${job.status === "open"
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}>
                        {job.status}
                      </span>
                      <span className="text-xs font-extrabold text-blue-600">
                        {job.applicants_count || 0}
                        <span className="text-[9px] font-normal text-slate-400 ml-0.5">applied</span>
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Hiring Funnel ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-1">Hiring Funnel</h3>
        <p className="text-xs text-slate-400 mb-5">
          Conversion at each stage of your pipeline
        </p>

        {total === 0 ? (
          <EmptyChart message="No applications in your pipeline yet" />
        ) : (
          <div className="space-y-4">
            {funnelStages.map(({ label, value, pct, colorBar, colorBg }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-slate-700">{label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-extrabold text-slate-800">{value}</span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: colorBg, color: colorBar }}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>
                {/* Track */}
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${pct}%`, background: colorBar }}
                  />
                </div>
              </div>
            ))}

            {/* Drop-off indicators */}
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
              <Metric label="Applied → Shortlisted" value={total > 0 ? `${Math.round(shortlisted / total * 100)}%` : "—"} color="text-violet-600" />
              <Metric label="Shortlisted → Hired" value={shortlisted > 0 ? `${Math.round(hired / shortlisted * 100)}%` : "—"} color="text-green-600" />
              <Metric label="Overall Conversion" value={`${conversionRate}%`} color="text-blue-600" />
            </div>
          </div>
        )}
      </div>

      {/* ── Jobs table summary ───────────────────────────────────────────────── */}
      {jobs.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">All Jobs Overview</h3>
            <p className="text-xs text-slate-400 mt-0.5">Applicant counts and salary ranges for each posting</p>
          </div>
          <div className="divide-y divide-slate-100">
            {jobs.map(job => (
              <div key={job.job_id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                {/* Icon */}
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                </div>

                {/* Title + location */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{job.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{job.location || "—"}</p>
                </div>

                {/* Salary */}
                {(job.salary_min || job.salary_max) && (
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-slate-700">
                      NPR {Number(job.salary_min || 0).toLocaleString()}
                      {job.salary_max ? ` – ${Number(job.salary_max).toLocaleString()}` : ""}
                    </p>
                    <p className="text-[10px] text-slate-400">salary range</p>
                  </div>
                )}

                {/* Status badge */}
                <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shrink-0 ${job.status === "open"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}>
                  {job.status}
                </span>

                {/* Applicants count — the KEY dynamic value */}
                <div className="text-right shrink-0 min-w-[52px]">
                  <p className={`text-lg font-extrabold leading-tight ${(job.applicants_count || 0) > 0 ? "text-blue-600" : "text-slate-300"
                    }`}>
                    {job.applicants_count || 0}
                  </p>
                  <p className="text-[10px] text-slate-400">applied</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── helpers ───────────────────────────────────────────────────────────────────
function EmptyChart({ message }) {
  return (
    <div className="h-52 flex flex-col items-center justify-center gap-2 text-slate-300">
      <BarChart2 className="w-8 h-8" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

function Metric({ label, value, color }) {
  return (
    <div>
      <p className={`text-lg font-extrabold ${color}`}>{value}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

export default HiringAnalytics;