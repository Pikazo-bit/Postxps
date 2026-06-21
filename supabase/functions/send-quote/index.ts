import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { name, email, phone, serviceType, message } = body;

    if (!name || !email || !serviceType) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Save to Supabase database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: dbError } = await supabase.from("quotes").insert({
      name,
      email,
      phone: phone || null,
      service_type: serviceType,
      message: message || null,
    });

    if (dbError) {
      console.error("DB insert error:", dbError);
      // Don't block email sending if DB insert fails
    }

    // 2. Send email via Resend (free tier: 3,000 emails/month)
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (RESEND_API_KEY) {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #16a34a, #15803d); color: white; padding: 24px; border-radius: 8px 8px 0 0; }
              .header h2 { margin: 0; font-size: 22px; }
              .body { background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; }
              .field { margin-bottom: 16px; }
              .label { font-weight: bold; color: #6b7280; font-size: 12px; text-transform: uppercase; }
              .value { color: #111827; font-size: 15px; margin-top: 4px; }
              .message-box { background: white; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; margin-top: 4px; }
              .footer { background: #f3f4f6; padding: 16px 24px; border-radius: 0 0 8px 8px; font-size: 12px; color: #9ca3af; }
              .badge { display: inline-block; background: #dcfce7; color: #16a34a; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>📦 New Quote Request</h2>
                <p style="margin:8px 0 0;opacity:0.85;">Post Express Moving & Storage</p>
              </div>
              <div class="body">
                <div class="field">
                  <div class="label">Customer Name</div>
                  <div class="value">${name}</div>
                </div>
                <div class="field">
                  <div class="label">Email</div>
                  <div class="value"><a href="mailto:${email}" style="color:#16a34a;">${email}</a></div>
                </div>
                <div class="field">
                  <div class="label">Phone</div>
                  <div class="value">${phone || "Not provided"}</div>
                </div>
                <div class="field">
                  <div class="label">Service Type</div>
                  <div class="value"><span class="badge">${serviceType}</span></div>
                </div>
                ${message ? `
                <div class="field">
                  <div class="label">Message</div>
                  <div class="message-box">${message}</div>
                </div>` : ""}
              </div>
              <div class="footer">
                Submitted on ${new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })} · Post Express Website
              </div>
            </div>
          </body>
        </html>
      `;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "quotes@resend.dev",
          to: "info@postsxps.com",
          reply_to: email,
          subject: `New Quote Request from ${name} — ${serviceType}`,
          html: emailHtml,
        }),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
