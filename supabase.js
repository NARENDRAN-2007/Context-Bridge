// Supabase helpers used by the background service worker.
// Configuration is read from chrome.storage.local (set via the Settings tab).

async function getSupabaseConfig() {
  const result = await chrome.storage.local.get(['supabase_url', 'supabase_key']);
  return {
    SUPABASE_URL: (result.supabase_url || '').replace(/\/$/, ''),
    SUPABASE_ANON_KEY: result.supabase_key || ''
  };
}

async function supabaseFetch(endpoint, method = 'GET', body = null) {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = await getSupabaseConfig();
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase not configured');
  }
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Prefer': 'return=representation'
    }
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, options);
  if (!res.ok) throw new Error(`Supabase error: ${res.status} ${res.statusText}`);
  if (method === 'DELETE') return true;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function getDeviceId() {
  const result = await chrome.storage.local.get('device_id');
  if (result.device_id) return result.device_id;
  const id = 'device_' + Math.random().toString(36).slice(2, 11);
  await chrome.storage.local.set({ device_id: id });
  return id;
}

async function saveToCloud(context) {
  return supabaseFetch('contexts', 'POST', {
    platform: context.platform,
    url: context.url,
    title: context.title,
    summary: context.summary,
    raw: context.raw,
    device_id: await getDeviceId(),
    saved_at: context.savedAt || new Date().toISOString()
  });
}

async function getFromCloud() {
  return supabaseFetch('contexts?order=saved_at.desc&limit=50');
}

async function deleteFromCloud(id) {
  return supabaseFetch(`contexts?id=eq.${id}`, 'DELETE');
}

// SQL to run in Supabase:
// CREATE TABLE contexts (
//   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   platform text, url text, title text,
//   summary text, raw text, device_id text,
//   saved_at timestamptz DEFAULT now()
// );
// ALTER TABLE contexts ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "Allow all" ON contexts FOR ALL USING (true);