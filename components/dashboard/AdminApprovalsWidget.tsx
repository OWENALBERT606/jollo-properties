"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

interface Property { id: string; title: string; plotNumber: string; district: string; }

export default function AdminApprovalsWidget({ properties }: { properties: Property[] }) {
  const [items, setItems] = useState(properties);
  const [confirm, setConfirm] = useState<{ id: string; action: "approve" | "reject" } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAction() {
    if (!confirm) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${confirm.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: confirm.action === "approve" ? "ACTIVE" : "ARCHIVED" }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((p) => p.id !== confirm.id));
      toast.success(`Property ${confirm.action === "approve" ? "approved" : "rejected"}`);
    } catch {
      toast.error("Action failed");
    } finally {
      setLoading(false);
      setConfirm(null);
    }
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Pending Approvals</h2>
        {items.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400 dark:text-gray-500">All caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-100 line-clamp-1">{p.title}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">{p.plotNumber} · {p.district}</div>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30"
                    onClick={() => setConfirm({ id: p.id, action: "approve" })}>
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-brand-red hover:bg-red-50 dark:hover:bg-red-900/30"
                    onClick={() => setConfirm({ id: p.id, action: "reject" })}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!confirm} onOpenChange={() => setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirm?.action === "approve" ? "Approve Property?" : "Reject Property?"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            {confirm?.action === "approve"
              ? "This will set the property status to ACTIVE and make it visible."
              : "This will archive the property. This action can be reversed."}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button
              onClick={handleAction}
              disabled={loading}
              className={confirm?.action === "approve" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-brand-red hover:bg-red-700 text-white"}
            >
              {loading ? "Processing..." : confirm?.action === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
