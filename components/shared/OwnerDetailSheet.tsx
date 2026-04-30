"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

interface Props { owner: any; open: boolean; onClose: () => void; }

export default function OwnerDetailSheet({ owner, open, onClose }: Props) {
  const [ownerships, setOwnerships] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !owner) return;
    setLoading(true);
    fetch(`/api/users/${owner.id}/ownerships`)
      .then((r) => r.json())
      .then((d) => setOwnerships(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, owner]);

  const initials = owner?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Owner Details</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-brand-blue text-white text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-gray-900 text-lg">{owner?.name}</div>
              <div className="text-sm text-gray-500">{owner?.email}</div>
              {owner?.phone && <div className="text-sm text-gray-400">{owner.phone}</div>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">NIN</div>
              <div className="text-sm font-medium flex items-center gap-1">
                {owner?.nin || "—"}
                {owner?.nin && (owner?.ninVerified
                  ? <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                  : <XCircle className="h-3.5 w-3.5 text-gray-300" />)}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Joined</div>
              <div className="text-sm font-medium">
                {owner?.createdAt ? formatDistanceToNow(new Date(owner.createdAt), { addSuffix: true }) : "—"}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Properties Owned
            </h3>
            {loading ? (
              <div className="space-y-2">{[1,2,3].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
            ) : ownerships.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No properties owned</p>
            ) : (
              <div className="space-y-2">
                {ownerships.map((o: any) => (
                  <div key={o.id} className="bg-brand-blue-pale rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{o.property?.title}</div>
                      <div className="text-xs text-gray-400">{o.property?.plotNumber} · {o.property?.district}</div>
                    </div>
                    <Badge variant="secondary">{Number(o.sharePercentage)}%</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
