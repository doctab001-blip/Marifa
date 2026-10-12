type ProgressRingProps = {
  value: number;
  total: number;
  size?: number;
  stroke?: number;
  label: string;
  tone?: "teal" | "blue" | "amber" | "magenta";
  centre?: React.ReactNode;
};

// A server-rendered SVG ring; no client JavaScript needed.
export function ProgressRing({ value, total, size = 72, stroke = 7, label, tone = "teal", centre }: ProgressRingProps) {
  const fraction = total > 0 ? Math.min(Math.max(value / total, 0), 1) : 0;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.round(fraction * 100);
  return (
    <div className={`progress-ring progress-ring-${tone}`} style={{ width: size, height: size }} role="img" aria-label={`${label}: ${percent}%`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle className="progress-ring-track" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} fill="none" />
        <circle
          className="progress-ring-value"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="progress-ring-centre">{centre ?? `${percent}%`}</span>
    </div>
  );
}
