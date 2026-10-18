import type { HTMLAttributes, ReactNode } from "react";

export function Alert({ variant = "error", title, children, ...props }: HTMLAttributes<HTMLDivElement> & { variant?: "error" | "success"; title?: string; children: ReactNode }) {
  return (
    <div {...props} className={`ui-alert ui-alert-${variant}${props.className ? ` ${props.className}` : ""}`} role={variant === "error" ? "alert" : "status"}>
      {title && <strong>{title}</strong>}
      <div>{children}</div>
    </div>
  );
}
