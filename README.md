# Ronaq Company Website

Bilingual English/Arabic website for Ronaq Company with a product request popup and Telegram delivery.

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
https://ataher-kow.github.io/Ronaq-website/public/
```

GitHub Pages is static hosting. It will show the website, products, language switcher, and contact links, but it cannot run `server.js` or the Telegram `/api/request` endpoint. Keep `server.js` for local/private hosting, or move the Telegram request endpoint to a small backend such as Cloudflare Workers, Render, Railway, or Vercel.

On GitHub Pages, the request form falls back to WhatsApp using `public/config.js` so customers can still send the prepared request message. To connect a real backend later, set `requestEndpoint` in `public/config.js` to your deployed API URL.

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
