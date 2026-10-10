"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, Eye, X, XCircle } from "lucide-react";
import type { GovernanceItem } from "@/lib/admin/data";
import { Button } from "@/components/ui/button";

type QueueAction = "Review" | "Approve" | "Reject";

export function GovernanceQueue({ items }: { items: GovernanceItem[] }) {
  const [selected, setSelected] = useState<{ action: QueueAction; item: GovernanceItem } | null>(null);
  return (
    <>
      <div className="admin-queue">
        {items.length ? items.map((item) => (
          <article className="card admin-queue-item" key={item.id}>
            <div className="admin-queue-copy"><span className={`admin-queue-status status-${item.status}`}>{item.status === "under_review" ? "Under review" : "Draft"}</span><h3>{item.title}</h3><p>{item.specialty} <span aria-hidden="true">·</span> Added {new Intl.DateTimeFormat("en-SA", { dateStyle: "medium", timeZone: "Asia/Riyadh" }).format(new Date(item.updatedAt))}</p></div>
            <div className="admin-queue-actions">
              <Button onClick={() => setSelected({ action: "Review", item })}><Eye size={15} />Review</Button>
              <Button variant="primary" onClick={() => setSelected({ action: "Approve", item })}><Check size={15} />Approve</Button>
              <Button variant="danger" onClick={() => setSelected({ action: "Reject", item })}><XCircle size={15} />Reject</Button>
            </div>
          </article>
        )) : <div className="card admin-empty admin-queue-empty"><ShieldCheckIcon /><p>No draft or under-review guidelines in this organization’s queue.</p></div>}
      </div>
      <Dialog.Root open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <Dialog.Portal><Dialog.Overlay className="admin-dialog-overlay" /><Dialog.Content className="admin-dialog">
          <div className="admin-dialog-header"><div><Dialog.Title>{selected?.action} guideline</Dialog.Title><Dialog.Description>{selected?.item.title}</Dialog.Description></div><Dialog.Close asChild><button className="dialog-close" aria-label="Close"><X size={18} /></button></Dialog.Close></div>
          <p className="admin-form-note">This {selected?.action.toLowerCase()} action is a preview. No clinical content or approval status has been changed.</p>
          <Dialog.Close asChild><Button>Close</Button></Dialog.Close>
        </Dialog.Content></Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

function ShieldCheckIcon() { return <span className="admin-queue-empty-icon" aria-hidden="true">✓</span>; }
