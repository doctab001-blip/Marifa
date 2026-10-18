"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInAction, signUpAction } from "@/app/(auth)/actions";
import { signInSchema, signUpSchema, type SignInValues, type SignUpValues } from "@/lib/auth/schemas";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { GoogleSignInButton } from "@/components/auth/google-button";

function OAuthDivider() {
  return <div className="auth-or-divider" aria-label="Or continue with email"><span>Or continue with email</span></div>;
}

export function SignInForm() {
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: SignInValues) => {
    form.clearErrors("root.server");
    const formData = new FormData();
    formData.set("email", values.email);
    formData.set("password", values.password);
    const result = await signInAction(formData);
    if (result.error) form.setError("root.server", { type: "server", message: result.error });
  };

  return (
    <div className="auth-form-stack">
      <GoogleSignInButton />
      <OAuthDivider />
      <Form {...form}>
        <form className="auth-fields" noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <FormField control={form.control} name="email" label="Work email" type="email" placeholder="name@hospital.org" autoComplete="email" />
          <FormField control={form.control} name="password" label="Password" type="password" placeholder="Enter your password" autoComplete="current-password" />
          {form.formState.errors.root?.server?.message && <Alert>{form.formState.errors.root.server.message}</Alert>}
          <Button type="submit" variant="primary" className="auth-submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Signing in…" : "Sign in securely"}
          </Button>
        </form>
      </Form>
      <p className="auth-switch">New to Marifa? <Link href="/signup">Create an account</Link></p>
    </div>
  );
}

export function SignUpForm() {
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "" },
  });

  const onSubmit = async (values: SignUpValues) => {
    form.clearErrors("root.server");
    const formData = new FormData();
    formData.set("firstName", values.firstName);
    formData.set("lastName", values.lastName);
    formData.set("email", values.email);
    formData.set("password", values.password);
    const result = await signUpAction(formData);
    if (result.error) form.setError("root.server", { type: "server", message: result.error });
    if (result.message) form.setError("root.success", { type: "success", message: result.message });
  };

  return (
    <div className="auth-form-stack">
      <GoogleSignInButton />
      <OAuthDivider />
      <Form {...form}>
        <form className="auth-fields" noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <div className="auth-name-row">
            <FormField control={form.control} name="firstName" label="First name" autoComplete="given-name" />
            <FormField control={form.control} name="lastName" label="Last name" autoComplete="family-name" />
          </div>
          <FormField control={form.control} name="email" label="Work email" type="email" placeholder="name@hospital.org" autoComplete="email" />
          <FormField control={form.control} name="password" label="Create password" type="password" placeholder="At least 12 characters" autoComplete="new-password" hint="Use uppercase and lowercase letters plus a number." />
          {form.formState.errors.root?.server?.message && <Alert>{form.formState.errors.root.server.message}</Alert>}
          {form.formState.errors.root?.success?.message && <Alert variant="success">{form.formState.errors.root.success.message}</Alert>}
          <Button type="submit" variant="primary" className="auth-submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating account…" : "Create your account"}
          </Button>
        </form>
      </Form>
      <p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p>
    </div>
  );
}
