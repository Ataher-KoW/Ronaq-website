# Ronaq Company Website

Bilingual English/Arabic website for Ronaq Company with a product request popup, WhatsApp fallback, and optional Telegram delivery through Cloudflare Workers.

## Run locally

```powershell
npm start
```

Open `http://localhost:4173`.

## GitHub Pages

This repo includes a GitHub Actions workflow that deploys the static site from `public/` to GitHub Pages on every push to `main`.

After pushing, open the repo on GitHub, go to **Settings > Pages**, and set **Source** to **GitHub Actions**.

The public site will be:

```text
https://ronaq.ly/
https://ataher-kow.github.io/Ronaq-website/
```

GitHub Pages is static hosting. It shows the website, products, language switcher, request popup, and contact links, but it cannot safely run Telegram bot code because the bot token must stay private.

Until a backend URL is configured, the request form falls back to WhatsApp using `public/config.js` so customers can still send a prepared request message.

## Cloudflare Worker for Telegram

Best setup for this project:

1. Keep the website on GitHub Pages.
2. Create one Cloudflare Worker for the Telegram request endpoint.
3. Put the Worker URL in `public/config.js`.

Cloudflare setup:

1. Open Cloudflare Dashboard.
2. Go to **Workers & Pages**.
3. Create a new Worker, for example `ronaq-telegram`.
4. Deploy the starter Worker once.
5. Open **Edit Code** and replace the code with `cloudflare-worker/request-worker.js`.
6. Deploy again.
7. Open the Worker's **Settings > Variables and Secrets**.
8. Add these as secrets:

```env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

Test the Worker from PowerShell:

```powershell
Invoke-RestMethod -Uri "https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev" -Method Post -ContentType "application/json" -Body '{"customerName":"Test","phone":"0910000000","item":"Diapers","shopLocation":"Tripoli"}'
```

If Telegram receives the test request, update `public/config.js`:

```js
window.RONAQ_CONFIG = {
  requestEndpoint: "https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev",
  whatsappNumber: "218918808125"
};
```

After that, requests from the website will appear in the Telegram chat configured by `TELEGRAM_CHAT_ID`. No DNS change is required when using the `workers.dev` URL.

## Telegram setup

Create a `.env` file based on `.env.example`:

```env
PORT=4173
TELEGRAM_BOT_TOKEN=123456789:replace_with_your_bot_token
TELEGRAM_CHAT_ID=replace_with_your_chat_id
```

The site works without these values, but request submissions will return a configuration message until Telegram is configured.

## Telegram info needed

1. `TELEGRAM_BOT_TOKEN`: create it with Telegram's `@BotFather`.
2. `TELEGRAM_CHAT_ID`: the ID of your private chat, group, or channel where requests should arrive.

If you want requests sent to a group, add the bot to the group first, then use that group's chat ID.
