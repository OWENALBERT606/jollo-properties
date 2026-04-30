"use client";

import { useState } from "react";
import { Plus, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PropertyRegistrationDialog from "@/components/dashboard/PropertyRegistrationDialog";
import { useRouter } from "next/navigation";

export default function RegisterPageClient({ officerId }: { officerId: string }) {
  const [open, setOpen] = useState(true);
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="text-center">
        <div className="bg-brand-blue-pale rounded-2xl p-6 inline-flex mb-4">
          <Building2 className="h-12 w-12 text-brand-blue" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Register a Property</h1>
        <p className="text-gray-500 mt-2 max-w-sm">
          Add a new land or property listing to the registry with photos, documents, and ownership details.
        </p>
      </div>
      <Button
        onClick={() => setOpen(true)}
        className="bg-brand-red hover:bg-red-700 text-white flex items-center gap-2 h-12 px-8 text-base"
      >
        <Plus className="h-5 w-5" /> Register New Property
      </Button>

      <PropertyRegistrationDialog
        open={open}
        onClose={() => { setOpen(false); router.push("/dashboard/properties"); }}
        officerId={officerId}
        onSaved={() => router.push("/dashboard/properties")}
      />
    </div>
  );
}
