"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MessageSquare, Send } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("")
  const router=useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setStatus("")

      const form = e.currentTarget // ✅ this is your form element


    const formData = new FormData(e.currentTarget)
    const data = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()
      if (result.success) {
        setStatus("✅ Message sent successfully!")
        // e.currentTarget.reset()
        router.refresh();
        form.reset();
          setTimeout(() => {
    window.location.reload()
  }, 2000) // 2 second delay
     

      } else {
        setStatus("❌ Failed to send message. Try again.")
      }
    } catch {
    //   setStatus("❌ Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Contact Form Section */}
      <section className="py-20 bg-popover">
        <div className="max-w-3xl mx-auto px-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-card-foreground flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-primary" />
                Send a Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input name="firstName" required placeholder="Your first name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input name="lastName" required placeholder="Your last name" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input name="email" type="email" required placeholder="your.email@example.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input name="subject" required placeholder="What's this about?" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea name="message" required rows={6} placeholder="Share your thoughts..." />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
              {status && <p className="mt-4 text-sm">{status}</p>}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
