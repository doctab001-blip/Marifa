"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";

export type RadarPoint = { chapter: string; score: number };

/** Chapter readiness as a radar. Decorative alongside the accessible list of bars, which carries the same numbers. */
export function ChapterRadar({ data }: { data: RadarPoint[] }) {
  return (
    <div style={{ width: "100%", height: 300 }} aria-hidden="true">
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid />
          <PolarAngleAxis dataKey="chapter" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
          <Radar dataKey="score" stroke="#0e7490" fill="#0e7490" fillOpacity={0.3} />
          <Tooltip formatter={(value) => [`${value}%`, "Readiness"]} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
