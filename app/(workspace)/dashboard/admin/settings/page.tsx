import { Check, Palette, UserRound } from "@/components/icons-3d";
import { getAdminSettings } from "@/lib/admin/data";
import { saveAdminSettings } from "./actions";

const themes = [
  { value: "#0e7490", label: "Aqua Blue" },
  { value: "#1f3c88", label: "Classic blue" },
  { value: "#166534", label: "Forest" },
  { value: "#7c3aed", label: "Violet" },
  { value: "#be123c", label: "Rose" },
] as const;

export default async function HospitalSettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const [{ context, profile, settings }, query] = await Promise.all([getAdminSettings(), searchParams]);
  return (
    <section className="admin-content">
      <header className="admin-section-heading"><div><p className="eyebrow">Workspace configuration</p><h2>Profile &amp; appearance</h2><p>Update your administrator profile and the shared look and locale for {context.organizationName}.</p></div></header>
      {query.saved && <p className="settings-feedback settings-feedback-success" role="status"><Check size={16} /> Your changes have been saved.</p>}
      {query.error && <p className="settings-feedback settings-feedback-error" role="alert">{query.error === "invalid" ? "Check the name and choose valid options before saving." : query.error === "temporary_mode" ? "Profile settings are paused while temporary no-login administration is active." : "We couldn’t save these changes. Please try again."}</p>}
      <form action={saveAdminSettings} className="admin-settings-form" id="profile">
        <div className="admin-settings-grid">
          <article className="card admin-setting-card admin-edit-card">
            <div className="settings-card-heading"><span className="admin-section-icon"><UserRound size={19} strokeWidth={1.5} /></span><div><h3>My profile</h3><p>These details appear in your Marifa workspace.</p></div></div>
            <label className="settings-field">Display name<input name="display_name" defaultValue={profile.displayName} autoComplete="name" minLength={2} maxLength={80} required /></label>
            <label className="settings-field">Professional designation
              <select name="professional_level" defaultValue={profile.professionalLevel}>
                <option value="mbbs_gp">MBBS / GP</option>
                <option value="specialist">Specialist</option>
                <option value="consultant">Consultant</option>
              </select>
            </label>
            <p className="settings-help">Your platform or hospital administrator role is managed separately and cannot be changed here.</p>
          </article>

          <article className="card admin-setting-card admin-edit-card">
            <div className="settings-card-heading"><span className="admin-section-icon"><Palette size={19} strokeWidth={1.5} /></span><div><h3>Workspace appearance</h3><p>Choose the accent color shared by {context.organizationName}.</p></div></div>
            <fieldset className="theme-options">
              <legend>Color theme</legend>
              {themes.map((theme) => (
                <label className="theme-choice" key={theme.value}>
                  <input type="radio" name="primary_color" value={theme.value} defaultChecked={settings.primary_color.toLowerCase() === theme.value} />
                  <span className="theme-swatch" style={{ backgroundColor: theme.value }} aria-hidden="true" />
                  <span>{theme.label}</span>
                </label>
              ))}
            </fieldset>
            <div className="settings-inline-fields">
              <label className="settings-field">Language
                <select name="locale" defaultValue={settings.locale}>
                  <option value="en-SA">English</option>
                  <option value="ar-SA">العربية</option>
                </select>
              </label>
              <label className="settings-field">Time zone
                <select name="timezone" defaultValue={settings.timezone}>
                  <option value="Asia/Riyadh">Riyadh (UTC+03:00)</option>
                  <option value="UTC">UTC</option>
                </select>
              </label>
            </div>
          </article>
        </div>
        <div className="settings-save-row"><span>Changes are limited to your own profile and this organization’s appearance.</span><button className="button-primary" type="submit">Save changes</button></div>
      </form>
    </section>
  );
}
