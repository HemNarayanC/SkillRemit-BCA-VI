import { useState } from "react";
const LOCATIONS = [
  "Kathmandu, Nepal",
  "Pokhara, Nepal",
  "Lalitpur, Nepal",
  "Bhaktapur, Nepal",
  "Hetauda, Nepal",
  "Chitwan, Nepal",
];

const ALL_SKILLS = [
  "Woodworking", "Welding", "Wiring", "Plumbing",
  "Bricklaying", "Painting", "HVAC", "Tile Setting",
  "Blueprint Reading", "Safety Protocols",
];

// Chip palette — same as JobCard for visual consistency
const CHIP_PALETTE = [
  { bg: "#eff6ff", color: "#0369a1", border: "#bfdbfe" },
  { bg: "#f0f9ff", color: "#0284c7", border: "#bae6fd" },
  { bg: "#ecfeff", color: "#0891b2", border: "#a5f3fc" },
  { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  { bg: "#fdf4ff", color: "#7e22ce", border: "#e9d5ff" },
];
const chip = (i) => CHIP_PALETTE[i % CHIP_PALETTE.length];

export default function JobFilters({ filters, onChange, onClear }) {
  const { location, salary_min, salary_max, skills } = filters;
  const [salaryMin, setSalaryMin] = useState(salary_min || 0);
  const [salaryMax, setSalaryMax] = useState(salary_max || 200000);

  const handleLocationToggle = (loc) => {
    onChange({ location: location === loc ? "" : loc });
  };

  const handleSkillToggle = (skill) => {
    const current = skills ? skills.split(",").map(s => s.trim()).filter(Boolean) : [];
    const updated = current.includes(skill) ? current.filter(s => s !== skill) : [...current, skill];
    onChange({ skills: updated.join(", ") });
  };

  const activeSkills = skills ? skills.split(",").map(s => s.trim()).filter(Boolean) : [];

  const handleMinChange = (val) => {
    setSalaryMin(val);
    onChange({ salary_min: val });
  };

  const handleMaxChange = (val) => {
    setSalaryMax(val);
    onChange({ salary_max: val });
  };

  return (
    <div className="font-exo" style={{
      background: "#ffffff",
      border: "1.5px solid #e2e8f0",
      borderRadius: 20,
      padding: "22px 20px",
      position: "sticky",
      top: 24,
      boxShadow: "0 2px 12px rgba(3,105,161,0.06)",
    }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg, #0369a1, #0ea5e9)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </div>
          <span style={{ color: "#0f172a", fontWeight: 700, fontSize: 16 }}>Filters</span>
        </div>
        <button
          onClick={onClear}
          style={{
            background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: 8, color: "#dc2626",
            fontSize: 12, cursor: "pointer", fontWeight: 600,
            padding: "4px 10px",
          }}
        >
          Clear All
        </button>
      </div>

      {/* ── Location ── */}
      <FilterSection title="Location" icon="📍">
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {LOCATIONS.map((loc) => {
            const active = location === loc;
            return (
              <label key={loc} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", borderRadius: 10, cursor: "pointer",
                background: active ? "#eff6ff" : "transparent",
                border: `1px solid ${active ? "#bfdbfe" : "transparent"}`,
                transition: "all 0.15s",
              }}>
                {/* Custom checkbox */}
                <div style={{
                  width: 16, height: 16, borderRadius: 5, flexShrink: 0,
                  border: `2px solid ${active ? "#0369a1" : "#cbd5e1"}`,
                  background: active ? "#0369a1" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s",
                }}>
                  {active && (
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <input type="checkbox" checked={active} onChange={() => handleLocationToggle(loc)}
                  style={{ display: "none" }} />
                <span style={{ color: active ? "#0369a1" : "#475569", fontSize: 13, fontWeight: active ? 600 : 400 }}>
                  {loc}
                </span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      {/* ── Salary Range ── */}
      <FilterSection title="Salary Range" icon="💰">
        {/* Min / Max display */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#94a3b8", fontSize: 10, fontWeight: 700, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Min</div>
            <div style={{
              background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10,
              padding: "8px 12px", color: "#0369a1", fontSize: 12, fontWeight: 700,
            }}>
              Rs. {Number(salaryMin).toLocaleString()}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#94a3b8", fontSize: 10, fontWeight: 700, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Max</div>
            <div style={{
              background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10,
              padding: "8px 12px", color: "#0369a1", fontSize: 12, fontWeight: 700,
            }}>
              Rs. {Number(salaryMax).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Slider track wrapper */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: "#94a3b8" }}>Min salary</span>
            <span style={{ fontSize: 10, color: "#0369a1", fontWeight: 600 }}>
              Rs. {Number(salaryMin).toLocaleString()}
            </span>
          </div>
          <input
            type="range" min="0" max="100000" step="5000"
            value={salaryMin}
            onChange={(e) => handleMinChange(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#0369a1", height: 4 }}
          />
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: "#94a3b8" }}>Max salary</span>
            <span style={{ fontSize: 10, color: "#0369a1", fontWeight: 600 }}>
              Rs. {Number(salaryMax).toLocaleString()}
            </span>
          </div>
          <input
            type="range" min="0" max="200000" step="5000"
            value={salaryMax}
            onChange={(e) => handleMaxChange(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#0369a1", height: 4 }}
          />
        </div>
      </FilterSection>

      {/* ── Skills ── */}
      <FilterSection title="Skills" icon="⚡" last>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {ALL_SKILLS.map((skill, i) => {
            const active = activeSkills.includes(skill);
            const c = chip(i);
            return (
              <span
                key={i}
                onClick={() => handleSkillToggle(skill)}
                style={{
                  padding: "5px 12px", borderRadius: 20, fontSize: 11, cursor: "pointer",
                  fontWeight: 600, transition: "all 0.15s",
                  background: active ? c.bg : "#f8fafc",
                  color: active ? c.color : "#64748b",
                  border: `1px solid ${active ? c.border : "#e2e8f0"}`,
                  boxShadow: active ? `0 2px 6px ${c.border}80` : "none",
                  transform: active ? "scale(1.03)" : "scale(1)",
                }}
              >
                {active && <span style={{ marginRight: 4 }}>✓</span>}
                {skill}
              </span>
            );
          })}
        </div>

        {/* Active filter count */}
        {activeSkills.length > 0 && (
          <div style={{
            marginTop: 12, padding: "6px 12px", borderRadius: 10,
            background: "#eff6ff", border: "1px solid #bfdbfe",
            fontSize: 11, color: "#0369a1", fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span>{activeSkills.length} skill{activeSkills.length > 1 ? "s" : ""} selected</span>
            <button onClick={() => onChange({ skills: "" })}
              style={{ background: "none", border: "none", color: "#0369a1", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
              ✕ Clear
            </button>
          </div>
        )}
      </FilterSection>
    </div>
  );
}

function FilterSection({ title, icon, children, last = false }) {
  return (
    <div style={{ marginBottom: last ? 0 : 24 }}>
      {/* Section label */}
      <div style={{
        display: "flex", alignItems: "center", gap: 7, marginBottom: 12,
      }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{
          color: "#0f172a", fontWeight: 700, fontSize: 12,
          textTransform: "uppercase", letterSpacing: "0.07em",
        }}>
          {title}
        </span>
      </div>

      {/* Subtle divider under label */}
      <div style={{ borderTop: "1px solid #f1f5f9", marginBottom: 12 }} />

      {children}
    </div>
  );
}