"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import {
  Building2, LayoutDashboard, Users, BarChart3, Settings,
  PlusSquare, ArrowLeftRight, Scale, AlertTriangle, UserCheck,
  Home, FolderOpen, ChevronLeft, ChevronRight, LogOut, User,
  Map, Tag, Landmark, MapPin, Globe, ChevronDown, ChevronUp,
  FileText, Road,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// ── Nav definitions ──────────────────────────────────────────────────────────

const adminNav = [
  { href: "/dashboard/admin-home", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/properties", label: "Properties", icon: Building2 },
  { href: "/dashboard/register", label: "Add Property", icon: PlusSquare },
  { href: "/dashboard/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/dashboard/owners", label: "Owners", icon: UserCheck },
  { href: "/dashboard/valuations", label: "Valuations & Tax", icon: Scale },
  { href: "/dashboard/disputes", label: "Disputes", icon: AlertTriangle },
  { href: "/dashboard/map", label: "GIS Map", icon: Map },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  // Reference data group
  {
    label: "Reference Data",
    icon: Settings,
    group: true,
    children: [
      { href: "/dashboard/categories", label: "Categories", icon: Tag },
      { href: "/dashboard/tenures", label: "Tenure Types", icon: Landmark },
      { href: "/dashboard/regions", label: "Regions", icon: Globe },
      { href: "/dashboard/districts", label: "Districts", icon: MapPin },
      { href: "/dashboard/counties", label: "Counties", icon: MapPin },
      { href: "/dashboard/subcounties", label: "Sub-counties", icon: MapPin },
      { href: "/dashboard/streets", label: "Streets / Villages", icon: FileText },
      { href: "/dashboard/roads", label: "Main Roads", icon: FileText },
    ],
  },
];

const officerNav = [
  { href: "/dashboard/officer-home", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/register", label: "Register Property", icon: PlusSquare },
  { href: "/dashboard/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/dashboard/owners", label: "Owners", icon: UserCheck },
  { href: "/dashboard/valuations", label: "Valuations & Tax", icon: Scale },
  { href: "/dashboard/disputes", label: "Disputes", icon: AlertTriangle },
  { href: "/dashboard/map", label: "GIS Map", icon: Map },
];

const userNav = [
  { href: "/dashboard/user-home", label: "My Dashboard", icon: Home },
  { href: "/dashboard/my-properties", label: "My Properties", icon: Building2 },
  { href: "/dashboard/my-transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/dashboard/documents", label: "Documents", icon: FolderOpen },
];

// ── Types ─────────────────────────────────────────────────────────────────────

type NavItem = {
  href?: string;
  label: string;
  icon: React.ElementType;
  group?: boolean;
  children?: { href: string; label: string; icon: React.ElementType }[];
};

// ── Component ─────────────────────────────────────────────────────────────────

interface Props { role: string; userName: string; userEmail: string; }

export default function Sidebar({ role, userName, userEmail }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar-collapsed") === "true";
    }
    return false;
  });
  const [openGroups, setOpenGroups] = useState<string[]>(["Reference Data"]);

  const nav: NavItem[] =
    role === "ADMIN" ? adminNav :
    role === "LAND_OFFICER" ? officerNav :
    userNav;

  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  function toggleGroup(label: string) {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "hidden md:flex flex-col bg-brand-blue text-white transition-all duration-300 relative shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-white/10">
        <div className="bg-white/20 rounded-lg p-1.5 shrink-0">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="font-bold text-sm whitespace-nowrap overflow-hidden"
            >
              DEMO PROPERTIES
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto scrollbar-hide">
        {nav.map((item, i) => {
          // Group item
          if (item.group && item.children) {
            const isOpen = openGroups.includes(item.label);
            const anyChildActive = item.children.some((c) => isActive(c.href));
            return (
              <div key={item.label}>
                <button
                  onClick={() => !collapsed && toggleGroup(item.label)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    anyChildActive ? "text-white" : "text-blue-200 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex-1 text-left whitespace-nowrap overflow-hidden">
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {!collapsed && (isOpen ? <ChevronUp className="h-3 w-3 shrink-0" /> : <ChevronDown className="h-3 w-3 shrink-0" />)}
                </button>

                <AnimatePresence>
                  {isOpen && !collapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden ml-3 pl-3 border-l border-white/10 mt-0.5 space-y-0.5"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                            isActive(child.href)
                              ? "bg-white text-brand-blue"
                              : "text-blue-200 hover:bg-white/10 hover:text-white"
                          )}
                        >
                          <child.icon className="h-3.5 w-3.5 shrink-0" />
                          {child.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          // Regular item
          const active = isActive(item.href!);
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link
                href={item.href!}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative",
                  active
                    ? "bg-white text-brand-blue"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-red rounded-r-full" />
                )}
                <item.icon className="h-4 w-4 shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="whitespace-nowrap overflow-hidden">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-white/10 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 w-full rounded-lg p-2 hover:bg-white/10 transition-colors">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-white/20 text-white text-xs">{initials}</AvatarFallback>
              </Avatar>
              <AnimatePresence>
                {!collapsed && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-left overflow-hidden">
                    <div className="text-xs font-medium text-white truncate">{userName}</div>
                    <div className="text-xs text-blue-200 truncate">{userEmail}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-48 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })} className="text-red-600 flex items-center gap-2">
              <LogOut className="h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((v) => {
          const next = !v;
          localStorage.setItem("sidebar-collapsed", String(next));
          return next;
        })}
        className="absolute -right-3 top-20 bg-brand-blue border border-white/20 rounded-full p-1 text-white hover:bg-brand-blue-light transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </motion.aside>
  );
}
