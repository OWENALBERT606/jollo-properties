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
  type: z.enum(["SALE","LEASE","TRANSFER","MORTGAGE"]),
  propertyId: z.string().min(1, "Property required"),
  buyerId: z.string().optional(),
  sellerId: z.string().optional(),
  amount: z.coerce.number().optional(),
  currency: z.string().default("UGX"),
  agreementDate: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface Props { open: boolean; onClose: () => void; officerId: string; onSaved: (tx: any) => void; }

export default function TransactionDialog({ open, onClose, officerId, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const [propSearch, setPropSearch] = useState("");
  const [propResults, setPropResults] = useState<any[]>([]);
  const [selectedProp, setSelectedProp] = useState<any>(null);
  const [buyerSearch, setBuyerSearch] = useState("");
  const [buyerResults, setBuyerResults] = useState<any[]>([]);
  const [selectedBuyer, setSelectedBuyer] = useState<any>(null);
  const [sellerSearch, setSellerSearch] = useState("");
  const [sellerResults, setSellerResults] = useState<any[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<any>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "SALE", currency: "UGX" },
  });

  async function searchProps(q: string) {
    if (q.length < 2) return;
    const res = await fetch(`/api/admin/properties?search=${encodeURIComponent(q)}&limit=5`);
    const data = await res.json();
    setPropResults(data.data || []);
  }

  async function searchUsers(q: string) {
    if (q.length < 2) return;
    const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setBuyerResults(Array.isArray(data) ? data : data.users || []);
  }

  async function searchSellers(q: string) {
    if (q.length < 2) return;
    const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setSellerResults(Array.isArray(data) ? data : data.users || []);
  }

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, initiatedById: officerId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Transaction recorded");
      onSaved(json);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white dark:bg-gray-800">
        <DialogHeader><DialogTitle>Record Transaction</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto pr-1">
          <div className="space-y-1">
            <Label className="text-gray-700 dark:text-gray-300">Transaction Type *</Label>
            <select {...register("type")} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue">
              {["SALE","LEASE","TRANSFER","MORTGAGE"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

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
                      className="w-full text-left px-4 py-2.5 hover:bg-brand-blue-pale dark:hover:bg-gray-700 text-sm border-b last:border-0 dark:border-gray-700">
                      <div className="font-medium dark:text-white">{p.title}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">{p.plotNumber}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.propertyId && <p className="text-xs text-brand-red">{errors.propertyId.message}</p>}
          </div>

          <div className="space-y-1">
            <Label>Buyer</Label>
            <div className="relative">
              <Input value={selectedBuyer ? selectedBuyer.name : buyerSearch}
                onChange={(e) => { setBuyerSearch(e.target.value); setSelectedBuyer(null); searchUsers(e.target.value); }}
                placeholder="Search buyer..." />
              {buyerResults.length > 0 && !selectedBuyer && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 mt-1">
                  {buyerResults.map((u) => (
                    <button key={u.id} onClick={() => { setSelectedBuyer(u); setValue("buyerId", u.id); setBuyerResults([]); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-brand-blue-pale dark:hover:bg-gray-700 text-sm border-b last:border-0 dark:border-gray-700 dark:text-gray-200">
                      {u.name} <span className="text-gray-400 dark:text-gray-500 text-xs">· {u.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label>Seller</Label>
            <div className="relative">
              <Input value={selectedSeller ? selectedSeller.name : sellerSearch}
                onChange={(e) => { setSellerSearch(e.target.value); setSelectedSeller(null); searchSellers(e.target.value); }}
                placeholder="Search seller..." />
              {sellerResults.length > 0 && !selectedSeller && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 mt-1">
                  {sellerResults.map((u) => (
                    <button key={u.id} onClick={() => { setSelectedSeller(u); setValue("sellerId", u.id); setSellerResults([]); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-brand-blue-pale dark:hover:bg-gray-700 text-sm border-b last:border-0 dark:border-gray-700 dark:text-gray-200">
                      {u.name} <span className="text-gray-400 dark:text-gray-500 text-xs">· {u.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Amount (UGX)</Label>
              <Input {...register("amount")} type="number" placeholder="e.g. 150000000" />
            </div>
            <div className="space-y-1">
              <Label>Agreement Date</Label>
              <Input {...register("agreementDate")} type="date" />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Notes</Label>
            <Textarea {...register("notes")} placeholder="Additional notes..." rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={loading} className="bg-brand-blue hover:bg-brand-blue-light text-white">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : "Record"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
