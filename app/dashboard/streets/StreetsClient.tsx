"use client";
import CrudTable, { CrudField } from "@/components/dashboard/CrudTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const REGIONS = ["Central", "Eastern", "Western", "Northern"];

const columns: ColumnDef<any>[] = [
  { accessorKey: "name", header: "Street / Village", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
  { accessorKey: "subcounty", header: "Sub-county", cell: ({ row }) => <span className="text-sm text-gray-600">{row.original.subcounty || "—"}</span> },
  { accessorKey: "district", header: "District", cell: ({ row }) => <Badge className="bg-brand-blue-pale text-brand-blue">{row.original.district}</Badge> },
  { accessorKey: "region", header: "Region", cell: ({ row }) => <span className="text-sm text-gray-500">{row.original.region || "—"}</span> },
  { accessorKey: "isActive", header: "Status", cell: ({ row }) => <Badge className={row.original.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>{row.original.isActive ? "Active" : "Inactive"}</Badge> },
  { accessorKey: "createdAt", header: "Added", cell: ({ row }) => <span className="text-xs text-gray-400">{format(new Date(row.original.createdAt), "dd MMM yyyy")}</span> },
];

export default function StreetsClient({ data, districts = [] }: { data: any[]; districts?: string[] }) {
  const fields: CrudField[] = [
    { key: "name", label: "Street / Village Name", required: true },
    { key: "subcounty", label: "Sub-county" },
    { key: "district", label: "District", type: districts.length ? "select" : "text", options: districts, required: true },
    { key: "region", label: "Region", type: "select", options: REGIONS },
  ];
  return <CrudTable title="Streets" data={data} fields={fields} columns={columns} apiBase="/api/admin/streets" onRefresh={() => {}} addButtonColor="bg-amber-600 hover:bg-amber-700" />;
}
