import { getOrganizationSettings } from "@/lib/admin/data";

export default async function HospitalSettingsPage() {
  const { context, settings } = await getOrganizationSettings();
  return (
    <section className="admin-content">
      <header className="admin-section-heading"><div><p className="eyebrow">Workspace configuration</p><h2>Hospital Settings</h2><p>Settings shown here apply only to {context.organizationName}.</p></div></header>
      <div className="admin-settings-grid">
        <article className="card admin-setting-card"><span className="admin-setting-label">Organization</span><strong>{context.organizationName}</strong><p>Tenant identity used across this workspace.</p></article>
        <article className="card admin-setting-card"><span className="admin-setting-label">Primary color</span><strong><i className="admin-color-swatch" />{settings.primary_color}</strong><p>Primary navigation and action color.</p></article>
        <article className="card admin-setting-card"><span className="admin-setting-label">Language &amp; locale</span><strong>{settings.locale}</strong><p>Workspace display locale.</p></article>
        <article className="card admin-setting-card"><span className="admin-setting-label">Time zone</span><strong>{settings.timezone}</strong><p>Used for governance dates and deadlines.</p></article>
      </div>
      <p className="admin-preview-note">Editing controls will be enabled when the organization settings workflow is connected.</p>
    </section>
  );
}
