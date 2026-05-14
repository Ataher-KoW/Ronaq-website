const allowedOrigins = new Set([
  "https://ataher-kow.github.io",
  "https://ronaq.ly",
  "https://www.ronaq.ly",
  "http://localhost:4173",
  "http://127.0.0.1:4173"
]);

export default {
  async fetch(request, env) {
    const corsHeaders = getCorsHeaders(request);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, corsHeaders);
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400, corsHeaders);
    }

    const requiredFields = ["customerName", "phone", "item", "shopLocation"];
    const missing = requiredFields.filter((field) => !String(data[field] || "").trim());

    if (missing.length) {
      return json({ error: "Missing required fields", fields: missing }, 400, corsHeaders);
    }

    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
      return json({ error: "Telegram is not configured" }, 503, corsHeaders);
    }

    const telegramResponse = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text: buildTelegramMessage(data),
        parse_mode: "HTML",
        disable_web_page_preview: true
      })
    });

    if (!telegramResponse.ok) {
      return json({ error: "Telegram rejected the request" }, 502, corsHeaders);
    }

    return json({ ok: true }, 200, corsHeaders);
  }
};

function getCorsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const allowOrigin = allowedOrigins.has(origin) ? origin : "https://ataher-kow.github.io";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

function json(payload, status, corsHeaders) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "content-type": "application/json; charset=utf-8"
    }
  });
}

function buildTelegramMessage(data) {
  const fields = [
    ["Customer", data.customerName],
    ["Phone / WhatsApp", data.phone],
    ["Requested item", data.item],
    ["Quantity", data.quantity || "Not specified"],
    ["Shop name", data.shopName || "Not specified"],
    ["Shop / shopping center location", data.shopLocation],
    ["City", data.city || "Not specified"],
    ["Preferred language", data.language || "Not specified"],
    ["Notes", data.notes || "None"]
  ];

  return [
    "<b>New Ronaq product request</b>",
    "",
    ...fields.map(([label, value]) => `<b>${escapeHtml(label)}:</b> ${escapeHtml(String(value).trim())}`)
  ].join("\n");
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[char]);
}
