import Link from "next/link";
import { Building2, Facebook, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-brand-blue text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-white/20 rounded-lg p-1.5">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg">DEMO PROPERTIES</span>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed">
              Uganda&apos;s trusted land registry and real estate platform. Secure, transparent, and GIS-verified.
            </p>
            <div className="flex gap-3 mt-4">
              {[Facebook, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/listings", label: "Browse Listings" },
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-blue-200 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Services</h3>
            <ul className="space-y-2">
              {[
                "Property Registration",
                "Land Valuation",
                "Title Verification",
                "Dispute Resolution",
                "Tax Payments",
              ].map((s) => (
                <li key={s}>
                  <span className="text-blue-200 text-sm">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-blue-200 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                Plot 13, Kampala Road, Kampala, Uganda
              </li>
              <li className="flex items-center gap-2 text-blue-200 text-sm">
                <Phone className="h-4 w-4 shrink-0" />
                +256 700 000 000
              </li>
              <li className="flex items-center gap-2 text-blue-200 text-sm">
                <Mail className="h-4 w-4 shrink-0" />
                info@demoproperties.ug
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-10 pt-6 text-center text-blue-200 text-sm">
          © 2025 Demo Properties. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
