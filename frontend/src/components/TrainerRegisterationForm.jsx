import { useState } from "react"
import { GraduationCap, CheckCircle, Loader2, AlertCircle, X } from "lucide-react"
import { createTrainerProfile } from "../api/trainerApi.js"
import { inputStyle } from "../utils/roleConstants"

function FLabel({ label, required, children }) {
  return (
    <div>
      <div style={{
        fontSize: 11, fontWeight: 700, color: "#475569",
        textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7,
      }}>
        {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
      </div>
      {children}
    </div>
  )
}

const TrainerRegisterationForm = ({ onClose, onSuccess }) => {
  const [submitting, setSub] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ organization_name: "", contact_info: "" })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const valid = form.organization_name.trim() && form.contact_info.trim()

  const handleSubmit = async () => {
    setSub(true); setError("")
    try {
      await createTrainerProfile(form)
      onSuccess?.()
    } catch (err) {
      setError(err?.message || "Registration failed. Please try again.")
    } finally { setSub(false) }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(15,23,42,0.5)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#ffffff", borderRadius: 24,
          width: "100%", maxWidth: 480,
          boxShadow: "0 32px 80px rgba(21,128,61,0.15)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "22px 26px 18px",
          borderBottom: "1px solid #e2e8f0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, background: "#15803d",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <GraduationCap style={{ width: 20, height: 20, color: "#ffffff" }} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>Register as Trainer</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>Fill in your trainer details</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8,
            border: "1px solid #e2e8f0", background: "#f8fafc",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <X style={{ width: 15, height: 15, color: "#64748b" }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 26px", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{
            padding: "12px 16px", borderRadius: 12,
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            fontSize: 12, color: "#166534", lineHeight: 1.5,
          }}>
            🎓 As a trainer, you can publish skill-based courses and help job seekers improve their employability.
          </div>

          <FLabel label="Organization / Institution Name" required>
            <input
              style={inputStyle}
              placeholder="e.g. Nepal Skills Academy"
              value={form.organization_name}
              onChange={e => set("organization_name", e.target.value)}
            />
          </FLabel>

          <FLabel label="Contact Information" required>
            <textarea
              style={{ ...inputStyle, resize: "vertical" }}
              rows={3}
              placeholder="Phone, email, website, LinkedIn…"
              value={form.contact_info}
              onChange={e => set("contact_info", e.target.value)}
            />
            <span style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "block" }}>
              This helps learners and admins reach you
            </span>
          </FLabel>

          {error && (
            <div style={{
              padding: "10px 14px", borderRadius: 10,
              background: "#fef2f2", border: "1px solid #fecaca",
              fontSize: 12, color: "#dc2626",
              display: "flex", gap: 6, alignItems: "center",
            }}>
              <AlertCircle style={{ width: 13, height: 13, flexShrink: 0 }} /> {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: "11px", borderRadius: 12,
              border: "1.5px solid #e2e8f0", background: "#ffffff",
              color: "#64748b", fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}>
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!valid || submitting}
              style={{
                flex: 2, padding: "11px", borderRadius: 12, border: "none",
                cursor: valid && !submitting ? "pointer" : "not-allowed",
                background: valid ? "#15803d" : "#e2e8f0",
                color: valid ? "#ffffff" : "#94a3b8",
                fontWeight: 700, fontSize: 13,
                opacity: submitting ? 0.7 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {submitting
                ? <><Loader2 style={{ width: 14, height: 14 }} /> Registering…</>
                : <><CheckCircle style={{ width: 14, height: 14 }} /> Register as Trainer</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrainerRegisterationForm;