"use client";

import CrudTable, { CrudField } from "@/components/dashboard/CrudTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const columns: ColumnDef<any>[] = [
  { accessorKey: "name", header: "Road Name", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
  { accessorKey: "district", header: "District", cell: ({ row }) => <span className="text-sm text-gray-600">{row.original.district}</span> },
  { accessorKey: "region", header: "Region", cell: ({ row }) => <Badge className="bg-brand-blue-pale text-brand-blue">{row.original.region || "—"}</Badge> },
  { accessorKey: "isActive", header: "Status", cell: ({ row }) => (
    <Badge className={row.original.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
      {row.original.isActive ? "Active" : "Inactive"}
    </Badge>
  )},
  { accessorKey: "createdAt", header: "Added", cell: ({ row }) => <span className="text-xs text-gray-400">{format(new Date(row.original.createdAt), "dd MMM yyyy")}</span> },
];

const REGIONS = ["Central", "Eastern", "Western", "Northern"];

const fields: CrudField[] = [
  { key: "name", label: "Road Name", required: true },
  { key: "district", label: "District", required: true },
  { key: "region", label: "Region", type: "select", options: REGIONS },
];

export default function RoadsClient({ data }: { data: any[] }) {
  return <CrudTable title="Main Roads" data={data} fields={fields} columns={columns} apiBase="/api/admin/roads" onRefresh={() => window.location.reload()} addButtonColor="bg-brand-red hover:bg-red-700" />;
}
