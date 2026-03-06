import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getEmployerProfile } from "../../../api/employerApi";
import { 
  Building2, User, MapPin, FileText, Edit, Save, X, 
  Calendar, Globe, Phone, Mail, Shield, CheckCircle,
  AlertCircle, Clock, Download, Eye
} from "lucide-react";

const EmployerProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await getEmployerProfile();
      console.log("Employer profile data:", data);
      setProfile(data);
    } catch (error) {
      console.error("Fetch profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return { bg: "rgba(16,185,129,0.08)", color: "rgb(16,185,129)", icon: CheckCircle };
      case "rejected":
        return { bg: "rgba(220,38,38,0.08)", color: "rgb(220,38,38)", icon: AlertCircle };
      case "pending":
        return { bg: "rgba(250,204,21,0.08)", color: "rgb(250,204,21)", icon: Clock };
      default:
        return { bg: "rgba(100,116,139,0.08)", color: "rgb(100,116,139)", icon: AlertCircle };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statusStyle = getStatusColor(profile?.verification_status);
  const StatusIcon = statusStyle.icon;

  return (
    <>
      {/* Header Section with Verification Status */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: "linear-gradient(90deg, var(--color-primary), var(--color-secondary))", color: "var(--color-primary-foreground)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/20 flex items-center justify-center bg-white/10">
              <Building2 className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">{profile?.company_name || "Company Name"}</h1>
              <p className="opacity-90">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div 
              className="px-4 py-2 rounded-xl flex items-center gap-2 font-semibold"
              style={{ background: "white", color: statusStyle.color }}
            >
              <StatusIcon className="w-5 h-5" />
              <span className="capitalize">{profile?.verification_status || "Pending"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Note Alert */}
      {profile?.verification_status === "rejected" && profile?.verification_note && (
        <div 
          className="mb-6 p-4 rounded-xl flex items-start gap-3"
          style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)" }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "rgb(220,38,38)" }} />
          <div>
            <h3 className="font-semibold mb-1" style={{ color: "rgb(220,38,38)" }}>Verification Rejected</h3>
            <p className="text-sm" style={{ color: "var(--color-foreground)" }}>{profile.verification_note}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Company Info */}
        <div className="col-span-2 space-y-6">
          {/* Company Information */}
          <div className="rounded-2xl p-6" style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
              <Building2 className="w-5 h-5" /> Company Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: "var(--color-muted-foreground)" }}>
                    Company Name
                  </label>
                  <div className="px-4 py-3 rounded-xl" style={{ background: "rgba(15,23,42,0.03)", border: "1px solid var(--color-border)" }}>
                    <p style={{ color: "var(--color-foreground)" }}>{profile?.company_name || "Not provided"}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: "var(--color-muted-foreground)" }}>
                    Business Type
                  </label>
                  <div className="px-4 py-3 rounded-xl capitalize" style={{ background: "rgba(15,23,42,0.03)", border: "1px solid var(--color-border)" }}>
                    <p style={{ color: "var(--color-foreground)" }}>{profile?.business_type || "Not specified"}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: "var(--color-muted-foreground)" }}>
                    Registration Number
                  </label>
                  <div className="px-4 py-3 rounded-xl" style={{ background: "rgba(15,23,42,0.03)", border: "1px solid var(--color-border)" }}>
                    <p style={{ color: "var(--color-foreground)" }}>{profile?.registration_number || "Not provided"}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: "var(--color-muted-foreground)" }}>
                    Registered Country
                  </label>
                  <div className="px-4 py-3 rounded-xl" style={{ background: "rgba(15,23,42,0.03)", border: "1px solid var(--color-border)" }}>
                    <p style={{ color: "var(--color-foreground)" }}>{profile?.registered_country || "Nepal"}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: "var(--color-muted-foreground)" }}>
                  Address
                </label>
                <div className="px-4 py-3 rounded-xl" style={{ background: "rgba(15,23,42,0.03)", border: "1px solid var(--color-border)" }}>
                  <p style={{ color: "var(--color-foreground)" }}>{profile?.address || "Not provided"}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: "var(--color-muted-foreground)" }}>
                  Document Type
                </label>
                <div className="px-4 py-3 rounded-xl capitalize" style={{ background: "rgba(15,23,42,0.03)", border: "1px solid var(--color-border)" }}>
                  <p style={{ color: "var(--color-foreground)" }}>{profile?.document_type?.replace(/_/g, ' ') || "Not specified"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Person Information */}
          <div className="rounded-2xl p-6" style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
              <User className="w-5 h-5" /> Contact Person
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: "var(--color-muted-foreground)" }}>
                    Full Name
                  </label>
                  <div className="px-4 py-3 rounded-xl" style={{ background: "rgba(15,23,42,0.03)", border: "1px solid var(--color-border)" }}>
                    <p style={{ color: "var(--color-foreground)" }}>{user.name}</p>
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
                    <p style={{ color: "var(--color-foreground)" }}>{profile?.User?.phone || "Not provided"}</p>
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

          {/* Uploaded Documents */}
          {profile?.document_urls && profile.document_urls.length > 0 && (
            <div className="rounded-2xl p-6" style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
                <FileText className="w-5 h-5" /> Verification Documents
              </h2>
              <div className="space-y-3">
                {profile.document_urls.map((url, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 rounded-xl"
                    style={{ background: "rgba(15,23,42,0.03)", border: "1px solid var(--color-border)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(3,105,161,0.08)" }}>
                        <FileText className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: "var(--color-foreground)" }}>Document {index + 1}</p>
                        <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                          {profile.document_type?.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-lg hover:opacity-80 transition-opacity"
                        style={{ background: "rgba(3,105,161,0.08)", color: "var(--color-primary)" }}
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <a
                        href={url}
                        download
                        className="px-3 py-2 rounded-lg hover:opacity-80 transition-opacity"
                        style={{ background: "rgba(3,105,161,0.08)", color: "var(--color-primary)" }}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Stats & Verification */}
        <div className="space-y-6">
          {/* Verification Status */}
          <div 
            className="rounded-2xl p-6" 
            style={{ 
              background: statusStyle.bg,
              border: `1px solid ${statusStyle.color}40`
            }}
          >
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: statusStyle.color }}>
              <Shield className="w-5 h-5" /> Verification Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "var(--color-foreground)" }}>Status</span>
                <span className="font-semibold capitalize" style={{ color: statusStyle.color }}>
                  {profile?.verification_status || "Pending"}
                </span>
              </div>
              {profile?.verified_at && (
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: "var(--color-foreground)" }}>Verified On</span>
                  <span className="font-semibold text-sm" style={{ color: "var(--color-foreground)" }}>
                    {new Date(profile.verified_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              {profile?.trust_score !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: "var(--color-foreground)" }}>Trust Score</span>
                  <span className="font-semibold" style={{ color: statusStyle.color }}>
                    {profile.trust_score}/5.0
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-2xl p-6" style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}>
            <h3 className="font-bold mb-4" style={{ color: "var(--color-foreground)" }}>Company Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(15,23,42,0.03)" }}>
                <span className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>Registered</span>
                <span className="font-semibold" style={{ color: "var(--color-foreground)" }}>
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(15,23,42,0.03)" }}>
                <span className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>Business Type</span>
                <span className="font-semibold capitalize" style={{ color: "var(--color-foreground)" }}>
                  {profile?.business_type || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(15,23,42,0.03)" }}>
                <span className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>Documents</span>
                <span className="font-semibold" style={{ color: "var(--color-foreground)" }}>
                  {profile?.document_urls?.length || 0} files
                </span>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="rounded-2xl p-6" style={{ background: "rgba(3,105,161,0.08)", border: "1px solid rgba(3,105,161,0.2)" }}>
            <h3 className="font-bold mb-4" style={{ color: "var(--color-primary)" }}>Account Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
                <span style={{ color: "var(--color-foreground)" }}>
                  Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
                <span style={{ color: "var(--color-foreground)" }}>
                  {user?.email}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
                <span style={{ color: "var(--color-foreground)" }}>
                  Language: {user?.language === "en" ? "English" : "Nepali"}
                </span>
              </div>
            </div>
          </div>

          {/* Note for Unverified */}
          {profile?.verification_status === "pending" && (
            <div className="rounded-2xl p-5" style={{ background: "rgba(250,204,21,0.08)", border: "1px solid rgba(250,204,21,0.2)" }}>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "rgb(250,204,21)" }} />
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: "rgb(250,204,21)" }}>Verification Pending</h3>
                  <p className="text-sm" style={{ color: "var(--color-foreground)" }}>
                    Your profile is under review. You'll be notified once verification is complete.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EmployerProfile;