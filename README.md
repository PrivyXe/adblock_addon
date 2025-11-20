# 🚫 Adblock Extension

Chrome extension for blocking ads using declarativeNetRequest API. Fast, lightweight, and privacy-focused.

## ✨ Features

- 🎯 Blocks 19+ major ad networks and trackers
- ⚡ Uses Chrome's native declarativeNetRequest API (Manifest V3)
- 📊 Real-time blocked ads counter
- 🔒 Privacy-first - no data collection
- 🎨 Simple toggle UI

## 🚀 Installation

1. Clone this repository
```bash
git clone https://github.com/PrivyXe/adblock.git
cd adblock
```

2. Load the extension in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension` folder

3. Done! Click the extension icon to enable/disable adblock

## 🛡️ Blocked Domains

- Google Ads (doubleclick, googleadservices, googlesyndication)
- Facebook Ads & Tracking
- Twitter/X Ads
- YouTube Ads
- Google Analytics & Tag Manager
- Major ad networks (criteo, outbrain, taboola, adnxs, etc.)
- adhouse.pro

## 📁 Project Structure

```
adblock/
├── extension/           # Chrome extension files
│   ├── manifest.json   # Extension manifest (V3)
│   ├── background.js   # Service worker
│   ├── popup.html      # Extension popup UI
│   ├── popup.js        # Popup logic
│   ├── rules.json      # Ad blocking rules
│   └── icons/          # Extension icons
└── worker/             # Optional Cloudflare Worker
    └── src/
        └── index.js    # Worker script
```

## 🔧 Adding Custom Domains

Edit `extension/rules.json` and add a new rule:

```json
{
  "id": 20,
  "priority": 1,
  "action": { "type": "block" },
  "condition": {
    "urlFilter": "*yourdomain.com*",
    "resourceTypes": ["script", "image", "xmlhttprequest", "sub_frame"]
  }
}
```

Then reload the extension in Chrome.

## 📝 License

MIT

## 🤝 Contributing

Pull requests are welcome! Feel free to add more ad domains to the blocklist.
