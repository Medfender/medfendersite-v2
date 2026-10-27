import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "mock-key");

const LIMITS = {
  name: 200,
  email: 320,
  subject: 300,
  message: 10_000,
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asText(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Untrusted form text is escaped before it is interpolated into the email. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = asText(body?.name, LIMITS.name);
    const email = asText(body?.email, LIMITS.email);
    const subject = asText(body?.subject, LIMITS.subject);
    const message = asText(body?.message, LIMITS.message);

    if (!name || !email || !message) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!EMAIL_PATTERN.test(email)) {
      return Response.json({ error: "Enter a valid email address" }, { status: 400 });
    }

    const validTypes = ["Booking", "Presets", "Tone Matching", "General"];
    const type = validTypes.includes(body?.inquiryType) ? body.inquiryType : "General";

    const safe = {
      name: escapeHtml(name),
      email: escapeHtml(email),
      subject: escapeHtml(subject || "—"),
      message: escapeHtml(message),
    };

    const html = `
      <div style="max-width:600px;padding:32px;background:#f6f5f2;color:#121210;border:1px solid #d8d4ca;font-family:Georgia,'Times New Roman',serif;">
        <p style="margin:0 0 8px;font-family:'Courier New',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7d3125;">
          Medfender · New inquiry
        </p>
        <h2 style="margin:0 0 24px;padding-bottom:16px;border-bottom:1px solid #d8d4ca;font-size:28px;font-weight:400;color:#121210;">
          ${type}
        </h2>
        <p style="margin:0 0 8px;font-size:14px;"><strong>Name:</strong> ${safe.name}</p>
        <p style="margin:0 0 8px;font-size:14px;"><strong>Email:</strong> <a href="mailto:${safe.email}" style="color:#7d3125;">${safe.email}</a></p>
        <p style="margin:0 0 24px;font-size:14px;"><strong>Subject:</strong> ${safe.subject}</p>
        <p style="margin:0 0 8px;font-family:'Courier New',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#6b675e;">
          Message
        </p>
        <p style="margin:0;padding:16px;border-left:2px solid #c08a2b;background:#ecebe6;font-size:14px;line-height:1.6;white-space:pre-wrap;">${safe.message}</p>
      </div>
    `;

    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "mock-key") {
      console.log("[MOCK RESEND] Email payload:", {
        name,
        email,
        subject,
        inquiryType: type,
        htmlLength: html.length,
      });
      return Response.json({ success: true, mock: true, message: "Email logged (RESEND_API_KEY not set)" });
    }

    const { data, error } = await resend.emails.send({
      from: "Medfender <onboarding@resend.dev>",
      to: ["med.hamza.music@gmail.com"],
      replyTo: email,
      subject: `New Inquiry — ${type} | ${subject || name}`,
      html,
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("Contact POST error:", err);
    const message = err instanceof Error ? err.message : "Server error";
    return Response.json({ error: message }, { status: 500 });
  }
}
