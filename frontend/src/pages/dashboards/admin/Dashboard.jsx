import { useState, useEffect, useCallback } from "react";
import {
  Users, Briefcase, BookOpen, Activity, DollarSign, TrendingUp,
  ShieldCheck, UserCheck, Loader2, RefreshCw, AlertCircle,
  CheckCircle2, AlertTriangle, XCircle, Clock, Banknote,
  Handshake, Crown,
} from "lucide-react";
import {
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { getPlatformStats, getSystemLogs } from "../../../api/adminApi";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const num = (n) => Number(n ?? 0).toLocaleString("en-NP");
const npr = (n) => `NPR ${Number(n ?? 0).toLocaleString("en-NP")}`;
const fmtTime = (d) => {
  if (!d) return "—";
  const diff = Date.now() - new Date(d).getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}hr ago`;
  if (diff < 86_400_000 * 2) return "yesterday";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

const LOG_STATUS = {
  Success: { icon: CheckCircle2, color: "rgb(16,185,129)", bg: "rgba(16,185,129,0.08)" },
  Warning: { icon: AlertTriangle, color: "rgb(245,158,11)", bg: "rgba(245,158,11,0.08)" },
  Error: { icon: XCircle, color: "rgb(220,38,38)", bg: "rgba(220,38,38,0.08)" },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skel = ({ w = "w-full", h = "h-4" }) => (
  <div className={`${h} ${w} bg-slate-200/60 rounded-lg animate-pulse`} />
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, val, sub, gradient, iconBg, iconColor }) => (
  <div className="rounded-2xl p-5" style={{ background: gradient || "var(--color-card)", border: gradient ? "none" : "1px solid var(--color-border)" }}>
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg || "rgba(3,105,161,0.08)" }}>
        <Icon className="w-7 h-7" style={{ color: iconColor || "var(--color-primary)" }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs" style={{ color: gradient ? "rgba(255,255,255,0.7)" : "var(--color-muted-foreground)" }}>{label}</p>
        <p className="text-2xl font-bold truncate" style={{ color: gradient ? "#fff" : "var(--color-foreground)" }}>{val}</p>
        {sub && <p className="text-[11px] mt-0.5 truncate" style={{ color: gradient ? "rgba(255,255,255,0.6)" : "var(--color-muted-foreground)" }}>{sub}</p>}
      </div>
    </div>
  </div>
);

const EarningsBanner = ({ earnings, loading }) => {
  const cf = earnings?.course_fees || {};
  const hf = earnings?.hiring_fees || {};
  const pm = earnings?.premium || {};

  const streams = [
    {
      icon: BookOpen,
      label: "Course Platform Fees",
      sublabel: "20% of each released enrollment",
      total: cf.total_npr,
      mtd: cf.mtd_npr,
      color: "#6366F1",
    },
    {
      icon: Handshake,
      label: `Hiring Fees · NPR ${hf.fee_per_hire_npr ?? 500}/hire`,
      sublabel: `${num(hf.total_hires)} paid · ${num(hf.waived_hires)} waived`,
      total: hf.total_npr,
      mtd: hf.mtd_npr,
      color: "#10B981",
      extra: hf.pending_npr > 0 ? `+ ${npr(hf.pending_npr)} pending` : null,
    },
    {
      icon: Crown,
      label: "Premium Subscriptions",
      sublabel: `${num(pm.total_subscribers)} active subscribers`,
      total: pm.total_npr,
      mtd: pm.mtd_npr,
      color: "#F59E0B",
    },
  ];

  return (
    <div className="rounded-2xl p-6 mb-6" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)" }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-white/50 uppercase tracking-widest">Total Platform Earnings</p>
          <h2 className="text-3xl font-bold text-white mt-1">
            {loading
              ? <span className="inline-block w-36 h-8 bg-white/10 rounded-xl animate-pulse" />
              : npr(earnings?.total_npr)}
          </h2>
          <p className="text-sm text-white/60 mt-1">
            {loading ? "—" : `${npr(earnings?.mtd_npr)} this month`}
          </p>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
          <Banknote className="w-8 h-8 text-white" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {streams.map(({ icon: Icon, label, sublabel, total, mtd, color, extra }) => (
          <div key={label} className="rounded-xl p-4 bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}22` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <p className="text-[11px] text-white/60 uppercase tracking-wider leading-tight">{label}</p>
            </div>
            {loading
              ? <Skel h="h-6" w="w-24" />
              : <>
                <p className="text-xl font-bold text-white">{npr(total)}</p>
                <p className="text-xs text-white/50 mt-0.5">{npr(mtd)} MTD</p>
                <p className="text-[11px] text-white/40 mt-0.5">{sublabel}</p>
                {extra && <p className="text-[11px] mt-0.5" style={{ color: "#F59E0B" }}>{extra}</p>}
              </>
            }
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const Dashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [statsRes, logsRes] = await Promise.all([
        getPlatformStats(),
        getSystemLogs(10),
      ]);
      setStats(statsRes);
      setLogs(logsRes?.logs || []);
    } catch (e) {
      setError(e?.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const kpis = stats?.kpis || {};
  const escrow = stats?.escrow || {};
  const earnings = stats?.earnings || {};
  const charts = stats?.charts || {};
  const roles = charts.roleDistribution || [];
  const weekly = charts.weekly || [];
  const monthly = charts.monthlyEarnings || [];
  const breakdown = charts.earningsBreakdown || [];
  const hf = earnings.hiring_fees || {};

  const STAT_CARDS = [
    {
      icon: Users, label: "Total Users",
      val: loading ? "—" : num(kpis.totalUsers),
      sub: loading ? "" : `+${num(kpis.newUsersThisWeek)} this week`,
    },
    {
      icon: Briefcase, label: "Open Jobs",
      val: loading ? "—" : num(kpis.openJobs),
      sub: loading ? "" : `${num(kpis.totalApplications)} applications`,
      gradient: "linear-gradient(90deg, var(--color-primary), var(--color-secondary))",
      iconBg: "rgba(255,255,255,0.12)", iconColor: "#fff",
    },
    {
      icon: BookOpen, label: "Active Courses",
      val: loading ? "—" : num(kpis.activeCourses),
      sub: loading ? "" : `${num(kpis.enrollmentsMTD)} enrolled MTD`,
      gradient: "var(--color-accent)",
      iconBg: "rgba(255,255,255,0.12)", iconColor: "#fff",
    },
    {
      icon: Activity, label: "Hires This Month",
      val: loading ? "—" : num(kpis.hiresThisMonth),
      sub: loading ? "" : `${num(kpis.totalHires)} total hires`,
      gradient: "linear-gradient(90deg, var(--color-primary), var(--color-secondary))",
      iconBg: "rgba(255,255,255,0.12)", iconColor: "#fff",
    },
  ];

  const SECONDARY_CARDS = [
    { icon: DollarSign, label: "Escrow Held", val: npr(escrow.held_npr), color: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
    { icon: ShieldCheck, label: "Active Disputes", val: num(kpis.disputedEnrollments), color: "#EF4444", bg: "rgba(239,68,68,0.08)" },
    { icon: UserCheck, label: "Pending Verifications", val: num((kpis.pendingTrainers || 0) + (kpis.pendingEmployers || 0)), color: "#8B5CF6", bg: "rgba(139,92,246,0.08)" },
    { icon: TrendingUp, label: "Premium Subscribers", val: num(kpis.premiumTotal), color: "#10B981", bg: "rgba(16,185,129,0.08)" },
  ];

  const HIRING_CARDS = [
    { label: "Total Hires Billed", val: num(hf.total_hires), color: "#6366F1", bg: "rgba(99,102,241,0.08)" },
    { label: "Fees Collected", val: npr(hf.paid_npr), color: "#10B981", bg: "rgba(16,185,129,0.08)" },
    { label: "Fees Pending", val: npr(hf.pending_npr), color: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
    { label: "Hires Waived", val: num(hf.waived_hires), color: "#8B5CF6", bg: "rgba(139,92,246,0.08)" },
  ];

  const CHART_COLORS = { course_fees: "#6366F1", hiring_fees: "#10B981", premium: "#F59E0B" };

  return (
    <>
      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 text-red-600 rounded-2xl border border-red-100">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm flex-1">{error}</span>
          <button onClick={load} className="flex items-center gap-1 text-xs font-bold underline">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-foreground)" }}>
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
            Here's what's happening on SkillRemit today
          </p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold hover:opacity-80 disabled:opacity-40 transition-opacity"
          style={{ background: "var(--color-card)", borderColor: "var(--color-border)", color: "var(--color-foreground)" }}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Earnings Banner */}
      <EarningsBanner earnings={earnings} loading={loading} />

      {/* KPI Row 1 */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {STAT_CARDS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* KPI Row 2 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {SECONDARY_CARDS.map(({ icon: Icon, label, val, color, bg }) => (
          <div key={label} className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px]" style={{ color: "var(--color-muted-foreground)" }}>{label}</p>
              {loading ? <Skel h="h-5" w="w-16" /> : <p className="text-lg font-bold" style={{ color: "var(--color-foreground)" }}>{val}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1: Monthly stacked bar + Revenue mix donut */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 rounded-2xl p-6" style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}>
          <h3 className="text-base font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>Monthly Earnings (last 6 months)</h3>
          {loading
            ? <div className="h-52 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
            : (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthly} barCategoryGap="30%">
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                      tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                    <Tooltip
                      formatter={(v, name) => [npr(v), name === "course_fees" ? "Course Fees" : name === "hiring_fees" ? "Hiring Fees" : "Premium"]}
                      contentStyle={{ borderRadius: "12px", fontSize: "12px" }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                      formatter={v => v === "course_fees" ? "Course Fees" : v === "hiring_fees" ? "Hiring Fees" : "Premium"} />
                    <Bar dataKey="course_fees" stackId="a" fill={CHART_COLORS.course_fees} />
                    <Bar dataKey="hiring_fees" stackId="a" fill={CHART_COLORS.hiring_fees} />
                    <Bar dataKey="premium" stackId="a" fill={CHART_COLORS.premium} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
        </div>

        <div className="rounded-2xl p-6" style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}>
          <h3 className="text-base font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>Revenue Mix</h3>
          {loading
            ? <div className="h-52 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
            : (
              <>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={breakdown} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={2} dataKey="value">
                        {breakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip formatter={(v) => npr(v)} contentStyle={{ borderRadius: "12px", fontSize: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 mt-3">
                  {breakdown.map((d) => {
                    const total = breakdown.reduce((s, x) => s + (x.value || 0), 0);
                    const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
                    return (
                      <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                          <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>{d.name}</span>
                        </div>
                        <span className="text-xs font-bold" style={{ color: "var(--color-foreground)" }}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
        </div>
      </div>

      {/* Charts Row 2: User distribution + Activity line */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="rounded-2xl p-6" style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}>
          <h3 className="text-base font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>User Distribution</h3>
          {loading
            ? <div className="h-48 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
            : (
              <>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={roles} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={2} dataKey="value">
                        {roles.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip formatter={(v) => v.toLocaleString()} contentStyle={{ borderRadius: "12px", fontSize: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 mt-3">
                  {roles.map((d) => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                        <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>{d.name}</span>
                      </div>
                      <span className="text-xs font-bold" style={{ color: "var(--color-foreground)" }}>{num(d.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
        </div>

        <div className="col-span-2 rounded-2xl p-6" style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}>
          <h3 className="text-base font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>Platform Activity (last 7 days)</h3>
          {loading
            ? <div className="h-48 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
            : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weekly}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                    <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px" }} />
                    <Line type="monotone" dataKey="users" stroke="var(--color-primary)" strokeWidth={2} dot={false} name="New Users" />
                    <Line type="monotone" dataKey="jobs" stroke="#10B981" strokeWidth={2} dot={false} name="Jobs Posted" />
                    <Line type="monotone" dataKey="enrollments" stroke="#F59E0B" strokeWidth={2} dot={false} name="Enrollments" />
                    <Line type="monotone" dataKey="hires" stroke="#EF4444" strokeWidth={2} dot={false} name="Hires" />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
        </div>
      </div>

      {/* Hiring Fee Detail Row */}
      <div className="mb-6">
        <h3 className="text-base font-semibold mb-3" style={{ color: "var(--color-foreground)" }}>Hiring Fee Breakdown</h3>
        <div className="grid grid-cols-4 gap-4">
          {HIRING_CARDS.map(({ label, val, color, bg }) => (
            <div key={label} className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                <Handshake className="w-5 h-5" style={{ color }} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px]" style={{ color: "var(--color-muted-foreground)" }}>{label}</p>
                {loading ? <Skel h="h-5" w="w-16" /> : <p className="text-lg font-bold" style={{ color: "var(--color-foreground)" }}>{val}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Logs */}
      <section>
        <h3 className="text-base font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>Recent System Activity</h3>
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", background: "rgba(15,23,42,0.03)" }}>
                {["Event", "Source", "Type", "Amount", "Time", "Status"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold" style={{ color: "var(--color-muted-foreground)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--color-border)" }}>
                    {[200, 120, 80, 80, 60, 60].map((w, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded-lg animate-pulse" style={{ width: w }} /></td>
                    ))}
                  </tr>
                ))
                : logs.length === 0
                  ? <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm">No recent activity.</td></tr>
                  : logs.map((log, i) => {
                    const meta = LOG_STATUS[log.status] || LOG_STATUS.Success;
                    const StatusIcon = meta.icon;
                    const typeBg =
                      log.type === "Hiring" ? "bg-emerald-50 text-emerald-700" :
                        log.type === "Escrow" ? "bg-amber-50  text-amber-700" :
                          log.type === "Enrollment" ? "bg-purple-50 text-purple-700" :
                            "bg-slate-100 text-slate-600";
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid var(--color-border)" }}>
                        <td className="px-5 py-3.5 font-semibold text-sm" style={{ color: "var(--color-foreground)" }}>{log.event}</td>
                        <td className="px-5 py-3.5 text-sm" style={{ color: "var(--color-muted-foreground)" }}>{log.user || "System"}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${typeBg}`}>{log.type}</span>
                        </td>
                        <td className="px-5 py-3.5 text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>{log.amount || "—"}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                            <Clock className="w-3 h-3" />{fmtTime(log.time)}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{ background: meta.bg, color: meta.color }}>
                            <StatusIcon className="w-3 h-3" />{log.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
};

export default Dashboard;