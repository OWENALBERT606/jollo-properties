"use client";

import dynamic from "next/dynamic";

const PublicPropertiesMap = dynamic(
  () => import("@/components/public/PublicPropertiesMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-gradient-to-br from-brand-blue-pale to-blue-100 rounded-2xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-brand-blue">
          <div className="w-8 h-8 border-3 border-brand-blue border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading map...</span>
        </div>
      </div>
    ),
  }
);

export default PublicPropertiesMap;
