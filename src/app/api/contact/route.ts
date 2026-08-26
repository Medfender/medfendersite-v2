import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "mock-key");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message, inquiryType } = body;

    if (!name || !email || !message) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const validTypes = ["Booking", "Presets", "Tone Matching", "General"];
    const type = validTypes.includes(inquiryType) ? inquiryType : "General";

    const html = `
      <div style="font-family:sans-serif;background:#0b0f19;color:#f3f4f6;padding:24px;border-radius:12px;max-width:600px;">
        <h2 style="color:#00d8f6;border-bottom:2px solid #00d8f6;padding-bottom:8px;">New Inquiry — ${type}</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject || "—"}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space:pre-wrap;background:#181a20;padding:12px;border-radius:8px;">${message}</p>
      </div>
    `;

    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "mock-key") {
      console.log("[MOCK RESEND] Email payload:", { name, email, subject, inquiryType, htmlLength: html.length });
      return Response.json({ success: true, mock: true, message: "Email logged (RESEND_API_KEY not set)" });
    }

    const { data, error } = await resend.emails.send({
      from: "Medfender <noreply@medfender.site>",
      to: ["contact@medfender.site"],
      subject: `New Inquiry — ${type} | ${subject || name}`,
      html,
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, id: data?.id });
  } catch (err: any) {
    console.error("Contact POST error:", err);
    return Response.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
