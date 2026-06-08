// Standalone scraping helpers (kept for reference / future use).
// The active content script uses inlined versions of these helpers.

const PLATFORMS = {
  'claude.ai': { name: 'Claude', emoji: '🧠' },
  'chat.openai.com': { name: 'ChatGPT', emoji: '🤖' },
  'chatgpt.com': { name: 'ChatGPT', emoji: '🤖' },
  'gemini.google.com': { name: 'Gemini', emoji: '✨' },
  'perplexity.ai': { name: 'Perplexity', emoji: '🔍' },
  'copilot.microsoft.com': { name: 'Copilot', emoji: '💼' },
  'grok.com': { name: 'Grok', emoji: '⚡' },
  'meta.ai': { name: 'Meta AI', emoji: '🌐' },
  'chat.mistral.ai': { name: 'Mistral', emoji: '🌊' },
  'poe.com': { name: 'Poe', emoji: '⚡' },
  'you.com': { name: 'You.com', emoji: '🔎' },
  'huggingface.co': { name: 'HuggingChat', emoji: '🤗' }
};

function detectPlatform() {
  const host = window.location.hostname.replace('www.', '');
  for (const [key, val] of Object.entries(PLATFORMS)) {
    if (host.includes(key)) return { key, ...val };
  }
  return null;
}