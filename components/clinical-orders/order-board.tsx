import { addManualOrderAction, removeOrderAction, reviewOrderAction, updateOrderAction } from "@/app/(workspace)/dashboard/patients/actions";
import type { WorkspaceOrder } from "@/lib/clinical-orders/workspace";
import { ORDER_SECTIONS, SECTION_LABELS, STATUS_LABELS, type OrderSection, type OrderType } from "@/lib/clinical-orders/types";

/** The patient's order columns. Server component: every control is a form posting to a server action. */

const SECTION_TYPES: Record<OrderSection, OrderType[]> = { investigations: ["laboratory", "imaging", "investigation"], medications: ["medication"], procedures: ["procedure"], monitoring: ["monitoring"] };
const TYPE_LABELS: Record<OrderType, string> = { laboratory: "Laboratory", imaging: "Imaging", investigation: "Other investigation", medication: "Medication", procedure: "Procedure", monitoring: "Monitoring / follow-up" };
const EMPTY: Record<OrderSection, string> = {
  investigations: "No investigation orders yet.",
  medications: "No medication or treatment orders yet.",
  procedures: "No procedure orders yet.",
  monitoring: "No monitoring or follow-up orders yet.",
};
const MEDICATION_FIELDS = ["dose", "route", "frequency", "duration"] as const;

function OrderCard({ order, patientId }: { order: WorkspaceOrder; patientId: string }) {
  const details = Object.entries(order.details).filter(([key, value]) => value && !["linkedSourceKey", "contraindications"].includes(key));
  const editable = order.status === "draft" || order.status === "reviewed";
  return (
    <article className="co-order" data-status={order.status} aria-label={order.orderName}>
      <div>
        <strong>{order.orderName}</strong>
        <div className="co-badges">
          <span className={`pill pill-sm ${order.status === "reviewed" ? "pill-emerald" : "pill-amber"}`}>{STATUS_LABELS[order.status]}</span>
          {order.priority ? <span className="pill pill-sm pill-sky">{order.priority.toUpperCase()}</span> : null}
          {order.incomplete ? <span className="pill pill-sm pill-rose">Incomplete</span> : null}
          {order.isConditional ? <span className="pill pill-sm pill-amber">Conditional{order.conditionConfirmed ? " – confirmed" : ""}</span> : null}
          {order.isManual ? <span className="pill pill-sm pill-violet">Added manually</span> : null}
          {order.isEdited ? <span className="pill pill-sm pill-slate">Edited</span> : null}
        </div>
      </div>
      {order.protocol ? <small>From protocol: <strong>{order.protocol.title}</strong> · version {order.protocol.version}</small> : null}
      {order.indication ? <p className="co-text"><strong>Indication:</strong> {order.indication}</p> : null}
      {details.length > 0 ? <div className="co-params">{details.map(([key, value]) => <span key={key} className="co-param"><b>{key}</b>{value}</span>)}</div> : null}
      {order.instructions ? <p className="co-text">{order.instructions}</p> : null}
      {order.isConditional && order.conditionText ? <div className="co-flag co-flag-warn"><strong>Condition from the protocol</strong><span style={{ whiteSpace: "pre-line" }}>{order.conditionText}</span></div> : null}
      {order.incomplete ? <div className="co-flag co-flag-warn"><strong>Needs the clinician before it can be reviewed</strong><ul>{order.missingFields.map((field) => <li key={field}>{field}</li>)}</ul></div> : null}

      {editable ? (
        <>
          <div className="co-order-actions">
            {order.status === "draft" ? (
              <form action={reviewOrderAction} className="co-inline-form">
                <input type="hidden" name="patientId" value={patientId} />
                <input type="hidden" name="orderId" value={order.id} />
                {order.isConditional && !order.conditionConfirmed ? <label style={{ fontSize: ".82rem" }}><input type="checkbox" name="conditionConfirmed" /> Condition verified</label> : null}
                <button className="ui-button" type="submit" disabled={order.incomplete} title={order.incomplete ? "Complete the missing information first" : "Confirm you have reviewed this order. It is still not signed or sent."}>Mark reviewed</button>
              </form>
            ) : null}
            <form action={removeOrderAction} className="co-inline-form">
              <input type="hidden" name="patientId" value={patientId} />
              <input type="hidden" name="orderId" value={order.id} />
              <button className="ui-button" type="submit" aria-label={`Remove ${order.orderName}`}>Remove</button>
            </form>
          </div>
          <details>
            <summary>Edit</summary>
            <form action={updateOrderAction} className="co-edit">
              <input type="hidden" name="patientId" value={patientId} />
              <input type="hidden" name="orderId" value={order.id} />
              <div className="co-edit-grid">
                <label className="co-field">Order name<input name="orderName" defaultValue={order.orderName} required maxLength={240} /></label>
                <label className="co-field">Priority<select name="priority" defaultValue={order.priority ?? ""}><option value="">Not set</option><option value="routine">Routine</option><option value="urgent">Urgent</option><option value="stat">STAT</option></select></label>
                {order.orderType === "medication" ? MEDICATION_FIELDS.map((field) => (
                  <label className="co-field" key={field} style={{ textTransform: "capitalize" }}>{field}<input name={`param_${field}`} defaultValue={order.details[field] ?? ""} /></label>
                )) : null}
              </div>
              <label className="co-field">Indication<input name="indication" defaultValue={order.indication} maxLength={1000} /></label>
              <label className="co-field">Instructions<textarea name="instructions" rows={3} defaultValue={order.instructions} maxLength={4000} /></label>
              <div><button className="ui-button ui-button-primary" type="submit">Save changes</button> <small>Editing a reviewed order returns it to draft.</small></div>
            </form>
          </details>
        </>
      ) : null}
    </article>
  );
}

export function OrderBoard({ orders, patientId, activeEncounterId }: { orders: WorkspaceOrder[]; patientId: string; activeEncounterId: string | null }) {
  return (
    <section aria-label="Patient orders" className="co-grid-4">
      {ORDER_SECTIONS.map((section) => {
        const sectionOrders = orders.filter((order) => order.section === section);
        return (
          <div key={section} className="co-col" aria-label={SECTION_LABELS[section]}>
            <h3>{SECTION_LABELS[section]} <span className="co-count">{sectionOrders.length}</span></h3>
            {sectionOrders.length === 0 ? <p className="co-empty">{EMPTY[section]}</p> : sectionOrders.map((order) => <OrderCard key={order.id} order={order} patientId={patientId} />)}
            {activeEncounterId ? (
              <details className="co-add">
                <summary>Add a draft order</summary>
                <form action={addManualOrderAction} className="co-edit">
                  <input type="hidden" name="patientId" value={patientId} />
                  <input type="hidden" name="encounterId" value={activeEncounterId} />
                  {SECTION_TYPES[section].length > 1 ? (
                    <label className="co-field">Type<select name="orderType" defaultValue={SECTION_TYPES[section][0]}>{SECTION_TYPES[section].map((type) => <option key={type} value={type}>{TYPE_LABELS[type]}</option>)}</select></label>
                  ) : <input type="hidden" name="orderType" value={SECTION_TYPES[section][0]} />}
                  <label className="co-field">Order name<input name="orderName" required maxLength={240} /></label>
                  {section === "medications" ? <div className="co-edit-grid">{MEDICATION_FIELDS.map((field) => <label className="co-field" key={field} style={{ textTransform: "capitalize" }}>{field}<input name={`param_${field}`} /></label>)}</div> : null}
                  <label className="co-field">Indication<input name="indication" maxLength={1000} /></label>
                  <label className="co-field">Instructions<textarea name="instructions" rows={2} maxLength={4000} /></label>
                  <label style={{ fontSize: ".82rem" }}><input type="checkbox" name="allowDuplicate" /> Allow even if it looks like a duplicate</label>
                  <div><button className="ui-button" type="submit">Add draft</button></div>
                </form>
              </details>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
