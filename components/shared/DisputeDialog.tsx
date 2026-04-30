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
  complainantId: z.string().min(1, "Complainant required"),
  title: z.string().min(3, "Title required"),
  description: z.string().min(10, "Description required"),
});
type FormData = z.infer<typeof schema>;

interface Props { open: boolean; onClose: () => void; officerId: string; onSaved: (d: any) => void; }

export default function DisputeDialog({ open, onClose, officerId, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const [propSearch, setPropSearch] = useState(""); const [propResults, setPropResults] = useState<any[]>([]); const [selectedProp, setSelectedProp] = useState<any>(null);
  const [userSearch, setUserSearch] = useState(""); const [userResults, setUserResults] = useState<any[]>([]); const [selectedUser, setSelectedUser] = useState<any>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function searchProps(q: string) {
    if (q.length < 2) return;
    const res = await fetch(`/api/properties?search=${encodeURIComponent(q)}&limit=5`);
    setPropResults((await res.json()).data || []);
  }
  async function searchUsers(q: string) {
    if (q.length < 2) return;
    setUserResults(await (await fetch(`/api/users/search?q=${encodeURIComponent(q)}`)).json());
  }

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const res = await fetch("/api/disputes", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Dispute filed");
      onSaved(json);
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>File Dispute</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <Label>Property *</Label>
            <div className="relative">
              <Input value={selectedProp ? selectedProp.title : propSearch}
                onChange={(e) => { setPropSearch(e.target.value); setSelectedProp(null); searchProps(e.target.value); }} placeholder="Search property..." />
              {propResults.length > 0 && !selectedProp && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                  {propResults.map((p) => (
                    <button key={p.id} onClick={() => { setSelectedProp(p); setValue("propertyId", p.id); setPropResults([]); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-brand-blue-pale text-sm border-b last:border-0">
                      <div className="font-medium">{p.title}</div><div className="text-xs text-gray-400">{p.plotNumber}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.propertyId && <p className="text-xs text-brand-red">{errors.propertyId.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Complainant *</Label>
            <div className="relative">
              <Input value={selectedUser ? selectedUser.name : userSearch}
                onChange={(e) => { setUserSearch(e.target.value); setSelectedUser(null); searchUsers(e.target.value); }} placeholder="Search complainant..." />
              {userResults.length > 0 && !selectedUser && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                  {userResults.map((u) => (
                    <button key={u.id} onClick={() => { setSelectedUser(u); setValue("complainantId", u.id); setUserResults([]); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-brand-blue-pale text-sm border-b last:border-0">
                      {u.name} <span className="text-gray-400 text-xs">· {u.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.complainantId && <p className="text-xs text-brand-red">{errors.complainantId.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Title *</Label>
            <Input {...register("title")} placeholder="e.g. Boundary Encroachment" />
            {errors.title && <p className="text-xs text-brand-red">{errors.title.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Description *</Label>
            <Textarea {...register("description")} placeholder="Describe the dispute in detail..." rows={3} />
            {errors.description && <p className="text-xs text-brand-red">{errors.description.message}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={loading} className="bg-brand-red hover:bg-red-700 text-white">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Filing...</> : "File Dispute"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
