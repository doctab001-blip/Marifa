export function isTemporaryOpenAdminMode() {
  return process.env.MARIFA_TEMPORARY_OPEN_ADMIN === "true";
}

export function getTemporaryAdminIdentity() {
  const userId = process.env.MARIFA_TEMPORARY_ADMIN_USER_ID;
  const organizationId = process.env.MARIFA_TEMPORARY_ADMIN_ORGANIZATION_ID;
  if (!userId || !organizationId) return null;
  return { userId, organizationId };
}
