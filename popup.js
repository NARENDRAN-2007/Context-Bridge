let allContexts = [];
let selectedContext = null;

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab, .tab-content').forEach(el => el.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    if (tab.dataset.tab === 'restore') renderRestoreList();
  });
});

document.addEventListener('DOMContentLoaded', async () => {
  await loadContexts();
  await loadSettings();
});

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

async function loadContexts() {
  const list = document.getElementById('contexts-list');
  list.innerHTML = '<div class="loading">Loading...</div>';

  const local = await chrome.storage.local.get('cb_contexts');
  allContexts = local.cb_contexts || [];

  try {
    const cloudRes = await chrome.runtime.sendMessage({ action: 'getCloudContexts' });
    if (cloudRes?.success && Array.isArray(cloudRes.data) && cloudRes.data.length) {
      const cloudContexts = cloudRes.data.map(c => ({
        ...c,
        platformEmoji: c.platformEmoji || '🤖',
        savedAt: c.saved_at || c.savedAt,
        fromCloud: true
      }));
      const seen = new Set(allContexts.map(c => c.savedAt));
      cloudContexts.forEach(c => { if (!seen.has(c.savedAt)) allContexts.push(c); });
      allContexts.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    }
  } catch (_) { /* offline */ }

  renderContexts(allContexts);
}

function renderContexts(contexts) {
  const list = document.getElementById('contexts-list');
  if (!contexts.length) {
    list.innerHTML = '<div class="empty">No saved contexts yet.<br/>Visit an AI chat and click the 🧠 button.</div>';
    return;
  }
  list.innerHTML = contexts.map((c, i) => `
    <div class="context-card" data-index="${i}">
      <div class="card-top">
        <div class="card-platform">${escapeHtml(c.platformEmoji || '🤖')} ${escapeHtml(c.platform || '')}</div>
        <div class="card-date">${formatDate(c.savedAt)}</div>
      </div>
      <div class="card-title">${escapeHtml(c.title || c.url || 'Untitled')}</div>
      <div class="card-preview">${escapeHtml((c.summary || '').slice(0, 80))}...</div>
      <div class="card-actions">
        <button class="card-btn card-restore" data-action="restore" data-index="${i}">🔄 Restore</button>
        <button class="card-btn card-delete" data-action="delete" data-index="${i}">🗑️ Delete</button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('.card-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const i = Number(btn.dataset.index);
      if (btn.dataset.action === 'restore') quickRestore(i);
      else deleteContext(i);
    });
  });
}

function renderRestoreList() {
  const list = document.getElementById('restore-list');
  if (!allContexts.length) {
    list.innerHTML = '<div class="empty">No saved contexts yet.</div>';
    return;
  }
  list.innerHTML = allContexts.map((c, i) => `
    <div class="context-card" data-index="${i}">
      <div class="card-top">
        <div class="card-platform">${escapeHtml(c.platformEmoji || '🤖')} ${escapeHtml(c.platform || '')}</div>
        <div class="card-date">${formatDate(c.savedAt)}</div>
      </div>
      <div class="card-title">${escapeHtml(c.title || c.url || 'Untitled')}</div>
    </div>
  `).join('');

  list.querySelectorAll('.context-card').forEach(card => {
    card.addEventListener('click', () => selectContext(Number(card.dataset.index), card));
  });
}

function selectContext(index, el) {
  document.querySelectorAll('#restore-list .context-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedContext = allContexts[index];
  document.getElementById('preview-text').textContent =
    (selectedContext.summary || '').slice(0, 400) + '...';
  document.getElementById('restore-preview').style.display = 'block';
}

function quickRestore(index) {
  document.querySelectorAll('.tab, .tab-content').forEach(el => el.classList.remove('active'));
  document.querySelector('[data-tab="restore"]').classList.add('active');
  document.getElementById('tab-restore').classList.add('active');
  renderRestoreList();
  setTimeout(() => {
    const card = document.querySelector(`#restore-list .context-card[data-index="${index}"]`);
    if (card) selectContext(index, card);
  }, 50);
}

document.getElementById('copy-btn')?.addEventListener('click', async () => {
  if (!selectedContext) return;
  try {
    await navigator.clipboard.writeText(selectedContext.summary || '');
    const toast = document.getElementById('copy-toast');
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
  } catch (e) {
    alert('Copy failed. Please try again.');
  }
});

async function deleteContext(index) {
  const ctx = allContexts[index];
  allContexts.splice(index, 1);
  const localOnly = allContexts.filter(c => !c.fromCloud);
  await chrome.storage.local.set({ cb_contexts: localOnly });
  if (ctx?.id && ctx.fromCloud) {
    try { chrome.runtime.sendMessage({ action: 'deleteCloudContext', id: ctx.id }); } catch (_) {}
  }
  renderContexts(allContexts);
}

async function loadSettings() {
  const result = await chrome.storage.local.get(['supabase_url', 'supabase_key']);
  if (result.supabase_url) document.getElementById('supabase-url').value = result.supabase_url;
  if (result.supabase_key) document.getElementById('supabase-key').value = result.supabase_key;
}

document.getElementById('save-settings')?.addEventListener('click', async () => {
  const url = document.getElementById('supabase-url').value.trim();
  const key = document.getElementById('supabase-key').value.trim();
  await chrome.storage.local.set({ supabase_url: url, supabase_key: key });
  const toast = document.getElementById('settings-toast');
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 2500);
});

document.getElementById('clear-local')?.addEventListener('click', async () => {
  if (confirm('Clear all local contexts?')) {
    await chrome.storage.local.remove('cb_contexts');
    allContexts = allContexts.filter(c => c.fromCloud);
    renderContexts(allContexts);
  }
});

document.getElementById('search')?.addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  renderContexts(allContexts.filter(c =>
    (c.platform || '').toLowerCase().includes(q) ||
    (c.title || '').toLowerCase().includes(q) ||
    (c.summary || '').toLowerCase().includes(q)
  ));
});

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
  return d.toLocaleDateString();
}