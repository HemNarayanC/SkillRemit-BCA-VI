import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle, XCircle, Loader2, Crown, ArrowRight,
  RefreshCw, Home, BookOpen, ShieldCheck, GraduationCap,
  AlertTriangle,
} from "lucide-react";
import { verifyPremiumPayment } from "../api/premiumApi.js";
import { verifyEnrollmentPayment } from "../api/enrollmentApi.js";
import { DASHBOARD_ROUTE } from "../constant/routes.js";

/**
 * PaymentSuccess.jsx — Single page for ALL Khalti payment redirects.
 *
 * Flow detection (in priority order):
 *   1. ?type=enrollment  — explicitly set by enrollCourse controller return_url
 *   2. ?type=premium     — explicitly set by premium controller return_url
 *   3. purchase_order_id starts with "COURSE-"  → enrollment  (fallback auto-detect)
 *   4. purchase_order_id starts with "PREM-"    → premium     (fallback auto-detect)
 *   5. Default → premium (backward compat)
 *
 * FIX: The enrollment controller's return_url MUST include ?type=enrollment.
 * See enrollment_controller_fix.js for the one-line backend fix.
 */
const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [state, setState] = useState("verifying");
  const [detail, setDetail] = useState(null);
  const [errMsg, setErrMsg] = useState("");
  const [khaltiMeta, setKhaltiMeta] = useState({});
  const [flowType, setFlowType] = useState("premium");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pidx = params.get("pidx");
    const khaltiStatus = params.get("status");
    const purchase_order_id = params.get("purchase_order_id") || "";
    const amount = params.get("amount");
    const mobile = params.get("mobile");
    const typeParam = params.get("type");

    // ── Detect flow type ────────────────────────────────────────────────────
    // Priority: explicit ?type= param first, then auto-detect from order ID
    let type = typeParam;
    if (!type) {
      if (purchase_order_id.startsWith("COURSE-")) type = "enrollment";
      else if (purchase_order_id.startsWith("PREM-")) type = "premium";
      else type = "premium"; // safe fallback
    }

    setFlowType(type);
    setKhaltiMeta({ purchase_order_id, amount, mobile });

    // ── Missing pidx ────────────────────────────────────────────────────────
    if (!pidx) {
      setErrMsg("No payment reference (pidx) found in the URL.");
      setState("failed");
      return;
    }

    // ── Khalti reported non-Completed status ────────────────────────────────
    if (khaltiStatus && khaltiStatus !== "Completed") {
      setErrMsg(
        khaltiStatus === "User canceled"
          ? "You cancelled the payment. No charges were made."
          : `Payment not completed (Khalti status: ${khaltiStatus}).`
      );
      setState("failed");
      return;
    }

    // ── Call the correct verify endpoint ────────────────────────────────────
    const verifyFn = type === "enrollment" ? verifyEnrollmentPayment : verifyPremiumPayment;

    verifyFn(pidx)
      .then((data) => {
        setDetail(data);
        setState("success");
      })
      .catch((err) => {
        // Give a helpful message based on flow type
        const raw = err?.message || "";
        let friendly = raw || "Verification failed. Please contact support.";

        if (type === "enrollment") {
          if (raw.includes("Transaction not found") || raw.includes("not found"))
            friendly = "Enrollment transaction not found. This may happen if you refreshed the page after payment. Check 'My Courses' — your enrollment may already be active.";
          else if (raw.includes("not completed") || raw.includes("Initiated"))
            friendly = "Payment was not completed with Khalti. If you were charged, please contact support with your transaction ID.";
        } else {
          if (raw.includes("No PremiumTransaction"))
            friendly = "Premium transaction record not found. If you were charged, please contact support with your transaction ID.";
        }

        setErrMsg(friendly);
        setState("failed");
      });
  }, []);

  const fmtDate = (iso) => iso ? new Date(iso).toLocaleString("en-NP", { dateStyle: "medium", timeStyle: "short" }) : "Just now";
  const fmtPlan = (k) => k ? k.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "—";
  const fmtAmount = (p) => p ? `NPR ${(Number(p) / 100).toLocaleString()}` : "—";
  const isEnroll = flowType === "enrollment";

  const successRows = isEnroll
    ? [
      ["Course", detail?.course_title || "—"],
      ["Amount", fmtAmount(khaltiMeta?.amount)],
      ["Enrolled", fmtDate(detail?.paid_at)],
      ["Order ID", khaltiMeta?.purchase_order_id || "—"],
      ["Escrow", "Held until both parties confirm completion"],
    ]
    : [
      ["Plan", fmtPlan(detail?.plan)],
      ["Role", detail?.role === "employer" ? "Employer" : "Job Seeker"],
      ["Amount", fmtAmount(khaltiMeta?.amount)],
      ["Reference", `#${detail?.transaction_id ?? "—"}`],
      ["Activated", fmtDate(detail?.paid_at)],
    ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">

      {/* ── VERIFYING ─────────────────────────────────────────────────────── */}
      {state === "verifying" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm w-full max-w-md p-10 flex flex-col items-center text-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-800 mb-1">Verifying your payment</h2>
            <p className="text-sm text-slate-500">
              {isEnroll ? "Activating your course enrollment…" : "Activating your Premium account…"}
            </p>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-slate-300 inline-block"
                style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
        </div>
      )}

      {/* ── SUCCESS ───────────────────────────────────────────────────────── */}
      {state === "success" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm w-full max-w-md overflow-hidden">
          <div className="h-1.5 bg-emerald-500 w-full" />
          <div className="p-8 flex flex-col items-center text-center">

            {/* Icon stack */}
            <div className="relative mb-5">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border
                ${isEnroll ? "bg-indigo-50 border-indigo-200" : "bg-amber-50 border-amber-200"}`}>
                {isEnroll
                  ? <BookOpen className="w-8 h-8 text-indigo-500" />
                  : <Crown className="w-8 h-8 text-amber-600" />}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
            </div>

            <h2 className="text-xl font-extrabold text-slate-800 mb-1">Payment Successful!</h2>
            <p className="text-sm text-slate-500 mb-5">
              {isEnroll
                ? "You're enrolled! Your payment is held in escrow until course completion."
                : "Your Premium account is now active. Enjoy unlimited AI access."}
            </p>

            {/* Escrow notice — enrollment only */}
            {isEnroll && (
              <div className="w-full bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4 flex items-start gap-3 text-left">
                <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-blue-700">🔒 Escrow Protection Active</p>
                  <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
                    Your payment is held securely. It releases to the trainer only after{" "}
                    <strong>both you and the trainer confirm</strong> course completion.
                    Go to <strong>My Courses</strong> to track your progress.
                  </p>
                </div>
              </div>
            )}

            {/* Transaction details */}
            <div className="w-full rounded-xl bg-slate-50 border border-slate-200 divide-y divide-slate-100 mb-6 text-left">
              {successRows.map(([label, value]) => (
                <div key={label} className="flex justify-between items-start px-4 py-2.5 gap-3">
                  <span className="text-xs text-slate-400 font-medium flex-shrink-0">{label}</span>
                  <span className="text-xs font-bold text-slate-800 text-right">{value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate(DASHBOARD_ROUTE)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-colors"
            >
              {isEnroll ? <GraduationCap className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              {isEnroll ? "Go to My Courses" : "Go to Dashboard"}
            </button>
          </div>
        </div>
      )}

      {/* ── FAILED ────────────────────────────────────────────────────────── */}
      {state === "failed" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm w-full max-w-md overflow-hidden">
          <div className="h-1.5 bg-red-500 w-full" />
          <div className="p-8 flex flex-col items-center text-center">

            <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-5">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>

            <h2 className="text-xl font-extrabold text-slate-800 mb-1">Verification Failed</h2>
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">{errMsg}</p>

            {/* Debug info — shows order ID so user can reference it */}
            {khaltiMeta?.purchase_order_id && (
              <div className="w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 flex items-start gap-2.5 text-left">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-700">Reference for Support</p>
                  <p className="text-xs text-amber-600 mt-0.5 font-mono break-all">
                    {khaltiMeta.purchase_order_id}
                  </p>
                </div>
              </div>
            )}

            <div className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 mb-6 text-left">
              <p className="text-xs text-slate-500 leading-5">
                Your account has{" "}
                <strong className="text-slate-700">not been charged</strong> unless Khalti
                showed a success screen. If you were charged, contact support with the
                reference ID above.
              </p>
            </div>

            {/* If it looks like enrollment but maybe already verified, offer a shortcut */}
            {flowType === "enrollment" && (
              <div className="w-full bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4 text-left">
                <p className="text-xs text-blue-700 font-semibold mb-0.5">Already enrolled?</p>
                <p className="text-xs text-blue-600 leading-relaxed">
                  If you see this after refreshing the success page, your enrollment may already be active.
                  Check <strong>My Courses</strong> in your dashboard before retrying.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={() => navigate(DASHBOARD_ROUTE)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-colors"
              >
                <GraduationCap className="w-4 h-4" />
                {flowType === "enrollment" ? "Check My Courses" : "Go to Dashboard"}
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold transition-colors"
              >
                <Home className="w-4 h-4" /> Back to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;