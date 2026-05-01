import { Metadata } from "next";
import { useRouter } from "next/navigation";
import { Building2, Shield, MapPin, Users, Zap, TrendingUp, Award, Heart } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | Jollo Properties",
  description:
    "Learn about Jollo Properties — Uganda's trusted land registry and real estate platform. GIS-verified properties, transparent transactions, and secure ownership.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://jollo-properties.vercel.app"}/about`,
  },
  openGraph: {
    title: "About Jollo Properties — Uganda's Trusted Land Registry",
    description:
      "Uganda's trusted land registry and real estate platform. GIS-verified properties, transparent transactions, and secure ownership.",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "About Jollo Properties" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Jollo Properties",
    description: "Uganda's trusted land registry and real estate platform.",
    images: ["/og-image.png"],
  },
};

export default function AboutPage() {
  const stats = [
    { value: "50K+", label: "Properties Registered" },
    { value: "15K+", label: "Active Users" },
    { value: "99.9%", label: "Data Accuracy" },
    { value: "24/7", label: "Support Available" },
  ];

  const values = [
    { icon: Shield, title: "Transparency", description: "Complete visibility into property records and transactions" },
    { icon: Zap, title: "Innovation", description: "Cutting-edge technology for land management" },
    { icon: Award, title: "Excellence", description: "Highest standards in service delivery" },
    { icon: Heart, title: "Community", description: "Empowering Ugandans through property ownership" },
  ];

  const features = [
    {
      icon: Shield,
      title: "Our Mission",
      desc: "To digitize and secure Uganda's land registry, eliminating fraud and ensuring every Ugandan can confidently own and transact property.",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-700",
    },
    {
      icon: MapPin,
      title: "GIS Technology",
      desc: "Every property is geo-referenced using modern GIS technology, providing accurate boundary data and location verification.",
      iconBg: "bg-red-100",
      iconColor: "text-red-700",
    },
    {
      icon: Users,
      title: "Our Team",
      desc: "A dedicated team of land officers, surveyors, and technology experts working to modernize Uganda's land management system.",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-700",
    },
    {
      icon: Building2,
      title: "Our Platform",
      desc: "Built on modern technology with full audit trails, workflow approvals, and secure document storage via Cloudflare R2.",
      iconBg: "bg-red-100",
      iconColor: "text-red-700",
    },
  ];

  return (
    <main className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pt-24 pb-32 sm:px-10 lg:px-16">
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/HERO/Cheap-plots-for-sale-in-Kisubi-Wamala-Entebbe-road-2-592x444.jpeg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-800/85 via-blue-900/70 to-red-600/85" />

        <div className="relative max-w-5xl mx-auto">
          {/* eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span className="text-xs font-semibold tracking-widest uppercase text-blue-400">
              Est. Uganda
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.08] tracking-tight mb-6 max-w-3xl">
            Building Trust in{" "}
            <span className="text-blue-400">Property</span>{" "}
            <span className="text-red-400">Ownership</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-xl leading-relaxed mb-12">
            Uganda&apos;s most trusted land registry platform — bringing transparency,
            security, and confidence to every property transaction.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/listings" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors duration-200 text-sm">
              Get Started Today
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 transition-colors duration-200 text-sm">
              Contact Us
            </Link>
          </div>
        </div>

        {/* bottom fade */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-24"
          style={{ background: "linear-gradient(to bottom, transparent, #f8fafc)" }}
        />
      </section>

      {/* ── Stats bar ── */}
      <section className="px-6 sm:px-10 lg:px-16 py-0 max-w-5xl mx-auto -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white border border-slate-100 shadow-md shadow-slate-100"
            >
              <p className={`text-3xl sm:text-4xl font-bold mb-1 tabular-nums ${i % 2 === 0 ? "text-blue-600" : "text-red-600"}`}>
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm text-slate-500 font-medium text-center">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What We Do ── */}
      <section className="px-6 sm:px-10 lg:px-16 py-28 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-blue-600 mb-3">
              What We Do
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
              A platform built for Uganda&apos;s land future
            </h2>
          </div>
          <p className="text-slate-500 text-sm max-w-xs sm:text-right leading-relaxed">
            Four pillars that underpin everything we build.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map(({ icon: Icon, title, desc, iconBg, iconColor }, i) => (
            <div
              key={title}
              className="group relative p-8 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 overflow-hidden"
            >
              <span
                aria-hidden
                className="absolute top-4 right-5 text-7xl font-black text-slate-50 select-none transition-colors duration-300 group-hover:text-slate-100"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${iconBg} mb-6`}>
                <Icon className={`h-6 w-6 ${iconColor}`} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">{title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm relative z-10">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Values ── */}
      <section className="bg-blue-800 px-6 sm:px-10 lg:px-16 py-28 relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(to right, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 w-72 h-72 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 w-72 h-72 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)" }}
        />

        <div className="max-w-5xl mx-auto relative">
          <div className="mb-16 text-center">
            <p className="text-xs font-bold tracking-widest uppercase text-blue-400 mb-3">
              Core Values
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              What guides every decision
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map(({ icon: Icon, title, description }, i) => (
              <div
                key={title}
                className="group p-7 rounded-2xl bg-white/5 border border-white/[0.08] hover:bg-white/10 hover:border-white/[0.15] transition-all duration-300"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${i % 2 === 0 ? "bg-blue-500/15" : "bg-red-500/15"}`}>
                  <Icon className={`h-5 w-5 ${i % 2 === 0 ? "text-blue-400" : "text-red-400"}`} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                <p className="text-blue-100 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 sm:px-10 lg:px-16 py-28 max-w-5xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-red-50 border border-blue-100 px-10 py-16 text-center relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-blue-200/40"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-red-200/30"
          />

          <div className="relative">
            <p className="text-xs font-bold tracking-widest uppercase text-blue-600 mb-4">
              Get Started
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 max-w-xl mx-auto">
              Ready to secure your property?
            </h2>
            <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed text-sm">
              Join thousands of Ugandans who trust Demo Properties for transparent and
              secure property transactions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
<Link href="/listings" className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm">
              Get Started Today
            </Link>
            <Link href="/contact" className="px-8 py-3.5 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-sm">
              Contact Us
            </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}