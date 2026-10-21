"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";

export type RadarPoint = { chapter: string; score: number };

/** Chapter readiness as a radar. Decorative alongside the accessible list of bars, which carries the same numbers. */
export function ChapterRadar({ data }: { data: RadarPoint[] }) {
  return (
    <div style={{ width: "100%", height: 300 }} aria-hidden="true">
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="var(--mx-line)" />
          <PolarAngleAxis dataKey="chapter" tick={{ fontSize: 11, fill: "var(--mx-muted)" }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--mx-muted)" }} />
          <Radar dataKey="score" name="Readiness" stroke="var(--mx-chart-1)" fill="var(--mx-chart-1)" fillOpacity={0.22} strokeWidth={2} />
          <Tooltip contentStyle={{ background: "var(--mx-card)", border: "1px solid var(--mx-line)", borderRadius: 10, fontSize: 12 }} formatter={(value) => [`${value}%`, "Readiness"]} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
