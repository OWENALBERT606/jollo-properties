"use client";

import dynamic from "next/dynamic";
const OfficeMap = dynamic(() => import("@/components/shared/PropertyMap"), { ssr: false });

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { MapPin, Phone, Mail, Clock, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Subject required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});
type FormData = z.infer<typeof schema>;

const contacts = [
  {
    icon: MapPin,
    label: "Office Address",
    value: "Kireka Shopping Centre, Kampala, Uganda",
    color: "bg-brand-blue-pale text-brand-blue",
  },
  {
    icon: Phone,
    label: "Phone Number",
    value: "+256 700 000 000",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Mail,
    label: "Email Address",
    value: "info@demoproperties.ug",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Clock,
    label: "Working Hours",
    value: "Mon – Fri: 8:00 AM – 5:00 PM",
    color: "bg-amber-50 text-amber-600",
  },
];

export default function ContactSection() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    toast.success("Message sent! We'll get back to you within 24 hours.");
    reset();
    setLoading(false);
  }

  return (
    <section className="py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-1.5 bg-brand-blue-pale text-brand-blue text-xs font-semibold px-3 py-1 rounded-full mb-3">
            Get In Touch
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Contact <span className="text-brand-red">Us</span></h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-xl mx-auto">
            Have a question about a property or need help with land registration?
            Our team is ready to assist you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact info — left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 space-y-4"
          >
            {contacts.map(({ icon: Icon, label, value, color }) => (
              <div
                key={label}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex items-center gap-4 border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-brand-blue/20 transition-all duration-200"
              >
                <div className={`rounded-xl p-3 shrink-0 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide mb-0.5">
                    {label}
                  </div>
                  <div className="text-gray-800 dark:text-gray-200 font-medium text-sm">{value}</div>
                </div>
              </div>
            ))}

            {/* Map embed placeholder */}
            <div className="mt-2 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 h-52">
              <OfficeMap lat={0.3394} lng={32.6394} title="Demo Properties — Kireka Shopping Centre" />
            </div>
          </motion.div>

          {/* Contact form — right */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm"
          >
            {/* Gradient top strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-brand-blue to-brand-blue-light" />

            <div className="p-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Send Us a Message</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      {...register("name")}
                      className={errors.name ? "border-brand-red" : "bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"}
                    />
                    {errors.name && <p className="text-xs text-brand-red">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      {...register("email")}
                      className={errors.email ? "border-brand-red" : "bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"}
                    />
                    {errors.email && <p className="text-xs text-brand-red">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+256 700 000000"
                      {...register("phone")}
                      className="bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      placeholder="e.g. Property Inquiry"
                      {...register("subject")}
                      className={errors.subject ? "border-brand-red" : "bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"}
                    />
                    {errors.subject && <p className="text-xs text-brand-red">{errors.subject.message}</p>}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    placeholder="Tell us how we can help you..."
                    {...register("message")}
                    className={`resize-none ${errors.message ? "border-brand-red" : "bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"}`}
                  />
                  {errors.message && <p className="text-xs text-brand-red">{errors.message.message}</p>}
                </div>

                <Button
                  onClick={handleSubmit(onSubmit)}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-brand-blue to-brand-blue-light hover:from-brand-blue-light hover:to-brand-blue text-white h-12 text-base font-semibold flex items-center gap-2 shadow-md shadow-brand-blue/20 transition-all duration-300"
                >
                  {loading ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="h-5 w-5" /> Send Message</>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
