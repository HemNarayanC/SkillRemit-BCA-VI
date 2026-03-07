import { useState, useEffect, useCallback } from "react";
import {
  Users, ShieldCheck, ShieldX, Eye, Search, CheckCircle2, XCircle, Clock, AlertCircle, Building2, GraduationCap, Briefcase, User as UserIcon, Mail, Phone, Crown, RefreshCw, Loader2,
  BadgeCheck, ChevronDown, X, FileText, Download, MapPin, Star, Cpu,
} from "lucide-react";
import UserModal from '../../../components/modals/UserModal'
import { getAllEmployers, verifyEmployer } from "../../../api/usersApi.js";
import { listAllTrainers, verifyTrainer } from "../../../api/trainerApi.js";
import { listAllJobSeekers } from "../../../api/jobSeekerApi.js";
import { adminGetAllUsers } from "../../../api/adminApi";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const normalizeUser = (u) => {
  const user = u.User || {};
  return {
    id: u.id || u.jobseeker_id || u.trainer_id || u.employer_id,
    name: user.name || u.company_name || "—",
    email: user.email || "—",
    phone: user.phone || "—",
    profile_image: user.profile_image || null,
    role: u.trainer_id ? "trainer" : u.jobseeker_id ? "jobseeker" : u.employer_id ? "employer" : "user",
    roles: u.trainer_id ? ["trainer"]
      : u.jobseeker_id ? ["jobseeker"]
        : u.employer_id ? ["employer"]
          : ["user"],
    organization_name: u.organization_name || null,
    company_name: u.company_name || null,
    business_type: u.business_type || null,
    registration_number: u.registration_number || null,
    registered_country: u.registered_country || null,
    trust_score: u.trust_score || null,
    is_premium: u.is_premium || false,
    specialization: u.specialization || null,
    years_experience: u.years_experience || null,
    contact_info: u.contact_info || null,
    verification_status: u.verification_status || (u.jobseeker_id ? "verified" : "pending"),
    verification_note: u.verification_note || null,
    document_urls: u.document_urls || [],
    created_at: u.created_at || user.created_at || null,
    verified_at: u.verified_at || null,
    employer: u.employer_id
      ? {
        employer_id: u.employer_id, company_name: u.company_name, business_type: u.business_type,
        registration_number: u.registration_number, registered_country: u.registered_country,
        trust_score: u.trust_score, is_premium: u.is_premium, created_at: u.created_at
      }
      : null,
    trainer: u.trainer_id
      ? {
        trainer_id: u.trainer_id, organization_name: u.organization_name,
        contact_info: u.contact_info, verification_status: u.verification_status
      }
      : null,
    jobseeker: u.jobseeker_id
      ? {
        jobseeker_id: u.jobseeker_id, current_location: u.current_location,
        remittance_district: u.remittance_district, skill_description: u.skill_description,
        years_of_experience: u.years_of_experience, document_urls: u.document_urls || [],
        created_at: u.created_at
      }
      : null,
  };
};

/** Normaliser for /admin/users — returns { user_id, roles[], Employer, Trainer, JobSeeker } */
const normaliseAllUsers = (u) => {
  const primaryRole = u.roles?.includes("admin") ? "admin"
    : u.Employer ? "employer"
      : u.Trainer ? "trainer"
        : u.JobSeeker ? "jobseeker"
          : u.roles?.[0] ?? "user";

  const verificationStatus =
    u.Employer?.verification_status ??
    u.Trainer?.verification_status ??
    (u.is_verified ? "verified" : "pending");

  return {
    id: u.user_id,
    name: u.name || "—",
    email: u.email || "—",
    phone: u.phone || null,
    profile_image: u.profile_image || null,
    role: primaryRole,
    roles: u.roles || [],
    is_verified: u.is_verified,
    created_at: u.created_at,
    is_premium: u.Employer?.is_premium || u.JobSeeker?.is_premium || false,
    verification_status: verificationStatus,
    verification_note: null,
    document_urls: [],
    company_name: u.Employer?.company_name || null,
    organization_name: u.Trainer?.organization_name || null,
    employer: u.Employer
      ? {
        employer_id: u.Employer.employer_id, company_name: u.Employer.company_name,
        business_type: u.Employer.business_type, registration_number: u.Employer.registration_number,
        registered_country: u.Employer.registered_country, trust_score: u.Employer.trust_score,
        is_premium: u.Employer.is_premium, created_at: u.Employer.created_at
      }
      : null,
    trainer: u.Trainer
      ? {
        trainer_id: u.Trainer.trainer_id, organization_name: u.Trainer.organization_name,
        contact_info: u.Trainer.contact_info, verification_status: u.Trainer.verification_status
      }
      : null,
    jobseeker: u.JobSeeker
      ? {
        jobseeker_id: u.JobSeeker.jobseeker_id, current_location: u.JobSeeker.current_location,
        remittance_district: u.JobSeeker.remittance_district, skill_description: u.JobSeeker.skill_description,
        years_of_experience: u.JobSeeker.years_of_experience, ai_checks_used: u.JobSeeker.ai_checks_used,
        is_premium: u.JobSeeker.is_premium
      }
      : null,
  };
};

// ─── Static config maps ───────────────────────────────────────────────────────
const ROLE_META = {
  employer: { icon: Building2, label: "Employer", textCls: "text-indigo-600", bgCls: "bg-indigo-50" },
  trainer: { icon: GraduationCap, label: "Trainer", textCls: "text-amber-600", bgCls: "bg-amber-50" },
  jobseeker: { icon: Briefcase, label: "Job Seeker", textCls: "text-emerald-600", bgCls: "bg-emerald-50" },
  admin: { icon: ShieldCheck, label: "Admin", textCls: "text-red-600", bgCls: "bg-red-50" },
  user: { icon: UserIcon, label: "User", textCls: "text-slate-500", bgCls: "bg-slate-100" },
};

const STATUS_META = {
  verified: { label: "Verified", textCls: "text-emerald-700", bgCls: "bg-emerald-50", icon: BadgeCheck },
  pending: { label: "Pending", textCls: "text-amber-700", bgCls: "bg-amber-50", icon: Clock },
  rejected: { label: "Rejected", textCls: "text-red-700", bgCls: "bg-red-50", icon: XCircle },
};

const STAT_CARDS = [
  { key: "total", label: "Total Users", icon: Users, textCls: "text-sky-600", bgCls: "bg-sky-50" },
  { key: "pending", label: "Pending", icon: Clock, textCls: "text-amber-600", bgCls: "bg-amber-50" },
  { key: "verified", label: "Verified", icon: ShieldCheck, textCls: "text-emerald-600", bgCls: "bg-emerald-50" },
  { key: "rejected", label: "Rejected", icon: ShieldX, textCls: "text-red-600", bgCls: "bg-red-50" },
  { key: "premium", label: "Premium", icon: Crown, textCls: "text-amber-500", bgCls: "bg-amber-50" },
];

const TABS = [
  { key: "all", label: "All Users", icon: Users },
  { key: "employers", label: "Employers", icon: Building2 },
  { key: "trainers", label: "Trainers", icon: GraduationCap },
  { key: "jobseekers", label: "Job Seekers", icon: Briefcase },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
const RolePills = ({ roles }) => (
  <div className="flex flex-wrap gap-1">
    {(roles || []).map((r) => {
      const m = ROLE_META[r] || ROLE_META.user;
      const Icon = m.icon;
      return (
        <span key={r}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${m.bgCls} ${m.textCls}`}>
          <Icon className="w-2.5 h-2.5" />{m.label}
        </span>
      );
    })}
  </div>
);

const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META.pending;
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${m.bgCls} ${m.textCls}`}>
      <Icon className="w-3 h-3" />{m.label}
    </span>
  );
};

const Avatar = ({ user }) => {
  const initials = (user.name || "U").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const m = ROLE_META[user.role] || ROLE_META.user;
  if (user.profile_image) {
    return (
      <img src={user.profile_image} alt={user.name}
        className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 flex-shrink-0" />
    );
  }
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border-2 ${m.bgCls} ${m.textCls} border-current/20`}>
      {initials}
    </div>
  );
};

// ─── Table Row ────────────────────────────────────────────────────────────────
const UserRow = ({ user, onView, onQuickApprove }) => {
  const [approving, setApproving] = useState(false);

  const isPending = user.verification_status === "pending";
  const canVerify = isPending && (user.role === "employer" || user.role === "trainer");

  const handleApprove = async () => {
    setApproving(true);
    await onQuickApprove();
    setApproving(false);
  };

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">

      {/* User identity */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <Avatar user={user} />
          <div className="min-w-0">
            <p className="font-semibold text-sm text-slate-800 truncate max-w-[160px]">{user.name}</p>
            {user.company_name && (
              <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{user.company_name}</p>
            )}
            {user.organization_name && (
              <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{user.organization_name}</p>
            )}
            <p className="text-[10px] text-slate-300">#{user.id}</p>
          </div>
        </div>
      </td>

      {/* Roles */}
      <td className="px-5 py-3.5"><RolePills roles={user.roles} /></td>

      {/* Contact */}
      <td className="px-5 py-3.5">
        <div className="space-y-1">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <Mail className="w-3 h-3 flex-shrink-0" />
            <span className="truncate max-w-[170px]">{user.email}</span>
          </p>
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <Phone className="w-3 h-3 flex-shrink-0" />
            {user.phone || "—"}
          </p>
        </div>
      </td>

      {/* Status + Premium */}
      <td className="px-5 py-3.5">
        <div className="flex flex-col gap-1.5">
          <StatusBadge status={user.verification_status} />
          {user.is_premium && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 w-fit">
              <Crown className="w-2.5 h-2.5" /> Premium
            </span>
          )}
        </div>
      </td>

      {/* Joined */}
      <td className="px-5 py-3.5 text-xs text-slate-400">{fmt(user.created_at)}</td>

      {/* Actions — always rendered; conditionally enabled */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2">

          {/* View — always active */}
          <button
            onClick={onView}
            className="p-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Approve */}
          <button
            onClick={canVerify ? handleApprove : undefined}
            disabled={!canVerify || approving}
            title={canVerify ? "Quick Approve" : isPending ? "Only employers & trainers can be verified" : "Already processed"}
            className={`p-2 rounded-lg transition-all ${canVerify
              ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 cursor-pointer"
              : "bg-slate-50 text-slate-300 cursor-not-allowed opacity-40"
              }`}
          >
            {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          </button>

          {/* Reject — opens modal so note can be written */}
          <button
            onClick={canVerify ? onView : undefined}
            disabled={!canVerify}
            title={canVerify ? "Reject (add note in panel)" : isPending ? "Only employers & trainers can be rejected" : "Already processed"}
            className={`p-2 rounded-lg transition-all ${canVerify
              ? "bg-red-50 text-red-500 hover:bg-red-100 cursor-pointer"
              : "bg-slate-50 text-slate-300 cursor-not-allowed opacity-40"
              }`}
          >
            <XCircle className="w-4 h-4" />
          </button>

        </div>
      </td>
    </tr>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const UsersManagement = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [selected, setSelected] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let raw = [];

      if (activeTab === "all") {
        const res = await adminGetAllUsers();
        raw = res?.users ?? (Array.isArray(res) ? res : []);
        setUsers(raw.map(normaliseAllUsers));

      } else if (activeTab === "employers") {
        const res = await getAllEmployers(filterStatus === "all" ? null : filterStatus);
        raw = Array.isArray(res) ? res : res?.employers ?? [];
        setUsers(raw.map(normalizeUser));

      } else if (activeTab === "trainers") {
        const res = await listAllTrainers(filterStatus === "all" ? "all" : filterStatus);
        raw = Array.isArray(res) ? res : res?.trainers ?? [];
        setUsers(raw.map(normalizeUser));

      } else if (activeTab === "jobseekers") {
        const res = await listAllJobSeekers(filterStatus === "all" ? null : filterStatus);
        raw = Array.isArray(res) ? res : res?.jobSeekers ?? res?.job_seekers ?? [];
        setUsers(raw.map(normalizeUser));
      }

    } catch (err) {
      console.error("Fetch users error:", err);
      setError(err?.message || "Failed to load users.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, filterStatus]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleVerified = (userId, status, note) => {
    setUsers((prev) =>
      prev.map((u) => u.id === userId ? { ...u, verification_status: status, verification_note: note } : u)
    );
  };

  const displayedUsers = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.company_name?.toLowerCase().includes(q) ||
      u.organization_name?.toLowerCase().includes(q) ||
      String(u.id).includes(q)
    );
  });

  const stats = {
    total: users.length,
    pending: users.filter((u) => (u.verification_status || "pending") === "pending").length,
    verified: users.filter((u) => u.verification_status === "verified").length,
    rejected: users.filter((u) => u.verification_status === "rejected").length,
    premium: users.filter((u) => u.is_premium).length,
  };

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[60] flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl text-white ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
          {toast.type === "error" ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">User Management</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage accounts, verify employers &amp; trainers</p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 disabled:opacity-40 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {STAT_CARDS.map(({ key, label, icon: Icon, textCls, bgCls }) => (
          <div key={key} className="rounded-2xl p-5 bg-white border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bgCls}`}>
                <Icon className={`w-5 h-5 ${textCls}`} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">{label}</p>
                <p className="text-2xl font-bold text-slate-800">{stats[key]}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="rounded-2xl p-4 mb-4 bg-white border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap">

          {/* Role tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-slate-100">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setSearchQuery(""); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${active
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />{tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Status filter — hidden on "all" tab */}
            {activeTab !== "all" && (
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 rounded-xl text-sm font-medium bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-slate-400" />
              </div>
            )}

            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, email, company…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 w-60"
              />
            </div>

            <button
              onClick={fetchUsers}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-sky-600 hover:bg-sky-700 text-white transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 mb-4 rounded-2xl bg-red-50 border border-red-100">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
          <span className="text-sm flex-1 text-red-600">{error}</span>
          <button onClick={fetchUsers} className="text-xs font-bold underline text-red-500">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {["User", "Roles", "Contact", "Status / Plan", "Joined", "Actions"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-50">
                  {[160, 100, 140, 90, 70, 100].map((w, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 rounded-lg bg-slate-100 animate-pulse" style={{ width: w }} />
                    </td>
                  ))}
                </tr>
              ))
              : displayedUsers.length === 0
                ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-sm text-slate-400">
                      No users found.
                    </td>
                  </tr>
                )
                : displayedUsers.map((u) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    onView={() => setSelected(u)}
                    onQuickApprove={async () => {
                      try {
                        if (u.role === "employer" && u.employer?.employer_id) {
                          await verifyEmployer(u.employer.employer_id, "verified", "");
                        } else if (u.role === "trainer" && u.trainer?.trainer_id) {
                          await verifyTrainer(u.trainer.trainer_id, "verified");
                        }
                        handleVerified(u.id, "verified", "");
                        showToast("User approved successfully.", "success");
                      } catch (e) {
                        showToast(e?.message || "Approval failed.", "error");
                      }
                    }}
                  />
                ))
            }
          </tbody>
        </table>

        {!loading && (
          <div className="px-5 py-3 border-t border-slate-50 text-xs text-slate-400">
            Showing {displayedUsers.length} of {users.length} users
          </div>
        )}
      </div>

      {/* Detail / verify modal */}
      {selected && (
        <UserModal
          user={selected}
          onClose={() => setSelected(null)}
          onVerified={handleVerified}
          showToast={showToast}
        />
      )}
    </>
  );
};

export default UsersManagement;