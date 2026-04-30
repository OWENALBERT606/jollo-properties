"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CrudTable, { CrudField } from "@/components/dashboard/CrudTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const columns: ColumnDef<any>[] = [
  { 
    accessorKey: "name", 
    header: "User", 
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.name}</div>
        <div className="text-xs text-gray-400">{row.original.email}</div>
      </div>
    ) 
  },
  { accessorKey: "phone", header: "Phone", cell: ({ row }) => <span className="text-sm">{row.original.phone || "—"}</span> },
  { accessorKey: "nin", header: "NIN", cell: ({ row }) => <span className="text-sm font-mono">{row.original.nin || "—"}</span> },
  { 
    accessorKey: "ninVerified", 
    header: "Verified", 
    cell: ({ row }) => (
      <Badge className={row.original.ninVerified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
        {row.original.ninVerified ? "Yes" : "No"}
      </Badge>
    ) 
  },
  { 
    accessorKey: "role", 
    header: "Role", 
    cell: ({ row }) => (
      <Badge className={
        row.original.role === "ADMIN" ? "bg-purple-100 text-purple-700" :
        row.original.role === "LAND_OFFICER" ? "bg-blue-100 text-blue-700" :
        "bg-gray-100 text-gray-600"
      }>
        {row.original.role}
      </Badge>
    ) 
  },
  { accessorKey: "createdAt", header: "Joined", cell: ({ row }) => <span className="text-xs text-gray-400">{format(new Date(row.original.createdAt), "dd MMM yyyy")}</span> },
];

export default function UsersClient({ data }: { data: any[] }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setCurrentUser(data))
      .catch(() => {});
  }, []);

  const fields: CrudField[] = [
    { key: "name", label: "Full Name", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "phone", label: "Phone", type: "tel" },
    { key: "nin", label: "NIN", type: "text" },
    { key: "role", label: "Role", type: "select", options: ["ADMIN", "LAND_OFFICER", "PUBLIC_USER"], required: true },
    { key: "password", label: "Password", type: "password", required: true },
  ];

  return (
    <CrudTable
      title="Users"
      data={data}
      fields={fields}
      columns={columns}
      apiBase="/api/admin/users"
      onRefresh={() => router.refresh()}
      addButtonColor="bg-indigo-600 hover:bg-indigo-700"
    />
  );
}