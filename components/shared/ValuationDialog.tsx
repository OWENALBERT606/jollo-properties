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
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const schema = z.object({
  propertyId: z.string().min(1, "Property required"),
  valuedAmount: z.coerce.number().positive(),
  taxRate: z.coerce.number().min(0).max(1).default(0.01),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface Props { open: boolean; onClose: () => void; officerId: string; onSaved: (v: any) => void; }

export default function ValuationDialog({ open, onClose, officerId, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const [propSearch, setPropSearch] = useState("");
  const [propResults, setPropResults] = useState<any[]>([]);
  const [selectedProp, setSelectedProp] = useState<any>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { taxRate: 0.01 },
  });

  const valuedAmount = watch("valuedAmount") || 0;
  const taxRate = watch("taxRate") || 0.01;
  const taxAmount = Number(valuedAmount) * Number(taxRate);

  async function searchProps(q: string) {
    if (q.length < 2) return;
    const res = await fetch(`/api/properties?search=${encodeURIComponent(q)}&limit=5`);
    const data = await res.json();
    setPropResults(data.data || []);
  }

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const res = await fetch("/api/valuations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, officerId, taxAmount }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Valuation created");
      onSaved(json);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white dark:bg-gray-800">
        <DialogHeader><DialogTitle>New Valuation</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <Label>Property *</Label>
            <div className="relative">
              <Input value={selectedProp ? selectedProp.title : propSearch}
                onChange={(e) => { setPropSearch(e.target.value); setSelectedProp(null); searchProps(e.target.value); }}
                placeholder="Search property..." />
              {propResults.length > 0 && !selectedProp && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 mt-1">
                  {propResults.map((p) => (
                    <button key={p.id} onClick={() => { setSelectedProp(p); setValue("propertyId", p.id); setPropResults([]); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-brand-blue-pale dark:hover:bg-gray-700 text-sm border-b last:border-0 dark:border-gray-700 dark:text-gray-200">
                      <div className="font-medium dark:text-white">{p.title}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">{p.plotNumber}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.propertyId && <p className="text-xs text-brand-red">{errors.propertyId.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Assessed Value (UGX) *</Label>
              <Input {...register("valuedAmount")} type="number" placeholder="e.g. 450000000" />
              {errors.valuedAmount && <p className="text-xs text-brand-red">{errors.valuedAmount.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Tax Rate (e.g. 0.01 = 1%)</Label>
              <Input {...register("taxRate")} type="number" step="0.001" placeholder="0.01" />
            </div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">Calculated Tax Amount</div>
            <div className="text-lg font-bold text-amber-700 dark:text-amber-300">UGX {taxAmount.toLocaleString()}</div>
          </div>
          <div className="space-y-1">
            <Label>Notes</Label>
            <Textarea {...register("notes")} placeholder="Valuation notes..." rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={loading} className="bg-brand-blue hover:bg-brand-blue-light text-white">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : "Create Valuation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
