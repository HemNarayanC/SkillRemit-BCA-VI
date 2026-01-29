import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Search, Bell, Menu, Mail, ChevronDown, User, Settings, LogOut, Zap
} from "lucide-react";
import { sidebarConfig, roleLabels } from "../constant/dashboardData";

// Import all role-based pages
import JobSeekerDashboard from "./dashboards/jobseeker/Dashboard";
import JobSeekerFindJobs from "./dashboards/jobseeker/FindJobs";
import JobSeekerAIJobMatch from "./dashboards/jobseeker/AIJobMatch";
import JobSeekerSkillAnalysis from "./dashboards/jobseeker/SkillAnalysis";
import JobSeekerRecommendedTraining from "./dashboards/jobseeker/RecommendedTraining";
import JobSeekerMySkills from "./dashboards/jobseeker/MySkills";
import JobSeekerApplications from "./dashboards/jobseeker/Applications";
import JobSeekerCertifications from "./dashboards/jobseeker/Certifications";
import JobSeekerMessages from "./dashboards/jobseeker/Messages";

import EmployerDashboard from "./dashboards/employer/Dashboard";
import EmployerPostJob from "./dashboards/employer/PostJob";
import EmployerMyJobs from "./dashboards/employer/MyJobs";
import EmployerAICandidateMatch from "./dashboards/employer/AICandidateMatch";
import EmployerApplicants from "./dashboards/employer/Applicants";
import EmployerShortlisted from "./dashboards/employer/Shortlisted";
import EmployerInterviews from "./dashboards/employer/Interviews";
import EmployerHiringAnalytics from "./dashboards/employer/HiringAnalytics";
import EmployerMessages from "./dashboards/employer/Messages";

import TrainerDashboard from "./dashboards/trainer/Dashboard";
import TrainerMyCourses from "./dashboards/trainer/MyCourses";
import TrainerCreateCourse from "./dashboards/trainer/CreateCourse";
import TrainerEnrollments from "./dashboards/trainer/Enrollments";
import TrainerSkillDemand from "./dashboards/trainer/SkillDemand";
import TrainerCourseFeedback from "./dashboards/trainer/CourseFeedback";
import TrainerEarnings from "./dashboards/trainer/Earnings";
import TrainerMessages from "./dashboards/trainer/Messages";

import AdminDashboard from "./dashboards/admin/Dashboard";
import AdminUsersManagement from "./dashboards/admin/UsersManagement";
import AdminJobsManagement from "./dashboards/admin/JobsManagement";
import AdminCoursesManagement from "./dashboards/admin/CoursesManagement";
import AdminSkillsManagement from "./dashboards/admin/SkillsManagement";
import AdminTrainersVerification from "./dashboards/admin/TrainersVerification";
import AdminPlatformAnalytics from "./dashboards/admin/PlatformAnalytics";
import AdminReportsLogs from "./dashboards/admin/ReportsLogs";
import AdminSystemSettings from "./dashboards/admin/SystemSettings";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeMenuItem, setActiveMenuItem] = useState("Dashboard");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const userRole = user?.role || "jobseeker";

  // Page routing based on role and active menu item
  const pageComponents = {
    jobseeker: {
      Dashboard: JobSeekerDashboard,
      "Find Jobs": JobSeekerFindJobs,
      "AI Job Match": JobSeekerAIJobMatch,
      "Skill Analysis": JobSeekerSkillAnalysis,
      "Recommended Training": JobSeekerRecommendedTraining,
      "My Skills": JobSeekerMySkills,
      Applications: JobSeekerApplications,
      Certifications: JobSeekerCertifications,
      Messages: JobSeekerMessages,
    },
    employer: {
      Dashboard: EmployerDashboard,
      "Post Job": EmployerPostJob,
      "My Jobs": EmployerMyJobs,
      "AI Candidate Match": EmployerAICandidateMatch,
      Applicants: EmployerApplicants,
      Shortlisted: EmployerShortlisted,
      Interviews: EmployerInterviews,
      "Hiring Analytics": EmployerHiringAnalytics,
      Messages: EmployerMessages,
    },
    trainer: {
      Dashboard: TrainerDashboard,
      "My Courses": TrainerMyCourses,
      "Create Course": TrainerCreateCourse,
      Enrollments: TrainerEnrollments,
      "Skill Demand Insights": TrainerSkillDemand,
      "Course Feedback": TrainerCourseFeedback,
      Earnings: TrainerEarnings,
      Messages: TrainerMessages,
    },
    admin: {
      Dashboard: AdminDashboard,
      "Users Management": AdminUsersManagement,
      "Jobs Management": AdminJobsManagement,
      "Courses Management": AdminCoursesManagement,
      "Skills Management": AdminSkillsManagement,
      "Trainers Verification": AdminTrainersVerification,
      "Platform Analytics": AdminPlatformAnalytics,
      "Reports & Logs": AdminReportsLogs,
      "System Settings": AdminSystemSettings,
    },
  };

  const ActivePageComponent = pageComponents[userRole]?.[activeMenuItem] || pageComponents[userRole]?.Dashboard;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="flex h-screen font-exo" style={{ background: "var(--color-background)" }}>
      {/* Unified Sidebar */}
      <aside className="w-60 flex flex-col" style={{ background: "var(--color-foreground)", color: "var(--color-sidebar-primary-foreground)" }}>
        {/* Logo */}
        <div className="p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--color-primary-foreground)" }}>
            <Zap className="w-6 h-6" style={{ color: "var(--color-primary)" }} />
          </div>
          <span className="text-xl font-bold" style={{ color: "var(--color-primary-foreground)", fontFamily: "Audiowide, Exo, sans-serif" }}>
            SkillRemit
          </span>
        </div>

        {/* Navigation - Dynamic based on role */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {sidebarConfig[userRole]?.map((item, i) => (
            <div
              key={i}
              onClick={() => setActiveMenuItem(item.label)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all mb-1"
              style={{
                background: activeMenuItem === item.label ? "var(--color-primary-foreground)" : "transparent",
                color: activeMenuItem === item.label ? "var(--color-primary)" : "var(--color-sidebar-primary-foreground)",
                boxShadow: activeMenuItem === item.label ? "0 6px 18px rgba(3,105,161,0.12)" : "none"
              }}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </div>
          ))}
        </nav>

        {/* Common Items */}
        <div className="px-3 py-4" style={{ borderTop: "1px solid var(--color-sidebar-border)" }}>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all hover:bg-white/10">
            <User className="w-5 h-5" />
            <span className="text-sm">Profile</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all hover:bg-white/10">
            <Settings className="w-5 h-5" />
            <span className="text-sm">Settings</span>
          </div>
          <div onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all hover:bg-white/10">
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4" style={{ borderTop: "1px solid var(--color-sidebar-border)" }}>
          <p className="text-xs">SkillRemit Platform</p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>© 2024 All Rights Reserved</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6" style={{ background: "var(--color-card)", borderBottom: "1px solid var(--color-border)" }}>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg" style={{ color: "var(--color-muted-foreground)" }}>
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold" style={{ color: "var(--color-foreground)" }}>
              {activeMenuItem}
            </h1>
          </div>

          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-4 pr-12 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                style={{ background: "var(--color-muted)", color: "var(--color-foreground)", border: "1px solid var(--color-border)" }}
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--color-muted-foreground)" }} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Role Badge
            <div className="relative">
              <button
                className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
                style={{ background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
              >
                {roleLabels[userRole]}
              </button>
            </div> */}

            <button className="relative p-2 rounded-lg" style={{ color: "var(--color-muted-foreground)" }}>
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                5
              </span>
            </button>

            <button className="relative p-2 rounded-lg" style={{ color: "var(--color-muted-foreground)" }}>
              <Mail className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 text-white text-[10px] font-bold rounded-full flex items-center justify-center" style={{ background: "var(--color-primary)" }}>
                3
              </span>
            </button>

            <div className="flex items-center gap-3 ml-2 pl-4" style={{ borderLeft: "1px solid var(--color-border)" }}>
              <div className="text-right">
                <p className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>
                  {user?.name?.split(" ")[0]}
                </p>
                <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                  {roleLabels[userRole]}
                </p>
              </div>
              {/* Profile Picture or Icon */}
              <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-300">
                {user.profile_image ? (
                  <img
                    src={user.profile_image || "/default-avatar.png"}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-full h-full p-1 text-gray-600" />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {/* Welcome Banner */}
          <div className="rounded-2xl p-6 mb-6" style={{ background: "linear-gradient(90deg, var(--color-primary), var(--color-secondary))", color: "var(--color-primary-foreground)" }}>
            <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "Audiowide, Exo, sans-serif" }}>
              Welcome back, {user?.name?.split(" ")[0]}! 👋
            </h2>
            <p style={{ color: "rgba(255,255,255,0.85)" }}>
              Here's what's happening with your {roleLabels[userRole].toLowerCase()} dashboard today.
            </p>
          </div>

          {/* Dynamic Page Content */}
          {ActivePageComponent && <ActivePageComponent user={user} />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;