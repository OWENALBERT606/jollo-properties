"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Home, Map, Users, Award } from "lucide-react";

const stats = [
  { label: "Properties Listed", value: 1240, suffix: "+", color: "text-brand-blue", icon: Home, desc: "Verified listings", iconBg: "from-brand-blue to-brand-blue-light" },
  { label: "Districts Covered", value: 45, suffix: "", color: "text-brand-red", icon: Map, desc: "Nationwide reach", iconBg: "from-brand-red to-red-400" },
  { label: "Happy Clients", value: 3800, suffix: "+", color: "text-brand-blue", icon: Users, desc: "Satisfied customers", iconBg: "from-brand-blue to-brand-blue-light" },
  { label: "Years Experience", value: 12, suffix: "", color: "text-brand-red", icon: Award, desc: "Industry expertise", iconBg: "from-brand-red to-red-400" },
];

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function StatsBar() {
  return (
    <section className="bg-brand-blue-pale/30 dark:bg-gray-900 border-y border-blue-100 dark:border-gray-800 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x-0 md:divide-x divide-blue-100 dark:divide-gray-700">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative flex flex-col items-center text-center px-6 py-6 group"
            >
              {/* Vertical divider for mobile (between rows) */}
              {i % 2 === 0 && i !== 0 && (
                <div className="absolute left-0 top-6 bottom-6 w-px bg-blue-100 dark:bg-gray-700 md:hidden" />
              )}

              {/* Icon container */}
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.iconBg} shadow-md mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>

              {/* Number with gradient text */}
              <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-brand-blue to-brand-blue-light bg-clip-text text-transparent leading-none mb-1">
                <CountUp target={stat.value} suffix={stat.suffix} />
              </div>

              {/* Label */}
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-1">{stat.label}</div>

              {/* Descriptor */}
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{stat.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
