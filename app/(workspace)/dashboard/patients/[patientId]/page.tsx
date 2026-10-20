import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { closeEncounterAction, setActiveEncounterAction, startEncounterAction } from "../actions";
import { OrderBoard } from "@/components/clinical-orders/order-board";
import { getOrderActor } from "@/lib/clinical-orders/auth";
import { ACTIVE_ENCOUNTER_COOKIE } from "@/lib/clinical-orders/constants";
import { canManageOrders } from "@/lib/clinical-orders/policy";
import { getPatientWorkspace } from "@/lib/clinical-orders/workspace";

export default async function PatientWorkspacePage({ params, searchParams }: { params: Promise<{ patientId: string }>; searchParams: Promise<{ error?: string; done?: string }> }) {
  const [{ patientId }, { error, done }] = await Promise.all([params, searchParams]);
  const actor = await getOrderActor();
  if (!canManageOrders(actor)) {
    return <main className="page co-page"><h1>Patient Orders</h1><p className="co-notice co-notice-danger" role="alert">Your account is not authorised to view or change patient orders.</p></main>;
  }
  const workspace = await getPatientWorkspace(actor, patientId).catch(() => null);
  if (!workspace) notFound();

  const cookieEncounter = (await cookies()).get(ACTIVE_ENCOUNTER_COOKIE)?.value;
  const activeEncounter = workspace.encounters.find((encounter) => encounter.status === "active" && encounter.id === cookieEncounter) ?? null;
  const { patient } = workspace;
  const drafts = workspace.orders.filter((order) => order.status === "draft").length;

  return (
    <main className="page co-page">
      <Link href="/dashboard/patients" className="disease-back-link">← Back to patients</Link>
      <header>
        <p className="scenario-eyebrow">Patient orders</p>
        <h1>{patient.fullName}</h1>
        <p>MRN {patient.mrn}{patient.dateOfBirth ? ` · born ${patient.dateOfBirth}` : ""}{patient.sex && patient.sex !== "unknown" ? ` · ${patient.sex}` : ""}</p>
        <p className="co-banner" role="note">Demonstration data only. Orders here are drafts for clinician review. Nothing is signed, prescribed, sent or scheduled by Marifa.</p>
      </header>
      {error ? <p className="co-notice co-notice-danger" role="alert">{error}</p> : null}
      {done ? <p className="co-notice co-notice-ok" role="status">{done}</p> : null}

      <section className="card" style={{ padding: "1rem" }} aria-label="Encounters">
        <h2 style={{ marginTop: 0 }}>Encounters</h2>
        {activeEncounter ? <p className="co-notice co-notice-info">Active encounter for protocol orders: <strong>{activeEncounter.encounterType}</strong>, started {activeEncounter.startedAt.slice(0, 16).replace("T", " ")} UTC.</p> : <p className="co-notice">No active encounter is selected. Start one or set one active so protocols can be applied.</p>}
        <table className="co-table">
          <thead><tr><th scope="col">Type</th><th scope="col">Started</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {workspace.encounters.map((encounter) => (
              <tr key={encounter.id}>
                <td style={{ textTransform: "capitalize" }}>{encounter.encounterType}</td>
                <td>{encounter.startedAt.slice(0, 16).replace("T", " ")} UTC</td>
                <td>{encounter.status === "active" ? (encounter.id === activeEncounter?.id ? "Active (selected)" : "Active") : "Closed"}</td>
                <td>
                  {encounter.status === "active" ? (
                    <span className="co-inline-form">
                      {encounter.id !== activeEncounter?.id ? <form action={setActiveEncounterAction} className="co-inline-form"><input type="hidden" name="patientId" value={patient.id} /><input type="hidden" name="encounterId" value={encounter.id} /><button className="ui-button" type="submit">Set active</button></form> : null}
                      <form action={closeEncounterAction} className="co-inline-form"><input type="hidden" name="patientId" value={patient.id} /><input type="hidden" name="encounterId" value={encounter.id} /><button className="ui-button" type="submit">Close</button></form>
                    </span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <form action={startEncounterAction} className="co-inline-form" style={{ marginTop: ".8rem" }}>
          <input type="hidden" name="patientId" value={patient.id} />
          <label className="co-field">New encounter<select name="encounterType" defaultValue="emergency"><option value="emergency">Emergency</option><option value="inpatient">Inpatient</option><option value="outpatient">Outpatient</option></select></label>
          <button className="ui-button ui-button-primary" type="submit">Start encounter</button>
        </form>
      </section>

      <section aria-label="Orders">
        <h2>Orders {drafts > 0 ? <span className="pill pill-sm pill-amber">{drafts} draft{drafts === 1 ? "" : "s"} awaiting review</span> : null}</h2>
        <p>Apply a protocol from <Link href="/dashboard/diseases">Disease Management</Link> or <Link href="/dashboard/protocols/published">Local Protocols</Link> to fill these columns with the protocol's draft orders.</p>
        <OrderBoard orders={workspace.orders} patientId={patient.id} activeEncounterId={activeEncounter?.id ?? null} />
      </section>
    </main>
  );
}
