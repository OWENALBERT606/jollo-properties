"use client";

import CrudTable, { CrudField } from "@/components/dashboard/CrudTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const columns: ColumnDef<any>[] = [
  { accessorKey: "name", header: "Region", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
  { accessorKey: "description", header: "Description", cell: ({ row }) => <span className="text-gray-500 text-sm">{row.original.description || "—"}</span> },
  { accessorKey: "isActive", header: "Status", cell: ({ row }) => (
    <Badge className={row.original.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
      {row.original.isActive ? "Active" : "Inactive"}
    </Badge>
  )},
  { accessorKey: "createdAt", header: "Added", cell: ({ row }) => <span className="text-xs text-gray-400">{format(new Date(row.original.createdAt), "dd MMM yyyy")}</span> },
];

const fields: CrudField[] = [
  { key: "name", label: "Region Name", required: true },
  { key: "description", label: "Description", type: "textarea" },
];

export default function RegionsClient({ data }: { data: any[] }) {
  return <CrudTable title="Regions" data={data} fields={fields} columns={columns} apiBase="/api/admin/regions" onRefresh={() => {}} addButtonColor="bg-purple-600 hover:bg-purple-700" />;
}
