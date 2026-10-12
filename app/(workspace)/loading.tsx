// Shown instantly while a workspace page streams in, so navigation never feels frozen.
export default function WorkspaceLoading() {
  return (
    <main className="page page-loading" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="skeleton" style={{ width: 120, height: 10 }} />
      <div className="skeleton" style={{ width: "min(420px, 70%)", height: 26, marginTop: 12 }} />
      <div className="skeleton" style={{ width: "min(640px, 90%)", height: 12, marginTop: 14 }} />
      <div className="page-loading-grid">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="card page-loading-card" key={index}>
            <div className="skeleton" style={{ width: "40%" }} />
            <div className="skeleton" style={{ width: "85%", height: 14, marginTop: 14 }} />
            <div className="skeleton" style={{ width: "65%", marginTop: 10 }} />
          </div>
        ))}
      </div>
    </main>
  );
}
