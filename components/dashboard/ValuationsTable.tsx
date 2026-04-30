"use client";

import { useState, useMemo } from "react";
import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, flexRender, ColumnDef } from "@tanstack/react-table";
import { Plus, Search, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import ValuationDialog from "@/components/shared/ValuationDialog";
import PaymentDialog from "@/components/shared/PaymentDialog";
import ReceiptDialog from "@/components/shared/ReceiptDialog";

export default function ValuationsTable({ initialValuations, officerId }: { initialValuations: any[]; officerId: string }) {
  const [valuations, setValuations] = useState(initialValuations);
  const [globalFilter, setGlobalFilter] = useState("");
  const [valuationDialog, setValuationDialog] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<any>(null);
  const [receiptTarget, setReceiptTarget] = useState<any>(null);

  const columns = useMemo<ColumnDef<any>[]>(() => [
    { accessorKey: "property.title", header: "Property", cell: ({ row }) => (
      <div>
        <div className="font-medium text-sm">{row.original.property?.title}</div>
        <div className="text-xs text-gray-400">{row.original.property?.plotNumber}</div>
      </div>
    )},
    { accessorKey: "valuedAmount", header: "Valued Amount", cell: ({ row }) => (
      <span className="font-medium">UGX {Number(row.original.valuedAmount).toLocaleString()}</span>
    )},
    { accessorKey: "taxAmount", header: "Tax Due", cell: ({ row }) => (
      <span className="text-amber-600 font-medium">UGX {Number(row.original.taxAmount).toLocaleString()}</span>
    )},
    { id: "paymentStatus", header: "Payment", cell: ({ row }) => {
      const paid = row.original.payments?.length > 0;
      return <Badge className={paid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>{paid ? "Paid" : "Pending"}</Badge>;
    }},
    { accessorKey: "valuationDate", header: "Date", cell: ({ row }) => (
      <span className="text-sm text-gray-400">{format(new Date(row.original.valuationDate), "dd MMM yyyy")}</span>
    )},
    { id: "actions", header: "", cell: ({ row }) => {
      const paid = row.original.payments?.length > 0;
      return (
        <div className="flex gap-1">
          {!paid && (
            <Button size="sm" variant="ghost" className="text-xs text-brand-blue" onClick={() => setPaymentTarget(row.original)}>
              Record Payment
            </Button>
          )}
          {paid && (
            <Button size="sm" variant="ghost" className="text-xs text-green-600" onClick={() => setReceiptTarget(row.original)}>
              <Receipt className="h-3.5 w-3.5 mr-1" /> Receipt
            </Button>
          )}
        </div>
      );
    }},
  ], []);

  const table = useReactTable({
    data: valuations, columns,
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
            <Input placeholder="Search valuations..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="pl-9 text-sm" />
          </div>
          <Button onClick={() => setValuationDialog(true)} className="bg-brand-blue hover:bg-brand-blue-light text-white flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Valuation
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
                ? <tr><td colSpan={columns.length} className="text-center py-12 text-gray-400">No valuations yet</td></tr>
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

      <ValuationDialog open={valuationDialog} onClose={() => setValuationDialog(false)} officerId={officerId}
        onSaved={(v) => { setValuations((p) => [v, ...p]); setValuationDialog(false); }} />
      {paymentTarget && <PaymentDialog open={!!paymentTarget} onClose={() => setPaymentTarget(null)} valuation={paymentTarget}
        onSaved={(updated) => { setValuations((p) => p.map((v) => v.id === updated.id ? updated : v)); setPaymentTarget(null); }} />}
      {receiptTarget && <ReceiptDialog open={!!receiptTarget} onClose={() => setReceiptTarget(null)} valuation={receiptTarget} />}
    </>
  );
}
