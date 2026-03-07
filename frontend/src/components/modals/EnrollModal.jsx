import { useState } from "react";
import {
  X, GraduationCap, CreditCard, Zap, Shield, CheckCircle,
  AlertCircle, ExternalLink, Lock,
} from "lucide-react";
import { enrollInCourse } from "../../api/enrollmentApi";

const EnrollModal = ({ course, jobseekerId, onClose, onSuccess }) => {
  const [step, setStep] = useState("confirm"); // "confirm" | "paying" | "success" | "error"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");

  const isFree = !course.price || parseFloat(course.price) === 0;
  const priceNPR = isFree ? 0 : parseFloat(course.price);
  const platformFee = isFree ? 0 : Math.round(priceNPR * 0.20);
  const trainerReceives = priceNPR - platformFee;

  const handleEnroll = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await enrollInCourse(course.course_id);

      if (isFree) {
        setStep("success");
        setTimeout(() => onSuccess(), 1500);
      } else {
        // Redirect to Khalti
        setPaymentUrl(result.payment_url);
        setStep("paying");
        window.open(result.payment_url, "_blank");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to initiate enrollment.");
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">

        {/* Header */}
        <div className="p-6 pb-4 border-b border-border">
          <button onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "#eff6ff" }}>
              <GraduationCap className="w-5 h-5" style={{ color: "#0369a1" }} />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Enroll in Course</h2>
              <p className="text-xs text-muted-foreground">{course.title}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* ── CONFIRM STEP ───────────────────────────────────────────── */}
          {step === "confirm" && (
            <>
              {/* Course summary */}
              <div className="rounded-xl p-4" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div className="font-semibold text-foreground mb-1">{course.title}</div>
                {course.Trainer?.organization_name && (
                  <div className="text-xs text-muted-foreground mb-2">by {course.Trainer.organization_name}</div>
                )}
                {course.Skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {course.Skills.slice(0, 4).map((s, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "#eff6ff", color: "#0369a1", border: "1px solid #bfdbfe" }}>
                        {s.skill_name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Pricing breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Course price</span>
                  <span className="font-semibold text-foreground">
                    {isFree ? "Free" : `Rs. ${priceNPR.toLocaleString()}`}
                  </span>
                </div>
                {!isFree && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Platform fee (20%)</span>
                      <span className="text-muted-foreground">Rs. {platformFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Trainer receives (80%)</span>
                      <span className="text-muted-foreground">Rs. {trainerReceives.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between font-bold">
                      <span className="text-foreground">You pay</span>
                      <span style={{ color: "#0369a1" }}>Rs. {priceNPR.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Escrow notice for paid courses */}
              {!isFree && (
                <div className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                  <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#15803d" }} />
                  <div className="text-xs" style={{ color: "#166534" }}>
                    <div className="font-bold mb-0.5">Escrow Protection</div>
                    Your payment is held securely until you confirm course completion.
                    Trainer receives funds only after you're satisfied.
                  </div>
                </div>
              )}

              {/* Platform deal notice */}
              <div className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#b45309" }} />
                <div className="text-xs" style={{ color: "#92400e" }}>
                  <div className="font-bold mb-0.5">On-Platform Only</div>
                  All enrollment and communication must happen through this platform.
                  Off-platform deals void your protections and violate our Terms of Service.
                </div>
              </div>

              <button
                onClick={handleEnroll}
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #0369a1, #0ea5e9)", opacity: loading ? 0.7 : 1 }}>
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isFree ? (
                  <><Zap className="w-4 h-4" /> Enroll for Free</>
                ) : (
                  <><CreditCard className="w-4 h-4" /> Pay with Khalti</>
                )}
              </button>
            </>
          )}

          {/* ── PAYING STEP ────────────────────────────────────────────── */}
          {step === "paying" && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                style={{ background: "#eff6ff" }}>
                <CreditCard className="w-8 h-8" style={{ color: "#0369a1" }} />
              </div>
              <div>
                <div className="font-bold text-foreground text-lg">Payment Window Opened</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete your payment in the Khalti tab. Come back here once done.
                </p>
              </div>

              <a href={paymentUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl"
                style={{ background: "#eff6ff", color: "#0369a1" }}>
                <ExternalLink className="w-4 h-4" /> Reopen Payment Page
              </a>

              <p className="text-xs text-muted-foreground">
                After payment, your enrollment will activate automatically within seconds.
              </p>

              <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Close (enrollment will activate in background)
              </button>
            </div>
          )}

          {/* ── SUCCESS STEP ───────────────────────────────────────────── */}
          {step === "success" && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                style={{ background: "#f0fdf4" }}>
                <CheckCircle className="w-8 h-8" style={{ color: "#15803d" }} />
              </div>
              <div>
                <div className="font-bold text-foreground text-lg">Enrolled Successfully!</div>
                <p className="text-sm text-muted-foreground mt-1">
                  You're now enrolled in <span className="font-semibold">{course.title}</span>.
                  Contact your trainer through our messaging system to get started.
                </p>
              </div>
            </div>
          )}

          {/* ── ERROR STEP ─────────────────────────────────────────────── */}
          {step === "error" && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl"
                style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "#dc2626" }} />
                <div>
                  <div className="font-semibold text-sm" style={{ color: "#dc2626" }}>Enrollment Failed</div>
                  <p className="text-sm text-muted-foreground mt-0.5">{error}</p>
                </div>
              </div>
              <button onClick={() => setStep("confirm")}
                className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all"
                style={{ background: "#f1f5f9", color: "#0369a1", border: "1px solid #bfdbfe" }}>
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrollModal;