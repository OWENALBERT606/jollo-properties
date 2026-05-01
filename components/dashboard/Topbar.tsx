"use client";

import { Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { usePathname } from "next/navigation";

const routeLabels: Record<string, string> = {
  "/dashboard/admin-home": "Admin Dashboard",
  "/dashboard/officer-home": "Officer Dashboard",
  "/dashboard/user-home": "My Dashboard",
  "/dashboard/users": "User Management",
  "/dashboard/properties": "Property Listings",
  "/dashboard/transactions": "Transactions",
  "/dashboard/owners": "Owner Management",
  "/dashboard/valuations": "Valuations & Tax",
  "/dashboard/disputes": "Disputes",
  "/dashboard/map": "GIS Map",
  "/dashboard/reports": "Reports",
  "/dashboard/register": "Register Property",
  "/dashboard/categories": "Property Categories",
  "/dashboard/tenures": "Tenure Types",
  "/dashboard/districts": "Districts",
  "/dashboard/regions": "Regions",
  "/dashboard/counties": "Counties",
  "/dashboard/subcounties": "Sub-counties",
  "/dashboard/streets": "Streets & Villages",
  "/dashboard/roads": "Main Roads",
  "/dashboard/my-properties": "My Properties",
  "/dashboard/my-transactions": "My Transactions",
  "/dashboard/documents": "My Documents",
};

interface Props { userName: string; role: string; }

export default function Topbar({ userName, role }: Props) {
  const pathname = usePathname();
  const title = routeLabels[pathname] ?? "Dashboard";
  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const roleLabel = role === "ADMIN" ? "Administrator" : role === "LAND_OFFICER" ? "Land Officer" : "Public User";

  return (
    <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <h1 className="text-base font-semibold text-gray-800 dark:text-gray-100">{title}</h1>
      <div className="flex items-center gap-2">
        <ModeToggle />
        <Button variant="ghost" size="icon" className="relative text-gray-500 dark:text-gray-400">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-red rounded-full" />
        </Button>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-brand-blue text-white text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:block text-right">
            <div className="text-xs font-medium text-gray-800 dark:text-gray-100">{userName}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500">{roleLabel}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
