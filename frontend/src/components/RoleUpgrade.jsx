import { useState } from "react"
import { ArrowRight, CheckCircle, X, Star, Users } from "lucide-react"
import { ROLES } from "../utils/roleConstants"

// ── RoleCard ──────────────────────────────────────────────────
function RoleCard({ role, onSelect }) {
  const [hovered, setHovered] = useState(false)
  const { Icon, label, tagline, description, perks, accent, accentLight, accentBorder } = role

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(role.key)}
      style={{
        flex: 1,
        minWidth: 280,
        background: hovered ? accentLight : "#ffffff",
        border: `1.5px solid ${hovered ? accent : "#e2e8f0"}`,
        borderRadius: 24,
        padding: "32px 28px",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered
          ? `0 20px 48px ${accent}20, 0 4px 16px rgba(0,0,0,0.06)`
          : "0 2px 12px rgba(0,0,0,0.05)",
      }}
    >
      {/* Decorative bg circle */}
      <div style={{
        position: "absolute", top: -30, right: -30,
        width: 120, height: 120, borderRadius: "50%",
        background: accent + "0D",
        transform: hovered ? "scale(2)" : "scale(1)",
        transition: "transform 0.4s",
        pointerEvents: "none",
      }} />

      {/* Icon badge */}
      <div style={{
        width: 56, height: 56, borderRadius: 18, marginBottom: 20,
        background: hovered ? accent : accentLight,
        border: `1.5px solid ${accentBorder}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.25s",
        position: "relative",
      }}>
        <Icon style={{ width: 26, height: 26, color: hovered ? "#ffffff" : accent }} />
      </div>

      {/* Tagline pill */}
      <span style={{
        fontSize: 10, fontWeight: 800, letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: accent, background: accentLight,
        border: `1px solid ${accentBorder}`,
        borderRadius: 20, padding: "3px 10px",
        display: "inline-block", marginBottom: 10,
      }}>
        {tagline}
      </span>

      <h3 style={{
        fontSize: 20, fontWeight: 800, color: "#0f172a",
        margin: "8px 0", lineHeight: 1.2, position: "relative",
      }}>
        {label}
      </h3>

      <p style={{
        fontSize: 13, color: "#64748b", lineHeight: 1.65,
        marginBottom: 24, position: "relative",
      }}>
        {description}
      </p>

      {/* Perks */}
      <ul style={{
        margin: "0 0 24px", padding: 0, listStyle: "none",
        display: "flex", flexDirection: "column", gap: 10,
        position: "relative",
      }}>
        {perks.map((perk, i) => (
          <li key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle style={{ width: 14, height: 14, color: accent, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>{perk}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        color: accent, fontWeight: 700, fontSize: 13,
        opacity: hovered ? 1 : 0.65,
        transition: "opacity 0.2s",
        position: "relative",
      }}>
        Get started
        <ArrowRight style={{
          width: 14, height: 14,
          transform: hovered ? "translateX(5px)" : "translateX(0)",
          transition: "transform 0.2s",
        }} />
      </div>
    </div>
  )
}

// ── SuccessBanner ─────────────────────────────────────────────
function SuccessBanner({ role, onDismiss }) {
  const isEmployer = role === "employer"
  return (
    <div style={{
      padding: "20px 28px", borderRadius: 20, marginBottom: 32,
      background: isEmployer ? "#eff6ff" : "#f0fdf4",
      border: `1.5px solid ${isEmployer ? "#bfdbfe" : "#bbf7d0"}`,
      display: "flex", alignItems: "center", gap: 16,
    }}>
      <CheckCircle style={{
        width: 28, height: 28, flexShrink: 0,
        color: isEmployer ? "#0369a1" : "#15803d",
      }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
          {isEmployer ? "Employer profile submitted!" : "Trainer profile created!"}
        </div>
        <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
          {isEmployer
            ? "Our team will review your application within 1–2 business days."
            : "You can now create and publish training courses from your trainer dashboard."}
        </div>
      </div>
      <button onClick={onDismiss} style={{
        background: "none", border: "none", cursor: "pointer",
        color: "#94a3b8", padding: 4,
      }}>
        <X style={{ width: 16, height: 16 }} />
      </button>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────
export default function RoleUpgrade({ onSelect, successRole, onDismissSuccess }) {
  return (
    <section
      className="role-section px-6 md:px-12 lg:px-24 py-20"
      style={{ background: "#f8fafc" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 18px", borderRadius: 20,
            background: "#eff6ff", border: "1px solid #bfdbfe",
            fontSize: 11, fontWeight: 800, color: "#0369a1",
            textTransform: "uppercase", letterSpacing: "0.08em",
            marginBottom: 16,
          }}>
            <Users style={{ width: 13, height: 13 }} />
            Expand Your Role
          </div>

          <h2
            className="font-audiowide"
            style={{ fontSize: 36, fontWeight: 800, color: "#0f172a", margin: "0 0 12px", lineHeight: 1.2 }}
          >
            More Than Just a Job Seeker
          </h2>

          <p style={{ fontSize: 15, color: "#64748b", maxWidth: 520, margin: "0 auto", lineHeight: 1.65 }}>
            Your account already gives you access to jobs and AI matching.
            Unlock more by registering as an{" "}
            <strong style={{ color: "#0369a1" }}>Employer</strong> or{" "}
            <strong style={{ color: "#15803d" }}>Trainer</strong> — at no extra cost.
          </p>
        </div>

        {/* Success banner */}
        {successRole && (
          <SuccessBanner role={successRole} onDismiss={onDismissSuccess} />
        )}

        {/* Role cards */}
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {ROLES.map(role => (
            <RoleCard key={role.key} role={role} onSelect={onSelect} />
          ))}
        </div>

        {/* Footer note */}
        <div style={{
          textAlign: "center", marginTop: 32, fontSize: 12, color: "#94a3b8",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          <Star style={{ width: 12, height: 12, color: "#0369a1" }} />
          Your existing job seeker account and applications are always preserved when you add a new role.
        </div>
      </div>
    </section>
  )
}