import Link from "next/link";
import { createPatientAction } from "./actions";
import { getOrderActor } from "@/lib/clinical-orders/auth";
import { canManageOrders } from "@/lib/clinical-orders/policy";
import { listPatients } from "@/lib/clinical-orders/workspace";

export const metadata = { title: "Patient Orders — Marifa" };

export default async function PatientsPage({ searchParams }: { searchParams: Promise<{ error?: string; done?: string }> }) {
  const { error, done } = await searchParams;
  const actor = await getOrderActor();
  if (!canManageOrders(actor)) {
    return (
      <main className="page co-page">
        <h1>Patient Orders</h1>
        <p className="co-notice co-notice-danger" role="alert">Your account is not authorised to view or create patient orders. Ask an administrator to assign you a clinical role (consultant, specialist or MBBS / GP).</p>
      </main>
    );
  }
  let patients: Awaited<ReturnType<typeof listPatients>> = [];
  let loadError: string | null = null;
  try { patients = await listPatients(actor); } catch { loadError = "Patients could not be loaded. Has the patient-orders migration been applied to this database?"; }

  return (
    <main className="page co-page">
      <header>
        <p className="scenario-eyebrow">Orders workspace</p>
        <h1>Patient Orders</h1>
        <p className="co-banner" role="note">Demonstration data only. Marifa is not yet approved for real patient data, so create fictional patients here to try the protocol-to-orders workflow.</p>
      </header>
      {error ? <p className="co-notice co-notice-danger" role="alert">{error}</p> : null}
      {done ? <p className="co-notice co-notice-ok" role="status">{done}</p> : null}
      {loadError ? <p className="co-notice co-notice-danger" role="alert">{loadError}</p> : null}

      <section className="card" style={{ padding: "1rem" }} aria-label="Create a demonstration patient">
        <h2 style={{ marginTop: 0 }}>Create a demonstration patient</h2>
        <form action={createPatientAction} className="co-form-grid">
          <label className="co-field">Record number (MRN)<input name="mrn" required maxLength={40} /></label>
          <label className="co-field">Name (fictional)<input name="fullName" required maxLength={160} /></label>
          <label className="co-field">Date of birth<input name="dateOfBirth" type="date" /></label>
          <label className="co-field">Sex<select name="sex" defaultValue="unknown"><option value="unknown">Unknown</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option></select></label>
          <div><button className="ui-button ui-button-primary" type="submit">Create patient</button></div>
        </form>
      </section>

      <section className="card" style={{ padding: "1rem" }} aria-label="Patients">
        <h2 style={{ marginTop: 0 }}>Patients</h2>
        {patients.length === 0 ? <p className="co-empty">No patients yet.</p> : (
          <table className="co-table">
            <thead><tr><th scope="col">Name</th><th scope="col">MRN</th><th scope="col">Date of birth</th><th scope="col">Active encounters</th><th scope="col"><span className="sr-only">Open</span></th></tr></thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td><strong>{patient.fullName}</strong></td><td>{patient.mrn}</td><td>{patient.dateOfBirth ?? "—"}</td><td>{patient.activeEncounters}</td>
                  <td><Link className="ui-button" href={`/dashboard/patients/${patient.id}`}>Open orders</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
