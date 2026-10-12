import { UserPlus, UsersRound } from "@/components/icons-3d";
import type { StaffMember } from "@/lib/admin/data";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function StaffTable({ staff }: { staff: StaffMember[] }) {
  return (
    <>
      <div className="staff-toolbar staff-toolbar-simple">
        <p className="admin-preview-note">Staff members in your organization.</p>
        <Button variant="primary" type="button"><UserPlus size={16} strokeWidth={1.5} aria-hidden="true" />Invite Staff Member</Button>
      </div>
      <div className="card admin-table-card">
        <div className="admin-table-scroll">
          <Table>
            <caption className="staff-table-caption">Organization staff directory</caption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Professional Level</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>System Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.length === 0 ? (
                <TableRow><TableCell colSpan={5}><div className="admin-empty staff-empty"><UsersRound size={30} strokeWidth={1.5} aria-hidden="true" /><p>No additional staff members found. Click &apos;Invite Staff Member&apos; to grow your team.</p></div></TableCell></TableRow>
              ) : staff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell><strong className="staff-name">{member.name}</strong></TableCell>
                  <TableCell>{member.professionalLevel}</TableCell>
                  <TableCell>{member.specialty}</TableCell>
                  <TableCell><span className="role-pill">{member.systemRole}</span></TableCell>
                  <TableCell><span className={`staff-status${member.status === "Active" ? " is-active" : ""}`}><i aria-hidden="true" />{member.status}</span></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
