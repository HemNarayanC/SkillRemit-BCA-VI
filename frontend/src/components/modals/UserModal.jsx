import { useState } from 'react';
import { X, MapPin, Star, Cpu, Phone, Clock, Building2, GraduationCap, Briefcase, BadgeCheck, XCircle, ShieldCheck, UserIcon, Users } from 'lucide-react';

const fmt = (d) =>
    d
        ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "—";

const Avatar = ({ user }) => {
    const initials = (user.name || "U").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    const m = ROLE_META[user.primaryRole] || ROLE_META.user;
    if (user.profile_image) {
        return <img src={user.profile_image} alt={user.name}
            className="w-10 h-10 rounded-full object-cover border-2"
            style={{ borderColor: "var(--color-border)" }} />;
    }
    return (
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: m.bg, color: m.color, border: `2px solid ${m.color}30` }}>
            {initials}
        </div>
    );
};

const RolePills = ({ roles }) => (
    <div className="flex flex-wrap gap-1">
        {(roles || []).map((r) => {
            const m = ROLE_META[r] || ROLE_META.user;
            const Icon = m.icon;
            return (
                <span key={r} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize"
                    style={{ background: m.bg, color: m.color }}>
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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
            style={{ background: m.bg, color: m.color }}>
            <Icon className="w-3 h-3" />{m.label}
        </span>
    );
};

const ROLE_META = {
    employer: { icon: Building2, label: "Employer", color: "#6366F1", bg: "rgba(99,102,241,0.09)" },
    trainer: { icon: GraduationCap, label: "Trainer", color: "#F59E0B", bg: "rgba(245,158,11,0.09)" },
    jobseeker: { icon: Briefcase, label: "Job Seeker", color: "#10B981", bg: "rgba(16,185,129,0.09)" },
    admin: { icon: ShieldCheck, label: "Admin", color: "#EF4444", bg: "rgba(239,68,68,0.09)" },
    user: { icon: UserIcon, label: "User", color: "#94A3B8", bg: "rgba(148,163,184,0.09)" },
};

const STATUS_META = {
    verified: { label: "Verified", bg: "rgba(16,185,129,0.09)", color: "rgb(16,185,129)", icon: BadgeCheck },
    pending: { label: "Pending", bg: "rgba(245,158,11,0.09)", color: "rgb(245,158,11)", icon: Clock },
    rejected: { label: "Rejected", bg: "rgba(220,38,38,0.09)", color: "rgb(220,38,38)", icon: XCircle },
};

const TABS = [
    { key: "all", label: "All", icon: Users },
    { key: "employer", label: "Employers", icon: Building2 },
    { key: "trainer", label: "Trainers", icon: GraduationCap },
    { key: "jobseeker", label: "Job Seekers", icon: Briefcase },
];

const UserModal = ({ user, onClose, onVerified, showToast }) => {
    const [note, setNote] = useState(user.verification_note || "");
    const [loading, setLoading] = useState(false);

    const canVerify =
        user.verification_status === "pending" &&
        (user.primaryRole === "employer" || user.primaryRole === "trainer");

    const handleVerify = async (status) => {
        if (status === "rejected" && !note.trim()) {
            showToast("A rejection reason is required.", "error"); return;
        }
        setLoading(true);
        try {
            if (user.primaryRole === "employer") {
                await adminVerifyEmployer(user.employer.employer_id, status, note);
            }
            // trainer: await adminVerifyTrainer(user.trainer.trainer_id, status, note) when route added
            showToast(`User ${status === "verified" ? "approved" : "rejected"} successfully.`, "success");
            onVerified(user.user_id, status, note);
            onClose();
        } catch (e) {
            showToast(e?.message || "Action failed.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
            onClick={onClose}>
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
                style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
                onClick={(e) => e.stopPropagation()}>

                {/* Modal header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 rounded-t-2xl"
                    style={{ background: "var(--color-card)", borderBottom: "1px solid var(--color-border)" }}>
                    <div className="flex items-center gap-3">
                        <Avatar user={user} />
                        <div>
                            <h2 className="font-bold text-base" style={{ color: "var(--color-foreground)" }}>{user.name}</h2>
                            <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>{user.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:opacity-70 transition-opacity"
                        style={{ background: "rgba(15,23,42,0.05)" }}>
                        <X className="w-4 h-4" style={{ color: "var(--color-muted-foreground)" }} />
                    </button>
                </div>

                <div className="p-6 space-y-5">

                    {/* Account */}
                    <section className="rounded-xl p-4 space-y-3" style={{ background: "rgba(15,23,42,0.03)" }}>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--color-muted-foreground)" }}>
                            Account Information
                        </h3>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                            <Info label="User ID" val={`#${user.user_id}`} />
                            <Info label="Roles"><RolePills roles={user.roles} /></Info>
                            <Info label="Phone" val={user.phone || "—"} icon={Phone} />
                            <Info label="Registered" val={fmt(user.created_at)} icon={Clock} />
                            <Info label="Status"><StatusBadge status={user.verification_status} /></Info>
                            {user.is_premium && (
                                <Info label="Plan">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
                                        style={{ background: "rgba(245,158,11,0.1)", color: "rgb(245,158,11)" }}>
                                        <Crown className="w-3 h-3" /> Premium
                                    </span>
                                </Info>
                            )}
                        </div>
                    </section>

                    {/* Employer */}
                    {user.employer && (
                        <section className="rounded-xl p-4 space-y-3" style={{ background: "rgba(99,102,241,0.04)" }}>
                            <h3 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                                style={{ color: "rgb(99,102,241)" }}>
                                <Building2 className="w-3.5 h-3.5" /> Employer Profile
                            </h3>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                <Info label="Company" val={user.employer.company_name} />
                                <Info label="Type" val={user.employer.business_type} />
                                <Info label="Reg No." val={user.employer.registration_number} />
                                <Info label="Country" val={user.employer.registered_country} icon={MapPin} />
                                <Info label="Trust Score" val={user.employer.trust_score ?? "—"} icon={Star} />
                                <Info label="Employer ID" val={`#${user.employer.employer_id}`} />
                            </div>
                        </section>
                    )}

                    {/* Trainer */}
                    {user.trainer && (
                        <section className="rounded-xl p-4 space-y-3" style={{ background: "rgba(245,158,11,0.04)" }}>
                            <h3 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                                style={{ color: "rgb(245,158,11)" }}>
                                <GraduationCap className="w-3.5 h-3.5" /> Trainer Profile
                            </h3>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                <Info label="Organization" val={user.trainer.organization_name} />
                                <Info label="Contact" val={user.trainer.contact_info} />
                                <Info label="Trainer ID" val={`#${user.trainer.trainer_id}`} />
                                <Info label="Status"><StatusBadge status={user.trainer.verification_status} /></Info>
                            </div>
                        </section>
                    )}

                    {/* JobSeeker */}
                    {user.jobseeker && (
                        <section className="rounded-xl p-4 space-y-3" style={{ background: "rgba(16,185,129,0.04)" }}>
                            <h3 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                                style={{ color: "rgb(16,185,129)" }}>
                                <Briefcase className="w-3.5 h-3.5" /> Job Seeker Profile
                            </h3>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                <Info label="Location" val={user.jobseeker.current_location} icon={MapPin} />
                                <Info label="District" val={user.jobseeker.remittance_district} />
                                <Info label="Experience" val={user.jobseeker.years_of_experience ? `${user.jobseeker.years_of_experience} yrs` : "—"} />
                                <Info label="AI Checks" val={user.jobseeker.ai_checks_used ?? "—"} icon={Cpu} />
                            </div>
                            {user.jobseeker.skill_description && (
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1"
                                        style={{ color: "var(--color-muted-foreground)" }}>Skills Summary</p>
                                    <p className="text-xs leading-relaxed" style={{ color: "var(--color-foreground)" }}>
                                        {user.jobseeker.skill_description}
                                    </p>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Verification decision — only for pending employer/trainer */}
                    {canVerify && (
                        <section className="rounded-xl p-4 space-y-4"
                            style={{ background: "rgba(15,23,42,0.03)", border: "1px solid var(--color-border)" }}>
                            <h3 className="text-[10px] font-bold uppercase tracking-widest"
                                style={{ color: "var(--color-muted-foreground)" }}>Verification Decision</h3>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Add a note — optional for approval, required for rejection…"
                                rows={3}
                                className="w-full px-3 py-2.5 rounded-xl text-sm resize-none focus:outline-none"
                                style={{
                                    background: "var(--color-card)",
                                    color: "var(--color-foreground)",
                                    border: "1px solid var(--color-border)",
                                }}
                            />
                            <div className="flex gap-3">
                                <button onClick={() => handleVerify("verified")} disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-opacity disabled:opacity-50"
                                    style={{ background: "rgb(16,185,129)", color: "#fff" }}>
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    Approve & Verify
                                </button>
                                <button onClick={() => handleVerify("rejected")} disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-opacity disabled:opacity-50"
                                    style={{ background: "rgb(220,38,38)", color: "#fff" }}>
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                    Reject
                                </button>
                            </div>
                        </section>
                    )}

                </div>
            </div>
        </div>
    );
};

export default UserModal;

const Info = ({ label, val, icon: Icon, children }) => (
    <div>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1"
            style={{ color: "var(--color-muted-foreground)" }}>{label}</p>
        {children ?? (
            <p className="text-sm font-medium flex items-center gap-1" style={{ color: "var(--color-foreground)" }}>
                {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--color-muted-foreground)" }} />}
                {val ?? "—"}
            </p>
        )}
    </div>
);
