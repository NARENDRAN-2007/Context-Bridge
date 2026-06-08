# ContextBridge

Save & restore AI conversation context across 10+ AI platforms, with optional Supabase cloud sync.

## Install (unpacked)

1. Unzip `contextbridge.zip` (or use the `extension/` folder directly).
2. Open `chrome://extensions` in Chrome (or any Chromium browser).
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the unzipped folder.
5. (Optional) Open the popup → **Settings** tab → paste your Supabase URL + anon key for cloud sync.
6. Visit any supported AI chat → click the floating 🧠 **Save Context** button.

## Supabase setup (optional)

Run this SQL in Supabase → SQL Editor:

```sql
CREATE TABLE contexts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  platform text,
  url text,
  title text,
  summary text,
  raw text,
  device_id text,
  saved_at timestamptz DEFAULT now()
);

ALTER TABLE contexts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON contexts FOR ALL USING (true);
```

## Supported platforms

Claude · ChatGPT · Gemini · Perplexity · Copilot · Grok · Meta AI · Mistral · Poe · You.com · HuggingChat