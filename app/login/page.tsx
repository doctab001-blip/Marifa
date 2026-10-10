import { BookOpenCheck, ShieldCheck } from "lucide-react";
import { SupabaseLoginForm } from "@/components/supabase-login-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  const connected = isSupabaseConfigured();
  return (
    <main className="login-page">
      <section className="login-brand">
        <div className="brand">
          <div className="brand-mark">M</div>
          <div className="brand-copy"><div className="brand-name">Marifa</div><div className="brand-sub" style={{ color: "#bdccec" }}>Clinical knowledge & governance</div></div>
        </div>
        <div className="login-copy">
          <div className="eyebrow" style={{ color: "#92d0f5" }}>Knowledge at the point of care</div>
          <h1>Safer decisions.<br />Stronger governance.</h1>
          <p>A single, source-aware workspace for clinical pathways, staff competencies, policies and hospital quality.</p>
        </div>
        <div className="login-note">Built for Saudi healthcare organizations · English / العربية ready</div>
      </section>
      <section className="login-panel">
        <div className="login-form">
          <div className="eyebrow">Secure demonstration</div>
          <h2>Choose a demo workspace</h2>
          <p>{connected ? "Sign in with an invited hospital account, or use an isolated demonstration workspace." : "Authentication is intentionally isolated for this local build. Select a role to preview permission-aware navigation."}</p>
          {connected && <><SupabaseLoginForm /><div className="auth-divider"><span>or preview demo mode</span></div></>}
          <form action="/api/demo-session" method="post">
            <button className="demo-account" type="submit" name="role" value="clinician">
              <span className="avatar"><BookOpenCheck size={17} /></span>
              <span><strong>Clinician workspace</strong><span>Dr. Tabassum · Specialist · General Medicine</span></span>
            </button>
            <button className="demo-account" type="submit" name="role" value="governance">
              <span className="avatar"><ShieldCheck size={17} /></span>
              <span><strong>Governance workspace</strong><span>Dr Sarah Alqahtani · Clinical Governance Lead</span></span>
            </button>
          </form>
          <div className="login-disclaimer"><strong>Clinical safety.</strong> The hosted environment contains only fictional demonstration records and no patient data. Clinical records are illustrative and not for clinical use.</div>
        </div>
      </section>
    </main>
  );
}
