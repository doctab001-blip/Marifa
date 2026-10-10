"use client";

import { useMemo, useState } from "react";
import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronDown, MoreHorizontal, Search, UserPlus, X } from "lucide-react";
import type { StaffMember } from "@/lib/admin/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ModalContent = { title: string; description: string } | null;
const staffTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
});
const columnHelper = createColumnHelper<typeof staffTableFeatures, StaffMember>();

export function StaffTable({ staff }: { staff: StaffMember[] }) {
  const [nameFilter, setNameFilter] = useState("");
  const [modal, setModal] = useState<ModalContent>(null);
  const columns = useMemo(() => columnHelper.columns([
    columnHelper.accessor("name", { header: "Name", cell: (info) => <strong className="staff-name">{info.getValue()}</strong> }),
    columnHelper.accessor("professionalLevel", { header: "Professional level" }),
    columnHelper.accessor("specialty", { header: "Specialty" }),
    columnHelper.accessor("systemRole", { header: "System role", cell: (info) => <span className={`role-pill role-${info.getValue().toLowerCase()}`}>{info.getValue()}</span> }),
    columnHelper.accessor("status", { header: "Status", cell: (info) => <span className={`staff-status${info.getValue() === "Active" ? " is-active" : ""}`}><i />{info.getValue()}</span> }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: (info) => (
        <details className="staff-actions-menu">
          <summary aria-label={`Actions for ${info.row.original.name}`}><MoreHorizontal size={18} /></summary>
          <div className="staff-actions-popover" role="menu">
            <button role="menuitem" type="button" onClick={() => setModal({ title: "Edit roles", description: `Role changes for ${info.row.original.name} will be available when the governed role editor is connected.` })}>Edit Roles</button>
            <button role="menuitem" type="button" onClick={() => setModal({ title: "View competencies", description: `Competency records for ${info.row.original.name} will appear here.` })}>View Competencies</button>
            <button role="menuitem" type="button" className="is-danger" onClick={() => setModal({ title: "Revoke access", description: `Access for ${info.row.original.name} cannot be revoked from this preview.` })}>Revoke Access</button>
          </div>
        </details>
      ),
    }),
  ]), []);

  const table = useTable({
    features: staffTableFeatures,
    data: staff,
    columns,
    state: { globalFilter: nameFilter },
    onGlobalFilterChange: (value) => setNameFilter(String(value ?? "")),
    globalFilterFn: "includesString",
    getColumnCanGlobalFilter: (column) => column.id === "name",
  });

  return (
    <>
      <div className="staff-toolbar">
        <label className="staff-search"><Search size={17} aria-hidden="true" /><Input value={nameFilter} onChange={(event) => setNameFilter(event.target.value)} placeholder="Search staff by name" aria-label="Search staff by name" /></label>
        <Dialog.Root>
          <Dialog.Trigger asChild><Button variant="primary"><UserPlus size={16} />Invite Staff Member</Button></Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="admin-dialog-overlay" />
            <Dialog.Content className="admin-dialog admin-sheet">
              <div className="admin-dialog-header"><div><Dialog.Title>Invite staff member</Dialog.Title><Dialog.Description>Prepare a tenant-scoped invitation.</Dialog.Description></div><Dialog.Close asChild><button className="dialog-close" aria-label="Close"><X size={18} /></button></Dialog.Close></div>
              <label className="admin-field">Work email<Input type="email" placeholder="name@hospital.org" /></label>
              <label className="admin-field">Professional level<select defaultValue="mbbs_gp"><option value="mbbs_gp">MBBS / GP</option><option value="specialist">Specialist</option><option value="consultant">Consultant</option></select></label>
              <label className="admin-field">System role<select defaultValue="clinician"><option value="clinician">Clinician</option><option value="editor">Editor</option><option value="admin">Admin</option></select></label>
              <p className="admin-form-note">Invitation delivery and role assignment are placeholders in this release.</p>
              <Dialog.Close asChild><Button variant="primary">Done</Button></Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
      <div className="card admin-table-card">
        <div className="admin-table-scroll"><Table>
        <TableHeader><TableRow>{table.getHeaderGroups().flatMap((group) => group.headers).map((header) => <TableHead key={header.id}>{header.isPlaceholder ? null : <table.FlexRender header={header} />}</TableHead>)}</TableRow></TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>{row.getAllCells().map((cell) => <TableCell key={cell.id}><table.FlexRender cell={cell} /></TableCell>)}</TableRow>
            )) : <TableRow><TableCell colSpan={columns.length}><div className="admin-empty"><Search size={19} /><p>{staff.length ? "No staff match that name." : "No staff memberships are available for this organization."}</p></div></TableCell></TableRow>}
          </TableBody>
        </Table></div>
        <div className="admin-table-footer"><span>{table.getFilteredRowModel().rows.length} staff members</span><span>Organization data only <ChevronDown size={14} /></span></div>
      </div>
      <Dialog.Root open={Boolean(modal)} onOpenChange={(open) => { if (!open) setModal(null); }}>
        <Dialog.Portal><Dialog.Overlay className="admin-dialog-overlay" /><Dialog.Content className="admin-dialog">
          <div className="admin-dialog-header"><div><Dialog.Title>{modal?.title}</Dialog.Title><Dialog.Description>{modal?.description}</Dialog.Description></div><Dialog.Close asChild><button className="dialog-close" aria-label="Close"><X size={18} /></button></Dialog.Close></div>
          <Dialog.Close asChild><Button>Close</Button></Dialog.Close>
        </Dialog.Content></Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
