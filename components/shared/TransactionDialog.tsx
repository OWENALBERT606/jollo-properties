"use client";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ChevronDown, ChevronUp, Paperclip, X, Upload, FileText, Archive } from "lucide-react";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/octet-stream",
  "image/jpeg",
  "image/png",
  "image/webp",
];

interface UploadedFile {
  name: string;
  r2Key: string;
  r2Url: string;
  mimeType: string;
  sizeBytes: number;
  docType: string;
}

const schema = z.object({
  type: z.enum(["SALE", "LEASE", "TRANSFER", "MORTGAGE"]),
  propertyId: z.string().min(1, "Property required"),
  buyerName: z.string().min(2, "Buyer name required"),
  buyerNin: z.string().min(5, "National ID required"),
  buyerPhone: z.string().min(7, "Phone required"),
  buyerEmail: z.string().email().optional().or(z.literal("")),
  agreedPrice: z.coerce.number().min(0).optional(),
  discountLabel: z.string().optional(),
  discountAmount: z.coerce.number().min(0).optional(),
  currency: z.string().default("UGX"),
  agreementDate: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface Props { open: boolean; onClose: () => void; officerId: string; onSaved: (tx: any) => void; }

function fileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return <FileText className="h-4 w-4 text-blue-500" />;
  if (mimeType.includes("zip")) return <Archive className="h-4 w-4 text-amber-500" />;
  return <FileText className="h-4 w-4 text-brand-red" />;
}

export default function TransactionDialog({ open, onClose, officerId, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const [propSearch, setPropSearch] = useState("");
  const [propResults, setPropResults] = useState<any[]>([]);
  const [selectedProp, setSelectedProp] = useState<any>(null);
  const [showDiscount, setShowDiscount] = useState(false);
  const [agreedPriceVal, setAgreedPriceVal] = useState(0);
  const [discountAmountVal, setDiscountAmountVal] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "SALE", currency: "UGX" },
  });

  const netAmount = Math.max(0, agreedPriceVal - discountAmountVal);

  function handleClose() {
    reset();
    setPropSearch(""); setSelectedProp(null); setPropResults([]);
    setShowDiscount(false);
    setAgreedPriceVal(0); setDiscountAmountVal(0);
    setUploadedFiles([]);
    onClose();
  }

  async function searchProps(q: string) {
    if (q.length < 2) return;
    const res = await fetch(`/api/admin/properties?search=${encodeURIComponent(q)}&limit=8`);
    const data = await res.json();
    setPropResults(data.data || []);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const results: UploadedFile[] = [];
    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type) && !file.name.endsWith(".zip")) {
        toast.error(`${file.name}: only PDF, ZIP, or image files allowed`);
        continue;
      }
      try {
        const { uploadUrl, key, publicUrl } = await (await fetch("/api/documents/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, contentType: file.type || "application/octet-stream" }),
        })).json();

        const put = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type || "application/octet-stream" },
        });
        if (!put.ok) throw new Error("Upload failed");

        results.push({
          name: file.name,
          r2Key: key,
          r2Url: publicUrl,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size,
          docType: "AGREEMENT",
        });
        toast.success(`${file.name} uploaded`);
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    setUploadedFiles((prev) => [...prev, ...results]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSubmit(data: FormData) {
    if (!selectedProp) { toast.error("Please select a property"); return; }
    setLoading(true);
    try {
      const payload = {
        type: data.type,
        propertyId: data.propertyId,
        agreedPrice: agreedPriceVal || undefined,
        discountLabel: data.discountLabel || undefined,
        discountAmount: discountAmountVal || undefined,
        amount: netAmount || agreedPriceVal || undefined,
        currency: data.currency,
        agreementDate: data.agreementDate || undefined,
        notes: data.notes || undefined,
        buyer: {
          name: data.buyerName,
          nin: data.buyerNin,
          phone: data.buyerPhone,
          email: data.buyerEmail || undefined,
        },
        documents: uploadedFiles,
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
      <DialogContent className="max-w-2xl bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle>Record Transaction</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 max-h-[75vh] overflow-y-auto pr-1">

          {/* Transaction Type */}
          <div className="space-y-1">
            <Label>Transaction Type *</Label>
            <select {...register("type")} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue">
              {["SALE", "LEASE", "TRANSFER", "MORTGAGE"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Property search */}
          <div className="space-y-1">
            <Label>Property *</Label>
            <div className="relative">
              <Input
                value={selectedProp ? selectedProp.title : propSearch}
                onChange={(e) => { setPropSearch(e.target.value); setSelectedProp(null); searchProps(e.target.value); }}
                placeholder="Search by title or plot number..."
              />
              {propResults.length > 0 && !selectedProp && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 mt-1 max-h-48 overflow-y-auto">
                  {propResults.map((p) => (
                    <button key={p.id} type="button" onClick={() => {
                      setSelectedProp(p); setValue("propertyId", p.id); setPropResults([]);
                      const price = Number(p.price) || 0;
                      setAgreedPriceVal(price);
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
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pricing</p>
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

          {/* Buyer Details */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Buyer Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Full Name *</Label>
                <Input {...register("buyerName")} placeholder="John Doe" />
                {errors.buyerName && <p className="text-xs text-red-500">{errors.buyerName.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>National ID (NIN) *</Label>
                <Input {...register("buyerNin")} placeholder="CM90100012345A" />
                {errors.buyerNin && <p className="text-xs text-red-500">{errors.buyerNin.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Phone *</Label>
                <Input {...register("buyerPhone")} placeholder="+256 700 000000" />
                {errors.buyerPhone && <p className="text-xs text-red-500">{errors.buyerPhone.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input {...register("buyerEmail")} type="email" placeholder="buyer@email.com" />
                {errors.buyerEmail && <p className="text-xs text-red-500">{errors.buyerEmail.message}</p>}
              </div>
            </div>
          </div>

          {/* Agreement Date + Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Agreement Date</Label>
              <Input {...register("agreementDate")} type="date" />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Notes</Label>
            <Textarea {...register("notes")} placeholder="Additional notes, terms..." rows={2} />
          </div>

          {/* Document Attachments */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Attachments</p>
                <p className="text-xs text-gray-400">Upload buyer ID copies, agreements, or any supporting docs (PDF, ZIP, images)</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="flex items-center gap-1.5 shrink-0">
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                {uploading ? "Uploading..." : "Add Files"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.zip,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                {uploadedFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
                    {fileIcon(f.mimeType)}
                    <span className="text-sm flex-1 truncate">{f.name}</span>
                    <span className="text-xs text-gray-400">{(f.sizeBytes / 1024).toFixed(0)} KB</span>
                    <button type="button" onClick={() => setUploadedFiles((p) => p.filter((_, idx) => idx !== i))}>
                      <X className="h-3.5 w-3.5 text-gray-400 hover:text-brand-red" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {uploadedFiles.length === 0 && (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl py-6 flex flex-col items-center gap-2 text-gray-400 hover:border-brand-blue hover:text-brand-blue transition-colors">
                <Paperclip className="h-5 w-5" />
                <span className="text-sm">Click to attach files</span>
                <span className="text-xs">PDF, ZIP, JPG, PNG supported</span>
              </button>
            )}
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading || uploading}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={loading || uploading} className="bg-brand-blue hover:bg-brand-blue-light text-white">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : "Record Transaction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
