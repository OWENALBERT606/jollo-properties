"use client";

import { useState, useMemo } from "react";
import CrudTable, { CrudField } from "@/components/dashboard/CrudTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const REGIONS = ["Central", "Eastern", "Western", "Northern"];

const columns: ColumnDef<any>[] = [
  { accessorKey: "name", header: "Road Name", cell: ({ row }) => <span className="font-semibold">{row.original.name}</span> },
  { accessorKey: "district", header: "District", cell: ({ row }) => <span className="text-sm text-gray-600">{row.original.district}</span> },
  { accessorKey: "region", header: "Region", cell: ({ row }) => <Badge className="bg-brand-blue-pale text-brand-blue">{row.original.region || "—"}</Badge> },
  { accessorKey: "isActive", header: "Status", cell: ({ row }) => (
    <Badge className={row.original.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
      {row.original.isActive ? "Active" : "Inactive"}
    </Badge>
  )},
  { accessorKey: "createdAt", header: "Added", cell: ({ row }) => (
    <span className="text-xs text-gray-400">{format(new Date(row.original.createdAt), "dd MMM yyyy")}</span>
  )},
];

interface Props { data: any[]; districts?: string[]; }

export default function RoadsClient({ data, districts = [] }: Props) {
  const [districtFilter, setDistrictFilter] = useState("");

  const filtered = useMemo(() =>
    districtFilter ? data.filter((d) => d.district === districtFilter) : data,
    [data, districtFilter]
  );

  const fields: CrudField[] = [
    { key: "name", label: "Road Name", required: true },
    { key: "district", label: "District", type: districts.length ? "select" : "text", options: districts, required: true },
    { key: "region", label: "Region", type: "select", options: REGIONS },
  ];

  return (
    <div className="space-y-3">
      {districts.length > 0 && (
        <div className="flex items-center gap-3">
          <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white">
            <option value="">All Districts</option>
            {districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {districtFilter && <button onClick={() => setDistrictFilter("")} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>}
        </div>
      )}
      <CrudTable title="Main Roads" data={filtered} fields={fields} columns={columns}
        apiBase="/api/admin/roads" onRefresh={() => {}} addButtonColor="bg-brand-red hover:bg-red-700" />
    </div>
  );
}
