"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CrudTable, { CrudField } from "@/components/dashboard/CrudTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const columns: ColumnDef<any>[] = [
  { accessorKey: "name", header: "County", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
  { accessorKey: "district", header: "District", cell: ({ row }) => (
    <Badge className="bg-amber-100 text-amber-700">{row.original.district}</Badge>
  )},
  { accessorKey: "region", header: "Region", cell: ({ row }) => <span className="text-gray-500">{row.original.region || "—"}</span> },
  { accessorKey: "isActive", header: "Status", cell: ({ row }) => (
    <Badge className={row.original.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
      {row.original.isActive ? "Active" : "Inactive"}
    </Badge>
  )},
  { accessorKey: "createdAt", header: "Added", cell: ({ row }) => <span className="text-xs text-gray-400">{format(new Date(row.original.createdAt), "dd MMM yyyy")}</span> },
];

export default function CountiesClient({ data }: { data: any[] }) {
  const router = useRouter();
  const [districts, setDistricts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/districts?isActive=true")
      .then((res) => res.json())
      .then((data) => setDistricts(data))
      .catch(() => {});
  }, []);

  const fields: CrudField[] = [
    { key: "name", label: "County Name", required: true },
    { key: "district", label: "District", type: "select", options: districts.map((d: any) => d.name), required: true },
    { key: "region", label: "Region (Optional)", type: "select", options: ["Central", "Eastern", "Western", "Northern"] },
  ];

  return (
    <CrudTable
      title="Counties"
      data={data}
      fields={fields}
      columns={columns}
      apiBase="/api/admin/counties"
      onRefresh={() => router.refresh()}
      addButtonColor="bg-orange-600 hover:bg-orange-700"
    />
  );
}