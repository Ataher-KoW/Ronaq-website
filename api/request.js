const allowedOrigins = new Set([
  "https://ataher-kow.github.io",
  "https://ronaq.ly",
  "https://www.ronaq.ly"
]);

module.exports = async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const data = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const requiredFields = ["customerName", "phone", "item", "shopLocation"];
  const missing = requiredFields.filter((field) => !String(data[field] || "").trim());

  if (missing.length) {
    res.status(400).json({ error: "Missing required fields", fields: missing });
    return;
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    res.status(503).json({ error: "Telegram is not configured." });
    return;
  }

  const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: buildTelegramMessage(data),
      parse_mode: "HTML",
      disable_web_page_preview: true
    })
  });

  if (!telegramResponse.ok) {
    const details = await telegramResponse.text();
    console.error("Telegram error:", details);
    res.status(502).json({ error: "Telegram rejected the request" });
    return;
  }

  res.status(200).json({ ok: true });
};

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  const allowOrigin = allowedOrigins.has(origin) ? origin : "https://ataher-kow.github.io";

  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
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
