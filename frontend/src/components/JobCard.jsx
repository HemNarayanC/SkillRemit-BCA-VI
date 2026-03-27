import { useState } from "react";
import { BookmarkIcon, MapPinIcon, MoneyIcon, ClockIcon } from "./ui/Icons.jsx";
import { formatSalary, timeAgo, parseSkills } from "../utils/helpers.js";

// Skill chip palette — pulled from the blue/sky/teal family in index.css
const CHIP_PALETTE = [
  { bg: "#eff6ff", color: "#0369a1", border: "#bfdbfe" }, // primary blue
  { bg: "#f0f9ff", color: "#0284c7", border: "#bae6fd" }, // secondary sky
  { bg: "#ecfeff", color: "#0891b2", border: "#a5f3fc" }, // cyan
  { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" }, // green accent
  { bg: "#fdf4ff", color: "#7e22ce", border: "#e9d5ff" }, // violet accent
];

const chip = (i) => CHIP_PALETTE[i % CHIP_PALETTE.length];

// Company avatar gradient — cycles through blue shades
const AVATAR_GRADIENTS = [
  ["#0369a1", "#0ea5e9"],
  ["#0284c7", "#38bdf8"],
  ["#0891b2", "#22d3ee"],
  ["#1d4ed8", "#60a5fa"],
  ["#0369a1", "#818cf8"],
];
const gradient = (id) => AVATAR_GRADIENTS[(id || 0) % AVATAR_GRADIENTS.length];

const JobCard = ({ job, onViewDetails, onApplyNow }) => {
  const [saved, setSaved]   = useState(false);
  const [hovered, setHovered] = useState(false);

  const skills   = parseSkills(job.skills_required);
  const initials = job.Employer?.company_name?.slice(0, 2).toUpperCase() || "CO";
  const [g1, g2] = gradient(job.job_id);

  return (
    <div
      className="font-exo"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#ffffff",
        border: `1.5px solid ${hovered ? "#0369a1" : "#e2e8f0"}`,
        borderRadius: 20,
        padding: "20px 20px 16px",
        cursor: "pointer",
        transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 12px 40px rgba(3,105,161,0.12), 0 2px 8px rgba(3,105,161,0.06)"
          : "0 1px 4px rgba(15,23,42,0.06)",
        position: "relative",
      }}
    >
      {/* Top accent bar */}
      {hovered && (
        <div style={{
          position: "absolute", top: 0, left: 20, right: 20, height: 2,
          background: `linear-gradient(90deg, ${g1}, ${g2})`,
          borderRadius: "0 0 4px 4px",
          transition: "opacity 0.2s",
        }} />
      )}

      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flex: 1, minWidth: 0 }}>
          {/* Avatar */}
          <div style={{
            width: 46, height: 46, borderRadius: 14, flexShrink: 0,
            background: `linear-gradient(135deg, ${g1}, ${g2})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#ffffff", fontWeight: 800, fontSize: 15,
            boxShadow: `0 4px 12px ${g1}33`,
          }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 15, fontWeight: 700, color: "#0f172a",
              lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {job.title}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, fontWeight: 500 }}>
              {job.Employer?.company_name}
            </div>
          </div>
        </div>

        {/* Bookmark */}
        <button
          onClick={(e) => { e.stopPropagation(); setSaved(!saved); }}
          style={{
            background: saved ? "#eff6ff" : "transparent",
            border: `1px solid ${saved ? "#bfdbfe" : "#e2e8f0"}`,
            borderRadius: 10, cursor: "pointer",
            color: saved ? "#0369a1" : "#94a3b8",
            padding: "6px 8px", flexShrink: 0,
            transition: "all 0.2s",
          }}
        >
          <BookmarkIcon filled={saved} />
        </button>
      </div>

      {/* Meta row */}
      <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
        {job.location && (
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748b", fontWeight: 500 }}>
            <MapPinIcon style={{ color: "#0369a1" }} /> {job.location}
          </span>
        )}
        {(job.salary_min || job.salary_max) && (
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748b", fontWeight: 500 }}>
            <MoneyIcon style={{ color: "#0369a1" }} /> {formatSalary(job.salary_min, job.salary_max)}
          </span>
        )}
        {/* Status pill */}
        {job.status && (
          <span style={{
            padding: "2px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700,
            background: job.status === "open" ? "#eff6ff" : "#f1f5f9",
            color: job.status === "open" ? "#0369a1" : "#64748b",
            border: `1px solid ${job.status === "open" ? "#bfdbfe" : "#e2e8f0"}`,
            textTransform: "uppercase", letterSpacing: "0.05em",
          }}>
            {job.status}
          </span>
        )}
      </div>

      {/* Skill chips */}
      {skills.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {skills.slice(0, 3).map((s, i) => {
            const c = chip(i);
            return (
              <span key={i} style={{
                padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: c.bg, color: c.color, border: `1px solid ${c.border}`,
              }}>
                {s}
              </span>
            );
          })}
          {skills.length > 3 && (
            <span style={{
              padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500,
              background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0",
            }}>
              +{skills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Divider */}
      <div style={{ borderTop: "1px solid #f1f5f9", marginBottom: 14 }} />

      {/* Footer row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>
          <ClockIcon /> {timeAgo(job.created_at)}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onViewDetails(job.job_id); }}
            style={{
              padding: "7px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600,
              border: "1.5px solid #0369a1", background: "transparent", color: "#0369a1",
              cursor: "pointer", transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#eff6ff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            View Details
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onApplyNow(job); }}
            style={{
              padding: "7px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700,
              background: "linear-gradient(135deg, #0369a1, #0ea5e9)",
              border: "none", color: "#ffffff", cursor: "pointer",
              boxShadow: "0 2px 8px rgba(3,105,161,0.25)",
              transition: "opacity 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(3,105,161,0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(3,105,161,0.25)";
            }}
          >
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default JobCard;