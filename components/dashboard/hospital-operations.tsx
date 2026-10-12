import { BedDouble, ClipboardCheck, Hourglass, Info } from "lucide-react";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import type { OperationsSnapshot } from "@/lib/dashboard/hospital-feed";

const timeFormat = new Intl.DateTimeFormat("en-SA", { timeStyle: "short", dateStyle: "medium", timeZone: "Asia/Riyadh" });

export function HospitalOperations({ snapshot }: { snapshot: OperationsSnapshot }) {
  const { bedOccupancy, edWait, protocolCompliance } = snapshot;
  const peakMinutes = Math.max(edWait.targetMinutes, ...edWait.byHour.map(({ minutes }) => minutes));
  const breaches = edWait.byHour.filter(({ minutes }) => minutes > edWait.targetMinutes).length;
  return (
    <section className="ops-section" aria-labelledby="ops-title">
      <div className="ops-head">
        <div>
          <div className="eyebrow">Governance analytics</div>
          <h2 id="ops-title">Hospital operations</h2>
        </div>
        <span className="badge badge-yellow" title="Not connected to hospital systems">
          <Info size={13} aria-hidden="true" /> Sample data · {timeFormat.format(new Date(snapshot.asOf))}
        </span>
      </div>
      <div className="ops-grid">
        <article className="card ops-card">
          <header className="ops-card-head"><span className="ops-icon ops-icon-teal"><BedDouble size={18} aria-hidden="true" /></span><h3>Bed occupancy</h3></header>
          <div className="ops-occupancy">
            <ProgressRing value={bedOccupancy.occupied} total={bedOccupancy.total} size={96} stroke={9} label="Bed occupancy" tone="teal" />
            <div>
              <div className="ops-figure">{bedOccupancy.occupied}<small> / {bedOccupancy.total} beds</small></div>
              <p className="ops-note">{bedOccupancy.total - bedOccupancy.occupied} beds available</p>
            </div>
          </div>
          <ul className="ops-bars">
            {bedOccupancy.byArea.map(({ area, occupied, total }) => {
              const percent = Math.round((occupied / total) * 100);
              return (
                <li key={area}>
                  <div className="ops-bar-label"><span>{area}</span><span>{percent}%</span></div>
                  <div className="meter"><span className={percent >= 92 ? "meter-alert" : "meter-teal"} style={{ width: `${percent}%` }} /></div>
                </li>
              );
            })}
          </ul>
        </article>

        <article className="card ops-card">
          <header className="ops-card-head"><span className="ops-icon ops-icon-blue"><Hourglass size={18} aria-hidden="true" /></span><h3>ED wait times</h3></header>
          <div className="ops-figure">{edWait.currentMedianMinutes}<small> min median, arrival to decision</small></div>
          <p className="ops-note">Target {edWait.targetMinutes / 60} hours · {breaches ? `${breaches} of ${edWait.byHour.length} periods above target` : "all periods within target"}</p>
          <div className="ops-columns" role="img" aria-label={`ED median wait by hour: ${edWait.byHour.map(({ hour, minutes }) => `${hour}:00 ${minutes} minutes`).join(", ")}`}>
            <span className="ops-target" style={{ bottom: `${(edWait.targetMinutes / peakMinutes) * 100}%` }} aria-hidden="true"><em>Target</em></span>
            {edWait.byHour.map(({ hour, minutes }) => (
              <div className="ops-column" key={hour} aria-hidden="true">
                <span className={minutes > edWait.targetMinutes ? "ops-column-bar ops-column-over" : "ops-column-bar"} style={{ height: `${(minutes / peakMinutes) * 100}%` }} title={`${hour}:00 · ${minutes} min`} />
                <small>{hour}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="card ops-card">
          <header className="ops-card-head"><span className="ops-icon ops-icon-yellow"><ClipboardCheck size={18} aria-hidden="true" /></span><h3>Protocol compliance</h3></header>
          <ul className="ops-bars ops-bars-roomy">
            {protocolCompliance.map(({ protocol, percent, target }) => {
              const met = percent >= target;
              return (
                <li key={protocol}>
                  <div className="ops-bar-label"><span>{protocol}</span><span className={met ? "ops-met" : "ops-missed"}>{percent}%</span></div>
                  <div className="meter meter-with-target">
                    <span className={met ? "meter-teal" : "meter-amber"} style={{ width: `${percent}%` }} />
                    <i style={{ left: `${target}%` }} title={`Target ${target}%`} aria-hidden="true" />
                  </div>
                  <small className="ops-target-note">Target {target}% · {met ? "met" : `${target - percent} points below`}</small>
                </li>
              );
            })}
          </ul>
        </article>
      </div>
    </section>
  );
}
