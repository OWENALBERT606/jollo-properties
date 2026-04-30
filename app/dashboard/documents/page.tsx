import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import { FileText, Download } from "lucide-react";
import { format } from "date-fns";

export default async function UserDocumentsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  let documents: any[] = [];
  try {
    // Get documents for properties the user owns
    const ownerships = await db.propertyOwner.findMany({
      where: { userId: session.user.id, isActive: true },
      select: { propertyId: true },
    });
    const propertyIds = ownerships.map((o) => o.propertyId);
    documents = await db.document.findMany({
      where: { propertyId: { in: propertyIds } },
      include: { property: { select: { title: true, plotNumber: true } } },
      orderBy: { createdAt: "desc" },
    });
  } catch {}

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-brand-blue">My Documents</h1>
      {documents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <FileText className="h-10 w-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">No documents found for your properties.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-blue-pale rounded-lg p-2">
                    <FileText className="h-5 w-5 text-brand-blue" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{doc.name}</div>
                    <div className="text-xs text-gray-400">
                      {doc.type.replace("_", " ")} · {doc.property?.title} · {format(new Date(doc.createdAt), "dd MMM yyyy")}
                    </div>
                  </div>
                </div>
                <a href={`/api/documents/${doc.id}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-brand-blue-light hover:underline">
                  <Download className="h-3.5 w-3.5" /> Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
