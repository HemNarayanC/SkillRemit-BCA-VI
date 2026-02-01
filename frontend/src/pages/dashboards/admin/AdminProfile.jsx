import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { 
  Shield, User, Mail, Calendar, Globe, Phone, 
  Settings, Lock, Bell, Database
} from "lucide-react";

const AdminProfile = () => {
  const { user } = useAuth();

  return (
    <>
      {/* Header Section */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: "linear-gradient(90deg, var(--color-primary), var(--color-secondary))", color: "var(--color-primary-foreground)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/20">
              {user?.profile_image ? (
                <img src={user.profile_image} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/10">
                  <Shield className="w-10 h-10" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">{user?.name}</h1>
              <p className="opacity-90">System Administrator • {user?.email}</p>
            </div>
          </div>
          <div 
            className="px-4 py-2 rounded-xl flex items-center gap-2 font-semibold"
            style={{ background: "white", color: "var(--color-primary)" }}
          >
            <Shield className="w-5 h-5" />
            <span>Admin Access</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Account Info */}
        <div className="col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="rounded-2xl p-6" style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
              <User className="w-5 h-5" /> Administrator Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: "var(--color-muted-foreground)" }}>
                    Full Name
                  </label>
                  <div className="px-4 py-3 rounded-xl" style={{ background: "rgba(15,23,42,0.03)", border: "1px solid var(--color-border)" }}>
                    <p style={{ color: "var(--color-foreground)" }}>{user?.name}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: "var(--color-muted-foreground)" }}>
                    Email Address
                  </label>
                  <div className="px-4 py-3 rounded-xl" style={{ background: "rgba(15,23,42,0.03)", border: "1px solid var(--color-border)" }}>
                    <p style={{ color: "var(--color-foreground)" }}>{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: "var(--color-muted-foreground)" }}>
                    Phone Number
                  </label>
                  <div className="px-4 py-3 rounded-xl" style={{ background: "rgba(15,23,42,0.03)", border: "1px solid var(--color-border)" }}>
                    <p style={{ color: "var(--color-foreground)" }}>{user?.phone || "Not provided"}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: "var(--color-muted-foreground)" }}>
                    User ID
                  </label>
                  <div className="px-4 py-3 rounded-xl font-mono" style={{ background: "rgba(15,23,42,0.03)", border: "1px solid var(--color-border)" }}>
                    <p style={{ color: "var(--color-foreground)" }}>#{user?.user_id || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: "var(--color-muted-foreground)" }}>
                    Role
                  </label>
                  <div className="px-4 py-3 rounded-xl" style={{ background: "rgba(15,23,42,0.03)", border: "1px solid var(--color-border)" }}>
                    <p className="capitalize font-semibold" style={{ color: "var(--color-primary)" }}>{user?.role || "Admin"}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: "var(--color-muted-foreground)" }}>
                    Language Preference
                  </label>
                  <div className="px-4 py-3 rounded-xl" style={{ background: "rgba(15,23,42,0.03)", border: "1px solid var(--color-border)" }}>
                    <p style={{ color: "var(--color-foreground)" }}>{user?.language === "en" ? "English" : "Nepali"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Permissions & Access */}
          <div className="rounded-2xl p-6" style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
              <Lock className="w-5 h-5" /> Permissions & Access
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5" style={{ color: "rgb(16,185,129)" }} />
                  <span className="font-semibold" style={{ color: "var(--color-foreground)" }}>User Management</span>
                </div>
                <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
                  Full access to manage users, verify employers and trainers
                </p>
              </div>

              <div className="p-4 rounded-xl" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <div className="flex items-center gap-3 mb-2">
                  <Database className="w-5 h-5" style={{ color: "rgb(16,185,129)" }} />
                  <span className="font-semibold" style={{ color: "var(--color-foreground)" }}>Content Management</span>
                </div>
                <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
                  Manage jobs, courses, and skills across the platform
                </p>
              </div>

              <div className="p-4 rounded-xl" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <div className="flex items-center gap-3 mb-2">
                  <Settings className="w-5 h-5" style={{ color: "rgb(16,185,129)" }} />
                  <span className="font-semibold" style={{ color: "var(--color-foreground)" }}>System Settings</span>
                </div>
                <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
                  Configure platform settings and system parameters
                </p>
              </div>

              <div className="p-4 rounded-xl" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <div className="flex items-center gap-3 mb-2">
                  <Bell className="w-5 h-5" style={{ color: "rgb(16,185,129)" }} />
                  <span className="font-semibold" style={{ color: "var(--color-foreground)" }}>Analytics & Reports</span>
                </div>
                <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
                  View platform analytics, logs, and generate reports
                </p>
              </div>
            </div>
          </div>

          {/* Activity Summary */}
          <div className="rounded-2xl p-6" style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
              <Calendar className="w-5 h-5" /> Recent Activity
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "rgba(15,23,42,0.03)", border: "1px solid var(--color-border)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(3,105,161,0.08)" }}>
                  <User className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: "var(--color-foreground)" }}>User Verification</p>
                  <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>Last performed today</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "rgba(15,23,42,0.03)", border: "1px solid var(--color-border)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(3,105,161,0.08)" }}>
                  <Settings className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: "var(--color-foreground)" }}>System Configuration</p>
                  <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>Last updated 2 days ago</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "rgba(15,23,42,0.03)", border: "1px solid var(--color-border)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(3,105,161,0.08)" }}>
                  <Database className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: "var(--color-foreground)" }}>Content Moderation</p>
                  <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>Last performed yesterday</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Status & Security */}
        <div className="space-y-6">
          {/* Admin Status */}
          <div 
            className="rounded-2xl p-6" 
            style={{ 
              background: "rgba(3,105,161,0.08)",
              border: "1px solid rgba(3,105,161,0.2)"
            }}
          >
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "var(--color-primary)" }}>
              <Shield className="w-5 h-5" /> Administrator Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "var(--color-foreground)" }}>Access Level</span>
                <span className="font-semibold" style={{ color: "var(--color-primary)" }}>
                  Full Admin
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "var(--color-foreground)" }}>Account Status</span>
                <span className="font-semibold" style={{ color: "rgb(16,185,129)" }}>
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "var(--color-foreground)" }}>Verified</span>
                <span className="font-semibold" style={{ color: "rgb(16,185,129)" }}>
                  Yes
                </span>
              </div>
            </div>
          </div>

          {/* Account Stats */}
          <div className="rounded-2xl p-6" style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}>
            <h3 className="font-bold mb-4" style={{ color: "var(--color-foreground)" }}>Account Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(15,23,42,0.03)" }}>
                <span className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>Account Created</span>
                <span className="font-semibold text-sm" style={{ color: "var(--color-foreground)" }}>
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(15,23,42,0.03)" }}>
                <span className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>Last Login</span>
                <span className="font-semibold text-sm" style={{ color: "var(--color-foreground)" }}>
                  Today
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(15,23,42,0.03)" }}>
                <span className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>User ID</span>
                <span className="font-semibold text-sm font-mono" style={{ color: "var(--color-foreground)" }}>
                  #{user?.user_id || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="rounded-2xl p-6" style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}>
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
              <Lock className="w-5 h-5" /> Security
            </h3>
            <div className="space-y-3">
              <button 
                className="w-full px-4 py-3 rounded-xl text-left hover:opacity-80 transition-opacity"
                style={{ background: "rgba(15,23,42,0.03)", border: "1px solid var(--color-border)" }}
              >
                <p className="font-semibold text-sm mb-1" style={{ color: "var(--color-foreground)" }}>Change Password</p>
                <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>Update your account password</p>
              </button>
              
              <button 
                className="w-full px-4 py-3 rounded-xl text-left hover:opacity-80 transition-opacity"
                style={{ background: "rgba(15,23,42,0.03)", border: "1px solid var(--color-border)" }}
              >
                <p className="font-semibold text-sm mb-1" style={{ color: "var(--color-foreground)" }}>Two-Factor Auth</p>
                <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>Enable 2FA for extra security</p>
              </button>

              <button 
                className="w-full px-4 py-3 rounded-xl text-left hover:opacity-80 transition-opacity"
                style={{ background: "rgba(15,23,42,0.03)", border: "1px solid var(--color-border)" }}
              >
                <p className="font-semibold text-sm mb-1" style={{ color: "var(--color-foreground)" }}>Login History</p>
                <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>View recent login activity</p>
              </button>
            </div>
          </div>

          {/* System Info */}
          <div className="rounded-2xl p-6" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <h3 className="font-bold mb-4" style={{ color: "rgb(16,185,129)" }}>Quick Access</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" style={{ color: "rgb(16,185,129)" }} />
                <span style={{ color: "var(--color-foreground)" }}>System Settings</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" style={{ color: "rgb(16,185,129)" }} />
                <span style={{ color: "var(--color-foreground)" }}>Database Management</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" style={{ color: "rgb(16,185,129)" }} />
                <span style={{ color: "var(--color-foreground)" }}>User Verification</span>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" style={{ color: "rgb(16,185,129)" }} />
                <span style={{ color: "var(--color-foreground)" }}>Platform Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminProfile;