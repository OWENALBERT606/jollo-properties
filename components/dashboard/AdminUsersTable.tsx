"use client";

import { useState, useMemo } from "react";
import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, flexRender, ColumnDef } from "@tanstack/react-table";
import { Plus, Search, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import OwnerDialog from "@/components/shared/OwnerDialog";
import AdminUserDialog from "@/components/shared/AdminUserDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const roleBadge: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  LAND_OFFICER: "bg-blue-100 text-blue-700",
  PUBLIC_USER: "bg-gray-100 text-gray-600",
};

export default function AdminUsersTable({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [globalFilter, setGlobalFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const columns = useMemo<ColumnDef<any>[]>(() => [
    { accessorKey: "name", header: "Name", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: "email", header: "Email", cell: ({ row }) => <span className="text-gray-500 text-sm">{row.original.email}</span> },
    { accessorKey: "role", header: "Role", cell: ({ row }) => (
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleBadge[row.original.role] || "bg-gray-100"}`}>
        {(row.original.role || "").replace("_", " ")}
      </span>
    )},
    { accessorKey: "nin", header: "NIN", cell: ({ row }) => row.original.nin ? (
      <div className="flex items-center gap-1">
        <span className="text-xs font-mono">{row.original.nin}</span>
        {row.original.ninVerified ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-gray-300" />}
      </div>
    ) : <span className="text-gray-300 text-sm">—</span> },
    { accessorKey: "_count.ownerships", header: "Properties", cell: ({ row }) => (
      <Badge variant="secondary">{row.original._count?.ownerships || 0}</Badge>
    )},
    { accessorKey: "createdAt", header: "Joined", cell: ({ row }) => (
      <span className="text-sm text-gray-400">{formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true })}</span>
    )},
    { id: "actions", header: "Actions", cell: ({ row }) => (
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" className="h-7 text-xs text-brand-blue" onClick={() => { setEditUser(row.original); setDialogOpen(true); }}>Edit</Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs text-brand-red" onClick={() => setDeactivateTarget(row.original)}>Deactivate</Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs text-red-700" onClick={() => setDeleteTarget(row.original)}>Delete</Button>
      </div>
    )},
  ], []);

  const table = useReactTable({
    data: users, columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  function onSaved(user: any) {
    setUsers((prev) => {
      const idx = prev.findIndex((u) => u.id === user.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = { ...next[idx], ...user }; return next; }
      return [user, ...prev];
    });
    setDialogOpen(false); setEditUser(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setUsers((p) => p.filter((u) => u.id !== deleteTarget.id));
      toast.success("User deleted");
    } catch { toast.error("Failed to delete user"); }
    finally { setDeleteTarget(null); }
  }

  async function confirmDeactivate() {
    if (!deactivateTarget) return;
    try {
      await fetch(`/api/users/${deactivateTarget.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: false }),
      });
      setUsers((p) => p.filter((u) => u.id !== deactivateTarget.id));
      toast.success("User deactivated");
    } catch { toast.error("Failed"); }
    finally { setDeactivateTarget(null); }
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search users..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="pl-9 text-sm" />
          </div>
          <Button onClick={() => { setEditUser(null); setDialogOpen(true); }} className="bg-brand-blue hover:bg-brand-blue-light text-white flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add User
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>{hg.headers.map((h) => (
                  <th key={h.id} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer"
                    onClick={h.column.getToggleSortingHandler()}>
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}</tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0
                ? <tr><td colSpan={columns.length} className="text-center py-12 text-gray-400">No users found</td></tr>
                : table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <span className="text-sm text-gray-400">Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
          </div>
        </div>
      </div>

      <AdminUserDialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditUser(null); }} user={editUser} onSaved={onSaved} />

      <Dialog open={!!deactivateTarget} onOpenChange={() => setDeactivateTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Deactivate User?</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-500">This will deactivate <strong>{deactivateTarget?.name}</strong>. They will no longer be able to log in.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateTarget(null)}>Cancel</Button>
            <Button onClick={confirmDeactivate} className="bg-brand-red hover:bg-red-700 text-white">Deactivate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete User?</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-500">
            This will permanently delete <strong>{deleteTarget?.name}</strong> and all associated records. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button onClick={confirmDelete} className="bg-red-700 hover:bg-red-800 text-white">Delete Permanently</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
