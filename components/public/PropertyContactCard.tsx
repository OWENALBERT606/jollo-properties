"use client";

import { useState } from "react";
import { PhoneCall, MessageSquare, Calendar } from "lucide-react";

const WHATSAPP_NUMBER = "256709704128";
const CONTACT_PHONE = "256709704128";

interface Props {
  plotNumber: string;
  title: string;
  district?: string;
  tenure?: string;
  type?: string;
  price?: number;
  size?: number;
  sizeUnit?: string;
  address?: string;
}

export default function PropertyContactCard({ 
  plotNumber, 
  title, 
  district = "", 
  tenure = "", 
  type = "", 
  price, 
  size, 
  sizeUnit = "", 
  address = "" 
}: Props) {
  const priceStr = price ? `UGX ${Number(price).toLocaleString()}` : "Price on request";
  const sizeStr = size && sizeUnit ? `${Number(size)} ${sizeUnit}` : "";
  
  const fullMessage = `Hi, I'm interested in ${title} (${plotNumber}).
    
Property Details:
- Type: ${type.replace(/_/g, " ")}
- Tenure: ${tenure}
- Location: ${district}${address ? ", " + address : ""}
- Size: ${sizeStr}
- Price: ${priceStr}

Please contact me.`;

  function handleWhatsApp() {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(fullMessage)}`, "_blank");
  }

  function handleCall() {
    window.location.href = `tel:+${CONTACT_PHONE}`;
  }

  function handleBookVisit() {
    const visitMessage = fullMessage + "\n\nI would like to book a visit to this property.";
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(visitMessage)}`, "_blank");
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleWhatsApp}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold flex items-center justify-center gap-2 py-2.5 rounded-lg"
      >
        <MessageSquare className="h-4 w-4" /> Chat on WhatsApp
      </button>
      <button
        onClick={handleCall}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-colors text-sm font-medium"
      >
        <PhoneCall className="h-4 w-4" /> Call
      </button>
      <button
        onClick={handleBookVisit}
        className="w-full bg-white dark:bg-gray-800 text-brand-blue hover:bg-blue-50 dark:hover:bg-gray-700 font-semibold flex items-center justify-center gap-2 py-2.5 rounded-lg"
      >
        <Calendar className="h-4 w-4" /> Book Visit
      </button>
    </div>
  );
}