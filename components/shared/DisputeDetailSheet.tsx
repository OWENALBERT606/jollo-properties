"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const statusColors: Record<string, string> = {
  FILED: "bg-yellow-100 text-yellow-700",
  UNDER_INVESTIGATION: "bg-blue-100 text-blue-700",
  HEARING: "bg-purple-100 text-purple-700",
  RESOLVED: "bg-green-100 text-green-700",
  DISMISSED: "bg-gray-100 text-gray-600",
};

const statuses = ["FILED","UNDER_INVESTIGATION","HEARING","RESOLVED","DISMISSED"];

interface Props { dispute: any; open: boolean; onClose: () => void; officerId: string; onUpdated: (d: any) => void; }

export default function DisputeDetailSheet({ dispute, open, onClose, officerId, onUpdated }: Props) {
  const [notes, setNotes] = useState(dispute.notes || []);
  const [newNote, setNewNote] = useState("");
  const [resolution, setResolution] = useState(dispute.resolution || "");
  const [status, setStatus] = useState(dispute.status);
  const [loading, setLoading] = useState(false);

  async function addNote() {
    if (!newNote.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/disputes/${dispute.id}/notes`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: newNote, addedById: officerId }),
      });
      const note = await res.json();
      setNotes((p: any[]) => [...p, note]);
      setNewNote("");
      toast.success("Note added");
    } catch { toast.error("Failed to add note"); }
    finally { setLoading(false); }
  }

  async function updateStatus() {
    setLoading(true);
    try {
      const res = await fetch(`/api/disputes/${dispute.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, resolution }),
      });
      const updated = await res.json();
      toast.success("Dispute updated");
      onUpdated({ ...dispute, ...updated, notes });
    } catch { toast.error("Update failed"); }
    finally { setLoading(false); }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader><SheetTitle>Dispute Details</SheetTitle></SheetHeader>
        <div className="mt-6 space-y-5">
          <div className="bg-brand-blue-pale rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[status] || ""}`}>
                {status.replace("_", " ")}
              </span>
            </div>
            <div className="font-semibold text-brand-blue">{dispute.title}</div>
            <div className="text-xs text-gray-400 mt-1">{dispute.property?.title} · {dispute.property?.plotNumber}</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Description</div>
            <div className="text-sm text-gray-700">{dispute.description}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-0.5">Complainant</div>
              <div className="text-sm font-medium">{dispute.complainant?.name}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-0.5">Filed</div>
              <div className="text-sm font-medium">{formatDistanceToNow(new Date(dispute.createdAt), { addSuffix: true })}</div>
            </div>
          </div>

          {/* Notes thread */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Investigation Notes</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {notes.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No notes yet</p>
              ) : notes.map((n: any) => (
                <div key={n.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-700">{n.note}</div>
                  <div className="text-xs text-gray-400 mt-1">{n.addedBy?.name} · {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <Textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add investigation note..." rows={2} className="flex-1 text-sm" />
              <Button onClick={addNote} disabled={loading || !newNote.trim()} size="icon" className="bg-brand-blue text-white self-end">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Status update */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Change Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue">
                {statuses.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </div>
            {["RESOLVED","DISMISSED"].includes(status) && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Resolution</label>
                <Textarea value={resolution} onChange={(e) => setResolution(e.target.value)} placeholder="Describe the resolution..." rows={2} className="text-sm" />
              </div>
            )}
            <Button onClick={updateStatus} disabled={loading} className="w-full bg-brand-blue hover:bg-brand-blue-light text-white">
              {loading ? "Updating..." : "Update Dispute"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
