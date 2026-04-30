"use client";
import CrudTable, { CrudField } from "@/components/dashboard/CrudTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const columns: ColumnDef<any>[] = [
  { accessorKey: "name", header: "Sub-county", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
  { accessorKey: "county", header: "County", cell: ({ row }) => <span className="text-sm text-gray-600">{row.original.county}</span> },
  { accessorKey: "district", header: "District", cell: ({ row }) => <Badge className="bg-brand-blue-pale text-brand-blue">{row.original.district}</Badge> },
  { accessorKey: "isActive", header: "Status", cell: ({ row }) => <Badge className={row.original.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>{row.original.isActive ? "Active" : "Inactive"}</Badge> },
  { accessorKey: "createdAt", header: "Added", cell: ({ row }) => <span className="text-xs text-gray-400">{format(new Date(row.original.createdAt), "dd MMM yyyy")}</span> },
];

export default function SubcountiesClient({ data, counties = [], districts = [] }: { data: any[]; counties?: string[]; districts?: string[] }) {
  const fields: CrudField[] = [
    { key: "name", label: "Sub-county Name", required: true },
    { key: "county", label: "County", type: counties.length ? "select" : "text", options: counties, required: true },
    { key: "district", label: "District", type: districts.length ? "select" : "text", options: districts, required: true },
  ];
  return <CrudTable title="Sub-counties" data={data} fields={fields} columns={columns} apiBase="/api/admin/subcounties" onRefresh={() => {}} addButtonColor="bg-green-600 hover:bg-green-700" />;
}
