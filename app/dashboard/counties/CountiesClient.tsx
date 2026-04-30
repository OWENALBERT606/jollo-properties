"use client";
import CrudTable, { CrudField } from "@/components/dashboard/CrudTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const REGIONS = ["Central", "Eastern", "Western", "Northern"];

const columns: ColumnDef<any>[] = [
  { accessorKey: "name", header: "County", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
  { accessorKey: "district", header: "District", cell: ({ row }) => <span className="text-sm text-gray-600">{row.original.district}</span> },
  { accessorKey: "region", header: "Region", cell: ({ row }) => <Badge className="bg-brand-blue-pale text-brand-blue">{row.original.region || "—"}</Badge> },
  { accessorKey: "isActive", header: "Status", cell: ({ row }) => <Badge className={row.original.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>{row.original.isActive ? "Active" : "Inactive"}</Badge> },
  { accessorKey: "createdAt", header: "Added", cell: ({ row }) => <span className="text-xs text-gray-400">{format(new Date(row.original.createdAt), "dd MMM yyyy")}</span> },
];

const fields: CrudField[] = [
  { key: "name", label: "County Name", required: true },
  { key: "district", label: "District", required: true },
  { key: "region", label: "Region", type: "select", options: REGIONS },
];

export default function CountiesClient({ data, districts = [] }: { data: any[]; districts?: string[] }) {
  const fields: CrudField[] = [
    { key: "name", label: "County Name", required: true },
    { key: "district", label: "District", type: districts.length ? "select" : "text", options: districts, required: true },
    { key: "region", label: "Region", type: "select", options: REGIONS },
  ];
  return <CrudTable title="Counties" data={data} fields={fields} columns={columns} apiBase="/api/admin/counties" onRefresh={() => {}} addButtonColor="bg-brand-blue hover:bg-brand-blue-light" />;
}
