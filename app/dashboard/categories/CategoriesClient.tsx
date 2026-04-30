"use client";

import { useState } from "react";
import CrudTable, { CrudField } from "@/components/dashboard/CrudTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

const columns: ColumnDef<any>[] = [
  { accessorKey: "name", header: "Category", cell: ({ row }) => <span className="font-semibold">{row.original.name}</span> },
  { accessorKey: "slug", header: "Slug", cell: ({ row }) => <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{row.original.slug}</code> },
  { accessorKey: "description", header: "Description", cell: ({ row }) => <span className="text-gray-500 text-sm">{row.original.description || "—"}</span> },
  { accessorKey: "isActive", header: "Status", cell: ({ row }) => (
    <Badge className={row.original.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
      {row.original.isActive ? "Active" : "Inactive"}
    </Badge>
  )},
  { accessorKey: "createdAt", header: "Created", cell: ({ row }) => (
    <span className="text-xs text-gray-400">{format(new Date(row.original.createdAt), "dd MMM yyyy")}</span>
  )},
];

const fields: CrudField[] = [
  { key: "name", label: "Category Name", required: true },
  { key: "description", label: "Description", type: "textarea" },
];

export default function CategoriesClient({ data }: { data: any[] }) {
  return (
    <CrudTable title="Categories" data={data} fields={fields} columns={columns}
      apiBase="/api/admin/categories" onRefresh={() => {}} addButtonColor="bg-brand-blue hover:bg-brand-blue-light" />
  );
}
