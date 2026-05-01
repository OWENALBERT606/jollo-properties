"use client";

import dynamic from "next/dynamic";

const PropertiesMap = dynamic(() => import("@/components/shared/PropertiesMap"), { 
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800"><span className="text-gray-400">Loading map...</span></div>
});

export default function MapClient({ properties }: { properties: any[] }) {
  return <PropertiesMap properties={properties} />;
}