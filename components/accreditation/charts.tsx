"use client";

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

/**
 * Charts for the governance hub. Every chart uses the same palette tokens (--mx-chart-*, defined for light and dark in
 * app/theme-v21.css) so a colour means the same thing on every page. Each chart sits next to a table or text that
 * carries the same numbers, so nothing depends on seeing the chart.
 */
export const CHART = {
  primary: "var(--mx-chart-1)",
  blue: "var(--mx-chart-2)",
  gold: "var(--mx-chart-3)",
  emerald: "var(--mx-chart-4)",
  coral: "var(--mx-chart-5)",
  indigo: "var(--mx-chart-6)",
  grid: "var(--mx-line)",
  text: "var(--mx-muted)",
} as const;

const tick = { fontSize: 11, fill: CHART.text };
const tooltipStyle = { background: "var(--mx-card)", border: "1px solid var(--mx-line)", borderRadius: 10, fontSize: 12, color: "var(--mx-ink)" };

export type TrendPoint = { label: string; value: number | null; verified: boolean };

/** Indicator trend with the hospital's target (line, or band for a range). Unverified values are drawn hollow. */
export function TrendChart({ data, unit, target, targetUpper, percent, name }: { data: TrendPoint[]; unit: string; target: number | null; targetUpper?: number | null; percent?: boolean; name: string }) {
  const values = data.map((d) => d.value).filter((v): v is number => v !== null);
  const max = Math.max(...values, target ?? 0, targetUpper ?? 0, 1);
  return (
    <div className="gh-chart" role="img" aria-label={`${name}: trend over ${data.length} reporting periods`}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 12, right: 18, bottom: 4, left: 0 }}>
          <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={{ stroke: CHART.grid }} />
          <YAxis tick={tick} tickLine={false} axisLine={false} width={44} domain={percent ? [0, 100] : [0, Math.ceil(max * 1.15)]} />
          {target !== null && targetUpper !== null && targetUpper !== undefined
            ? <ReferenceArea y1={target} y2={targetUpper} fill={CHART.emerald} fillOpacity={0.08} stroke={CHART.emerald} strokeOpacity={0.4} label={{ value: "Target range", position: "insideTopRight", fontSize: 11, fill: CHART.text }} />
            : target !== null ? <ReferenceLine y={target} stroke={CHART.gold} strokeDasharray="6 4" label={{ value: `Target ${target}${percent ? "%" : ""}`, position: "insideTopRight", fontSize: 11, fill: CHART.text }} /> : null}
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v === null || v === undefined ? "No eligible cases" : `${v}${percent ? "%" : unit ? ` ${unit}` : ""}`, name]} />
          <Line type="monotone" dataKey="value" name={name} stroke={CHART.primary} strokeWidth={2.4} connectNulls={false}
            dot={(props: { cx?: number; cy?: number; payload?: TrendPoint; index?: number }) => {
              const { cx, cy, payload, index } = props;
              if (cx === undefined || cy === undefined || !payload || payload.value === null) return <g key={`d${index}`} />;
              return <circle key={`d${index}`} cx={cx} cy={cy} r={4.5} stroke={CHART.primary} strokeWidth={2} fill={payload.verified ? CHART.primary : "var(--mx-card)"} />;
            }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Sparkline({ values, label }: { values: (number | null)[]; label: string }) {
  const data = values.map((value, i) => ({ i, value }));
  if (values.filter((v) => v !== null).length < 2) return null;
  return (
    <div className="gh-spark" aria-hidden="true" title={label}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 4, right: 2, bottom: 2, left: 2 }}>
          <Area type="monotone" dataKey="value" stroke={CHART.primary} strokeWidth={2} fill={CHART.primary} fillOpacity={0.12} connectNulls={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Per-criterion audit compliance (or any labelled percentages) as horizontal bars. */
export function ComplianceBars({ data, name }: { data: { label: string; pct: number | null }[]; name: string }) {
  const rows = data.map((d) => ({ label: d.label.length > 42 ? `${d.label.slice(0, 40)}…` : d.label, pct: d.pct ?? 0 }));
  return (
    <div style={{ width: "100%", height: Math.max(120, rows.length * 34 + 30) }} role="img" aria-label={name}>
      <ResponsiveContainer>
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 8 }}>
          <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={tick} tickLine={false} axisLine={false} unit="%" />
          <YAxis type="category" dataKey="label" width={170} tick={tick} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Compliant"]} />
          <Bar dataKey="pct" name="Compliant" fill={CHART.emerald} radius={[0, 6, 6, 0]} barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Read-and-sign progress per approved policy (signed vs outstanding). */
export function AcknowledgementChart({ data }: { data: { label: string; signed: number; outstanding: number }[] }) {
  return (
    <div style={{ width: "100%", height: Math.max(140, data.length * 34 + 50) }} role="img" aria-label="Read-and-sign progress by policy">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 18, bottom: 4, left: 8 }}>
          <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={tick} tickLine={false} axisLine={false} allowDecimals={false} />
          <YAxis type="category" dataKey="label" width={170} tick={tick} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="signed" name="Signed" stackId="a" fill={CHART.gold} barSize={16} />
          <Bar dataKey="outstanding" name="Outstanding" stackId="a" fill="var(--mx-line)" barSize={16} radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
