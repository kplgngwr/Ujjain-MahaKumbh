// Vercel Serverless Function for chat — mirrors the Express /api/chat handler

const MODEL = process.env.GEMINI_MODEL || 'models/gemini-2.5-pro';
const MODEL_FALLBACKS = [
  MODEL,
  'models/gemini-2.5-flash',
  'models/gemini-1.5-pro-002',
  'models/gemini-1.5-flash-002',
  'models/gemini-1.5-flash',
];

function getApiKey() {
  return process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
}

function buildUrl(model) {
  return `https://generativelanguage.googleapis.com/v1/${model}:generateContent`;
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

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
    .filter((m) => !m.isError)
    .map((m) => ({ role: m.isUser ? 'user' : 'model', parts: [{ text: m.content }] }));

  return {
    contents: [
      ...formattedHistory,
      { role: 'user', parts: [{ text: `${sys}\n\n${message}` }] },
    ],
    generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 800 },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  };
}

async function callGeminiWithRetries(body, apiKey, correlationId) {
  const maxAttempts = 3;
  const perAttemptTimeoutMs = 12000;
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
          if (/not found|not supported/i.test(msg)) {
            lastErr = new Error(msg);
            continue; // try next model
          }
          throw new Error(msg);
        }
        const data = await res.json();
        return { data, modelTried: model };
      } catch (e) {
        clearTimeout(t);
        lastErr = e;
      }
    }
    const jitter = 200 + Math.floor(Math.random() * 600);
    await delay(jitter);
  }
  throw lastErr || new Error('Gemini call failed');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const started = Date.now();
  const watchdog = setTimeout(() => {
    try { res.status(200).json({ error: 'Request timed out. Please try again.' }); } catch {}
  }, 15000);

  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      clearTimeout(watchdog);
      res.status(200).json({ error: 'Server is not configured with GEMINI_API_KEY' });
      return;
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { message, history, systemContext, correlationId } = body;
    if (!message || typeof message !== 'string') {
      clearTimeout(watchdog);
      res.status(200).json({ error: 'Invalid message', correlationId });
      return;
    }

    const payload = makePayload({ message, history, systemContext });
    const { data } = await callGeminiWithRetries(payload, apiKey, correlationId);
    const cand = data?.candidates?.[0];
    let text = cand?.content?.parts?.[0]?.text || '';
    const finish = cand?.finishReason || 'STOP';
    if (!text) {
      text = 'Sorry, I could not craft a response. Please try again.';
    }
    if (finish !== 'STOP') {
      text = 'I couldn\'t complete that safely. Please try rephrasing.';
    }
    clearTimeout(watchdog);
    res.status(200).json({ text, correlationId });
  } catch (e) {
    clearTimeout(watchdog);
    res.status(200).json({ error: 'Sorry, I hit an error—please retry.', details: String(e?.message || e) });
  } finally {
    // eslint-disable-next-line no-console
    console.log(`[vercel-chat] done in ${Date.now() - started}ms`);
  }
}
