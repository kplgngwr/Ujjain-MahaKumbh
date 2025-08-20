// Gemini API Service - Vite compatible
// Communicates with Google's Gemini API (v1) and extracts map commands from responses

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Allow overriding the model from .env; default to a fast, widely available model
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'models/gemini-2.5-pro';

function buildUrl(model) {
  return `https://generativelanguage.googleapis.com/v1/${model}:generateContent`;
}

export async function sendMessageToGemini(message, history = [], systemContext = {}) {
  if (!GEMINI_API_KEY) {
    console.warn('VITE_GEMINI_API_KEY not set in .env');
  }
  try {
    const formattedHistory = history
      .filter(m => !m.isError)
      .map(m => ({ role: m.isUser ? 'user' : 'model', parts: [{ text: m.content }] }));

  const systemText = `You are Anubhav AI, an assistant for the Ujjain Mahakumbh (Simhastha) app.
You help with: Ghats, Temples, Accommodation, Transport, Emergencies.
You can include map control commands in your response when appropriate:
[SHOW_LAYER:ghats|temples|wards|restaurants|hospitals|hotels]
[FOCUS:location name]
[ROUTE:origin->destination]
Always be concise and helpful.
Respond in ${systemContext.language || 'English'}.
Available layers: ${Object.keys(systemContext.layers || {}).join(', ')}`;

      const buildPayload = () => ({
        contents: [
          ...formattedHistory,
          { role: 'user', parts: [{ text: `${systemText}\n\n${message}` }] }
        ],
        generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 800 },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
        ]
      });
    // Attempt with configured model first, then fall back to a couple of known good models
    const candidates = [
      GEMINI_MODEL,
      'models/gemini-2.5-pro',
      'models/gemini-2.5-flash',
      'models/gemini-1.5-pro-002',
      'models/gemini-1.5-flash-002',
      'models/gemini-1.5-flash'
    ];
    let data = null;
    let lastErr = null;
    for (const model of candidates) {
      try {
        const res = await fetch(`${buildUrl(model)}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload())
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          const msg = errBody.error?.message || `Gemini API error (${model})`;
          if (/not found|not supported/i.test(msg)) {
            lastErr = new Error(msg);
            continue; // try next model
          }
          throw new Error(msg);
        }
        data = await res.json();
        break; // success
      } catch (e) {
        lastErr = e;
      }
    }
    if (!data) throw lastErr || new Error('Gemini API error');
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return { text, commands: extractMapCommands(text) };
  } catch (e) {
    console.error('Gemini error:', e);
    return { text: 'Sorry, I had trouble answering. Please try again.', error: e.message };
  }
}

function extractMapCommands(text) {
  const commands = [];
  if (!text) return commands;
  const layerMatches = text.match(/\[SHOW_LAYER:([a-zA-Z]+)\]/g) || [];
  layerMatches.forEach(m => {
    const layer = m.match(/\[SHOW_LAYER:([a-zA-Z]+)\]/)?.[1];
    if (layer) commands.push({ type: 'toggleLayer', layer });
  });
  const focusMatches = text.match(/\[FOCUS:([^\]]+)\]/g) || [];
  focusMatches.forEach(m => {
    const location = m.match(/\[FOCUS:([^\]]+)\]/)?.[1];
    if (location) commands.push({ type: 'focus', location });
  });
  const routeMatches = text.match(/\[ROUTE:([^\]]+)->([^\]]+)\]/g) || [];
  routeMatches.forEach(m => {
    const parts = m.match(/\[ROUTE:([^\]]+)->([^\]]+)\]/);
    if (parts) commands.push({ type: 'route', origin: parts[1], destination: parts[2] });
  });
  return commands;
}

export default { sendMessageToGemini };
