import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, subject, message } = await req.json()

    await resend.emails.send({
      from: "info@kanywanibyaruhanga.com", // can be a verified domain/sender
      to: "kanywanibyaruhanga@gmail.com",
      subject: subject || "New Contact Form Message from Kanywani Byaruhanga website",
      replyTo: email,
      html: `
        <h2>New Message from ${firstName} ${lastName}</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error }, { status: 500 })
  }
}
