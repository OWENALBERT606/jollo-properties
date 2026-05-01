"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import {
  Building2, Users, Clock, AlertTriangle, ArrowLeftRight,
  Scale, BarChart3, Home, FolderOpen, CheckCircle, XCircle,
  TrendingUp, FileText, MapPin, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ElementType> = {
  Building2, Users, Clock, AlertTriangle, ArrowLeftRight,
  Scale, BarChart3, Home, FolderOpen, CheckCircle, XCircle,
  TrendingUp, FileText, MapPin, Shield,
};

interface Props {
  label: string;
  value: number;
  iconName: string;
  color?: string;
  prefix?: string;
  suffix?: string;
}

export default function StatsCard({
  label,
  value,
  iconName,
  color = "bg-brand-blue-pale text-brand-blue",
  prefix = "",
  suffix = "",
}: Props) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1200;
    const step = Math.max(1, Math.ceil(value / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value]);

  const Icon = ICONS[iconName] ?? Building2;

  return (
    <div ref={ref} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        <div className={cn("p-2 rounded-lg", color)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
    </div>
  );
}
