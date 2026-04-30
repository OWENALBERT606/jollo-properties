"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CrudTable, { CrudField } from "@/components/dashboard/CrudTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const columns: ColumnDef<any>[] = [
  { accessorKey: "name", header: "Street", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
  { accessorKey: "subcounty", header: "Subcounty", cell: ({ row }) => <span className="text-gray-500">{row.original.subcounty || "—"}</span> },
  { accessorKey: "district", header: "District", cell: ({ row }) => <Badge className="bg-cyan-100 text-cyan-700">{row.original.district}</Badge> },
  { accessorKey: "isActive", header: "Status", cell: ({ row }) => (
    <Badge className={row.original.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
      {row.original.isActive ? "Active" : "Inactive"}
    </Badge>
  )},
  { accessorKey: "createdAt", header: "Added", cell: ({ row }) => <span className="text-xs text-gray-400">{format(new Date(row.original.createdAt), "dd MMM yyyy")}</span> },
];

export default function StreetsClient({ data }: { data: any[] }) {
  const router = useRouter();
  const [districts, setDistricts] = useState<any[]>([]);
  const [subcounties, setSubcounties] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/districts?isActive=true")
      .then((res) => res.json())
      .then((data) => setDistricts(data))
      .catch(() => {});
    fetch("/api/admin/subcounties?isActive=true")
      .then((res) => res.json())
      .then((data) => setSubcounties(data))
      .catch(() => {});
  }, []);

  const fields: CrudField[] = [
    { key: "name", label: "Street Name", required: true },
    { key: "subcounty", label: "Subcounty", type: "select", options: subcounties.map((s: any) => s.name) },
    { key: "district", label: "District", type: "select", options: districts.map((d: any) => d.name) },
    { key: "region", label: "Region (Optional)", type: "select", options: ["Central", "Eastern", "Western", "Northern"] },
  ];

  return (
    <CrudTable
      title="Streets"
      data={data}
      fields={fields}
      columns={columns}
      apiBase="/api/admin/streets"
      onRefresh={() => router.refresh()}
      addButtonColor="bg-teal-600 hover:bg-teal-700"
    />
  );
}