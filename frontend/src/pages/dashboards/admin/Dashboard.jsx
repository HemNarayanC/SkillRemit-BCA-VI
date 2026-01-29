import { 
  Users, Briefcase, BookOpen, Activity
} from "lucide-react";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { platformStats, systemLogs } from "../../../constant/dashboardData";

const Dashboard = ({ user }) => {
  return (
    <>
      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl p-5" style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(3,105,161,0.08)" }}>
              <Users className="w-7 h-7" style={{ color: "var(--color-primary)" }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>Total Users</p>
              <p className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>48,470</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl p-5" style={{ background: "linear-gradient(90deg, var(--color-primary), var(--color-secondary))" }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)" }}>
              <Briefcase className="w-7 h-7" style={{ color: "var(--color-primary-foreground)" }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>Active Jobs</p>
              <p className="text-3xl font-bold" style={{ color: "var(--color-primary-foreground)" }}>1,248</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl p-5" style={{ background: "var(--color-accent)", color: "var(--color-primary-foreground)" }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)" }}>
              <BookOpen className="w-7 h-7" style={{ color: "var(--color-primary-foreground)" }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>Active Courses</p>
              <p className="text-3xl font-bold" style={{ color: "var(--color-primary-foreground)" }}>386</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl p-5" style={{ background: "linear-gradient(90deg,var(--color-primary),var(--color-secondary))", color: "var(--color-primary-foreground)" }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)" }}>
              <Activity className="w-7 h-7" style={{ color: "var(--color-primary-foreground)" }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>AI Matches Today</p>
              <p className="text-3xl font-bold" style={{ color: "var(--color-primary-foreground)" }}>2,456</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* User Distribution */}
        <div className="rounded-2xl p-6" style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>User Distribution</h3>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {platformStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {platformStats.map((stat, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.color }} />
                <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>{stat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Activity */}
        <div className="col-span-2 rounded-2xl p-6" style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>Platform Activity</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { day: "Mon", users: 1200, jobs: 45, courses: 12 },
                { day: "Tue", users: 1350, jobs: 52, courses: 18 },
                { day: "Wed", users: 1100, jobs: 38, courses: 15 },
                { day: "Thu", users: 1450, jobs: 62, courses: 22 },
                { day: "Fri", users: 1600, jobs: 58, courses: 28 },
                { day: "Sat", users: 900, jobs: 25, courses: 8 },
                { day: "Sun", users: 750, jobs: 18, courses: 5 },
              ]}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="jobs" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="courses" stroke="#F59E0B" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ background: "var(--color-primary)" }} />
              <span className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>New Users</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ background: "var(--color-accent)" }} />
              <span className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>Jobs Posted</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ background: "var(--color-secondary)" }} />
              <span className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>Courses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent System Activity */}
      <section>
        <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>Recent System Logs</h3>
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", background: "rgba(15,23,42,0.03)" }}>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: "var(--color-muted-foreground)" }}>EVENT</th>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: "var(--color-muted-foreground)" }}>USER</th>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: "var(--color-muted-foreground)" }}>TYPE</th>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: "var(--color-muted-foreground)" }}>TIME</th>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: "var(--color-muted-foreground)" }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {systemLogs.map((log, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--color-border)" }} className="hover:opacity-95 transition-opacity">
                  <td className="px-5 py-4 font-medium" style={{ color: "var(--color-foreground)" }}>{log.event}</td>
                  <td className="px-5 py-4" style={{ color: "var(--color-muted-foreground)" }}>{log.user}</td>
                  <td className="px-5 py-4 text-sm" style={{ color: "var(--color-muted-foreground)" }}>{log.type}</td>
                  <td className="px-5 py-4 text-sm" style={{ color: "var(--color-muted-foreground)" }}>{log.time}</td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full" style={{
                      background: log.status === 'Success' ? "rgba(16,185,129,0.08)" : log.status === 'Warning' ? "rgba(250,204,21,0.08)" : "rgba(220,38,38,0.08)",
                      color: log.status === 'Success' ? "rgb(16,185,129)" : log.status === 'Warning' ? "rgb(250,204,21)" : "rgb(220,38,38)"
                    }}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
};

export default Dashboard;