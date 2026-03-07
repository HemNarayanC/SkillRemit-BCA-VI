import { useState, useEffect } from "react";
import {
    X, Crown, Brain, Zap, Shield, Star,
    Check, Lock, ArrowRight, Loader2, Sparkles,
    XCircle, Infinity
} from "lucide-react";
import {
    getPremiumPlans,
    getPremiumStatus,
    initiatePremiumPayment,
} from "../../api/premiumApi.js";

const FEATURES = {
    jobseeker: [
        { icon: Brain, text: "Unlimited AI job match analyses" },
        { icon: Zap, text: "AI skill gap analysis — unlimited" },
        { icon: Star, text: "Priority visibility to employers" },
        { icon: Shield, text: "Profile verification badge" },
        { icon: Infinity, text: "No monthly AI check limits" },
    ],
    employer: [
        { icon: Brain, text: "Unlimited AI candidate screening" },
        { icon: Crown, text: "Featured job postings" },
        { icon: Zap, text: "Priority hiring support" },
        { icon: Shield, text: "Verified employer badge" },
        { icon: Infinity, text: "No AI screening limits" },
    ],
};

const FREE_LIMITS = {
    jobseeker: [
        "5 AI match analyses / month",
        "Standard profile listing",
        "Unlimited job applications",
    ],
    employer: [
        "5 AI candidate screenings / month",
        "Up to 10 active job posts",
        "Basic applicant management",
    ],
};

/**
 * PremiumUpgrade modal
 *
 * Props:
 *   role    – "jobseeker" | "employer"  (pass user.current_role from AuthContext)
 *   onClose – () => void
 *
 * Fetches live plans + premium status from the API on mount.
 * Calls POST /aipremium/initiate on pay → redirects to Khalti payment_url.
 */
const PremiumUpgrade = ({ role = "jobseeker", onClose }) => {
    const [plans, setPlans] = useState([]);
    const [status, setStatus] = useState(null);
    const [selected, setSelected] = useState(null);
    const [initLoading, setInitLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState("");

    const FREE_LIMIT = 5;
    const features = FEATURES[role] || FEATURES.jobseeker;
    const freeLimits = FREE_LIMITS[role] || FREE_LIMITS.jobseeker;
    const plan = plans.find(p => p.key === selected);
    const checksUsed = status?.ai_checks_used ?? 0;
    const checksLimit = status?.ai_checks_limit ?? FREE_LIMIT;
    const isPremium = status?.is_premium ?? false;

    // ── fetch plans + status ──────────────────────────────────────────────────
    useEffect(() => {
        Promise.allSettled([
            getPremiumPlans(),
            getPremiumStatus(),
        ]).then(([p, s]) => {
            if (p.status === "fulfilled") {
                const list = p.value?.plans ?? [];
                setPlans(list);
                if (list.length) setSelected(list[0].key);
            }
            if (s.status === "fulfilled") setStatus(s.value);
        }).finally(() => setInitLoading(false));
    }, [role]);

    // ── close on Escape ───────────────────────────────────────────────────────
    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose?.(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    // ── pay ───────────────────────────────────────────────────────────────────
    const handlePay = async () => {
        if (!plan) return;
        setError("");
        setPaying(true);
        try {
            const result = await initiatePremiumPayment(plan.key, role);
            window.location.href = result.payment_url;
        } catch (err) {
            setError(err?.message || "Failed to initiate payment. Please try again.");
            setPaying(false);
        }
    };

    const handleBackdrop = (e) => {
        if (e.target === e.currentTarget) onClose?.();
    };

    // ── loading ───────────────────────────────────────────────────────────────
    if (initLoading) return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(3px)" }}
        >
            <div className="bg-white rounded-2xl w-full max-w-2xl p-14 flex flex-col items-center gap-4">
                <Loader2 className="w-7 h-7 animate-spin text-slate-400" />
                <p className="text-sm text-slate-500 font-medium">Loading plans…</p>
            </div>
        </div>
    );

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(3px)" }}
            onClick={handleBackdrop}
        >
            <div
                className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
                style={{ maxHeight: "92vh", overflowY: "auto" }}
            >
                {/* ── top bar ── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                            <Crown className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                                {role === "employer" ? "Employer" : "JobSeeker"} Premium
                            </p>
                            <h2 className="text-base font-extrabold text-slate-800 leading-tight">
                                Upgrade your account
                            </h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    >
                        <X className="w-4 h-4 text-slate-500" />
                    </button>
                </div>

                {/* ── already premium ── */}
                {isPremium ? (
                    <div className="flex flex-col items-center py-14 px-8 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
                            <Crown className="w-8 h-8 text-amber-600" />
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-800 mb-2">
                            You're already Premium
                        </h3>
                        <p className="text-slate-500 text-sm mb-6">
                            Enjoy unlimited AI checks and all premium features.
                        </p>
                        <button
                            onClick={onClose}
                            className="px-8 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">

                        {/* ── LEFT ── */}
                        <div className="p-6 flex flex-col gap-5">

                            {/* live AI usage bar */}
                            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-1.5">
                                        <Brain className="w-3.5 h-3.5 text-slate-500" />
                                        <span className="text-xs font-semibold text-slate-500">
                                            Free AI Checks Used
                                        </span>
                                    </div>
                                    <span className={`text-xs font-bold ${checksUsed >= checksLimit ? "text-red-500" : "text-slate-700"}`}>
                                        {checksUsed} / {checksLimit}
                                    </span>
                                </div>
                                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${checksUsed >= checksLimit ? "bg-red-500" :
                                            checksUsed >= 3 ? "bg-amber-500" : "bg-blue-500"
                                            }`}
                                        style={{ width: `${Math.min(100, (checksUsed / (checksLimit || FREE_LIMIT)) * 100)}%` }}
                                    />
                                </div>
                                {checksUsed >= checksLimit && (
                                    <p className="text-xs text-red-500 font-semibold mt-1.5">
                                        Limit reached — upgrade for unlimited access
                                    </p>
                                )}
                            </div>

                            {/* plan cards — built from API response */}
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                    Choose plan
                                </p>
                                <div className="flex flex-col gap-3">
                                    {plans.map((p) => {
                                        const isActive = selected === p.key;
                                        const displayPrice = p.monthly_npr ?? p.amount_npr;
                                        const savings = p.key === "premium_yearly"
                                            ? Math.round(((299 * 12 - p.amount_npr) / (299 * 12)) * 100)
                                            : null;
                                        return (
                                            <button
                                                key={p.key}
                                                onClick={() => setSelected(p.key)}
                                                className={`relative w-full text-left rounded-xl border-2 px-4 py-3.5 transition-all ${isActive
                                                    ? "border-blue-600 bg-blue-50"
                                                    : "border-slate-200 bg-white hover:border-slate-300"
                                                    }`}
                                            >
                                                {savings && (
                                                    <span className="absolute -top-2.5 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                                                        Save {savings}%
                                                    </span>
                                                )}
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-0.5">
                                                            {p.label}
                                                        </p>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-2xl font-extrabold text-slate-900">
                                                                NPR {Number(displayPrice).toLocaleString()}
                                                            </span>
                                                            <span className="text-xs text-slate-400">/ month</span>
                                                        </div>
                                                        {p.key === "premium_yearly" && (
                                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                                Billed NPR {Number(p.amount_npr).toLocaleString()} / year
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isActive ? "border-blue-600 bg-blue-600" : "border-slate-300"
                                                        }`}>
                                                        {isActive && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* free tier comparison */}
                            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                                    Free plan includes
                                </p>
                                <div className="flex flex-col gap-2">
                                    {freeLimits.map((f) => (
                                        <div key={f} className="flex items-center gap-2">
                                            <Lock className="w-3 h-3 text-slate-300 flex-shrink-0" />
                                            <span className="text-xs text-slate-400">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── RIGHT ── */}
                        <div className="p-6 flex flex-col gap-5">

                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                    Premium includes
                                </p>
                                <div className="flex flex-col gap-3.5">
                                    {features.map(({ icon: Icon, text }) => (
                                        <div key={text} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                                                <Icon className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <span className="text-sm text-slate-700 font-medium">{text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-slate-100" />

                            {/* error */}
                            {error && (
                                <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-red-600 font-medium">{error}</p>
                                </div>
                            )}

                            {/* summary */}
                            <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">You're paying</p>
                                    <p className="text-lg font-extrabold text-slate-900">
                                        NPR {Number(plan?.amount_npr ?? 0).toLocaleString()}
                                        <span className="text-xs text-slate-400 font-normal ml-1">
                                            ({plan?.label})
                                        </span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-400 font-medium">via</p>
                                    <p className="text-sm font-bold text-violet-700">Khalti</p>
                                </div>
                            </div>

                            {/* CTA */}
                            <button
                                onClick={handlePay}
                                disabled={paying || !plan}
                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors"
                            >
                                {paying ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Redirecting to Khalti…
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        Pay NPR {Number(plan?.amount_npr ?? 0).toLocaleString()} with Khalti
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>

                            <p className="text-center text-xs text-slate-400">
                                Secured by Khalti · Cancel anytime
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PremiumUpgrade;