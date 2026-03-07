import { useState, useEffect, useCallback } from "react";
import {
  Users, Briefcase, BookOpen, TrendingUp, DollarSign, Activity,
  Award, ShieldCheck, Loader2, RefreshCw, AlertCircle,
  UserCheck, Star, BarChart2,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { getPlatformStats } from "../../../api/adminApi";

const nprFmt = (n) => `NPR ${Number(n ?? 0).toLocaleString("en-NP")}`;
const num = (n) => Number(n ?? 0).toLocaleString("en-NP");

const StatCard = ({ icon: Icon, label, val, sub, color, bg }) => (
  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
    <div className="flex items-start gap-3">
      <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{val}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  </div>
);

const Skel = ({ h = "h-8", w = "w-full" }) => (
  <div className={`${h} ${w} bg-slate-100 rounded-xl animate-pulse`} />
);

const PlatformAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await getPlatformStats();
      setData(res);
    } catch (e) {
      setError(e?.message || "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const kpis = data?.kpis || {};
  const escrow = data?.escrow || {};
  const charts = data?.charts || {};
  const weekly = charts.weekly || [];
  const monthly = charts.monthlyEscrow || [];
  const roles = charts.roleDistribution || [];

  const STATS = [
    { icon: Users, label: "Total Users", val: num(kpis.totalUsers), sub: `+${num(kpis.newUsersThisWeek)} this week`, color: "text-indigo-500", bg: "bg-indigo-50" },
    { icon: Briefcase, label: "Open Jobs", val: num(kpis.openJobs), sub: "Active listings", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: BookOpen, label: "Active Courses", val: num(kpis.activeCourses), sub: `${num(kpis.totalSkills)} skills tagged`, color: "text-amber-500", bg: "bg-amber-50" },
    { icon: TrendingUp, label: "Enrollments (MTD)", val: num(kpis.enrollmentsMTD), sub: `${num(kpis.completedEnrollments)} completed`, color: "text-emerald-500", bg: "bg-emerald-50" },
    { icon: DollarSign, label: "Escrow Held", val: nprFmt(escrow.held_npr), sub: "Awaiting confirmation", color: "text-orange-500", bg: "bg-orange-50" },
    { icon: ShieldCheck, label: "Active Disputes", val: num(kpis.disputedEnrollments), sub: "Requires admin review", color: "text-red-500", bg: "bg-red-50" },
    { icon: UserCheck, label: "Pending Verifications", val: num((kpis.pendingTrainers || 0) + (kpis.pendingEmployers || 0)), sub: `${num(kpis.pendingTrainers)} trainers · ${num(kpis.pendingEmployers)} employers`, color: "text-violet-500", bg: "bg-violet-50" },
    { icon: Star, label: "Premium Users", val: num(kpis.premiumTotal), sub: `${num(kpis.premiumSeekers)} seekers · ${num(kpis.premiumEmployers)} employers`, color: "text-teal-500", bg: "bg-teal-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Platform Analytics</h2>
          <p className="text-sm text-slate-400 mt-0.5">Live SkillRemit platform metrics</p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm flex-1">{error}</span>
          <button onClick={load} className="text-xs font-bold underline flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
              <Skel h="h-11" w="w-11" />
              <Skel h="h-3" w="w-20" />
              <Skel h="h-7" w="w-16" />
            </div>
          ))
          : STATS.map((s) => <StatCard key={s.label} {...s} />)
        }
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Weekly Platform Activity (last 7 days)</h3>
          {loading ? <Skel h="h-52" /> : weekly.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-slate-300"><BarChart2 className="w-10 h-10" /></div>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weekly}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "12px" }} />
                  <Line type="monotone" dataKey="users" stroke="#6366F1" strokeWidth={2} dot={false} name="New Users" />
                  <Line type="monotone" dataKey="enrollments" stroke="#10B981" strokeWidth={2} dot={false} name="Enrollments" />
                  <Line type="monotone" dataKey="jobs" stroke="#F59E0B" strokeWidth={2} dot={false} name="New Jobs" />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm mb-4">User Distribution</h3>
          {loading ? <Skel h="h-40" /> : roles.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-slate-300"><BarChart2 className="w-8 h-8" /></div>
          ) : (
            <>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={roles} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {roles.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => v.toLocaleString()} contentStyle={{ borderRadius: "12px", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 mt-3">
                {roles.map((d) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <span className="text-[11px] text-slate-500">{d.name}</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-600">{num(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Escrow chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 text-sm">Escrow Flow — Last 6 Months (NPR)</h3>
          <span className="text-xs text-slate-400">Initiated · Released · Disputed</span>
        </div>
        {loading ? <Skel h="h-56" /> : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} barSize={20} barGap={4}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }}
                  tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "12px" }}
                  formatter={(v) => [nprFmt(v / 100), undefined]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
                <Bar dataKey="initiated" name="Initiated" fill="#6366F1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="released" name="Released" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="disputed" name="Disputed" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Escrow snapshot row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Escrow Held Now", val: nprFmt(escrow.held_npr), icon: DollarSign, color: "text-amber-500", bg: "bg-amber-50" },
          { label: "Released to Trainers MTD", val: nprFmt(escrow.released_mtd_npr), icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Total Initiated MTD", val: nprFmt(escrow.total_initiated_mtd_npr), icon: Activity, color: "text-indigo-500", bg: "bg-indigo-50" },
          { label: "Disputed / Frozen", val: nprFmt(escrow.disputed_value_npr), icon: ShieldCheck, color: "text-red-500", bg: "bg-red-50" },
        ].map(({ label, val, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">{label}</p>
              {loading ? <Skel h="h-5 mt-1" w="w-24" /> : <p className="text-base font-bold text-slate-800 mt-0.5">{val}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Health summary */}
      {!loading && kpis.totalUsers > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 text-sm mb-5">Platform Health Summary</h3>
          <div className="grid grid-cols-3 gap-8">
            {[
              {
                title: "Enrollment Pipeline",
                rows: [
                  { label: "Total MTD", val: num(kpis.enrollmentsMTD), dot: "bg-indigo-400" },
                  { label: "Completed", val: num(kpis.completedEnrollments), dot: "bg-emerald-400" },
                  { label: "Disputed", val: num(kpis.disputedEnrollments), dot: "bg-red-400" },
                  { label: "Abandoned", val: num(kpis.abandonedEnrollments), dot: "bg-slate-300" },
                ],
              },
              {
                title: "User Breakdown",
                rows: [
                  { label: "Job Seekers", val: num(kpis.jobSeekerCount), dot: "bg-indigo-400" },
                  { label: "Employers", val: num(kpis.employerCount), dot: "bg-emerald-400" },
                  { label: "Trainers", val: num(kpis.trainerCount), dot: "bg-amber-400" },
                  { label: "Premium", val: num(kpis.premiumTotal), dot: "bg-teal-400" },
                ],
              },
              {
                title: "Pending Actions",
                rows: [
                  { label: "Trainer Verifications", val: num(kpis.pendingTrainers), dot: "bg-violet-400" },
                  { label: "Employer Verifications", val: num(kpis.pendingEmployers), dot: "bg-orange-400" },
                  { label: "Active Disputes", val: num(kpis.disputedEnrollments), dot: "bg-red-400" },
                ],
              },
            ].map(({ title, rows }) => (
              <div key={title}>
                <p className="text-[11px] uppercase tracking-widest text-slate-400 mb-3">{title}</p>
                {rows.map(({ label, val, dot }) => (
                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${dot}`} />
                      <span className="text-xs text-slate-500">{label}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-700">{val}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformAnalytics;