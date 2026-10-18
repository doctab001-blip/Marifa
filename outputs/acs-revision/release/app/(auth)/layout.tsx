import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-layout">
      <aside className="auth-brand-panel">
        <div className="auth-brand-pattern" aria-hidden="true">
          <svg viewBox="0 0 740 780" fill="none">
            <circle cx="510" cy="388" r="257" stroke="white" strokeOpacity=".09" />
            <circle cx="510" cy="388" r="190" stroke="white" strokeOpacity=".12" />
            <circle cx="510" cy="388" r="118" stroke="white" strokeOpacity=".13" />
            <path d="M165 414h128l48-111 87 220 53-130h94" stroke="white" strokeOpacity=".32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M498 115v42m-21-21h42M638 590v34m-17-17h34M248 196v28m-14-14h28" stroke="white" strokeOpacity=".2" strokeWidth="2" strokeLinecap="round" />
            <circle cx="165" cy="414" r="5" fill="#8ED8F6" />
            <circle cx="575" cy="393" r="5" fill="#8ED8F6" />
          </svg>
        </div>
        <Link className="auth-brand" href="/login" aria-label="Marifa home">
          <span className="auth-brand-mark">M</span>
          <span><strong>Marifa</strong><small>Clinical knowledge &amp; governance</small></span>
        </Link>
        <div className="auth-brand-message">
          <span className="auth-kicker">Healthcare knowledge, connected</span>
          <h1>Clinical Knowledge.<br />Safer Decisions.<br />Better Governance.</h1>
          <p>A trusted workspace for the teams who make care safer every day.</p>
        </div>
        <div className="auth-brand-footer"><span className="auth-footer-line" />Built for Saudi healthcare organizations</div>
      </aside>
      <section className="auth-panel">
        <div className="auth-mobile-brand"><span className="auth-brand-mark">M</span><strong>Marifa</strong></div>
        {children}
        <footer className="auth-panel-footer"><span>Secure access for healthcare teams</span><span>English · العربية</span></footer>
      </section>
    </main>
  );
}
