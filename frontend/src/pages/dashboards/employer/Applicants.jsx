import { useState, useEffect, useCallback } from "react";
import {
  Users, XCircle, Briefcase,
  Eye, Star, UserCheck, UserX,
  MapPin, Mail, Phone, Clock,
  UserIcon,
} from "lucide-react";
import {
  getAllApplicants,
  getApplicantStats,
  shortlistApplicant,
  rejectApplicant,
  hireApplicant,
} from "../../../api/applicationsApi.js";

const STATUS_LABEL = { "": "All", pending: "Pending", shortlisted: "Shortlisted", hired: "Hired", rejected: "Rejected" };

const STATUS_BADGE = {
  pending: { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
  shortlisted: { bg: "#f0f9ff", color: "#0284c7", border: "#bae6fd" },
  hired: { bg: "#eff6ff", color: "#0369a1", border: "#93c5fd" },
  rejected: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
};

const STAT_CONFIG = [
  { key: "total_applications", label: "Total", icon: Users, accent: "#0369a1", bg: "#eff6ff", border: "#bfdbfe" },
  { key: "pending", label: "Pending", icon: Clock, accent: "#b45309", bg: "#fffbeb", border: "#fde68a" },
  { key: "shortlisted", label: "Shortlisted", icon: Star, accent: "#0284c7", bg: "#f0f9ff", border: "#bae6fd" },
  { key: "hired", label: "Hired", icon: UserCheck, accent: "#0369a1", bg: "#eff6ff", border: "#93c5fd" },
  { key: "rejected", label: "Rejected", icon: UserX, accent: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
];

const TAB_KEYS = ["", "pending", "shortlisted", "hired", "rejected"];

export default function ApplicantsPage() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [appData, statsData] = await Promise.all([
        getAllApplicants(activeTab),
        getApplicantStats(),
      ]);
      setApplications(appData.applications || []);
      setStats(statsData.stats || null);
    } catch (err) {
      setError(err?.message || "Failed to load applicants.");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAction = async (applicationId, action) => {
    setActionLoading(applicationId);
    try {
      const fn = { shortlist: shortlistApplicant, reject: rejectApplicant, hire: hireApplicant }[action];
      await fn(applicationId);
      const newStatus = action === "shortlist" ? "shortlisted" : action === "hire" ? "hired" : "rejected";
      setApplications(prev => prev.map(a => a.application_id === applicationId ? { ...a, status: newStatus } : a));
      if (selected?.application_id === applicationId) setSelected(prev => ({ ...prev, status: newStatus }));
      const statsData = await getApplicantStats();
      setStats(statsData.stats || null);
    } catch (err) {
      alert(err?.message || "Action failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const sk = (a) => a.JobSeeker;
  const usr = (a) => a.JobSeeker?.User;
  const initials = (name) => (name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="px-6 lg:px-10 pb-16 min-h-screen bg-background font-exo">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Applicants</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review, shortlist, and manage all candidates who applied to your jobs
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {STAT_CONFIG.map(({ key, label, icon: Icon, accent, bg, border }) => (
            <div key={key} className="rounded-2xl px-5 py-4 flex items-center gap-3"
              style={{ background: bg, border: `1px solid ${border}` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: accent + "15" }}>
                <Icon className="w-5 h-5" style={{ color: accent }} />
              </div>
              <div>
                <div className="text-2xl font-bold leading-none" style={{ color: accent }}>
                  {stats[key] ?? 0}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-card border border-border rounded-xl p-1 w-fit shadow-sm">
        {TAB_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={
              activeTab === key
                ? { background: "#0369a1", color: "#ffffff" }
                : { color: "#64748b" }
            }
          >
            {STATUS_LABEL[key]}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm px-4 py-3 rounded-xl mb-6"
          style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
          {error}
        </div>
      )}

      {/* Skeletons */}
      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: "#f1f5f9", border: "1px solid #e2e8f0" }} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && applications.length === 0 && (
        <div className="text-center py-20 rounded-2xl bg-card" style={{ border: "1.5px dashed #e2e8f0" }}>
          <div className="text-5xl mb-4">📭</div>
          <div className="font-bold text-lg text-foreground mb-2">No applicants found</div>
          <div className="text-sm text-muted-foreground">
            {activeTab ? `No ${activeTab} applications yet.` : "No applications have been submitted yet."}
          </div>
        </div>
      )}

      {/* List + Drawer */}
      {!loading && applications.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Applicant Cards ── */}
          <div className="lg:col-span-2 space-y-3">
            {applications.map((app) => {
              const badge = STATUS_BADGE[app.status] || STATUS_BADGE.pending;
              const isSelected = selected?.application_id === app.application_id;
              return (
                <div
                  key={app.application_id}
                  onClick={() => setSelected(app)}
                  className="rounded-2xl px-5 py-4 cursor-pointer transition-all bg-card"
                  style={{
                    border: isSelected ? "1.5px solid #0369a1" : "1px solid #e2e8f0",
                    boxShadow: isSelected ? "0 0 0 3px #bfdbfe50" : "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: "var(--foreground)" }}>
                      {usr(app)?.profile_image
                        ? <img src={usr(app).profile_image} alt={usr(app).name} className="w-full h-full object-cover" />
                        : <UserIcon className="w-6 h-6 text-white opacity-90" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-foreground">{usr(app)?.name || "—"}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
                          style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                          {app.status}
                        </span>
                        {app.Job && (
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border">
                            {app.Job.title}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-4 mt-1.5 text-xs text-muted-foreground flex-wrap">
                        {usr(app)?.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{usr(app).email}</span>}
                        {sk(app)?.current_location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{sk(app).current_location}</span>}
                        {sk(app)?.years_of_experience != null && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{sk(app).years_of_experience} yr exp</span>}
                      </div>

                      {sk(app)?.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {sk(app).skills.slice(0, 4).map((s, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ background: "#eff6ff", color: "#0369a1", border: "1px solid #bfdbfe" }}>
                              {s.skill_name}
                            </span>
                          ))}
                          {sk(app).skills.length > 4 && (
                            <span className="text-xs text-muted-foreground">+{sk(app).skills.length - 4} more</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quick actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                      {app.status !== "shortlisted" && app.status !== "hired" && (
                        <QuickBtn label="Shortlist" icon={<Star className="w-3 h-3" />}
                          style={{ background: "#f0f9ff", color: "#0284c7", border: "1px solid #bae6fd" }}
                          onClick={() => handleAction(app.application_id, "shortlist")}
                          loading={actionLoading === app.application_id} />
                      )}
                      {app.status === "shortlisted" && (
                        <QuickBtn label="Hire" icon={<UserCheck className="w-3 h-3" />}
                          style={{ background: "#eff6ff", color: "#0369a1", border: "1px solid #93c5fd" }}
                          onClick={() => handleAction(app.application_id, "hire")}
                          loading={actionLoading === app.application_id} />
                      )}
                      {app.status !== "rejected" && app.status !== "hired" && (
                        <QuickBtn label="Reject" icon={<XCircle className="w-3 h-3" />}
                          style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
                          onClick={() => handleAction(app.application_id, "reject")}
                          loading={actionLoading === app.application_id} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Detail Drawer ── */}
          <div className="lg:col-span-1">
            {selected ? (() => {
              const badge = STATUS_BADGE[selected.status] || STATUS_BADGE.pending;
              return (
                <div className="bg-card rounded-2xl p-6 sticky top-24 space-y-5"
                  style={{ border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(3,105,161,0.06)" }}>

                  {/* Header */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl flex-shrink-0 overflow-hidden flex items-center justify-center text-white font-bold text-lg"
                      style={{ background: "var(--foreground" }}>
                      {usr(selected)?.profile_image
                        ? <img src={usr(selected).profile_image} className="w-full h-full object-cover" alt="" />
                        : <UserIcon className="w-8 h-8 text-white opacity-90" />}
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-lg leading-tight">{usr(selected)?.name}</div>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
                        style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                        {selected.status}
                      </span>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid #e2e8f0" }} />

                  {/* Contact */}
                  <div className="space-y-2.5 text-sm">
                    {[
                      { icon: Mail, value: usr(selected)?.email },
                      { icon: Phone, value: usr(selected)?.phone },
                      { icon: MapPin, value: sk(selected)?.current_location && `${sk(selected).current_location}${sk(selected).remittance_district ? ` — ${sk(selected).remittance_district}` : ""}` },
                      { icon: Briefcase, value: sk(selected)?.years_of_experience != null && `${sk(selected).years_of_experience} years experience` },
                    ].filter(r => r.value).map(({ icon: Icon, value }, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-muted-foreground">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: "#f1f5f9" }}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        {value}
                      </div>
                    ))}
                  </div>

                  {/* About */}
                  {sk(selected)?.skill_description && (
                    <div>
                      <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">About</div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{sk(selected).skill_description}</p>
                    </div>
                  )}

                  {/* Skills */}
                  {sk(selected)?.skills?.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Skills</div>
                      <div className="flex flex-wrap gap-2">
                        {sk(selected).skills.map((s, i) => (
                          <span key={i} className="text-xs px-3 py-1 rounded-full font-medium"
                            style={{ background: "#eff6ff", color: "#0369a1", border: "1px solid #bfdbfe" }}>
                            {s.skill_name}
                            {s.JobSeekerSkill?.proficiency_level && (
                              <span style={{ color: "#0ea5e9" }}> · {s.JobSeekerSkill.proficiency_level}</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cover letter */}
                  {selected.cover_letter && (
                    <div>
                      <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Cover Letter</div>
                      <p className="text-sm text-muted-foreground leading-relaxed rounded-xl p-4"
                        style={{ background: "#f1f5f9", border: "1px solid #e2e8f0" }}>
                        {selected.cover_letter}
                      </p>
                    </div>
                  )}

                  {/* Applied job */}
                  {selected.Job && (
                    <div className="rounded-xl p-3 text-sm" style={{ background: "#f1f5f9", border: "1px solid #e2e8f0" }}>
                      <span className="text-muted-foreground">Applied for: </span>
                      <span className="font-semibold text-foreground">{selected.Job.title}</span>
                      {selected.Job.location && <span className="text-muted-foreground"> · {selected.Job.location}</span>}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col gap-2 pt-1" onClick={e => e.stopPropagation()}>
                    {selected.status !== "shortlisted" && selected.status !== "hired" && (
                      <DrawerBtn label="Shortlist Candidate" icon={<Star className="w-4 h-4" />}
                        style={{ background: "#f0f9ff", color: "#0284c7", border: "1px solid #bae6fd" }}
                        onClick={() => handleAction(selected.application_id, "shortlist")}
                        loading={actionLoading === selected.application_id} />
                    )}
                    {selected.status === "shortlisted" && (
                      <DrawerBtn label="Hire This Candidate" icon={<UserCheck className="w-4 h-4" />}
                        style={{ background: "#eff6ff", color: "#0369a1", border: "1px solid #93c5fd" }}
                        onClick={() => handleAction(selected.application_id, "hire")}
                        loading={actionLoading === selected.application_id} />
                    )}
                    {selected.status !== "rejected" && selected.status !== "hired" && (
                      <DrawerBtn label="Reject" icon={<XCircle className="w-4 h-4" />}
                        style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
                        onClick={() => handleAction(selected.application_id, "reject")}
                        loading={actionLoading === selected.application_id} />
                    )}
                    {(selected.status === "hired" || selected.status === "rejected") && (
                      <div className="text-center text-sm font-semibold py-2 rounded-xl"
                        style={selected.status === "hired"
                          ? { background: "#eff6ff", color: "#0369a1", border: "1px solid #93c5fd" }
                          : { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
                        {selected.status === "hired" ? "✓ Hired" : "✗ Rejected"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })() : (
              <div className="rounded-2xl p-10 text-center sticky top-24 bg-card"
                style={{ border: "1.5px dashed #e2e8f0" }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: "#f1f5f9" }}>
                  <Eye className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="font-semibold text-sm text-foreground mb-1">No candidate selected</div>
                <div className="text-xs text-muted-foreground">Click an applicant to view their full profile</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function QuickBtn({ label, icon, onClick, loading, style }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
      style={style}>
      {loading ? <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" /> : icon}
      {label}
    </button>
  );
}

function DrawerBtn({ label, icon, onClick, loading, style }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-80 disabled:opacity-50 flex items-center justify-center gap-2"
      style={style}>
      {loading ? <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" /> : icon}
      {label}
    </button>
  );
}