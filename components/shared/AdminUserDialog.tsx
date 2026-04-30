"use client";

import { useEffect, useState } from "react";
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
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  nin: z.string().optional(),
  role: z.enum(["ADMIN","LAND_OFFICER","PUBLIC_USER"]),
  password: z.string().min(6).optional().or(z.literal("")),
});
type FormData = z.infer<typeof schema>;

interface Props { open: boolean; onClose: () => void; user?: any; onSaved: (u: any) => void; }

export default function AdminUserDialog({ open, onClose, user, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (user) reset({ name: user.name, email: user.email, phone: user.phone || "", nin: user.nin || "", role: user.role });
    else reset({ name: "", email: "", phone: "", nin: "", role: "PUBLIC_USER", password: "" });
  }, [user, reset]);

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const url = user ? `/api/users/${user.id}` : "/api/auth/register";
      const method = user ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success(user ? "User updated" : "User created");
      onSaved(json);
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{user ? "Edit User" : "Add New User"}</DialogTitle></DialogHeader>
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
          <div className="space-y-1">
            <Label>Role *</Label>
            <select {...register("role")} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue">
              <option value="PUBLIC_USER">Public User</option>
              <option value="LAND_OFFICER">Land Officer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          {!user && (
            <div className="space-y-1">
              <Label>Temporary Password *</Label>
              <Input type="password" placeholder="••••••••" {...register("password")}
                className={errors.password ? "border-brand-red" : ""} />
              {errors.password && <p className="text-xs text-brand-red">{errors.password.message}</p>}
            </div>
          )}
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
