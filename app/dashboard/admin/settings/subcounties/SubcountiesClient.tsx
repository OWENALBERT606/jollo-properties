"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CrudTable, { CrudField } from "@/components/dashboard/CrudTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const columns: ColumnDef<any>[] = [
  { accessorKey: "name", header: "Subcounty", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
  { accessorKey: "county", header: "County", cell: ({ row }) => (
    <Badge className="bg-orange-100 text-orange-700">{row.original.county}</Badge>
  )},
  { accessorKey: "district", header: "District", cell: ({ row }) => <span className="text-gray-500">{row.original.district}</span> },
  { accessorKey: "isActive", header: "Status", cell: ({ row }) => (
    <Badge className={row.original.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
      {row.original.isActive ? "Active" : "Inactive"}
    </Badge>
  )},
  { accessorKey: "createdAt", header: "Added", cell: ({ row }) => <span className="text-xs text-gray-400">{format(new Date(row.original.createdAt), "dd MMM yyyy")}</span> },
];

export default function SubcountiesClient({ data }: { data: any[] }) {
  const router = useRouter();
  const [districts, setDistricts] = useState<any[]>([]);
  const [counties, setCounties] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/districts?isActive=true")
      .then((res) => res.json())
      .then((data) => setDistricts(data))
      .catch(() => {});
    fetch("/api/admin/counties?isActive=true")
      .then((res) => res.json())
      .then((data) => setCounties(data))
      .catch(() => {});
  }, []);

  const fields: CrudField[] = [
    { key: "name", label: "Subcounty Name", required: true },
    { key: "county", label: "County", type: "select", options: counties.map((c: any) => c.name), required: true },
    { key: "district", label: "District", type: "select", options: districts.map((d: any) => d.name), required: true },
  ];

  return (
    <CrudTable
      title="Subcounties"
      data={data}
      fields={fields}
      columns={columns}
      apiBase="/api/admin/subcounties"
      onRefresh={() => router.refresh()}
      addButtonColor="bg-cyan-600 hover:bg-cyan-700"
    />
  );
}