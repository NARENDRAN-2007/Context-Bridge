# ContextBridge 

> Save and restore AI conversation context across 10+ platforms with cloud sync.

Never lose your train of thought again. ContextBridge is a browser extension that captures your AI conversation context — your prompts, personas, and progress — and lets you restore it instantly on any supported platform, synced via the cloud.

---

## ✨ Features

- 🔄 **Cross-platform context sync** — Save context on ChatGPT, pick it up on Claude or Gemini
- ☁️ **Cloud sync** — Your saved contexts follow you across devices via Supabase
- 🧠 **10+ AI platforms supported** — Works seamlessly across the major AI assistants
- 📋 **Clipboard-aware** — Intelligently handles copy-paste to inject context
- 🔔 **Notifications** — Get alerted when a context is saved or restored
- 🕵️ **InPrivate/Incognito support** *(optional)*

---

## 🌐 Supported Platforms

| Platform | URL |
|---|---|
| ChatGPT | `chat.openai.com`, `chatgpt.com` |
| Claude | `claude.ai` |
| Gemini | `gemini.google.com` |
| Microsoft Copilot | `copilot.microsoft.com` |
| Grok | `grok.com` |
| Perplexity | `perplexity.ai` |
| Meta AI | `meta.ai` |
| Mistral | `chat.mistral.ai` |
| Hugging Face | `huggingface.co` |
| Poe | `poe.com` |
| You.com | `you.com` |

---

## 🚀 Getting Started

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/contextbridge.git
   cd contextbridge
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load it in your browser:
   - **Chrome/Edge**: Go to `chrome://extensions/` → Enable Developer Mode → Load Unpacked → select the `dist/` folder
   - **Firefox**: Go to `about:debugging` → Load Temporary Add-on → select `manifest.json`

### Configuration

Set up your Supabase project for cloud sync:

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Add them to the extension settings after installation

---

## 🔐 Permissions

ContextBridge requests the following permissions:

| Permission | Reason |
|---|---|
| **Read browsing history** | Detect which AI platform you're currently on |
| **Display notifications** | Notify you when context is saved or restored |
| **Modify clipboard data** | Inject saved context into the active chat |
| **Site access** | Read and write context on supported AI platforms |

> ⚠️ **Privacy note**: ContextBridge only accesses data on the listed AI platforms. No data is shared with third parties. Cloud sync is handled entirely through your own Supabase instance.

---

## 🛠️ Tech Stack

- **Browser Extension** (Manifest V3)
- **Supabase** — Cloud sync backend
- **JavaScript / TypeScript**

---

## 📁 Project Structure

```
contextbridge/
├── src/
│   ├── background/       # Service worker
│   ├── content/          # Content scripts per platform
│   ├── popup/            # Extension popup UI
│   └── utils/            # Shared helpers
├── public/
│   └── icons/
├── manifest.json
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

[MIT](LICENSE)

---

## 🙋 Support

Found a bug or want a new platform added? [Open an issue](https://github.com/yourusername/contextbridge/issues).
