import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "quiet" | "danger" };

export function Button({ variant = "secondary", className = "", ...props }: ButtonProps) {
  return <button className={`ui-button ui-button-${variant}${className ? ` ${className}` : ""}`} {...props} />;
}
