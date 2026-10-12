"use client";

import { useFormStatus } from "react-dom";
import { CheckCircle2 } from "lucide-react";

export function TopicApproveButton({ title }: { title: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      className="ui-button ui-button-primary topic-approve-button"
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(`Approve "${title}"? This records your clinical sign-off and changes its status from Under review to Approved.`)) event.preventDefault();
      }}
    >
      <CheckCircle2 size={18} aria-hidden="true" />
      {pending ? "Approving…" : "Approve"}
    </button>
  );
}
