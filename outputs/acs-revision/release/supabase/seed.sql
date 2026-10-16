-- This seed intentionally excludes auth users because demo identities are local-only.
insert into public.organizations (id, name, slug) values
  ('10000000-0000-0000-0000-000000000001', 'Nour Medical Centre — Demo', 'nour-demo');

insert into public.organization_settings (organization_id) values
  ('10000000-0000-0000-0000-000000000001');

insert into public.permissions (code, description) values
  ('members.read', 'Read organization membership records'),
  ('guidelines.edit', 'Create and revise clinical guideline versions'),
  ('guidelines.approve', 'Approve clinical guideline versions'),
  ('competencies.read_all', 'Read competency records across the organization'),
  ('audit.read', 'Read organization audit history');

insert into public.roles (code, name) values
  ('org_admin', 'Hospital Organization Administrator'),
  ('governance_lead', 'Clinical Governance Lead'),
  ('guideline_editor', 'Guideline Content Editor'),
  ('guideline_reviewer', 'Clinical Guideline Reviewer'),
  ('guideline_approver', 'Clinical Guideline Approver'),
  ('competency_admin', 'Medical Education or Competency Administrator'),
  ('assessor', 'Supervisor or Assessor'),
  ('consultant', 'Consultant'),
  ('specialist', 'Specialist'),
  ('mbbs_gp', 'MBBS / GP'),
  ('auditor', 'Read-only Auditor');
