import { NextResponse } from "next/server"
import { sendEmail } from "@/services/email-service"

export async function POST(req: Request) {
  try {
    const { to, memberName, committeeName, monthNumber, amount, currency } = await req.json()

    if (!to || !memberName || !committeeName) {
      return NextResponse.json({ error: "Missing required email parameters" }, { status: 400 })
    }

    const subject = `Payment Reminder: ${committeeName} — Month ${monthNumber}`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4f46e5; margin-bottom: 10px;">Committee Payment Reminder</h2>
        <p>Dear <strong>${memberName}</strong>,</p>
        <p>This is a friendly reminder regarding your monthly committee contribution for <strong>${committeeName}</strong>.</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Month:</strong> Month ${monthNumber}</p>
          <p style="margin: 5px 0;"><strong>Amount Due:</strong> ${currency || "PKR"} ${amount?.toLocaleString()}</p>
        </div>
        <p>Please complete your payment at your earliest convenience to keep the committee pool on track!</p>
        <p style="color: #64748b; font-size: 12px; margin-top: 20px;">Personal Management System — Automated Reminder</p>
      </div>
    `

    await sendEmail(to, subject, html)
    return NextResponse.json({ success: true, message: "Reminder email sent successfully" })
  } catch (err: any) {
    console.error("Failed to send reminder email:", err)
    return NextResponse.json({ error: err.message || "Failed to send email" }, { status: 500 })
  }
}
