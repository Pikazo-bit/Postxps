import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { name, email, phone, origin, destination, pickupDate, packageType, weight, message } = body;

    if (!name || !email || !phone || !origin || !destination || !pickupDate || !packageType || !weight) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const packageTypeLabels: Record<string, string> = {
      "documents": "Documents",
      "small-package": "Small Package (<5kg)",
      "medium-package": "Medium Package (5-20kg)",
      "large-package": "Large Package (>20kg)",
      "freight": "Freight"
    };

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            h2 { color: #ea580c; border-bottom: 2px solid #ea580c; padding-bottom: 10px; }
            .field { margin-bottom: 12px; }
            .label { font-weight: bold; color: #666; }
            .value { color: #333; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>New Quote Request</h2>
            <div class="field">
              <span class="label">Name:</span>
              <span class="value">${name}</span>
            </div>
            <div class="field">
              <span class="label">Email:</span>
              <span class="value"><a href="mailto:${email}">${email}</a></span>
            </div>
            <div class="field">
              <span class="label">Phone:</span>
              <span class="value">${phone}</span>
            </div>
            <div class="field">
              <span class="label">Origin:</span>
              <span class="value">${origin}</span>
            </div>
            <div class="field">
              <span class="label">Destination:</span>
              <span class="value">${destination}</span>
            </div>
            <div class="field">
              <span class="label">Pickup Date:</span>
              <span class="value">${pickupDate}</span>
            </div>
            <div class="field">
              <span class="label">Package Type:</span>
              <span class="value">${packageTypeLabels[packageType] || packageType}</span>
            </div>
            <div class="field">
              <span class="label">Estimated Weight:</span>
              <span class="value">${weight} kg</span>
            </div>
            ${message ? `
            <div class="field">
              <span class="label">Additional Message:</span>
              <div class="value" style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin-top: 5px;">${message}</div>
            </div>
            ` : ''}
            <div class="footer">
              <p>This quote request was submitted via Post Express Delivery website.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "quotes@postsxps.com",
        to: "info@postsxps.com",
        subject: `New Quote Request from ${name}`,
        html: emailHtml,
        reply_to: email,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Resend API error:", errorData);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, message: "Quote request sent successfully" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
