"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const schema = z.object({
  amount: z.coerce.number().min(1, "Amount required"),
  method: z.enum(["CASH","BANK_TRANSFER","MOBILE_MONEY","CHEQUE"]),
  paidAt: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  transaction: any; // { id, amount, property, installments }
  onSaved: (result: any) => void;
}

export default function PaymentInstallmentDialog({ open, onClose, transaction, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const totalPaid = (transaction?.installments || []).reduce((s: number, i: any) => s + Number(i.amount), 0);
  const agreed = Number(transaction?.amount) || 0;
  const remaining = Math.max(0, agreed - totalPaid);
  const paidPct = agreed > 0 ? Math.min(100, Math.round((totalPaid / agreed) * 100)) : 0;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { method: "CASH", paidAt: new Date().toISOString().split("T")[0] },
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/${transaction.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success(json.isFullyPaid ? "Payment complete! Property marked as sold." : "Payment recorded.");
      reset();
      onSaved(json);
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  }

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          {/* Summary */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2">
            <div className="font-medium text-sm">{transaction.property?.title}</div>
            <div className="text-xs text-gray-500">{transaction.property?.plotNumber}</div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-500">Total Price</span>
              <span className="font-semibold">UGX {agreed.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Paid</span>
              <span className="font-semibold text-green-600">UGX {totalPaid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Remaining</span>
              <span className="font-bold text-red-500">UGX {remaining.toLocaleString()}</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
              <div className="bg-brand-blue rounded-full h-2 transition-all" style={{ width: `${paidPct}%` }} />
            </div>
            <div className="text-xs text-right text-gray-400">{paidPct}% paid</div>
          </div>

          <div className="space-y-1">
            <Label>Payment Amount (UGX) *</Label>
            <Input {...register("amount")} type="number" placeholder={`Remaining: ${remaining.toLocaleString()}`} />
            {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Payment Method *</Label>
              <select {...register("method")} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="MOBILE_MONEY">Mobile Money</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>Payment Date</Label>
              <Input {...register("paidAt")} type="date" />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Notes</Label>
            <Textarea {...register("notes")} placeholder="Reference number, remarks..." rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={loading} className="bg-brand-blue hover:bg-brand-blue-light text-white">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Recording...</> : "Record Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
