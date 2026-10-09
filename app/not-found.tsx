import Link from "next/link";

export default function NotFound() {
  return <main className="login-panel" style={{ minHeight: "100vh" }}><div className="login-form"><div className="eyebrow">404</div><h2>Clinical record not found</h2><p>The requested page does not exist or is not available to this workspace.</p><Link className="button-primary" href="/dashboard">Return to dashboard</Link></div></main>;
}
