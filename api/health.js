function getApiKey() {
  return process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
}

export default async function handler(_req, res) {
  res.status(200).json({ status: 'ok', hasApiKey: !!getApiKey() });
}
