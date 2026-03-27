const getScoreConfig = (score) => {
  if (score >= 80) return { color: "#10B981", label: "Excellent Match", bg: "#052e16", border: "#166534" };
  if (score >= 60) return { color: "#F59E0B", label: "Good Match", bg: "#451a03", border: "#92400e" };
  return { color: "#EF4444", label: "Low Match", bg: "#450a0a", border: "#7f1d1d" };
};

export default function MatchRing({ score, size = 100 }) {
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const { color, label } = getScoreConfig(score);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth="7" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
        />
        <text
          x={size / 2} y={size / 2}
          textAnchor="middle" dominantBaseline="central"
          fill="white" fontSize={size * 0.21} fontWeight="800"
          fontFamily="'DM Sans', sans-serif"
          style={{ transform: `rotate(90deg)`, transformOrigin: `${size / 2}px ${size / 2}px` }}
        >
          {score}%
        </text>
      </svg>
      <span style={{ fontSize: 12, color, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {label}
      </span>
    </div>
  );
}
