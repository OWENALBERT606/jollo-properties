"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, ChevronLeft, Loader2, Upload, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/shared/MapPicker"), { ssr: false });

const UGANDA_DISTRICTS = ["Kampala","Wakiso","Mukono","Jinja","Entebbe","Gulu","Mbarara","Mbale","Lira","Masaka","Soroti","Arua","Fort Portal","Kabale","Hoima","Masindi","Tororo","Iganga","Busia","Kasese"];

const step1Schema = z.object({
  plotNumber: z.string().min(3, "Plot number required"),
  title: z.string().min(3, "Title required"),
  description: z.string().optional(),
  district: z.string().min(1, "District required"),
  county: z.string().optional(),
  subcounty: z.string().optional(),
  village: z.string().optional(),
  type: z.enum(["LAND","HOUSE","RESIDENTIAL","COMMERCIAL","AGRICULTURAL","INDUSTRIAL","OTHER"]),
  tenure: z.enum(["MAILO","KIBANJA","TITLED","LEASEHOLD","FREEHOLD"]),
  size: z.coerce.number().positive("Size must be positive"),
  sizeUnit: z.string().default("acres"),
  condition: z.string().optional(),
  price: z.coerce.number().optional(),
});

type Step1Data = z.infer<typeof step1Schema>;

interface Owner { userId: string; name: string; email: string; share: number; }
interface UploadedDoc { name: string; type: string; r2Key: string; r2Url: string; mimeType: string; sizeBytes: number; }

const steps = ["Details", "Location", "Ownership", "Documents", "Review & Submit"];

export default function PropertyRegistrationForm({ officerId }: { officerId: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Step 2 state
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [address, setAddress] = useState("");

  // Step 3 state
  const [owners, setOwners] = useState<Owner[]>([]);
  const [ownerSearch, setOwnerSearch] = useState("");
  const [ownerResults, setOwnerResults] = useState<any[]>([]);
  const [ownerShare, setOwnerShare] = useState(100);

  // Step 4 state
  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { sizeUnit: "acres", type: "RESIDENTIAL", tenure: "TITLED" },
  });

  async function searchOwners(q: string) {
    if (q.length < 2) return;
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setOwnerResults(data);
    } catch {}
  }

  function addOwner(user: any) {
    if (owners.find((o) => o.userId === user.id)) return;
    const remaining = 100 - owners.reduce((s, o) => s + o.share, 0);
    setOwners((prev) => [...prev, { userId: user.id, name: user.name, email: user.email, share: remaining }]);
    setOwnerResults([]);
    setOwnerSearch("");
  }

  function removeOwner(userId: string) {
    setOwners((prev) => prev.filter((o) => o.userId !== userId));
  }

  function updateShare(userId: string, share: number) {
    setOwners((prev) => prev.map((o) => o.userId === userId ? { ...o, share } : o));
  }

  const totalShare = owners.reduce((s, o) => s + o.share, 0);

  async function uploadFile(file: File, docType: string) {
    setUploading(true);
    try {
      const urlRes = await fetch("/api/documents/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      const { uploadUrl, key, publicUrl } = await urlRes.json();
      await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      setDocs((prev) => [...prev, {
        name: file.name, type: docType, r2Key: key, r2Url: publicUrl,
        mimeType: file.type, sizeBytes: file.size,
      }]);
      toast.success(`${file.name} uploaded`);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onFinalSubmit() {
    const formData = getValues();
    if (owners.length > 0 && totalShare !== 100) {
      toast.error("Ownership shares must total 100%");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          latitude: lat,
          longitude: lng,
          address,
          owners,
          documents: docs,
          officerId,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Property registered successfully!");
      router.push("/dashboard/officer-home");
    } catch (err: any) {
      toast.error(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Progress */}
      <div className="bg-brand-blue-pale px-6 py-4">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                i < step ? "bg-green-500 text-white" : i === step ? "bg-brand-blue text-white" : "bg-white text-gray-400 border border-gray-200"
              }`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 w-8 sm:w-16 mx-1 transition-all ${i < step ? "bg-green-500" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 text-sm font-medium text-brand-blue">{steps[step]}</div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Step 1 — Details */}
          {step === 0 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <Label>District *</Label>
                  <select {...register("district")} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue">
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
                  <Label>Village</Label>
                  <Input {...register("village")} placeholder="Village" />
                </div>
                <div className="space-y-1">
                  <Label>Property Type *</Label>
                  <select {...register("type")} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue">
                    {["LAND","HOUSE","RESIDENTIAL","COMMERCIAL","AGRICULTURAL","INDUSTRIAL","OTHER"].map((t) => (
                      <option key={t} value={t}>{t.replace("_"," ")}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Tenure *</Label>
                  <select {...register("tenure")} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue">
                    {["MAILO","KIBANJA","TITLED","LEASEHOLD","FREEHOLD"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Size *</Label>
                  <div className="flex gap-2">
                    <Input {...register("size")} type="number" step="0.01" placeholder="0.00" className="flex-1" />
                    <select {...register("sizeUnit")} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue">
                      {["acres","hectares","sqm","sqft"].map((u) => <option key={u} value={u}>{u}</option>)}
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
                <Textarea {...register("description")} placeholder="Property description..." rows={3} />
              </div>
            </motion.div>
          )}

          {/* Step 2 — Location */}
          {step === 1 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <p className="text-sm text-gray-500">Click on the map to place the property pin.</p>
              <div className="h-72 rounded-xl overflow-hidden border border-gray-200">
                <MapPicker lat={lat} lng={lng} onChange={(l, g) => { setLat(l); setLng(g); }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Latitude</Label>
                  <Input value={lat ?? ""} readOnly placeholder="Click map to set" className="bg-gray-50" />
                </div>
                <div className="space-y-1">
                  <Label>Longitude</Label>
                  <Input value={lng ?? ""} readOnly placeholder="Click map to set" className="bg-gray-50" />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Address</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address" />
              </div>
            </motion.div>
          )}

          {/* Step 3 — Ownership */}
          {step === 2 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="space-y-1">
                <Label>Search Owner by Name or NIN</Label>
                <div className="relative">
                  <Input
                    value={ownerSearch}
                    onChange={(e) => { setOwnerSearch(e.target.value); searchOwners(e.target.value); }}
                    placeholder="Type name or NIN..."
                  />
                  {ownerResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                      {ownerResults.map((u) => (
                        <button key={u.id} onClick={() => addOwner(u)}
                          className="w-full text-left px-4 py-2.5 hover:bg-brand-blue-pale text-sm border-b last:border-0">
                          <div className="font-medium">{u.name}</div>
                          <div className="text-xs text-gray-400">{u.email} {u.nin ? `· ${u.nin}` : ""}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {owners.length > 0 && (
                <div className="space-y-2">
                  {owners.map((o) => (
                    <div key={o.userId} className="flex items-center gap-3 bg-brand-blue-pale rounded-lg p-3">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{o.name}</div>
                        <div className="text-xs text-gray-400">{o.email}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number" min={1} max={100} value={o.share}
                          onChange={(e) => updateShare(o.userId, Number(e.target.value))}
                          className="w-20 text-sm"
                        />
                        <span className="text-sm text-gray-500">%</span>
                        <button onClick={() => removeOwner(o.userId)} className="text-brand-red hover:text-red-700">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className={`text-sm font-medium ${totalShare === 100 ? "text-green-600" : "text-brand-red"}`}>
                    Total: {totalShare}% {totalShare !== 100 && "(must equal 100%)"}
                  </div>
                </div>
              )}
              {owners.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">No owners added yet. Search above to add owners.</p>
              )}
            </motion.div>
          )}

          {/* Step 4 — Documents */}
          {step === 3 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {["TITLE_DEED","SURVEY_MAP","AGREEMENT","PHOTO","OTHER"].map((docType) => (
                  <label key={docType} className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-brand-blue hover:bg-brand-blue-pale transition-colors">
                    <Upload className="h-6 w-6 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-600">{docType.replace("_"," ")}</span>
                    <span className="text-xs text-gray-400 mt-0.5">Click to upload</span>
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f, docType); }} />
                  </label>
                ))}
              </div>
              {uploading && (
                <div className="flex items-center gap-2 text-sm text-brand-blue">
                  <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                </div>
              )}
              {docs.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Documents</Label>
                  {docs.map((d, i) => (
                    <div key={i} className="flex items-center justify-between bg-green-50 rounded-lg p-3">
                      <div>
                        <div className="text-sm font-medium text-gray-800">{d.name}</div>
                        <div className="text-xs text-gray-400">{d.type} · {(d.sizeBytes / 1024).toFixed(1)} KB</div>
                      </div>
                      <button onClick={() => setDocs((prev) => prev.filter((_, j) => j !== i))} className="text-brand-red">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 5 — Review */}
          {step === 4 && (
            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="bg-brand-blue-pale rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-brand-blue">Property Details</h3>
                {Object.entries(getValues()).map(([k, v]) => v ? (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-gray-500 capitalize">{k.replace(/([A-Z])/g, " $1")}</span>
                    <span className="font-medium text-gray-800">{String(v)}</span>
                  </div>
                ) : null)}
              </div>
              {(lat || lng) && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Location</h3>
                  <div className="text-sm text-gray-600">Lat: {lat}, Lng: {lng}</div>
                  {address && <div className="text-sm text-gray-600">{address}</div>}
                </div>
              )}
              {owners.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Owners ({owners.length})</h3>
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

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          {step < 4 ? (
            <Button
              onClick={() => {
                if (step === 0) {
                  handleSubmit(() => setStep((s) => s + 1), () => {})();
                } else {
                  setStep((s) => s + 1);
                }
              }}
              className="bg-brand-blue hover:bg-brand-blue-light text-white"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={onFinalSubmit} disabled={submitting} className="bg-green-600 hover:bg-green-700 text-white">
              {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : "Submit Property"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
