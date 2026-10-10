import { UserRoundCheck } from "lucide-react";
import { StaffTable } from "@/components/admin/staff-table";
import { getAdminStaff } from "@/lib/admin/data";

export default async function AdminStaffPage() {
  const { staff } = await getAdminStaff();
  return (
    <section className="admin-content">
      <header className="admin-section-heading"><div><p className="eyebrow">People &amp; access</p><h2>Staff Directory &amp; Roles</h2><p>Review staff membership and role assignments for your organization.</p></div><span className="admin-section-icon"><UserRoundCheck size={20} /></span></header>
      <StaffTable staff={staff} />
    </section>
  );
}
