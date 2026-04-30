"use client";

import dynamic from "next/dynamic";

const PropertyMap = dynamic(() => import("@/components/shared/PropertyMap"), { ssr: false });

export default function OfficeMapClient() {
  return (
    <PropertyMap
      lat={0.3394}
      lng={32.6394}
      title="Demo Properties — Kireka Shopping Centre"
    />
  );
}
