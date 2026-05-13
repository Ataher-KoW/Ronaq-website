# Ronaq Company Website

Bilingual English/Arabic website for Ronaq Company with a product request popup and Telegram delivery.

## Run locally

```powershell
npm start
```

Open `http://localhost:4173`.

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
