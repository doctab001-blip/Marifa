"use client";

import { useId, type ReactNode } from "react";
import {
  Controller,
  FormProvider,
  type Control,
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";
import { Input } from "@/components/ui/input";

export function Form<T extends FieldValues>({ children, ...methods }: UseFormReturn<T> & { children: ReactNode }) {
  return <FormProvider {...methods}>{children}</FormProvider>;
}

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  hint,
}: {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  hint?: string;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <Controller control={control} name={name} render={({ field, fieldState }) => (
      <div className="auth-field-group">
        <label className="auth-label" htmlFor={id}>{label}</label>
        <Input
          {...field}
          id={id}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={fieldState.invalid}
          aria-describedby={[fieldState.error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined}
          className={`auth-input${fieldState.invalid ? " has-error" : ""}`}
        />
        {hint && <span className="auth-field-hint" id={hintId}>{hint}</span>}
        {fieldState.error?.message && <span className="auth-field-error" id={errorId}>{fieldState.error.message}</span>}
      </div>
    )} />
  );
}
