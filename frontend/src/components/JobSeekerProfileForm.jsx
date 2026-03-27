import { useState, useEffect, useRef } from "react";
import {
    User, Mail, Phone, MapPin, Briefcase, FileText,
    Star, Edit3, Save, X, Plus, Trash2, Loader2,
    AlertCircle, CheckCircle, Upload, Crown, Zap,
    BookOpen, Globe, Calendar, Award, ChevronDown,
} from "lucide-react";
import {
    getJobSeekerProfile,
    updateJobSeekerProfile,
    getMySkills,
    addMySkill,
    updateMySkill,
    removeMySkill,
    getAllSkills,
} from "../../../api/jobSeekerApi.js";
import PremiumUpgrade from "../../../components/modals/PremiumUpgrade.jsx";
import { usePlatformSettings } from "../../../context/PlatformSettingsContext.jsx";

// ─── Constants ─────────────────────────────────────────────────────────────────
const PROFICIENCY_LEVELS = ["basic", "intermediate", "advanced"];

const PROFICIENCY_CFG = {
    basic: { label: "Basic", bg: "#f8fafc", color: "#64748b", border: "#e2e8f0", dot: "#94a3b8" },
    intermediate: { label: "Intermediate", bg: "#eff6ff", color: "#0369a1", border: "#bfdbfe", dot: "#3b82f6" },
    advanced: { label: "Advanced", bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe", dot: "#8b5cf6" },
};

const NEPAL_DISTRICTS = [
    "Kathmandu", "Lalitpur", "Bhaktapur", "Chitwan", "Pokhara", "Butwal", "Birgunj",
    "Biratnagar", "Dharan", "Dhankuta", "Itahari", "Hetauda", "Bharatpur", "Janakpur",
    "Nepalgunj", "Dhangadhi", "Mahendranagar", "Bhairahawa", "Tansen", "Palpa",
    "Gorkha", "Lamjung", "Syangja", "Parbat", "Baglung", "Mustang", "Myagdi",
    "Kaski", "Tanahun", "Nawalparasi", "Rupandehi", "Kapilvastu", "Arghakhanchi",
    "Gulmi", "Palpa", "Rolpa", "Rukum", "Salyan", "Surkhet", "Dailekh", "Jajarkot",
    "Humla", "Jumla", "Dolpa", "Mugu", "Kalikot", "Achham", "Doti", "Bajhang", "Bajura",
    "Dadeldhura", "Baitadi", "Darchula", "Other",
];

// ─── Helper Components ─────────────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value, className = "" }) => (
    <div className={`flex items-start gap-3 ${className}`}>
        <div className="w-8 h-8 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center flex-shrink-0 mt-0.5">
            <Icon className="w-3.5 h-3.5 text-[#64748b]" />
        </div>
        <div className="min-w-0">
            <div className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-[0.05em] mb-0.5">{label}</div>
            <div className="text-sm font-medium text-[#0f172a] capitalize">{value || "—"}</div>
        </div>
    </div>
);

const SectionCard = ({ title, icon: Icon, iconColor = "#0369a1", iconBg = "#eff6ff", iconBorder = "#bfdbfe", children, action }) => (
    <div className="bg-white border border-[#e2e8f0] rounded-[18px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[10px] flex items-center justify-center border"
                    style={{ background: iconBg, borderColor: iconBorder }}>
                    <Icon className="w-4 h-4" style={{ color: iconColor }} />
                </div>
                <span className="text-sm font-bold text-[#0f172a]">{title}</span>
            </div>
            {action}
        </div>
        <div className="p-6">{children}</div>
    </div>
);

const Toast = ({ msg, type = "success", onClose }) => (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-[14px] border shadow-lg text-sm font-semibold
    ${type === "success" ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d]" : "bg-[#fef2f2] border-[#fecaca] text-[#dc2626]"}`}>
        {type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
        {msg}
        <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
    </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const JobSeekerProfileForm = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [toast, setToast] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [showUpgrade, setShowUpgrade] = useState(false);

    // form state (edit mode)
    const [form, setForm] = useState({});

    // skills state
    const [mySkills, setMySkills] = useState([]);
    const [allSkills, setAllSkills] = useState([]);
    const [skillsLoading, setSkillsLoading] = useState(false);
    const [addingSkill, setAddingSkill] = useState(false);
    const [removingSkill, setRemovingSkill] = useState(null);
    const [updatingSkill, setUpdatingSkill] = useState(null);
    const [skillSearch, setSkillSearch] = useState("");
    const [showSkillDD, setShowSkillDD] = useState(false);
    const [newProficiency, setNewProficiency] = useState("basic");
    const [selectedNewSkill, setSelectedNewSkill] = useState(null);

    const { settings } = usePlatformSettings();
    const FREE_LIMIT = settings?.free_ai_checks ?? 5;

    const skillDDRef = useRef(null);

    // ── Load profile + skills ───────────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [pData, sData, allData] = await Promise.allSettled([
                    getJobSeekerProfile(),
                    getMySkills(),
                    getAllSkills(),
                ]);
                if (pData.status === "fulfilled") {
                    setProfile(pData.value);
                    setForm(profileToForm(pData.value));
                }
                if (sData.status === "fulfilled") setMySkills(sData.value?.skills || []);
                if (allData.status === "fulfilled") setAllSkills(allData.value?.skills || []);
            } catch (e) {
                setError("Failed to load profile.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Close skill dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (skillDDRef.current && !skillDDRef.current.contains(e.target)) setShowSkillDD(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const profileToForm = (p) => ({
        name: p.user?.name || "",
        email: p.user?.email || "",
        phone: p.user?.phone || "",
        current_location: p.current_location || "",
        remittance_district: p.remittance_district || "",
        skill_description: p.skill_description || "",
        years_of_experience: p.years_of_experience ?? "",
    });

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    // ── Save profile ────────────────────────────────────────────────────────────
    const handleSave = async () => {
        setSaving(true);
        try {
            const updated = await updateJobSeekerProfile({
                current_location: form.current_location,
                remittance_district: form.remittance_district,
                skill_description: form.skill_description,
                years_of_experience: form.years_of_experience !== "" ? Number(form.years_of_experience) : null,
                phone: form.phone,
            });
            setProfile(updated.profile || { ...profile, ...form });
            setForm(profileToForm(updated.profile || { ...profile, ...form }));
            setEditMode(false);
            showToast("Profile updated successfully!");
        } catch (err) {
            showToast(err?.message || "Failed to update profile.", "error");
        } finally {
            setSaving(false);
        }
    };

    // ── Add skill ───────────────────────────────────────────────────────────────
    const handleAddSkill = async () => {
        if (!selectedNewSkill) return;
        setAddingSkill(true);
        try {
            await addMySkill(selectedNewSkill.skill_id, newProficiency);
            setMySkills(prev => [...prev, {
                skill_id: selectedNewSkill.skill_id,
                skill_name: selectedNewSkill.skill_name,
                proficiency_level: newProficiency,
            }]);
            setSelectedNewSkill(null);
            setSkillSearch("");
            setNewProficiency("basic");
            showToast("Skill added!");
        } catch (err) {
            showToast(err?.message || "Failed to add skill.", "error");
        } finally {
            setAddingSkill(false);
        }
    };

    // ── Update skill proficiency ────────────────────────────────────────────────
    const handleUpdateSkill = async (skill_id, proficiency_level) => {
        setUpdatingSkill(skill_id);
        try {
            await updateMySkill(skill_id, proficiency_level);
            setMySkills(prev => prev.map(s => s.skill_id === skill_id ? { ...s, proficiency_level } : s));
        } catch (err) {
            showToast(err?.message || "Failed to update skill.", "error");
        } finally {
            setUpdatingSkill(null);
        }
    };

    // ── Remove skill ────────────────────────────────────────────────────────────
    const handleRemoveSkill = async (skill_id) => {
        setRemovingSkill(skill_id);
        try {
            await removeMySkill(skill_id);
            setMySkills(prev => prev.filter(s => s.skill_id !== skill_id));
            showToast("Skill removed.");
        } catch (err) {
            showToast(err?.message || "Failed to remove skill.", "error");
        } finally {
            setRemovingSkill(null);
        }
    };

    // ── Derived ─────────────────────────────────────────────────────────────────
    const mySkillIds = new Set(mySkills.map(s => s.skill_id));
    const filteredAll = allSkills
        .filter(s => !mySkillIds.has(s.skill_id))
        .filter(s => s.skill_name.toLowerCase().includes(skillSearch.toLowerCase()));

    const isPremium = profile?.is_premium ?? false;
    const checksUsed = profile?.ai_checks_used ?? 0;
    const initials = (profile?.user?.name || "?").slice(0, 2).toUpperCase();
    const memberSince = profile?.user?.created_at
        ? new Date(profile.user.created_at).toLocaleDateString("en-NP", { year: "numeric", month: "long" })
        : "—";

    // ── Loading ─────────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#0369a1]" />
        </div>
    );
    if (error) return (
        <div className="flex items-center gap-3 p-4 bg-[#fef2f2] text-[#dc2626] rounded-xl border border-[#fecaca]">
            <AlertCircle className="w-5 h-5" /> {error}
        </div>
    );

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col gap-5 relative">

            {/* ── Header card ──────────────────────────────────────────────────────── */}
            <div className="bg-white border border-[#e2e8f0] rounded-[20px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)]">

                {/* Top accent strip */}
                <div className="h-2 bg-[#0369a1]" />

                <div className="px-7 py-6 flex items-start gap-5 flex-wrap">

                    {/* Avatar */}
                    <div className="w-[72px] h-[72px] rounded-[18px] bg-[#eff6ff] border-[1.5px] border-[#bfdbfe] flex items-center justify-center font-extrabold text-xl text-[#0369a1] flex-shrink-0">
                        {initials}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap mb-1">
                            <h1 className="text-xl font-extrabold text-[#0f172a]">
                                {profile?.user?.name || "Your Profile"}
                            </h1>
                            {isPremium && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.08em] px-2.5 py-1 rounded-full bg-[#fef3c7] text-[#b45309] border border-[#fde68a]">
                                    <Crown className="w-3 h-3" /> Premium
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-[#64748b] mb-3">
                            {profile?.skill_description
                                ? profile.skill_description.slice(0, 120) + (profile.skill_description.length > 120 ? "…" : "")
                                : "Add a bio to tell employers about yourself."}
                        </p>
                        <div className="flex items-center gap-4 flex-wrap text-xs text-[#64748b]">
                            {profile?.user?.email && (
                                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{profile.user.email}</span>
                            )}
                            {profile?.current_location && (
                                <span className="flex items-center gap-1.5 capitalize"><MapPin className="w-3.5 h-3.5" />{profile.current_location}</span>
                            )}
                            {profile?.years_of_experience != null && (
                                <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" />{profile.years_of_experience} yr exp</span>
                            )}
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Member since {memberSince}</span>
                        </div>
                    </div>

                    {/* Edit button */}
                    <button
                        onClick={() => { setEditMode(v => !v); setForm(profileToForm(profile)); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-[11px] text-xs font-bold border transition-colors flex-shrink-0 cursor-pointer"
                        style={{
                            background: editMode ? "#fef2f2" : "#eff6ff",
                            color: editMode ? "#dc2626" : "#0369a1",
                            borderColor: editMode ? "#fecaca" : "#bfdbfe",
                        }}
                    >
                        {editMode ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Edit3 className="w-3.5 h-3.5" /> Edit Profile</>}
                    </button>
                </div>

                {/* AI usage meter */}
                <div className="px-7 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        {isPremium ? (
                            <><Crown className="w-4 h-4 text-[#b45309]" />
                                <div>
                                    <div className="text-xs font-bold text-[#b45309]">Premium Active</div>
                                    <div className="text-[10px] text-[#94a3b8]">Unlimited AI job match checks</div>
                                </div></>
                        ) : (
                            <><Zap className="w-4 h-4 text-[#7c3aed]" />
                                <div>
                                    <div className="text-xs font-bold text-[#0f172a]">Free AI Checks</div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="w-24 h-1.5 rounded-full bg-[#e2e8f0] overflow-hidden">
                                            <div className="h-full rounded-full transition-[width] duration-300"
                                                style={{
                                                    width: `${Math.min(100, (checksUsed / FREE_LIMIT) * 100)}%`,
                                                    background: checksUsed >= FREE_LIMIT ? "#ef4444" : "#7c3aed",
                                                }} />
                                        </div>
                                        <span className="text-[10px] text-[#64748b]">{checksUsed}/{FREE_LIMIT} used</span>
                                    </div>
                                </div></>
                        )}
                    </div>
                    {!isPremium && (
                        <button
                            onClick={() => setShowUpgrade(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] border border-[#fde68a] bg-[#fffbeb] text-[#b45309] text-[11px] font-bold cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            <Zap className="w-3 h-3" /> Upgrade to Premium
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* ── LEFT column: Personal Info ──────────────────────────────────────── */}
                <div className="lg:col-span-1 flex flex-col gap-5">

                    {/* Personal details */}
                    <SectionCard
                        title="Personal Info"
                        icon={User}
                        iconColor="#0369a1"
                        iconBg="#eff6ff"
                        iconBorder="#bfdbfe"
                    >
                        {editMode ? (
                            <div className="flex flex-col gap-3">
                                <Field label="Full Name">
                                    <input
                                        value={form.name}
                                        disabled
                                        className="w-full px-3 py-2 rounded-[10px] border border-[#e2e8f0] bg-[#f8fafc] text-[13px] text-[#94a3b8] cursor-not-allowed"
                                        placeholder="Full name (edit via account settings)"
                                    />
                                    <p className="text-[10px] text-[#94a3b8] mt-0.5">Change name via account settings</p>
                                </Field>
                                <Field label="Email">
                                    <input
                                        value={form.email}
                                        disabled
                                        className="w-full px-3 py-2 rounded-[10px] border border-[#e2e8f0] bg-[#f8fafc] text-[13px] text-[#94a3b8] cursor-not-allowed"
                                    />
                                </Field>
                                <Field label="Phone">
                                    <input
                                        value={form.phone}
                                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-[10px] border border-[#e2e8f0] bg-white text-[13px] text-[#0f172a] focus:outline-none focus:border-[#0369a1]"
                                        placeholder="98XXXXXXXX"
                                    />
                                </Field>
                                <Field label="Current Location">
                                    <input
                                        value={form.current_location}
                                        onChange={e => setForm(f => ({ ...f, current_location: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-[10px] border border-[#e2e8f0] bg-white text-[13px] text-[#0f172a] focus:outline-none focus:border-[#0369a1] capitalize"
                                        placeholder="e.g. Kathmandu"
                                    />
                                </Field>
                                <Field label="Remittance District">
                                    <select
                                        value={form.remittance_district}
                                        onChange={e => setForm(f => ({ ...f, remittance_district: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-[10px] border border-[#e2e8f0] bg-white text-[13px] text-[#0f172a] focus:outline-none focus:border-[#0369a1]"
                                    >
                                        <option value="">Select district</option>
                                        {NEPAL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </Field>
                                <Field label="Years of Experience">
                                    <input
                                        type="number" min="0" max="50"
                                        value={form.years_of_experience}
                                        onChange={e => setForm(f => ({ ...f, years_of_experience: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-[10px] border border-[#e2e8f0] bg-white text-[13px] text-[#0f172a] focus:outline-none focus:border-[#0369a1]"
                                        placeholder="0"
                                    />
                                </Field>

                                {/* Save / cancel */}
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[10px] bg-[#0369a1] text-white text-xs font-bold disabled:opacity-60 cursor-pointer hover:opacity-90 transition-opacity border-0"
                                    >
                                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() => setEditMode(false)}
                                        className="px-3 py-2 rounded-[10px] border border-[#e2e8f0] text-[#64748b] text-xs font-bold cursor-pointer hover:bg-[#f8fafc] transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <InfoRow icon={Mail} label="Email" value={profile?.user?.email} />
                                <InfoRow icon={Phone} label="Phone" value={profile?.user?.phone} />
                                <InfoRow icon={MapPin} label="Current Location" value={profile?.current_location} />
                                <InfoRow icon={Globe} label="Remittance District" value={profile?.remittance_district} />
                                <InfoRow icon={Briefcase} label="Experience" value={profile?.years_of_experience != null ? `${profile.years_of_experience} years` : null} />
                            </div>
                        )}
                    </SectionCard>

                    {/* Documents */}
                    <SectionCard
                        title="Documents"
                        icon={FileText}
                        iconColor="#b45309"
                        iconBg="#fffbeb"
                        iconBorder="#fde68a"
                    >
                        {(profile?.document_urls || []).length > 0 ? (
                            <div className="flex flex-col gap-2">
                                {profile.document_urls.map((url, i) => (
                                    <a
                                        key={i}
                                        href={url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] bg-[#fffbeb] border border-[#fde68a] text-xs font-semibold text-[#b45309] hover:opacity-80 transition-opacity"
                                    >
                                        <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span className="truncate">Document {i + 1}</span>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <Upload className="w-6 h-6 text-[#e2e8f0] mx-auto mb-2" />
                                <div className="text-xs text-[#94a3b8]">No documents uploaded</div>
                                <div className="text-[10px] text-[#94a3b8] mt-0.5">Upload via the profile creation form</div>
                            </div>
                        )}
                    </SectionCard>
                </div>

                {/* ── RIGHT column: Bio + Skills ──────────────────────────────────────── */}
                <div className="lg:col-span-2 flex flex-col gap-5">

                    {/* Bio / About */}
                    <SectionCard
                        title="About Me"
                        icon={BookOpen}
                        iconColor="#15803d"
                        iconBg="#f0fdf4"
                        iconBorder="#bbf7d0"
                    >
                        {editMode ? (
                            <textarea
                                rows={5}
                                value={form.skill_description}
                                onChange={e => setForm(f => ({ ...f, skill_description: e.target.value }))}
                                className="w-full px-4 py-3 rounded-[12px] border border-[#e2e8f0] bg-white text-sm text-[#0f172a] focus:outline-none focus:border-[#0369a1] resize-none leading-relaxed"
                                placeholder="Tell employers about your background, strengths, and career goals…"
                            />
                        ) : (
                            <p className="text-sm text-[#475569] leading-relaxed">
                                {profile?.skill_description || (
                                    <span className="text-[#94a3b8] italic">
                                        No bio added yet. Click &quot;Edit Profile&quot; to add one.
                                    </span>
                                )}
                            </p>
                        )}
                    </SectionCard>

                    {/* Skills */}
                    <SectionCard
                        title="Skills"
                        icon={Star}
                        iconColor="#7c3aed"
                        iconBg="#f5f3ff"
                        iconBorder="#ddd6fe"
                        action={
                            <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.05em]">
                                {mySkills.length} skill{mySkills.length !== 1 ? "s" : ""}
                            </span>
                        }
                    >
                        {/* Current skills */}
                        {mySkills.length > 0 && (
                            <div className="flex flex-col gap-2 mb-5">
                                {mySkills.map(skill => {
                                    const cfg = PROFICIENCY_CFG[skill.proficiency_level] || PROFICIENCY_CFG.basic;
                                    const isUpdating = updatingSkill === skill.skill_id;
                                    const isRemoving = removingSkill === skill.skill_id;
                                    return (
                                        <div
                                            key={skill.skill_id}
                                            className="flex items-center gap-3 px-4 py-3 rounded-[12px] border bg-[#f8fafc]"
                                            style={{ borderColor: "#e2e8f0" }}
                                        >
                                            {/* Dot */}
                                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />

                                            {/* Name */}
                                            <span className="flex-1 text-sm font-semibold text-[#0f172a] min-w-0 truncate">
                                                {skill.skill_name}
                                            </span>

                                            {/* Proficiency selector */}
                                            <div className="flex-shrink-0 relative">
                                                {isUpdating ? (
                                                    <Loader2 className="w-3.5 h-3.5 text-[#64748b] animate-spin" />
                                                ) : (
                                                    <select
                                                        value={skill.proficiency_level}
                                                        onChange={e => handleUpdateSkill(skill.skill_id, e.target.value)}
                                                        className="text-[10px] font-bold px-2 py-1 rounded-full border appearance-none cursor-pointer focus:outline-none"
                                                        style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
                                                    >
                                                        {PROFICIENCY_LEVELS.map(l => (
                                                            <option key={l} value={l}>{PROFICIENCY_CFG[l].label}</option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>

                                            {/* Remove */}
                                            <button
                                                onClick={() => handleRemoveSkill(skill.skill_id)}
                                                disabled={isRemoving}
                                                className="w-6 h-6 rounded-lg border border-[#fecaca] bg-[#fef2f2] flex items-center justify-center text-[#dc2626] flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-40"
                                            >
                                                {isRemoving
                                                    ? <Loader2 className="w-3 h-3 animate-spin" />
                                                    : <Trash2 className="w-3 h-3" />}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Empty state */}
                        {mySkills.length === 0 && (
                            <div className="py-6 text-center mb-4">
                                <Star className="w-6 h-6 text-[#e2e8f0] mx-auto mb-2" />
                                <div className="text-sm text-[#94a3b8]">No skills added yet</div>
                                <div className="text-xs text-[#94a3b8] mt-0.5">Add skills to improve your job match score</div>
                            </div>
                        )}

                        {/* Add skill row */}
                        <div className="border-t border-[#e2e8f0] pt-4">
                            <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-[0.05em] mb-3">Add a Skill</div>
                            <div className="flex gap-2 flex-wrap">

                                {/* Skill search dropdown */}
                                <div className="relative flex-1 min-w-[180px]" ref={skillDDRef}>
                                    <input
                                        value={selectedNewSkill ? selectedNewSkill.skill_name : skillSearch}
                                        onChange={e => {
                                            setSkillSearch(e.target.value);
                                            setSelectedNewSkill(null);
                                            setShowSkillDD(true);
                                        }}
                                        onFocus={() => setShowSkillDD(true)}
                                        placeholder="Search skills…"
                                        className="w-full px-3 py-2 rounded-[10px] border border-[#e2e8f0] bg-white text-[13px] text-[#0f172a] focus:outline-none focus:border-[#7c3aed]"
                                    />
                                    {showSkillDD && filteredAll.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e2e8f0] rounded-[12px] shadow-lg z-20 max-h-[180px] overflow-y-auto">
                                            {filteredAll.slice(0, 20).map(skill => (
                                                <button
                                                    key={skill.skill_id}
                                                    onClick={() => {
                                                        setSelectedNewSkill(skill);
                                                        setSkillSearch(skill.skill_name);
                                                        setShowSkillDD(false);
                                                    }}
                                                    className="w-full text-left px-3 py-2 text-[13px] text-[#0f172a] hover:bg-[#f5f3ff] hover:text-[#7c3aed] transition-colors first:rounded-t-[12px] last:rounded-b-[12px]"
                                                >
                                                    {skill.skill_name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Proficiency */}
                                <select
                                    value={newProficiency}
                                    onChange={e => setNewProficiency(e.target.value)}
                                    className="px-3 py-2 rounded-[10px] border border-[#e2e8f0] text-[13px] text-[#0f172a] bg-white focus:outline-none focus:border-[#7c3aed] flex-shrink-0"
                                >
                                    {PROFICIENCY_LEVELS.map(l => (
                                        <option key={l} value={l}>{PROFICIENCY_CFG[l].label}</option>
                                    ))}
                                </select>

                                {/* Add button */}
                                <button
                                    onClick={handleAddSkill}
                                    disabled={!selectedNewSkill || addingSkill}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-[#7c3aed] text-white text-[13px] font-bold border-0 cursor-pointer disabled:opacity-50 hover:opacity-90 transition-opacity flex-shrink-0"
                                >
                                    {addingSkill
                                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        : <Plus className="w-3.5 h-3.5" />}
                                    Add
                                </button>
                            </div>
                        </div>
                    </SectionCard>

                    {/* Stats summary */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: "Skills Added", value: mySkills.length, color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
                            { label: "Advanced Skills", value: mySkills.filter(s => s.proficiency_level === "advanced").length, color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
                            { label: "Intermediate Skills", value: mySkills.filter(s => s.proficiency_level === "intermediate").length, color: "#0369a1", bg: "#eff6ff", border: "#bfdbfe" },
                        ].map(({ label, value, color, bg, border }) => (
                            <div key={label} className="rounded-[14px] border px-4 py-3 text-center" style={{ background: bg, borderColor: border }}>
                                <div className="text-2xl font-extrabold" style={{ color }}>{value}</div>
                                <div className="text-[10px] font-bold mt-0.5" style={{ color }}>{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Premium modal ─────────────────────────────────────────────────────── */}
            {showUpgrade && (
                <PremiumUpgrade
                    role="jobseeker"
                    onClose={() => setShowUpgrade(false)}
                />
            )}

            {/* ── Toast ─────────────────────────────────────────────────────────────── */}
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default JobSeekerProfileForm;

// ─── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, children }) {
    return (
        <div>
            <label className="block text-[10px] font-bold text-[#64748b] uppercase tracking-[0.05em] mb-1">
                {label}
            </label>
            {children}
        </div>
    );
}