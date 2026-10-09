"use client";

import { useActionState } from "react";
import { LockKeyhole, Mail } from "lucide-react";
import { loginWithSupabase, type LoginState } from "@/app/login/actions";

const initialState: LoginState = {};

export function SupabaseLoginForm() {
  const [state, action, pending] = useActionState(loginWithSupabase, initialState);
  return <form action={action} className="auth-form">
    <label htmlFor="email">Work email</label>
    <div className="auth-field"><Mail size={16} /><input id="email" name="email" type="email" autoComplete="email" required /></div>
    <label htmlFor="password">Password</label>
    <div className="auth-field"><LockKeyhole size={16} /><input id="password" name="password" type="password" autoComplete="current-password" minLength={8} required /></div>
    {state.error && <p className="auth-error" role="alert">{state.error}</p>}
    <button className="button-primary" type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in securely"}</button>
  </form>;
}
