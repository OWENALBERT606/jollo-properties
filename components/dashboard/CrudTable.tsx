"use client";

import { useState, useMemo } from "react";
import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, flexRender, ColumnDef } from "@tanstack/react-table";
import { Plus, Search, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export interface CrudField {
  key: string;
  label: string;
  type?: "text" | "textarea" | "select";
  options?: string[];
  required?: boolean;
}

interface Props {
  title: string;
  data: any[];
  fields: CrudField[];
  apiBase: string;
  columns: ColumnDef<any>[];
  onRefresh: (items: any[]) => void;
  addButtonColor?: string;
}

export default function CrudTable({ title, data, fields, apiBase, columns, onRefresh, addButtonColor = "bg-brand-blue hover:bg-brand-blue-light" }: Props) {
  const [items, setItems] = useState(data);
  const [globalFilter, setGlobalFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function openAdd() {
    setEditItem(null);
    setForm({});
    setDialogOpen(true);
  }

  function openEdit(item: any) {
    setEditItem(item);
    const f: Record<string, string> = {};
    fields.forEach((field) => { f[field.key] = item[field.key] ?? ""; });
    setForm(f);
    setDialogOpen(true);
  }

  async function handleSave() {
    setLoading(true);
    try {
      const url = editItem ? `${apiBase}/${editItem.id}` : apiBase;
      const method = editItem ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      if (editItem) {
        setItems((prev) => prev.map((i) => i.id === json.id ? json : i));
      } else {
        setItems((prev) => [json, ...prev]);
      }
      toast.success(editItem ? "Updated successfully" : "Created successfully");
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      toast.success("Deleted successfully");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
      setDeleteTarget(null);
    }
  }

  async function handleToggle(item: any) {
    try {
      const res = await fetch(`${apiBase}/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setItems((prev) => prev.map((i) => i.id === json.id ? json : i));
      toast.success(`${json.isActive ? "Activated" : "Deactivated"}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  // Inject edit/delete/toggle actions into columns
  const allColumns = useMemo<ColumnDef<any>[]>(() => [
    ...columns,
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="h-7 w-7 text-brand-blue hover:bg-brand-blue-pale"
            onClick={() => openEdit(row.original)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          {"isActive" in row.original && (
            <Button size="icon" variant="ghost" className="h-7 w-7 text-gray-500 hover:bg-gray-100"
              onClick={() => handleToggle(row.original)}>
              {row.original.isActive
                ? <ToggleRight className="h-4 w-4 text-green-500" />
                : <ToggleLeft className="h-4 w-4 text-gray-400" />}
            </Button>
          )}
          <Button size="icon" variant="ghost" className="h-7 w-7 text-brand-red hover:bg-red-50"
            onClick={() => setDeleteTarget(row.original)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ], [columns]);

  const table = useReactTable({
    data: items, columns: allColumns,
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
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder={`Search ${title.toLowerCase()}...`} value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)} className="pl-9 text-sm" />
          </div>
          <Button onClick={openAdd} className={`${addButtonColor} text-white flex items-center gap-2`}>
            <Plus className="h-4 w-4" /> Add {title.replace(/s$/, "")}
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
                ? <tr><td colSpan={allColumns.length} className="text-center py-12 text-gray-400">No {title.toLowerCase()} found</td></tr>
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
          <span className="text-sm text-gray-400">{items.length} total · Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
          </div>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? `Edit ${title.replace(/s$/, "")}` : `Add ${title.replace(/s$/, "")}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {fields.map((field) => (
              <div key={field.key} className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  {field.label} {field.required && <span className="text-brand-red">*</span>}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    value={form[field.key] ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
                  />
                ) : field.type === "select" ? (
                  <select
                    value={form[field.key] ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <Input
                    value={form[field.key] ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={field.label}
                    className="text-sm"
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading} className="bg-brand-blue hover:bg-brand-blue-light text-white">
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Confirm Delete</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-500">Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.</p>
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
