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
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";

const schema = z.object({
  type: z.enum(["SALE","LEASE","TRANSFER","MORTGAGE"]),
  propertyId: z.string().min(1, "Property required"),
  buyerId: z.string().optional(),
  sellerId: z.string().optional(),
  agreedPrice: z.coerce.number().min(0).optional(),
  discountLabel: z.string().optional(),
  discountAmount: z.coerce.number().min(0).optional(),
  currency: z.string().default("UGX"),
  agreementDate: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface Props { open: boolean; onClose: () => void; officerId: string; onSaved: (tx: any) => void; }

export default function TransactionDialog({ open, onClose, officerId, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const [propSearch, setPropSearch] = useState(""); const [propResults, setPropResults] = useState<any[]>([]); const [selectedProp, setSelectedProp] = useState<any>(null);
  const [buyerSearch, setBuyerSearch] = useState(""); const [buyerResults, setBuyerResults] = useState<any[]>([]); const [selectedBuyer, setSelectedBuyer] = useState<any>(null);
  const [sellerSearch, setSellerSearch] = useState(""); const [sellerResults, setSellerResults] = useState<any[]>([]); const [selectedSeller, setSelectedSeller] = useState<any>(null);
  const [showDiscount, setShowDiscount] = useState(false);
  const [agreedPriceVal, setAgreedPriceVal] = useState(0);
  const [discountAmountVal, setDiscountAmountVal] = useState(0);

  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "SALE", currency: "UGX" },
  });

  const netAmount = Math.max(0, agreedPriceVal - discountAmountVal);

  function handleClose() {
    reset();
    setPropSearch(""); setSelectedProp(null);
    setBuyerSearch(""); setSelectedBuyer(null);
    setSellerSearch(""); setSelectedSeller(null);
    setShowDiscount(false);
    setAgreedPriceVal(0);
    setDiscountAmountVal(0);
    onClose();
  }

  async function searchProps(q: string) {
    if (q.length < 2) return;
    const res = await fetch(`/api/admin/properties?search=${encodeURIComponent(q)}&limit=8`);
    const data = await res.json();
    setPropResults(data.data || []);
  }
  async function searchBuyers(q: string) {
    if (q.length < 2) return;
    const data = await (await fetch(`/api/users/search?q=${encodeURIComponent(q)}`)).json();
    setBuyerResults(Array.isArray(data) ? data : []);
  }
  async function searchSellers(q: string) {
    if (q.length < 2) return;
    const data = await (await fetch(`/api/users/search?q=${encodeURIComponent(q)}`)).json();
    setSellerResults(Array.isArray(data) ? data : []);
  }

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const payload = {
        ...data,
        initiatedById: officerId,
        agreedPrice: agreedPriceVal || undefined,
        discountAmount: discountAmountVal || undefined,
        amount: netAmount || agreedPriceVal || undefined,
      };
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Transaction recorded");
      onSaved(json);
      handleClose();
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-white dark:bg-gray-800">
        <DialogHeader><DialogTitle>Record Transaction</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2 max-h-[70vh] overflow-y-auto pr-1">

          <div className="space-y-1">
            <Label>Transaction Type *</Label>
            <select {...register("type")} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue">
              {["SALE","LEASE","TRANSFER","MORTGAGE"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Property search */}
          <div className="space-y-1">
            <Label>Property *</Label>
            <div className="relative">
              <Input value={selectedProp ? selectedProp.title : propSearch}
                onChange={(e) => { setPropSearch(e.target.value); setSelectedProp(null); searchProps(e.target.value); }}
                placeholder="Search property by title or plot number..." />
              {propResults.length > 0 && !selectedProp && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 mt-1 max-h-48 overflow-y-auto">
                  {propResults.map((p) => (
                    <button key={p.id} type="button" onClick={() => {
                      setSelectedProp(p); setValue("propertyId", p.id); setPropResults([]);
                      const price = Number(p.price) || 0;
                      setAgreedPriceVal(price);
                      setValue("agreedPrice", price as any);
                    }} className="w-full text-left px-4 py-2.5 hover:bg-brand-blue-pale dark:hover:bg-gray-700 text-sm border-b last:border-0 dark:border-gray-700">
                      <div className="font-medium dark:text-white">{p.title}</div>
                      <div className="text-xs text-gray-400">{p.plotNumber} · {p.price ? `UGX ${Number(p.price).toLocaleString()}` : "No price set"}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.propertyId && <p className="text-xs text-red-500">{errors.propertyId.message}</p>}
          </div>

          {/* Price breakdown */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
            <div className="space-y-1">
              <Label>Agreed Price (UGX) *</Label>
              <Input type="number" value={agreedPriceVal || ""} onChange={(e) => setAgreedPriceVal(Number(e.target.value))} placeholder="e.g. 150000000" />
            </div>

            <button type="button" onClick={() => setShowDiscount(!showDiscount)}
              className="flex items-center gap-1.5 text-xs text-brand-blue font-medium">
              {showDiscount ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {showDiscount ? "Remove" : "Add"} Discount / Waiver
            </button>

            {showDiscount && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Discount Label</Label>
                  <Input {...register("discountLabel")} placeholder="e.g. Loyalty Discount" className="text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Discount Amount (UGX)</Label>
                  <Input type="number" value={discountAmountVal || ""} onChange={(e) => setDiscountAmountVal(Number(e.target.value))} placeholder="0" className="text-sm" />
                </div>
              </div>
            )}

            {agreedPriceVal > 0 && (
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Net Amount Payable</span>
                <span className="text-lg font-bold text-brand-blue">UGX {netAmount.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Buyer */}
          <div className="space-y-1">
            <Label>Buyer</Label>
            <div className="relative">
              <Input value={selectedBuyer ? selectedBuyer.name : buyerSearch}
                onChange={(e) => { setBuyerSearch(e.target.value); setSelectedBuyer(null); searchBuyers(e.target.value); }}
                placeholder="Search buyer by name or email..." />
              {buyerResults.length > 0 && !selectedBuyer && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 mt-1">
                  {buyerResults.map((u) => (
                    <button key={u.id} type="button" onClick={() => { setSelectedBuyer(u); setValue("buyerId", u.id); setBuyerResults([]); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-brand-blue-pale dark:hover:bg-gray-700 text-sm border-b last:border-0 dark:text-gray-200">
                      {u.name} <span className="text-xs text-gray-400">· {u.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Seller */}
          <div className="space-y-1">
            <Label>Seller</Label>
            <div className="relative">
              <Input value={selectedSeller ? selectedSeller.name : sellerSearch}
                onChange={(e) => { setSellerSearch(e.target.value); setSelectedSeller(null); searchSellers(e.target.value); }}
                placeholder="Search seller by name or email..." />
              {sellerResults.length > 0 && !selectedSeller && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 mt-1">
                  {sellerResults.map((u) => (
                    <button key={u.id} type="button" onClick={() => { setSelectedSeller(u); setValue("sellerId", u.id); setSellerResults([]); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-brand-blue-pale dark:hover:bg-gray-700 text-sm border-b last:border-0 dark:text-gray-200">
                      {u.name} <span className="text-xs text-gray-400">· {u.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label>Agreement Date</Label>
            <Input {...register("agreementDate")} type="date" />
          </div>

          <div className="space-y-1">
            <Label>Notes</Label>
            <Textarea {...register("notes")} placeholder="Additional notes..." rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={loading} className="bg-brand-blue hover:bg-brand-blue-light text-white">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : "Record Transaction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
