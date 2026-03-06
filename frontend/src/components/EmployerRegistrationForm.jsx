import { useState, useRef } from "react"
import {
  Building2, ChevronLeft, ChevronRight,
  Upload, FileText, CheckCircle, Loader2, AlertCircle, X,
} from "lucide-react"
import { BUSINESS_TYPES, DOC_TYPES, inputStyle } from "../utils/roleConstants"
import { createEmployerProfile } from "../api/employerApi"

// ── Shared label helper ───────────────────────────────────────
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

const STEPS = ["Company Info", "Documents", "Review"]

const EmployerRegistrationForm = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(0)
  const [submitting, setSub] = useState(false)
  const [error, setError] = useState("")
  const [files, setFiles] = useState([])
  const fileRef = useRef(null)

  const [form, setForm] = useState({
    company_name: "", business_type: "",
    registration_number: "", registered_country: "Nepal",
    address: "", document_type: "",
  })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const step0Valid = form.company_name.trim() && form.business_type && form.registered_country
  const step1Valid = form.document_type && files.length > 0
  const canNext = [step0Valid, step1Valid, true][step]

  const addFiles = (e) => setFiles(p => [...p, ...Array.from(e.target.files)].slice(0, 5))
  const dropFiles = (e) => { e.preventDefault(); setFiles(p => [...p, ...Array.from(e.dataTransfer.files)].slice(0, 5)) }
  const removeFile = (i) => setFiles(p => p.filter((_, idx) => idx !== i))

  const handleSubmit = async () => {
    setSub(true); setError("")
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      files.forEach(f => fd.append("document_urls", f))
      await createEmployerProfile(fd)
      onSuccess?.()
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed. Please try again.")
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
          width: "100%", maxWidth: 600,
          maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 32px 80px rgba(3,105,161,0.18)",
        }}
      >
        {/* ── Header ── */}
        <div style={{
          padding: "24px 28px 20px",
          borderBottom: "1px solid #e2e8f0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, background: "#ffffff", zIndex: 10,
          borderRadius: "24px 24px 0 0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, background: "#0369a1",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Building2 style={{ width: 20, height: 20, color: "#ffffff" }} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>Register as Employer</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>Step {step + 1} of {STEPS.length} — {STEPS[step]}</div>
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

        {/* ── Step dots ── */}
        <div style={{ display: "flex", alignItems: "center", padding: "16px 28px" }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: i <= step ? "#0369a1" : "#e2e8f0",
                color: i <= step ? "#ffffff" : "#94a3b8",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 11,
                border: i === step ? "3px solid #bfdbfe" : "none",
              }}>
                {i < step ? <CheckCircle style={{ width: 13, height: 13 }} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, margin: "0 6px", background: i < step ? "#0369a1" : "#e2e8f0" }} />
              )}
            </div>
          ))}
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "0 28px 28px", display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Step 0 – Company Info */}
          {step === 0 && <>
            <FLabel label="Company Name" required>
              <input style={inputStyle} placeholder="e.g. Himalayan Construction Pvt. Ltd."
                value={form.company_name} onChange={e => set("company_name", e.target.value)} />
            </FLabel>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Business Type <span style={{ color: "#dc2626" }}>*</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {BUSINESS_TYPES.map(bt => (
                  <button key={bt.value} onClick={() => set("business_type", bt.value)} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                    border: form.business_type === bt.value ? "2px solid #0369a1" : "1.5px solid #e2e8f0",
                    background: form.business_type === bt.value ? "#eff6ff" : "#f8fafc",
                    transition: "all 0.15s",
                  }}>
                    <span style={{ fontSize: 18 }}>{bt.icon}</span>
                    <span style={{
                      fontSize: 12,
                      fontWeight: form.business_type === bt.value ? 700 : 500,
                      color: form.business_type === bt.value ? "#0369a1" : "#475569",
                    }}>{bt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <FLabel label="Reg. Number">
                <input style={inputStyle} placeholder="e.g. 12345-AB"
                  value={form.registration_number} onChange={e => set("registration_number", e.target.value)} />
              </FLabel>
              <FLabel label="Country" required>
                <input style={inputStyle} placeholder="Nepal"
                  value={form.registered_country} onChange={e => set("registered_country", e.target.value)} />
              </FLabel>
            </div>

            <FLabel label="Business Address">
              <textarea style={{ ...inputStyle, resize: "vertical" }} rows={2}
                placeholder="Street, City, District…"
                value={form.address} onChange={e => set("address", e.target.value)} />
            </FLabel>
          </>}

          {/* Step 1 – Documents */}
          {step === 1 && <>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Document Type <span style={{ color: "#dc2626" }}>*</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {DOC_TYPES.map(dt => (
                  <label key={dt.value} onClick={() => set("document_type", dt.value)} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                    border: form.document_type === dt.value ? "2px solid #0369a1" : "1.5px solid #e2e8f0",
                    background: form.document_type === dt.value ? "#eff6ff" : "#f8fafc",
                    transition: "all 0.15s",
                  }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                      border: `2px solid ${form.document_type === dt.value ? "#0369a1" : "#cbd5e1"}`,
                      background: form.document_type === dt.value ? "#0369a1" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {form.document_type === dt.value && (
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff" }} />
                      )}
                    </div>
                    <span style={{
                      fontSize: 13,
                      fontWeight: form.document_type === dt.value ? 600 : 400,
                      color: form.document_type === dt.value ? "#0369a1" : "#475569",
                    }}>{dt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Upload Documents <span style={{ color: "#dc2626" }}>*</span>
              </div>
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={dropFiles}
                style={{
                  padding: "28px 20px", border: "2px dashed #bfdbfe",
                  borderRadius: 14, background: "#f0f9ff",
                  cursor: "pointer", textAlign: "center",
                }}
              >
                <Upload style={{ width: 28, height: 28, color: "#0369a1", margin: "0 auto 8px" }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0369a1" }}>Click or drag & drop</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>PDF, JPG, PNG — up to 5 files</div>
                <input ref={fileRef} type="file" multiple hidden accept=".pdf,.jpg,.jpeg,.png" onChange={addFiles} />
              </div>

              {files.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
                  {files.map((f, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "8px 12px", borderRadius: 10,
                      background: "#f0fdf4", border: "1px solid #bbf7d0",
                    }}>
                      <FileText style={{ width: 13, height: 13, color: "#15803d" }} />
                      <span style={{ flex: 1, fontSize: 12, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {f.name}
                      </span>
                      <button onClick={() => removeFile(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: 0 }}>
                        <X style={{ width: 12, height: 12 }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>}

          {/* Step 2 – Review */}
          {step === 2 && <>
            <div style={{ padding: "16px 18px", borderRadius: 14, background: "#eff6ff", border: "1px solid #bfdbfe" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0369a1", marginBottom: 12 }}>Company Information</div>
              {[
                ["Company Name", form.company_name],
                ["Business Type", BUSINESS_TYPES.find(b => b.value === form.business_type)?.label || "—"],
                ["Reg. Number", form.registration_number || "Not provided"],
                ["Country", form.registered_country],
                ["Address", form.address || "Not provided"],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", gap: 12, padding: "7px 0", borderBottom: "1px solid #bfdbfe" }}>
                  <span style={{ fontSize: 11, color: "#64748b", minWidth: 110, fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: 12, color: "#0f172a", fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{
              padding: "14px 18px", borderRadius: 14,
              background: "#fffbeb", border: "1px solid #fde68a",
              display: "flex", gap: 8,
            }}>
              <AlertCircle style={{ width: 15, height: 15, color: "#b45309", flexShrink: 0, marginTop: 1 }} />
              <p style={{ margin: 0, fontSize: 11, color: "#92400e", lineHeight: 1.5 }}>
                Your employer profile will be reviewed by our team within 1–2 business days. You'll be notified once verified.
              </p>
            </div>
          </>}

          {/* Error */}
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

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, paddingTop: 4 }}>
            <button
              onClick={() => step === 0 ? onClose() : setStep(s => s - 1)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "10px 20px", borderRadius: 12,
                border: "1.5px solid #e2e8f0", background: "#ffffff",
                color: "#64748b", fontWeight: 600, fontSize: 13, cursor: "pointer",
              }}
            >
              <ChevronLeft style={{ width: 14, height: 14 }} />
              {step === 0 ? "Cancel" : "Back"}
            </button>

            {step < 2 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "10px 22px", borderRadius: 12, border: "none",
                  cursor: canNext ? "pointer" : "not-allowed",
                  background: canNext ? "#0369a1" : "#e2e8f0",
                  color: canNext ? "#ffffff" : "#94a3b8",
                  fontWeight: 700, fontSize: 13, transition: "all 0.2s",
                }}
              >
                Continue <ChevronRight style={{ width: 14, height: 14 }} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 24px", borderRadius: 12, border: "none",
                  cursor: submitting ? "not-allowed" : "pointer",
                  background: "#0369a1", color: "#ffffff",
                  fontWeight: 700, fontSize: 13, opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting
                  ? <><Loader2 style={{ width: 14, height: 14 }} /> Submitting…</>
                  : <><CheckCircle style={{ width: 14, height: 14 }} /> Submit</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployerRegistrationForm;