"use client";

import { useState, useMemo } from "react";
import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, flexRender, ColumnDef } from "@tanstack/react-table";
import { Search, Eye, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import PropertyDrawer from "@/components/shared/PropertyDrawer";
import PropertyRegistrationDialog from "@/components/dashboard/PropertyRegistrationDialog";
import { useRouter } from "next/navigation";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  PENDING_APPROVAL: "bg-amber-100 text-amber-700",
  DRAFT: "bg-gray-100 text-gray-600",
  DISPUTED: "bg-red-100 text-red-700",
  TRANSFERRED: "bg-teal-100 text-teal-700",
  ARCHIVED: "bg-gray-100 text-gray-500",
};

const tenureBadge: Record<string, string> = {
  TITLED: "bg-green-50 text-green-700",
  MAILO: "bg-blue-50 text-blue-700",
  KIBANJA: "bg-amber-50 text-amber-700",
  LEASEHOLD: "bg-purple-50 text-purple-700",
  FREEHOLD: "bg-teal-50 text-teal-700",
};

const ALL_STATUSES = ["DRAFT","PENDING_APPROVAL","ACTIVE","TRANSFERRED","DISPUTED","ARCHIVED"];

export default function AdminPropertiesTable({ initialProperties, officerId }: { initialProperties: any[]; officerId?: string }) {
  const router = useRouter();
  const [properties, setProperties] = useState(initialProperties);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tenureFilter, setTenureFilter] = useState("");
  const [detailProp, setDetailProp] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [statusTarget, setStatusTarget] = useState<{ prop: any; status: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  async function updateProperty(id: string, data: any) {
    const res = await fetch(`/api/properties/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    setProperties((prev) => prev.map((p) => p.id === id ? { ...p, ...json } : p));
    return json;
  }

  async function handleStatusChange() {
    if (!statusTarget) return;
    setLoading(true);
    try {
      await updateProperty(statusTarget.prop.id, { status: statusTarget.status });
      toast.success(`Status updated to ${statusTarget.status}`);
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); setStatusTarget(null); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setProperties((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success("Property deleted");
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); setDeleteTarget(null); }
  }

  const filtered = useMemo(() => {
    let data = properties;
    if (statusFilter) data = data.filter((p) => p.status === statusFilter);
    if (tenureFilter) data = data.filter((p) => p.tenure === tenureFilter);
    return data;
  }, [properties, statusFilter, tenureFilter]);

  const columns = useMemo<ColumnDef<any>[]>(() => [
    { accessorKey: "plotNumber", header: "Plot No.", cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.plotNumber}</span> },
    { accessorKey: "title", header: "Title", cell: ({ row }) => (
      <div>
        <div className="font-medium text-sm line-clamp-1">{row.original.title}</div>
        <div className="text-xs text-gray-400">{row.original.district}</div>
      </div>
    )},
    { accessorKey: "tenure", header: "Tenure", cell: ({ row }) => (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tenureBadge[row.original.tenure] || "bg-gray-100"}`}>
        {row.original.tenure}
      </span>
    )},
    { accessorKey: "status", header: "Status", cell: ({ row }) => (
      <select
        value={row.original.status}
        onChange={(e) => setStatusTarget({ prop: row.original, status: e.target.value })}
        className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-blue ${statusColors[row.original.status] || "bg-gray-100"}`}
      >
        {ALL_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
      </select>
    )},
    { accessorKey: "price", header: "Price", cell: ({ row }) => row.original.price
      ? <span className="text-sm font-medium">UGX {Number(row.original.price).toLocaleString()}</span>
      : <span className="text-gray-300 text-sm">—</span>
    },
    { accessorKey: "createdAt", header: "Registered", cell: ({ row }) => (
      <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true })}</span>
    )},
    { id: "actions", header: "Actions", cell: ({ row }) => (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="h-8 text-xs text-brand-blue border-brand-blue hover:bg-blue-50 gap-1.5" onClick={() => setDetailProp(row.original)}>
          <Eye className="h-3.5 w-3.5" /> View Details
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-xs text-brand-red border-red-300 hover:bg-red-50 gap-1.5" onClick={() => setDeleteTarget(row.original)}>
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </Button>
      </div>
    )},
  ], []);

  const table = useReactTable({
    data: filtered, columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mr-auto">
            <h2 className="text-lg font-bold text-brand-blue">Property Listings</h2>
            <span className="text-sm text-gray-400">({filtered.length})</span>
          </div>
          <Button onClick={() => setAddOpen(true)} className="bg-brand-red hover:bg-red-700 text-white flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Property
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3 px-4 pb-3 pt-2 border-b border-gray-100">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search plot, title, district..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="pl-9 text-sm" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue">
            <option value="">All Statuses</option>
            {ALL_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
          <select value={tenureFilter} onChange={(e) => setTenureFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue">
            <option value="">All Tenures</option>
            {["TITLED","MAILO","KIBANJA","LEASEHOLD","FREEHOLD"].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <span className="ml-auto text-sm text-gray-400">{filtered.length} results</span>
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
                ? <tr><td colSpan={columns.length} className="text-center py-12 text-gray-400">No properties found</td></tr>
                : table.getRowModel().rows.map((row) => (
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
          <span className="text-sm text-gray-400">Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
          </div>
        </div>
      </div>

      {/* Property detail drawer */}
      {detailProp && <PropertyDrawer property={detailProp} open={!!detailProp} onClose={() => setDetailProp(null)} />}

      {/* Add property dialog */}
      {officerId && (
        <PropertyRegistrationDialog
          open={addOpen}
          onClose={() => setAddOpen(false)}
          officerId={officerId}
          onSaved={() => { router.refresh(); }}
        />
      )}

      {/* Status change confirm */}
      <Dialog open={!!statusTarget} onOpenChange={() => setStatusTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Change Status</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-500">
            Change <strong>{statusTarget?.prop.title}</strong> status to{" "}
            <strong>{statusTarget?.status.replace("_", " ")}</strong>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusTarget(null)}>Cancel</Button>
            <Button onClick={handleStatusChange} disabled={loading} className="bg-brand-blue hover:bg-brand-blue-light text-white">
              {loading ? "Updating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Property?</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-500">
            This will permanently delete <strong>{deleteTarget?.title}</strong> and all associated records.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button onClick={handleDelete} disabled={loading} className="bg-brand-red hover:bg-red-700 text-white">
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
