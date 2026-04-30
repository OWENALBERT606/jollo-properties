"use client";

import { useState, useMemo } from "react";
import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, flexRender, ColumnDef } from "@tanstack/react-table";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import DisputeDialog from "@/components/shared/DisputeDialog";
import DisputeDetailSheet from "@/components/shared/DisputeDetailSheet";

const statusColors: Record<string, string> = {
  FILED: "bg-yellow-100 text-yellow-700",
  UNDER_INVESTIGATION: "bg-blue-100 text-blue-700",
  HEARING: "bg-purple-100 text-purple-700",
  RESOLVED: "bg-green-100 text-green-700",
  DISMISSED: "bg-gray-100 text-gray-600",
};

export default function DisputesTable({ initialDisputes, officerId }: { initialDisputes: any[]; officerId: string }) {
  const [disputes, setDisputes] = useState(initialDisputes);
  const [globalFilter, setGlobalFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDispute, setDetailDispute] = useState<any>(null);

  const columns = useMemo<ColumnDef<any>[]>(() => [
    { accessorKey: "title", header: "Title", cell: ({ row }) => (
      <div>
        <div className="font-medium text-sm">{row.original.title}</div>
        <div className="text-xs text-gray-400">{row.original.property?.plotNumber}</div>
      </div>
    )},
    { accessorKey: "property.title", header: "Property", cell: ({ row }) => (
      <span className="text-sm">{row.original.property?.title}</span>
    )},
    { accessorKey: "complainant.name", header: "Complainant", cell: ({ row }) => (
      <span className="text-sm">{row.original.complainant?.name}</span>
    )},
    { accessorKey: "status", header: "Status", cell: ({ row }) => (
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[row.original.status] || "bg-gray-100"}`}>
        {row.original.status.replace("_", " ")}
      </span>
    )},
    { accessorKey: "createdAt", header: "Filed", cell: ({ row }) => (
      <span className="text-sm text-gray-400">{formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true })}</span>
    )},
    { id: "actions", header: "", cell: ({ row }) => (
      <Button size="sm" variant="ghost" className="text-brand-blue text-xs" onClick={() => setDetailDispute(row.original)}>
        View
      </Button>
    )},
  ], []);

  const table = useReactTable({
    data: disputes, columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search disputes..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="pl-9 text-sm" />
          </div>
          <Button onClick={() => setDialogOpen(true)} className="bg-brand-red hover:bg-red-700 text-white flex items-center gap-2">
            <Plus className="h-4 w-4" /> File Dispute
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>{hg.headers.map((h) => (
                  <th key={h.id} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}</tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0
                ? <tr><td colSpan={columns.length} className="text-center py-12 text-gray-400">No disputes found</td></tr>
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

      <DisputeDialog open={dialogOpen} onClose={() => setDialogOpen(false)} officerId={officerId}
        onSaved={(d) => { setDisputes((p) => [d, ...p]); setDialogOpen(false); }} />
      {detailDispute && <DisputeDetailSheet dispute={detailDispute} open={!!detailDispute} onClose={() => setDetailDispute(null)} officerId={officerId}
        onUpdated={(updated) => { setDisputes((p) => p.map((d) => d.id === updated.id ? updated : d)); setDetailDispute(updated); }} />}
    </>
  );
}
