"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const statusColors: Record<string, string> = {
  INITIATED: "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  COMPLETED: "bg-teal-100 text-teal-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-600",
};

interface Props { tx: any; open: boolean; onClose: () => void; onUpdated: (tx: any) => void; }

export default function TransactionDetailSheet({ tx, open, onClose, onUpdated }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(status: string) {
    setLoading(status);
    try {
      const res = await fetch(`/api/transactions/${tx.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error);
      toast.success(`Transaction ${status.toLowerCase()}`);
      onUpdated(updated);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Transaction Details</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-5">
          <div className="bg-brand-blue-pale rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline">{tx.type}</Badge>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[tx.status] || ""}`}>
                {tx.status.replace("_", " ")}
              </span>
            </div>
            <div className="font-semibold text-brand-blue">{tx.property?.title}</div>
            <div className="text-xs text-gray-400">{tx.property?.plotNumber}</div>
            {tx.amount && <div className="text-lg font-bold text-gray-800 mt-2">UGX {Number(tx.amount).toLocaleString()}</div>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Buyer", value: tx.buyer?.name || "—" },
              { label: "Seller", value: tx.seller?.name || "—" },
              { label: "Initiated By", value: tx.initiatedBy?.name || "—" },
              { label: "Currency", value: tx.currency },
              { label: "Agreement Date", value: tx.agreementDate ? new Date(tx.agreementDate).toLocaleDateString() : "—" },
              { label: "Created", value: formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true }) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-0.5">{label}</div>
                <div className="text-sm font-medium">{value}</div>
              </div>
            ))}
          </div>

          {tx.notes && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Notes</div>
              <div className="text-sm text-gray-700">{tx.notes}</div>
            </div>
          )}

          {/* Workflow timeline */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Workflow</h3>
            <div className="space-y-2">
              {["INITIATED","UNDER_REVIEW","APPROVED","COMPLETED"].map((s, i) => {
                const statuses = ["INITIATED","UNDER_REVIEW","APPROVED","COMPLETED","REJECTED","CANCELLED"];
                const currentIdx = statuses.indexOf(tx.status);
                const stepIdx = statuses.indexOf(s);
                const done = stepIdx <= currentIdx && tx.status !== "REJECTED" && tx.status !== "CANCELLED";
                return (
                  <div key={s} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-green-500" : "bg-gray-200"}`}>
                      {done ? <CheckCircle className="h-3.5 w-3.5 text-white" /> : <Clock className="h-3.5 w-3.5 text-gray-400" />}
                    </div>
                    <span className={`text-sm ${done ? "text-gray-800 font-medium" : "text-gray-400"}`}>{s.replace("_", " ")}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          {["INITIATED","UNDER_REVIEW"].includes(tx.status) && (
            <div className="flex gap-2 pt-2">
              <Button onClick={() => updateStatus("APPROVED")} disabled={!!loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                {loading === "APPROVED" ? "..." : <><CheckCircle className="h-4 w-4 mr-1" />Approve</>}
              </Button>
              <Button onClick={() => updateStatus("REJECTED")} disabled={!!loading}
                className="flex-1 bg-brand-red hover:bg-red-700 text-white">
                {loading === "REJECTED" ? "..." : <><XCircle className="h-4 w-4 mr-1" />Reject</>}
              </Button>
            </div>
          )}
          {tx.status === "APPROVED" && (
            <Button onClick={() => updateStatus("COMPLETED")} disabled={!!loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white">
              {loading === "COMPLETED" ? "..." : "Mark as Completed"}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
