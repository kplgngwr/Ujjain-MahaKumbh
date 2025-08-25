// Simple Express server that wraps Gemini API with timeout, retries, and friendly errors
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8787;
function getApiKey() {
  return process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
}
const MODEL = process.env.GEMINI_MODEL || 'models/gemini-2.5-pro';

const MODEL_FALLBACKS = [
  MODEL,
  'models/gemini-2.5-flash',
  'models/gemini-1.5-pro-002',
  'models/gemini-1.5-flash-002',
  'models/gemini-1.5-flash'
];

function buildUrl(model) {
  return `https://generativelanguage.googleapis.com/v1/${model}:generateContent`;
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function makePayload({ message, history = [], systemContext = {} }) {
  const sys = `You are Anubhav AI, an assistant for the Ujjain Mahakumbh (Simhastha) app.\n` +
    `You help with: Ghats, Temples, Accommodation, Transport, Emergencies.\n` +
    `You can include map control commands in your response when appropriate:\n` +
    `[SHOW_LAYER:ghats|temples|wards|restaurants|hospitals|hotels]\n` +
    `[FOCUS:location name]\n` +
    `[ROUTE:origin->destination]\n` +
    `Always be concise and helpful.\n` +
    `Respond in ${systemContext.language || 'English'}.\n` +
    `Available layers: ${Object.keys(systemContext.layers || {}).join(', ')}`;

  const formattedHistory = (history || [])
    .filter(m => !m.isError)
    .map(m => ({ role: m.isUser ? 'user' : 'model', parts: [{ text: m.content }] }));

  return {
    contents: [
      ...formattedHistory,
      { role: 'user', parts: [{ text: `${sys}\n\n${message}` }] }
    ],
    generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 800 },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
    ]
  };
}

async function callGeminiWithRetries(body, apiKey, correlationId) {
  const maxAttempts = 3;
  const perAttemptTimeoutMs = 12000; // leave headroom under 15s total
  let lastErr = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    for (const model of MODEL_FALLBACKS) {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), perAttemptTimeoutMs);
      try {
  const res = await fetch(`${buildUrl(model)}?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        clearTimeout(t);
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          const msg = errBody.error?.message || `Gemini error (${model})`;
          // Not-found/unsupported → try next model
          if (/not found|not supported/i.test(msg)) {
            lastErr = new Error(msg);
            continue;
          }
          throw new Error(msg);
        }
        const data = await res.json();
        return { data, modelTried: model };
      } catch (e) {
        clearTimeout(t);
        lastErr = e;
        // On abort or fetch error, try next model/attempt
      }
    }
    // jitter backoff between attempts
    const jitter = 200 + Math.floor(Math.random() * 600);
    await delay(jitter);
  }
  throw lastErr || new Error('Gemini call failed');
}

app.post('/api/chat', async (req, res) => {
  const started = Date.now();
  const { message, history, systemContext, correlationId } = req.body || {};
  const API_KEY = getApiKey();
  if (!API_KEY) {
    return res.status(200).json({ error: 'Server is not configured with GEMINI_API_KEY', correlationId });
  }
  if (!message || typeof message !== 'string') {
    return res.status(200).json({ error: 'Invalid message', correlationId });
  }
  // Overall 15s watchdog
  const watchdog = setTimeout(() => {
    try { res.status(200).json({ error: 'Request timed out. Please try again.', correlationId }); } catch {}
  }, 15000);

  try {
    const payload = makePayload({ message, history, systemContext });
  const { data, modelTried } = await callGeminiWithRetries(payload, API_KEY, correlationId);
    const cand = data?.candidates?.[0];
    let text = cand?.content?.parts?.[0]?.text || '';
    const finish = cand?.finishReason || 'STOP';
    if (!text) {
      text = 'Sorry, I could not craft a response. Please try again.';
    }
    if (finish !== 'STOP') {
      text = 'I couldn\'t complete that safely. Please try rephrasing.';
    }
    const resp = { text, correlationId };
    // include raw text commands; client extracts
    res.status(200).json(resp);
  } catch (e) {
    res.status(200).json({ error: 'Sorry, I hit an error—please retry.', correlationId, details: String(e?.message || e) });
  } finally {
    clearTimeout(watchdog);
    const elapsed = Date.now() - started;
    // eslint-disable-next-line no-console
    console.log(`[chat] ${correlationId || '-'} done in ${elapsed}ms`);
  }
});

// Simple health check and root docs
app.get('/health', (req, res) => {
  res.json({
  status: 'ok',
    uptime: process.uptime(),
  hasApiKey: !!getApiKey(),
    routes: ['/api/chat', '/health'],
  });
});

app.get('/', (_req, res) => {
  res.type('html').send(`<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Ujjain Mahakumbh Chat API</title>
      <style>body{font-family:system-ui,Segoe UI,Arial;max-width:720px;margin:40px auto;padding:0 16px;line-height:1.5} code{background:#f5f5f5;padding:2px 6px;border-radius:4px}</style>
    </head>
    <body>
      <h1>Ujjain Mahakumbh Chat API</h1>
      <p>This server only serves API endpoints for the app. Try:</p>
      <ul>
        <li><a href="/health">/health</a> — basic health check</li>
        <li><code>POST /api/chat</code> — chat endpoint used by the frontend (via Vite proxy)</li>
      </ul>
      <p>Use the frontend at <a href="http://localhost:5173" target="_blank">http://localhost:5173</a>.</p>
    </body>
  </html>`);
});

app.listen(PORT, () => {
  console.log(`Chat server listening on http://localhost:${PORT}`);
});
