"use client";

import { useState, useMemo } from "react";
import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, flexRender, ColumnDef } from "@tanstack/react-table";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import TransactionDialog from "@/components/shared/TransactionDialog";
import TransactionDetailSheet from "@/components/shared/TransactionDetailSheet";

const statusColors: Record<string, string> = {
  INITIATED: "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  COMPLETED: "bg-teal-100 text-teal-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-600",
};

export default function TransactionsTable({ initialTransactions, officerId }: { initialTransactions: any[]; officerId: string }) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [globalFilter, setGlobalFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailTx, setDetailTx] = useState<any>(null);

  const columns = useMemo<ColumnDef<any>[]>(() => [
    { accessorKey: "property.title", header: "Property", cell: ({ row }) => (
      <div>
        <div className="font-medium text-sm">{row.original.property?.title}</div>
        <div className="text-xs text-gray-400">{row.original.property?.plotNumber}</div>
      </div>
    )},
    { accessorKey: "type", header: "Type", cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => (
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[row.original.status] || "bg-gray-100"}`}>
        {row.original.status.replace("_", " ")}
      </span>
    )},
    { accessorKey: "amount", header: "Amount", cell: ({ row }) => row.original.amount
      ? <span className="font-medium">UGX {Number(row.original.amount).toLocaleString()}</span>
      : <span className="text-gray-300">—</span>
    },
    { accessorKey: "buyer.name", header: "Buyer", cell: ({ row }) => row.original.buyer?.name || "—" },
    { accessorKey: "seller.name", header: "Seller", cell: ({ row }) => row.original.seller?.name || "—" },
    { accessorKey: "createdAt", header: "Date", cell: ({ row }) => (
      <span className="text-sm text-gray-400">{formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true })}</span>
    )},
    { id: "actions", header: "", cell: ({ row }) => (
      <Button size="sm" variant="ghost" className="text-brand-blue text-xs" onClick={() => setDetailTx(row.original)}>
        View
      </Button>
    )},
  ], []);

  const table = useReactTable({
    data: transactions, columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search transactions..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="pl-9 text-sm" />
          </div>
          <Button onClick={() => setDialogOpen(true)} className="bg-brand-blue hover:bg-brand-blue-light text-white flex items-center gap-2">
            <Plus className="h-4 w-4" /> Record Transaction
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
                ? <tr><td colSpan={columns.length} className="text-center py-12 text-gray-400">No transactions found</td></tr>
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

      <TransactionDialog open={dialogOpen} onClose={() => setDialogOpen(false)} officerId={officerId}
        onSaved={(tx) => { setTransactions((p) => [tx, ...p]); setDialogOpen(false); }} />
      {detailTx && <TransactionDetailSheet tx={detailTx} open={!!detailTx} onClose={() => setDetailTx(null)}
        onUpdated={(updated) => { setTransactions((p) => p.map((t) => t.id === updated.id ? updated : t)); setDetailTx(updated); }} />}
    </>
  );
}
