import { useState } from "react";
import { X, UserCheck, CreditCard, Crown, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { initiateHiringPayment } from "../../api/hiringApi.js";

/**
 * HiringPaymentModal
 * ------------------
 * Props:
 *   applicationId  — the application_id to hire
 *   onClose()      — called when user dismisses the modal
 *   onSuccess()    — called after a payment is successfully initiated
 *                    (redirect to Khalti happens inside the modal)
 *
 * Flow:
 *   1. User clicks "Hire" on a shortlisted candidate
 *   2. Modal shows fee info (NPR 500 free / NPR 350 premium)
 *   3. User confirms → POST /hiring/:id/initiate
 *   4. Redirect to Khalti payment_url
 *   5. Khalti returns to /payment/success?type=hiring&pidx=XXX
 *   6. PaymentSuccess.jsx calls verifyHiringPayment(pidx) to finalize
 */
const HiringFeeModal = ({ applicationId, candidateName, onClose, onSuccess }) => {
  const [step, setStep] = useState("confirm"); // "confirm" | "loading" | "error"
  const [error, setError] = useState("");
  const [feeInfo, setFeeInfo] = useState(null); // { fee_npr, is_premium, payment_url }

  const handleInitiate = async () => {
    setStep("loading");
    setError("");
    try {
      const result = await initiateHiringPayment(applicationId);
      setFeeInfo(result);

      // If payment_url is present, redirect to Khalti
      if (result?.payment_url) {
        onSuccess?.(); // notify parent (e.g. close sidebar)
        window.location.href = result.payment_url;
        return;
      }

      // Should not happen with current backend, but handle gracefully
      setError("No payment URL returned. Please try again.");
      setStep("error");
    } catch (err) {
      const msg = err?.message || "Failed to initiate payment. Please try again.";
      setError(msg);
      setStep("error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
        style={{ border: "1px solid #e2e8f0" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
              <UserCheck className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-lg leading-tight">Hire Candidate</h2>
              {candidateName && (
                <p className="text-xs text-slate-500 mt-0.5">{candidateName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div style={{ borderTop: "1px solid #f1f5f9" }} />

        {/* Content */}
        <div className="px-6 py-5 space-y-4">

          {step === "confirm" && (
            <>
              <p className="text-sm text-slate-600">
                A hiring fee is charged when you officially hire a candidate through the platform.
                You will be redirected to <strong>Khalti</strong> to complete the payment.
              </p>

              {/* Fee breakdown */}
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
                <div className="px-4 py-3 flex items-center justify-between"
                  style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    Free Tier Rate
                  </div>
                  <span className="font-bold text-slate-800">NPR 500</span>
                </div>
                <div className="px-4 py-3 flex items-center justify-between"
                  style={{ background: "#fffbeb" }}>
                  <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                    <Crown className="w-4 h-4 text-amber-500" />
                    Premium Rate
                  </div>
                  <span className="font-bold text-amber-700">NPR 350</span>
                </div>
              </div>

              <p className="text-xs text-slate-400">
                After payment is verified, the candidate's status will be updated to <strong>Hired</strong> automatically.
              </p>
            </>
          )}

          {step === "loading" && (
            <div className="flex flex-col items-center gap-4 py-6">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              <div className="text-center">
                <p className="font-semibold text-slate-800">Initiating payment…</p>
                <p className="text-xs text-slate-400 mt-1">You'll be redirected to Khalti shortly.</p>
              </div>
            </div>
          )}

          {step === "error" && (
            <div className="rounded-xl px-4 py-3 flex items-start gap-3"
              style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {step !== "loading" && (
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={step === "error" ? handleInitiate : handleInitiate}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-colors"
              style={{ background: "#0369a1" }}
              onMouseEnter={e => e.currentTarget.style.background = "#0284c7"}
              onMouseLeave={e => e.currentTarget.style.background = "#0369a1"}
            >
              <ExternalLink className="w-4 h-4" />
              {step === "error" ? "Retry Payment" : "Pay via Khalti"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default HiringFeeModal;