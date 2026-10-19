"use client";

import { useFormStatus } from "react-dom";
import { CheckCircle2 } from "@/components/icons-3d";

export function TopicApproveButton({ title }: { title: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      className="ui-button ui-button-primary topic-approve-button"
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(`Approve "${title}"? This records your clinical sign-off and moves it to the Approved list.`)) event.preventDefault();
      }}
    >
      <CheckCircle2 size={18} aria-hidden="true" />
      {pending ? "Approving…" : "Approve"}
    </button>
  );
}
