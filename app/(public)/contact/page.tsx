import { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import OfficeMapClient from "@/components/public/OfficeMapClient";

export const metadata: Metadata = {
  title: "Contact Us | Jollo Properties",
  description:
    "Get in touch with Jollo Properties. Visit us at Kireka Shopping Centre, Kampala, Uganda or send us a message online.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://jollo-properties.vercel.app"}/contact`,
  },
  openGraph: {
    title: "Contact Jollo Properties — Kampala, Uganda",
    description:
      "Get in touch with Jollo Properties. Visit us at Kireka Shopping Centre, Kampala, Uganda or send us a message online.",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Contact Jollo Properties" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Jollo Properties",
    description: "Get in touch with our team at Kireka Shopping Centre, Kampala.",
    images: ["/og-image.png"],
  },
};

export default function ContactPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero banner */}
      <div
        className="relative h-64 flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-brand-blue/80" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
            Contact Us
          </h1>
          <div className="flex items-center justify-center gap-2 text-blue-200 text-sm">
            <span>Home</span>
            <span>/</span>
            <span className="text-white font-semibold">Contact</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Contact info */}
          <div className="space-y-4">
            {[
              { icon: MapPin, label: "Office Address", value: "Kireka Shopping Centre, Kampala, Uganda", color: "bg-brand-red-light text-brand-red" },
              { icon: Phone, label: "Phone", value: "+256 700 000 000", color: "bg-brand-blue-pale text-brand-blue" },
              { icon: Mail, label: "Email", value: "info@demoproperties.ug", color: "bg-brand-red-light text-brand-red" },
              { icon: Clock, label: "Working Hours", value: "Mon–Fri: 8:00 AM – 5:00 PM", color: "bg-brand-blue-pale text-brand-blue" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-start gap-4 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <div className={`rounded-lg p-2.5 shrink-0 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{label}</div>
                  <div className="text-sm font-semibold text-gray-800">{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact form */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-5 text-lg">Send a Message</h2>
            <div className="space-y-3">
              {[
                { label: "Full Name", type: "text", placeholder: "John Doe" },
                { label: "Email", type: "email", placeholder: "john@example.com" },
                { label: "Phone", type: "tel", placeholder: "+256 700 000000" },
              ].map(({ label, type, placeholder }) => (
                <div key={label} className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                </div>
              ))}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Message</label>
                <textarea
                  rows={4}
                  placeholder="How can we help you?"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red resize-none"
                />
              </div>
              <button className="w-full bg-brand-red hover:bg-red-700 text-white py-3 rounded-lg text-sm font-semibold transition-colors">
                Send Message
              </button>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-brand-blue-pale px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-brand-blue" />
              Our Location
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Kireka Shopping Centre, Kampala</p>
          </div>
          <div className="h-96">
            <OfficeMapClient />
          </div>
        </div>
      </div>
    </div>
  );
}
