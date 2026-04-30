"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Check, ChevronRight, ChevronLeft, Loader2, Upload, X, Plus,
  Image as ImageIcon, Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import dynamic from "next/dynamic";
import Image from "next/image";

const MapPicker = dynamic(() => import("@/components/shared/MapPicker"), { ssr: false });

const UGANDA_DISTRICTS = [
  "Kampala","Wakiso","Mukono","Jinja","Entebbe","Gulu","Mbarara","Mbale",
  "Lira","Masaka","Soroti","Arua","Fort Portal","Kabale","Hoima","Masindi",
  "Tororo","Iganga","Busia","Kasese","Mityana","Mubende","Nakaseke","Luweero",
];

const PROPERTY_TYPES = [
  { value: "LAND", label: "Land (Plot/Acre)" },
  { value: "RESIDENTIAL", label: "Residential" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "AGRICULTURAL", label: "Agricultural" },
  { value: "INDUSTRIAL", label: "Industrial" },
  { value: "MIXED_USE", label: "Mixed Use" },
];

const step1Schema = z.object({
  plotNumber: z.string().min(3, "Plot number required"),
  title: z.string().min(3, "Title required"),
  description: z.string().optional(),
  district: z.string().min(1, "District required"),
  county: z.string().optional(),
  subcounty: z.string().optional(),
  village: z.string().optional(),
  type: z.enum(["LAND","RESIDENTIAL","COMMERCIAL","AGRICULTURAL","INDUSTRIAL","MIXED_USE"]),
  tenure: z.enum(["MAILO","KIBANJA","TITLED","LEASEHOLD","FREEHOLD"]),
  size: z.coerce.number().positive("Size must be positive"),
  sizeUnit: z.string().default("acres"),
  condition: z.string().optional(),
  price: z.coerce.number().optional(),
  isFeatured: z.boolean().default(false),
  isPublicListing: z.boolean().default(true),
});

type Step1Data = z.infer<typeof step1Schema>;

interface Owner { userId: string; name: string; email: string; share: number; }
interface UploadedDoc { name: string; type: string; r2Key: string; r2Url: string; mimeType: string; sizeBytes: number; }
interface UploadedImage { name: string; r2Key: string; r2Url: string; preview: string; }

const steps = ["Details", "Location", "Ownership", "Photos & Docs", "Review"];

interface Props {
  open: boolean;
  onClose: () => void;
  officerId: string;
  onSaved?: () => void;
}

export default function PropertyRegistrationDialog({ open, onClose, officerId, onSaved }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [address, setAddress] = useState("");

  const [owners, setOwners] = useState<Owner[]>([]);
  const [ownerSearch, setOwnerSearch] = useState("");
  const [ownerResults, setOwnerResults] = useState<any[]>([]);

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, getValues, watch, formState: { errors } } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { sizeUnit: "acres", type: "LAND", tenure: "TITLED", isFeatured: false, isPublicListing: true },
  });

  const propertyType = watch("type");

  function resetAll() {
    setStep(0); setLat(null); setLng(null); setAddress("");
    setOwners([]); setOwnerSearch(""); setOwnerResults([]);
    setImages([]); setDocs([]);
  }

  async function searchOwners(q: string) {
    if (q.length < 2) return;
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      setOwnerResults(await res.json());
    } catch {}
  }

  function addOwner(user: any) {
    if (owners.find((o) => o.userId === user.id)) return;
    const remaining = 100 - owners.reduce((s, o) => s + o.share, 0);
    setOwners((prev) => [...prev, { userId: user.id, name: user.name, email: user.email, share: remaining }]);
    setOwnerResults([]); setOwnerSearch("");
  }

  const totalShare = owners.reduce((s, o) => s + o.share, 0);

  async function uploadToR2(file: File): Promise<{ key: string; publicUrl: string }> {
    const res = await fetch("/api/documents/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, contentType: file.type }),
    });
    const { uploadUrl, key, publicUrl } = await res.json();
    await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
    return { key, publicUrl };
  }

  async function handleImageUpload(files: FileList | null) {
    if (!files) return;
    const remaining = 6 - images.length;
    const toUpload = Array.from(files).slice(0, remaining);
    if (toUpload.length === 0) { toast.error("Maximum 6 images allowed"); return; }
    setUploading(true);
    for (const file of toUpload) {
      try {
        const preview = URL.createObjectURL(file);
        const { key, publicUrl } = await uploadToR2(file);
        setImages((prev) => [...prev, { name: file.name, r2Key: key, r2Url: publicUrl, preview }]);
        toast.success(`${file.name} uploaded`);
      } catch { toast.error(`Failed to upload ${file.name}`); }
    }
    setUploading(false);
  }

  async function handleDocUpload(file: File, docType: string) {
    setUploading(true);
    try {
      const { key, publicUrl } = await uploadToR2(file);
      setDocs((prev) => [...prev, { name: file.name, type: docType, r2Key: key, r2Url: publicUrl, mimeType: file.type, sizeBytes: file.size }]);
      toast.success(`${file.name} uploaded`);
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); }
  }

  async function onFinalSubmit() {
    const formData = getValues();
    if (owners.length > 0 && totalShare !== 100) { toast.error("Ownership shares must total 100%"); return; }
    setSubmitting(true);
    try {
      const allDocs = [
        ...images.map((img) => ({ name: img.name, type: "PHOTO", r2Key: img.r2Key, r2Url: img.r2Url, mimeType: "image/jpeg", sizeBytes: 0 })),
        ...docs,
      ];
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, latitude: lat, longitude: lng, address, owners, documents: allDocs, officerId }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Property registered successfully!");
      resetAll();
      onClose();
      onSaved?.();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Submission failed");
    } finally { setSubmitting(false); }
  }

  const sel = "w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue";

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) { resetAll(); onClose(); } }}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b border-gray-100 bg-brand-blue text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-lg p-2"><Building2 className="h-5 w-5" /></div>
            <div>
              <SheetTitle className="text-white text-lg">Register Property</SheetTitle>
              <p className="text-blue-200 text-xs mt-0.5">Step {step + 1} of {steps.length} — {steps[step]}</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="flex gap-1 mt-3">
            {steps.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? "bg-white" : "bg-white/20"}`} />
            ))}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">

            {/* ── Step 1: Details ── */}
            {step === 0 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Plot Number *</Label>
                    <Input {...register("plotNumber")} placeholder="e.g. KLA-001-2024" />
                    {errors.plotNumber && <p className="text-xs text-brand-red">{errors.plotNumber.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label>Title *</Label>
                    <Input {...register("title")} placeholder="Property title" />
                    {errors.title && <p className="text-xs text-brand-red">{errors.title.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label>Property Type *</Label>
                    <select {...register("type")} className={sel}>
                      {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label>Tenure *</Label>
                    <select {...register("tenure")} className={sel}>
                      {["MAILO","KIBANJA","TITLED","LEASEHOLD","FREEHOLD"].map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label>District *</Label>
                    <select {...register("district")} className={sel}>
                      <option value="">Select district</option>
                      {UGANDA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {errors.district && <p className="text-xs text-brand-red">{errors.district.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label>County</Label>
                    <Input {...register("county")} placeholder="County" />
                  </div>
                  <div className="space-y-1">
                    <Label>Sub-county</Label>
                    <Input {...register("subcounty")} placeholder="Sub-county" />
                  </div>
                  <div className="space-y-1">
                    <Label>Village / Street</Label>
                    <Input {...register("village")} placeholder="Village or street" />
                  </div>
                  <div className="space-y-1">
                    <Label>Size *</Label>
                    <div className="flex gap-2">
                      <Input {...register("size")} type="number" step="0.01" placeholder="0.00" className="flex-1" />
                      <select {...register("sizeUnit")} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue">
                        {["acres","hectares","sqm","sqft","decimals"].map((u) => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                    {errors.size && <p className="text-xs text-brand-red">{errors.size.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label>Price (UGX)</Label>
                    <Input {...register("price")} type="number" placeholder="e.g. 150000000" />
                  </div>
                  <div className="space-y-1">
                    <Label>Condition</Label>
                    <Input {...register("condition")} placeholder="e.g. Good, Excellent" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Description</Label>
                  <Textarea {...register("description")} placeholder="Describe the property..." rows={3} />
                </div>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register("isPublicListing")} className="rounded" />
                    <span className="text-sm text-gray-700">Public Listing</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register("isFeatured")} className="rounded" />
                    <span className="text-sm text-gray-700">Featured</span>
                  </label>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Location ── */}
            {step === 1 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <p className="text-sm text-gray-500">Click on the map to pin the exact property location.</p>
                <div className="h-72 rounded-xl overflow-hidden border border-gray-200">
                  <MapPicker lat={lat} lng={lng} onChange={(l, g) => { setLat(l); setLng(g); }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Latitude</Label>
                    <Input value={lat ?? ""} readOnly className="bg-gray-50 text-sm" placeholder="Click map" />
                  </div>
                  <div className="space-y-1">
                    <Label>Longitude</Label>
                    <Input value={lng ?? ""} readOnly className="bg-gray-50 text-sm" placeholder="Click map" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Full Address</Label>
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. Plot 12, Kololo Hill Drive, Kampala" />
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Ownership ── */}
            {step === 2 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="space-y-1">
                  <Label>Search Owner by Name or NIN</Label>
                  <div className="relative">
                    <Input value={ownerSearch} onChange={(e) => { setOwnerSearch(e.target.value); searchOwners(e.target.value); }} placeholder="Type name or NIN..." />
                    {ownerResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 mt-1">
                        {ownerResults.map((u) => (
                          <button key={u.id} onClick={() => addOwner(u)} className="w-full text-left px-4 py-2.5 hover:bg-brand-blue-pale text-sm border-b last:border-0">
                            <div className="font-medium">{u.name}</div>
                            <div className="text-xs text-gray-400">{u.email}{u.nin ? ` · ${u.nin}` : ""}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {owners.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8 bg-gray-50 rounded-xl">No owners added yet</p>
                ) : (
                  <div className="space-y-2">
                    {owners.map((o) => (
                      <div key={o.userId} className="flex items-center gap-3 bg-brand-blue-pale rounded-lg p-3">
                        <div className="flex-1">
                          <div className="text-sm font-medium">{o.name}</div>
                          <div className="text-xs text-gray-400">{o.email}</div>
                        </div>
                        <Input type="number" min={1} max={100} value={o.share}
                          onChange={(e) => setOwners((prev) => prev.map((ow) => ow.userId === o.userId ? { ...ow, share: Number(e.target.value) } : ow))}
                          className="w-20 text-sm" />
                        <span className="text-sm text-gray-500">%</span>
                        <button onClick={() => setOwners((prev) => prev.filter((ow) => ow.userId !== o.userId))} className="text-brand-red">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <p className={`text-sm font-medium ${totalShare === 100 ? "text-green-600" : "text-brand-red"}`}>
                      Total: {totalShare}% {totalShare !== 100 && "(must equal 100%)"}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Step 4: Photos & Documents ── */}
            {step === 3 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                {/* Photo upload — up to 6 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base font-semibold">Property Photos</Label>
                    <span className="text-xs text-gray-400">{images.length}/6 photos</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {images.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                        <Image src={img.preview} alt={img.name} fill className="object-cover" sizes="150px" />
                        <button onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                          className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="h-3 w-3" />
                        </button>
                        {i === 0 && <span className="absolute bottom-1.5 left-1.5 bg-brand-blue text-white text-xs px-2 py-0.5 rounded-full">Cover</span>}
                      </div>
                    ))}
                    {images.length < 6 && (
                      <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-brand-blue hover:bg-brand-blue-pale transition-colors">
                        <ImageIcon className="h-6 w-6 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-400">Add Photo</span>
                        <input type="file" multiple accept="image/*" className="hidden"
                          onChange={(e) => handleImageUpload(e.target.files)} />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">First photo will be the cover image. Max 6 photos.</p>
                </div>

                {/* Document upload */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Documents</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {["TITLE_DEED","SURVEY_MAP","AGREEMENT","OTHER"].map((docType) => (
                      <label key={docType} className="flex items-center gap-3 border border-dashed border-gray-200 rounded-xl p-3 cursor-pointer hover:border-brand-blue hover:bg-brand-blue-pale transition-colors">
                        <Upload className="h-5 w-5 text-gray-400 shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-700">{docType.replace("_", " ")}</div>
                          <div className="text-xs text-gray-400">PDF, DOC, JPG</div>
                        </div>
                        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleDocUpload(f, docType); }} />
                      </label>
                    ))}
                  </div>
                  {uploading && <div className="flex items-center gap-2 text-sm text-brand-blue mt-2"><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</div>}
                  {docs.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {docs.map((d, i) => (
                        <div key={i} className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                          <div>
                            <div className="text-sm font-medium">{d.name}</div>
                            <div className="text-xs text-gray-400">{d.type} · {(d.sizeBytes / 1024).toFixed(1)} KB</div>
                          </div>
                          <button onClick={() => setDocs((prev) => prev.filter((_, j) => j !== i))} className="text-brand-red"><X className="h-4 w-4" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── Step 5: Review ── */}
            {step === 4 && (
              <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="bg-brand-blue-pale rounded-xl p-4 space-y-2">
                  <h3 className="font-semibold text-brand-blue mb-3">Property Summary</h3>
                  {Object.entries(getValues()).filter(([, v]) => v !== undefined && v !== "" && v !== false).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm py-1 border-b border-blue-100 last:border-0">
                      <span className="text-gray-500 capitalize">{k.replace(/([A-Z])/g, " $1")}</span>
                      <span className="font-medium text-gray-800 text-right max-w-[60%] truncate">{String(v)}</span>
                    </div>
                  ))}
                </div>
                {images.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-700 mb-3">Photos ({images.length})</h3>
                    <div className="flex gap-2 flex-wrap">
                      {images.map((img, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                          <Image src={img.preview} alt="" fill className="object-cover" sizes="64px" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {owners.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Owners</h3>
                    {owners.map((o) => (
                      <div key={o.userId} className="flex justify-between text-sm py-1">
                        <span>{o.name}</span><span className="font-medium">{o.share}%</span>
                      </div>
                    ))}
                  </div>
                )}
                {docs.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Documents ({docs.length})</h3>
                    {docs.map((d, i) => <div key={i} className="text-sm text-gray-600">{d.name} ({d.type})</div>)}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer navigation */}
        <div className="border-t border-gray-100 px-6 py-4 flex justify-between bg-white">
          <Button variant="outline" onClick={() => step === 0 ? onClose() : setStep((s) => s - 1)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> {step === 0 ? "Cancel" : "Back"}
          </Button>
          {step < 4 ? (
            <Button
              onClick={() => step === 0 ? handleSubmit(() => setStep(1), () => {})() : setStep((s) => s + 1)}
              className="bg-brand-blue hover:bg-brand-blue-light text-white"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={onFinalSubmit} disabled={submitting} className="bg-brand-red hover:bg-red-700 text-white">
              {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : "Submit Property"}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
