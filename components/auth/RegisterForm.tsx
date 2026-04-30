"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Building2, Loader2, Eye, EyeOff,
  CheckCircle, MapPin, Shield, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
type FormData = z.infer<typeof schema>;

const features = [
  { icon: MapPin,       text: "Browse 1,200+ land listings across Uganda" },
  { icon: Shield,       text: "GIS-verified, titled and secure properties" },
  { icon: TrendingUp,   text: "Track your property portfolio in one place" },
  { icon: CheckCircle,  text: "Instant access to land registry records" },
];

const stats = [
  { value: "1,240+", label: "Properties" },
  { value: "45",     label: "Districts" },
  { value: "3,800+", label: "Clients" },
];

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading]       = useState(false);
  const [showPass, setShowPass]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name, email: data.email,
          phone: data.phone, password: data.password,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Registration failed");
      toast.success("Account created! Please sign in.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  /* ── shared input class ── */
  const inputCls = (hasError?: boolean) =>
    `h-11 bg-slate-50 border text-sm rounded-xl px-3.5 focus-visible:ring-2 focus-visible:ring-blue-800/30 focus-visible:border-blue-800 transition-colors ${
      hasError ? "border-red-500 bg-red-50" : "border-slate-200"
    }`;

  return (
    <div className="min-h-screen flex font-sans">

      {/* ── LEFT — form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-white relative overflow-hidden">

        {/* Subtle background geometry */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-800/[.03] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-red-600/[.04] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="w-full max-w-[420px] relative">

          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 mb-9 group">
            <div className="w-9 h-9 rounded-xl bg-blue-800 flex items-center justify-center shadow-md shadow-blue-800/30 group-hover:bg-blue-900 transition-colors">
              <Building2 className="h-4.5 w-4.5 text-white" strokeWidth={2} />
            </div>
            <span className="font-extrabold text-blue-800 text-base tracking-tight uppercase">
              Demo Properties
            </span>
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-[2rem] font-extrabold text-slate-900 leading-tight tracking-tight">
              Create your<br />
              <span className="text-blue-800">free account</span>
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              Join thousands of Ugandans managing land securely.
            </p>
          </div>

          {/* ── Fields ── */}
          <div className="space-y-4">

            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                Full Name
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                {...register("name")}
                className={inputCls(!!errors.name)}
              />
              {errors.name && (
                <p className="text-[11px] text-red-600 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-600" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                {...register("email")}
                className={inputCls(!!errors.email)}
              />
              {errors.email && (
                <p className="text-[11px] text-red-600 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-600" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                Phone{" "}
                <span className="normal-case text-slate-400 font-normal tracking-normal">(optional)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+256 700 000000"
                {...register("phone")}
                className={inputCls()}
              />
            </div>

            {/* Password row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    className={`${inputCls(!!errors.password)} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-800 transition-colors"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-red-600 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-600" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  Confirm
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                    className={`${inputCls(!!errors.confirmPassword)} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-800 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] text-red-600 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-600" />
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
              className="w-full h-12 mt-1 bg-blue-800 hover:bg-blue-900 text-white font-bold text-sm rounded-xl tracking-wide shadow-lg shadow-blue-800/25 transition-all active:scale-[.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating account…
                </>
              ) : (
                <span className="flex items-center gap-2">
                  Create account
                  <span className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 12 12">
                      <line x1="2" y1="6" x2="10" y2="6" />
                      <polyline points="6,2 10,6 6,10" />
                    </svg>
                  </span>
                </span>
              )}
            </Button>
          </div>

          {/* Divider + sign in link */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-[11px] text-slate-400 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-800 font-semibold hover:text-red-600 transition-colors">
              Sign in →
            </Link>
          </p>
        </div>
      </div>

      {/* ── RIGHT — brand panel ── */}
      <div className="hidden lg:flex w-[46%] relative flex-col justify-between p-12 overflow-hidden bg-blue-800">

        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80"
            alt="Land in Uganda"
            fill
            className="object-cover opacity-[.12]"
            sizes="46vw"
          />
        </div>

        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 39px,#fff 39px,#fff 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,#fff 39px,#fff 40px)",
          }}
        />

        {/* Red accent blob */}
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-red-600/30 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -left-12 w-48 h-48 rounded-full bg-red-600/20 blur-2xl pointer-events-none" />

        {/* Top logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
            <Building2 className="h-4.5 w-4.5 text-white" strokeWidth={2} />
          </div>
          <span className="font-extrabold text-white text-base tracking-tight uppercase">
            Demo Properties
          </span>
        </div>

        {/* Middle content */}
        <div className="relative z-10 space-y-8">
          <div>
            {/* Red pill label */}
            <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/30 rounded-full px-3 py-1 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-red-300">
                Uganda's #1 Land Platform
              </span>
            </div>

            <h2 className="text-[2.6rem] font-extrabold text-white leading-[1.1] tracking-tight">
              Own Land.<br />
              <span className="text-red-400">Own</span> Your Future.
            </h2>
            <p className="text-blue-200 text-base mt-4 leading-relaxed max-w-xs">
              Register to access your property dashboard and manage land securely across Uganda.
            </p>
          </div>

          {/* Feature list */}
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

        {/* Stats footer */}
        <div className="relative z-10">
          <div className="h-px bg-white/10 mb-6" />
          <div className="grid grid-cols-3 gap-4">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-extrabold text-white tracking-tight">{value}</div>
                <div className="text-[11px] text-blue-300 uppercase tracking-widest mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}