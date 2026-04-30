"use client";

import { useState, useMemo } from "react";
import CrudTable, { CrudField } from "@/components/dashboard/CrudTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const columns: ColumnDef<any>[] = [
  { accessorKey: "name", header: "District", cell: ({ row }) => <span className="font-semibold">{row.original.name}</span> },
  { accessorKey: "region", header: "Region", cell: ({ row }) => <Badge className="bg-brand-blue-pale text-brand-blue">{row.original.region}</Badge> },
  { accessorKey: "isActive", header: "Status", cell: ({ row }) => (
    <Badge className={row.original.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
      {row.original.isActive ? "Active" : "Inactive"}
    </Badge>
  )},
  { accessorKey: "createdAt", header: "Created", cell: ({ row }) => (
    <span className="text-xs text-gray-400">{format(new Date(row.original.createdAt), "dd MMM yyyy")}</span>
  )},
];

interface Props { data: any[]; regions: string[]; }

export default function DistrictsClient({ data, regions }: Props) {
  const [regionFilter, setRegionFilter] = useState("");

  const filtered = useMemo(() =>
    regionFilter ? data.filter((d) => d.region === regionFilter) : data,
    [data, regionFilter]
  );

  const fields: CrudField[] = [
    { key: "name", label: "District Name", required: true },
    { key: "region", label: "Region", type: "select", options: regions, required: true },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white"
        >
          <option value="">All Regions</option>
          {regions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        {regionFilter && (
          <button onClick={() => setRegionFilter("")} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
        )}
      </div>
      <CrudTable
        title="Districts"
        data={filtered}
        fields={fields}
        columns={columns}
        apiBase="/api/admin/districts"
        onRefresh={() => {}}
        addButtonColor="bg-amber-600 hover:bg-amber-700"
      />
    </div>
  );
}
