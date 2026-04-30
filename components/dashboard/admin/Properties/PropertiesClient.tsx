"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  PENDING_APPROVAL: "bg-yellow-100 text-yellow-700",
  ACTIVE: "bg-green-100 text-green-700",
  TRANSFERRED: "bg-blue-100 text-blue-700",
  DISPUTED: "bg-red-100 text-red-700",
  ARCHIVED: "bg-gray-100 text-gray-500",
};

const tenureColors: Record<string, string> = {
  TITLED: "bg-green-100 text-green-700",
  MAILO: "bg-blue-100 text-blue-700",
  KIBANJA: "bg-amber-100 text-amber-700",
  LEASEHOLD: "bg-purple-100 text-purple-700",
  FREEHOLD: "bg-teal-100 text-teal-700",
};

const typeColors: Record<string, string> = {
  LAND: "bg-emerald-100 text-emerald-700",
  HOUSE: "bg-orange-100 text-orange-700",
  RESIDENTIAL: "bg-blue-100 text-blue-700",
  COMMERCIAL: "bg-purple-100 text-purple-700",
  AGRICULTURAL: "bg-green-100 text-green-700",
  INDUSTRIAL: "bg-gray-100 text-gray-700",
  OTHER: "bg-gray-100 text-gray-500",
};

const columns: ColumnDef<any>[] = [
  { 
    accessorKey: "plotNumber", 
    header: "Plot No.", 
    cell: ({ row }) => (
      <Link href={`/dashboard/properties/${row.original.id}`} className="font-mono font-semibold text-brand-blue hover:underline">
        {row.original.plotNumber}
      </Link>
    ) 
  },
  { accessorKey: "title", header: "Title", cell: ({ row }) => <span className="font-medium">{row.original.title}</span> },
  { accessorKey: "district", header: "District", cell: ({ row }) => <span className="text-sm">{row.original.district}</span> },
  { 
    accessorKey: "type", 
    header: "Type", 
    cell: ({ row }) => <Badge className={typeColors[row.original.type] || "bg-gray-100"}>{row.original.type}</Badge> 
  },
  { 
    accessorKey: "tenure", 
    header: "Tenure", 
    cell: ({ row }) => <Badge className={tenureColors[row.original.tenure] || "bg-gray-100"}>{row.original.tenure}</Badge> 
  },
  { 
    accessorKey: "status", 
    header: "Status", 
    cell: ({ row }) => <Badge className={statusColors[row.original.status] || "bg-gray-100"}>{row.original.status}</Badge> 
  },
  { accessorKey: "size", header: "Size", cell: ({ row }) => <span className="text-sm">{row.original.size} {row.original.sizeUnit}</span> },
  { 
    accessorKey: "createdAt", 
    header: "Added", 
    cell: ({ row }) => <span className="text-xs text-gray-400">{format(new Date(row.original.createdAt), "dd MMM yyyy")}</span> 
  },
];

export default function PropertiesClient({ data }: { data: any[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState(data);

  useEffect(() => {
    if (!search) {
      setFiltered(data);
    } else {
      const q = search.toLowerCase();
      setFiltered(data.filter((p: any) => 
        p.title.toLowerCase().includes(q) || 
        p.plotNumber.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q)
      ));
    }
  }, [search, data]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Search properties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 w-64"
        />
        <Link href="/dashboard/register">
          <Button>+ Add Property</Button>
        </Link>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {columns.map((col) => (
                <th key={col.accessorKey as string} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  {col.header as string}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400">
                  No properties found
                </td>
              </tr>
            ) : (
              filtered.map((property: any) => (
                <tr key={property.id} className="border-b border-gray-50 hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col.accessorKey as string} className="px-4 py-3">
                      {col.cell ? col.cell({ row: { original: property } }) : property[col.accessorKey as string]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}