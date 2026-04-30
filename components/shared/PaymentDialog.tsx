"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const schema = z.object({
  amount: z.coerce.number().positive(),
  method: z.enum(["CASH","MOBILE_MONEY","BANK"]),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface Props { open: boolean; onClose: () => void; valuation: any; onSaved: (v: any) => void; }

export default function PaymentDialog({ open, onClose, valuation, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { amount: Number(valuation?.taxAmount), method: "CASH" },
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const res = await fetch(`/api/valuations/${valuation.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Payment recorded");
      onSaved(json);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Record Tax Payment</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          <div className="bg-amber-50 rounded-lg p-3 text-sm">
            <div className="text-gray-500">Tax Due</div>
            <div className="font-bold text-amber-700">UGX {Number(valuation?.taxAmount).toLocaleString()}</div>
          </div>
          <div className="space-y-1">
            <Label>Amount (UGX) *</Label>
            <Input {...register("amount")} type="number" />
            {errors.amount && <p className="text-xs text-brand-red">{errors.amount.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Payment Method</Label>
            <select {...register("method")} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue">
              <option value="CASH">Cash</option>
              <option value="MOBILE_MONEY">Mobile Money</option>
              <option value="BANK">Bank Transfer</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label>Notes</Label>
            <Input {...register("notes")} placeholder="e.g. Paid via Stanbic Bank" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Recording...</> : "Record Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
