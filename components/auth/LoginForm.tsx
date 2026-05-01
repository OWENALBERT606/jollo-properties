"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Building2, Loader2, Eye, EyeOff, MapPin, Shield, TrendingUp, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormData = z.infer<typeof schema>;

const features = [
  { icon: MapPin,      text: "Browse 1,200+ land listings across Uganda" },
  { icon: Shield,      text: "GIS-verified, titled and secure properties" },
  { icon: TrendingUp,  text: "Track your property portfolio in one place" },
  { icon: CheckCircle, text: "Instant access to land registry records" },
];

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) { toast.error("Invalid email or password"); return; }
    toast.success("Welcome back!");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT — form ── */}
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900 px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 mb-10 group">
            <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center shadow-md shadow-brand-blue/30 group-hover:bg-brand-blue-light transition-colors">
              <Building2 className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <span className="font-extrabold text-brand-blue text-base tracking-tight uppercase">
              Demo Properties
            </span>
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
              Welcome back.
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              Sign in to access your property dashboard.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                {...register("email")}
                className={`h-12 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border ${errors.email ? "border-brand-red" : "border-gray-200 dark:border-gray-700"} focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:border-brand-blue text-gray-900 dark:text-gray-100`}
              />
              {errors.email && <p className="text-xs text-brand-red">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Password
                </Label>
                <Link href="/forgot-password" className="text-xs text-brand-blue font-semibold hover:text-brand-red transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={`h-12 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border pr-10 ${errors.password ? "border-brand-red" : "border-gray-200 dark:border-gray-700"} focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:border-brand-blue text-gray-900 dark:text-gray-100`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-brand-blue transition-colors"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-brand-red">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
              className="w-full h-12 bg-brand-blue hover:bg-brand-blue-light text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-blue/25 transition-all active:scale-[.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
              ) : (
                <>
                  Sign in
                  <span className="w-6 h-6 rounded-full bg-brand-red flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 12 12">
                      <line x1="2" y1="6" x2="10" y2="6" /><polyline points="6,2 10,6 6,10" />
                    </svg>
                  </span>
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
            <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-brand-blue font-bold hover:text-brand-red transition-colors">
              Register →
            </Link>
          </p>
        </motion.div>
      </div>

      {/* ── RIGHT — brand panel ── */}
      <div className="hidden lg:flex w-[48%] relative flex-col justify-between p-14 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80"
            alt="Land in Uganda"
            fill
            className="object-cover"
            sizes="48vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/90 via-brand-blue/80 to-[#0f2060]/95" />
        </div>

        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[.05]" style={{
          backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 39px,#fff 39px,#fff 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,#fff 39px,#fff 40px)",
        }} />

        {/* Red blobs */}
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-brand-red/25 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -left-12 w-52 h-52 rounded-full bg-brand-red/15 blur-2xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
            <Building2 className="h-5 w-5 text-white" strokeWidth={2} />
          </div>
          <span className="font-extrabold text-white text-base tracking-tight uppercase">Demo Properties</span>
        </div>

        {/* Middle */}
        <div className="relative z-10 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-red/20 border border-brand-red/30 rounded-full px-3 py-1 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-red-300">Uganda's #1 Land Platform</span>
            </div>
            <h2 className="text-5xl font-extrabold text-white leading-[1.1] tracking-tight">
              Own Land.<br /><span className="text-red-400">Own</span> Your Future.
            </h2>
            <p className="text-blue-200 text-base mt-4 leading-relaxed max-w-xs">
              Securely manage, track, and grow your land portfolio across Uganda — all in one place.
            </p>
          </div>
          <ul className="space-y-3">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                  <Icon className="h-3.5 w-3.5 text-red-400" />
                </div>
                <span className="text-sm text-blue-100">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Stats */}
        <div className="relative z-10">
          <div className="h-px bg-white/10 mb-6" />
          <div className="grid grid-cols-3 gap-4">
            {[{ value: "1,240+", label: "Properties" }, { value: "45", label: "Districts" }, { value: "3,800+", label: "Clients" }].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-extrabold text-white">{value}</div>
                <div className="text-[11px] text-blue-300 uppercase tracking-widest mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
