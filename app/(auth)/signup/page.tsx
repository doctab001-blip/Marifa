import Link from "next/link";
import { SignUpForm } from "@/components/auth/auth-forms";

export default function SignupPage() {
  return (
    <div className="auth-card-wrap auth-card-signup">
      <div className="auth-card-heading">
        <span className="auth-heading-icon"><span className="auth-plus">+</span></span>
        <p className="auth-eyebrow">Join your care team</p>
        <h2>Create your Marifa account</h2>
        <p className="auth-intro">Use your professional details to request secure access to your organization’s workspace.</p>
      </div>
      <SignUpForm />
      <p className="auth-terms">Account access may require confirmation and organization approval.</p>
      <div className="auth-mobile-signup">Already registered? <Link href="/login">Sign in</Link></div>
    </div>
  );
}
