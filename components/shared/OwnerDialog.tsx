"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const schema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  nin: z.string().optional(),
  ninVerified: z.boolean().default(false),
  password: z.string().min(6).optional().or(z.literal("")),
});
type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  owner?: any;
  onSaved: (owner: any) => void;
}

export default function OwnerDialog({ open, onClose, owner, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (owner) reset({ name: owner.name, email: owner.email, phone: owner.phone || "", nin: owner.nin || "", ninVerified: owner.ninVerified });
    else reset({ name: "", email: "", phone: "", nin: "", ninVerified: false, password: "" });
  }, [owner, reset]);

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const url = owner ? `/api/users/${owner.id}` : "/api/auth/register";
      const method = owner ? "PATCH" : "POST";
      const body = owner ? data : { ...data, role: "PUBLIC_USER" };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success(owner ? "Owner updated" : "Owner created");
      onSaved(json);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{owner ? "Edit Owner" : "Add New Owner"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {[
            { id: "name", label: "Full Name *", type: "text", placeholder: "John Doe" },
            { id: "email", label: "Email *", type: "email", placeholder: "john@example.com" },
            { id: "phone", label: "Phone", type: "tel", placeholder: "+256 700 000000" },
            { id: "nin", label: "NIN", type: "text", placeholder: "CM90100012345A" },
          ].map(({ id, label, type, placeholder }) => (
            <div key={id} className="space-y-1">
              <Label htmlFor={id}>{label}</Label>
              <Input id={id} type={type} placeholder={placeholder} {...register(id as any)}
                className={(errors as any)[id] ? "border-brand-red" : ""} />
              {(errors as any)[id] && <p className="text-xs text-brand-red">{(errors as any)[id]?.message}</p>}
            </div>
          ))}
          {!owner && (
            <div className="space-y-1">
              <Label htmlFor="password">Temporary Password *</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register("password")}
                className={errors.password ? "border-brand-red" : ""} />
              {errors.password && <p className="text-xs text-brand-red">{errors.password.message}</p>}
            </div>
          )}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="ninVerified" {...register("ninVerified")} className="rounded" />
            <Label htmlFor="ninVerified" className="cursor-pointer">NIN Verified</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={loading} className="bg-brand-blue hover:bg-brand-blue-light text-white">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
