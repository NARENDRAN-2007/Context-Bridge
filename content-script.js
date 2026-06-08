// ContextBridge content script — injects floating Save button on supported AI sites.
(function () {
  let platform = null;

  const platformMap = {
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

  function init() {
    const host = window.location.hostname.replace('www.', '');
    for (const [key, val] of Object.entries(platformMap)) {
      if (host.includes(key)) { platform = { key, ...val }; break; }
    }
    if (!platform) return;

    setTimeout(injectButton, 2000);

    let lastUrl = location.href;
    new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(injectButton, 2000);
      }
    }).observe(document, { subtree: true, childList: true });
  }

  function injectButton() {
    const old = document.getElementById('cb-float-btn');
    if (old) old.remove();

    const wrap = document.createElement('div');
    wrap.id = 'cb-float-btn';
    wrap.innerHTML = `
      <div id="cb-btn-inner">
        <span id="cb-btn-icon">🧠</span>
        <span id="cb-btn-text">Save Context</span>
      </div>
      <div id="cb-toast" style="display:none;">✅ Saved!</div>
    `;
    document.body.appendChild(wrap);
    document.getElementById('cb-btn-inner').addEventListener('click', handleSave);
  }

  async function handleSave() {
    const btn = document.getElementById('cb-btn-inner');
    const toast = document.getElementById('cb-toast');
    const txt = document.getElementById('cb-btn-text');

    btn.style.opacity = '0.6';
    txt.textContent = 'Saving...';

    try {
      const messages = scrapeGeneric();
      const summary = buildContextSummary(messages);

      const context = {
        platform: platform.name,
        platformEmoji: platform.emoji,
        url: window.location.href,
        title: document.title,
        summary,
        raw: JSON.stringify(messages).slice(0, 100000),
        savedAt: new Date().toISOString()
      };

      const stored = await chrome.storage.local.get('cb_contexts');
      const contexts = stored.cb_contexts || [];
      contexts.unshift(context);
      if (contexts.length > 50) contexts.length = 50;
      await chrome.storage.local.set({ cb_contexts: contexts });

      try { chrome.runtime.sendMessage({ action: 'syncToCloud', context }); } catch (_) {}

      btn.style.opacity = '1';
      txt.textContent = 'Save Context';
      toast.textContent = '✅ Saved! Open the extension to restore.';
      toast.style.display = 'block';
      setTimeout(() => { toast.style.display = 'none'; }, 3000);
    } catch (e) {
      btn.style.opacity = '1';
      txt.textContent = 'Save Context';
      console.error('ContextBridge save error:', e);
      toast.textContent = '⚠️ Save failed';
      toast.style.display = 'block';
      setTimeout(() => { toast.style.display = 'none'; }, 3000);
    }
  }

  function scrapeGeneric() {
    const messages = [];
    const selectors = [
      '[data-testid="human-turn"], [data-testid="ai-turn"]',
      '[data-message-author-role]',
      '[class*="message"], [class*="turn"], [class*="bubble"]'
    ];

    for (const sel of selectors) {
      const els = document.querySelectorAll(sel);
      if (els.length > 0) {
        els.forEach(el => {
          const text = el.innerText?.trim();
          if (!text || text.length < 5) return;
          const isUser = el.matches('[data-testid="human-turn"], [data-message-author-role="user"], [class*="user"], [class*="human"], [class*="outgoing"]');
          messages.push({ role: isUser ? 'user' : 'assistant', text: text.slice(0, 800) });
        });
        if (messages.length > 0) break;
      }
    }

    if (messages.length === 0) {
      document.querySelectorAll('p').forEach((p, i) => {
        const text = p.innerText?.trim();
        if (text && text.length > 20) {
          messages.push({ role: i % 2 === 0 ? 'user' : 'assistant', text: text.slice(0, 800) });
        }
      });
    }
    return messages;
  }

  function buildContextSummary(messages) {
    const userMsgs = messages.filter(m => m.role === 'user');
    const aiMsgs = messages.filter(m => m.role === 'assistant');
    const last10 = messages.slice(-10);

    return [
      `[ContextBridge — ${platform.emoji} ${platform.name}]`,
      `Saved: ${new Date().toLocaleString()}`,
      `Total messages: ${messages.length} (${userMsgs.length} from you, ${aiMsgs.length} from AI)`,
      ``,
      `=== WHAT WE DISCUSSED ===`,
      `First topic: ${userMsgs[0]?.text?.slice(0, 200) || 'N/A'}`,
      `Latest question: ${userMsgs.slice(-1)[0]?.text?.slice(0, 300) || 'N/A'}`,
      `Latest AI response: ${aiMsgs.slice(-1)[0]?.text?.slice(0, 400) || 'N/A'}`,
      ``,
      `=== LAST 10 MESSAGES ===`,
      ...last10.map(m => `[${m.role === 'user' ? 'YOU' : 'AI'}]: ${m.text.slice(0, 400)}`),
      ``,
      `=== INSTRUCTION FOR NEW AI ===`,
      `You are continuing a conversation that was cut off due to context limits.`,
      `Please read everything above carefully and continue helping from where we left off.`,
      `Do not ask me to re-explain anything already covered above.`
    ].join('\n');
  }

  init();
})();