import Link from "next/link";
import { LockKeyhole, ShieldCheck } from "@/components/icons-3d";
import { SignInForm } from "@/components/auth/auth-forms";
import { Alert } from "@/components/ui/alert";

const authErrors: Record<string, string> = {
  oauth: "Google sign-in could not be completed. Please try again or sign in with your email.",
  auth_config: "Authentication is not fully configured for this site. Contact your administrator.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="auth-card-wrap">
      <div className="auth-card-heading">
        <span className="auth-heading-icon"><LockKeyhole size={18} /></span>
        <p className="auth-eyebrow">Welcome back</p>
        <h2>Sign in to Marifa</h2>
        <p className="auth-intro">Access your organization’s clinical knowledge and governance workspace.</p>
      </div>
      {error && authErrors[error] && <Alert>{authErrors[error]}</Alert>}
      <SignInForm />
      <div className="auth-trust-note"><ShieldCheck size={16} /><span>Your session is encrypted and protected by your organization’s access policies.</span></div>
      <p className="auth-terms">By continuing, you agree to your organization’s security and acceptable-use policies.</p>
      <div className="auth-mobile-signup">Need a Marifa account? <Link href="/signup">Sign up</Link></div>
    </div>
  );
}
