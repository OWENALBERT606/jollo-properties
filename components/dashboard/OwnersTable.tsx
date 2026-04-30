"use client";

import { useState, useMemo } from "react";
import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, flexRender, ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Plus, Search, CheckCircle, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import OwnerDialog from "@/components/shared/OwnerDialog";
import OwnerDetailSheet from "@/components/shared/OwnerDetailSheet";

interface Owner {
  id: string; name: string; email: string; phone?: string; nin?: string;
  ninVerified: boolean; createdAt: string; _count: { ownerships: number };
}

export default function OwnersTable({ initialOwners }: { initialOwners: Owner[] }) {
  const [owners, setOwners] = useState(initialOwners);
  const [globalFilter, setGlobalFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOwner, setEditOwner] = useState<Owner | null>(null);
  const [detailOwner, setDetailOwner] = useState<Owner | null>(null);

  const columns = useMemo<ColumnDef<Owner>[]>(() => [
    { accessorKey: "name", header: "Name", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: "email", header: "Email", cell: ({ row }) => <span className="text-gray-500 text-sm">{row.original.email}</span> },
    { accessorKey: "nin", header: "NIN", cell: ({ row }) => row.original.nin ? (
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-mono">{row.original.nin}</span>
        {row.original.ninVerified
          ? <CheckCircle className="h-3.5 w-3.5 text-green-500" />
          : <XCircle className="h-3.5 w-3.5 text-gray-300" />}
      </div>
    ) : <span className="text-gray-300 text-sm">—</span> },
    { accessorKey: "_count.ownerships", header: "Properties", cell: ({ row }) => (
      <Badge variant="secondary">{row.original._count.ownerships}</Badge>
    )},
    { accessorKey: "createdAt", header: "Joined", cell: ({ row }) => (
      <span className="text-sm text-gray-400">{formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true })}</span>
    )},
    { id: "actions", header: "Actions", cell: ({ row }) => (
      <div className="flex gap-1">
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setDetailOwner(row.original)}>
          <Eye className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs text-brand-blue" onClick={() => { setEditOwner(row.original); setDialogOpen(true); }}>
          Edit
        </Button>
      </div>
    )},
  ], []);

  const table = useReactTable({
    data: owners, columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  function onSaved(owner: Owner) {
    setOwners((prev) => {
      const idx = prev.findIndex((o) => o.id === owner.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = owner; return next; }
      return [owner, ...prev];
    });
    setDialogOpen(false);
    setEditOwner(null);
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search name, NIN, email..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="pl-9 text-sm" />
          </div>
          <Button onClick={() => { setEditOwner(null); setDialogOpen(true); }} className="bg-brand-blue hover:bg-brand-blue-light text-white flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Owner
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none"
                      onClick={h.column.getToggleSortingHandler()}>
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr><td colSpan={columns.length} className="text-center py-12 text-gray-400">No owners found</td></tr>
              ) : table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
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

      <OwnerDialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditOwner(null); }} owner={editOwner} onSaved={onSaved} />
      {detailOwner && <OwnerDetailSheet owner={detailOwner} open={!!detailOwner} onClose={() => setDetailOwner(null)} />}
    </>
  );
}
