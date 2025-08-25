# Ujjain Mahakumbh — Frontend + Chat API

This app uses Vite + React for the frontend and exposes a chat API via:

- Local dev Express server on http://localhost:8787 (proxy from Vite to `/api/*`)
- Vercel serverless functions in the `/api` folder for production (`/api/chat`, `/api/health`)

## Local development

1. Copy `.env.example` to `.env` and set keys:

```
VITE_GOOGLE_MAPS_API_KEY=...
GEMINI_API_KEY=...  # or VITE_GEMINI_API_KEY=...
```

2. Start servers in two terminals:

```
npm run server   # starts Express API on 8787 (loads .env)
npm run dev      # starts Vite on 5173 and proxies /api to 8787
```

## Deploy on Vercel

When pushed to GitHub, Vercel builds the frontend and deploys serverless functions found under `/api`.

Set Environment Variables in Vercel Project Settings → Environment Variables:

- `GEMINI_API_KEY` (or `VITE_GEMINI_API_KEY`)
- `VITE_GOOGLE_MAPS_API_KEY`

After deploy, the frontend will call `/api/chat` directly (handled by Vercel functions).
