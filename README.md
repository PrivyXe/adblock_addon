# 🛡️ ProBlock - Advanced Ad Blocker

<div align="center">

![Version](https://img.shields.io/badge/version-2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Chrome](https://img.shields.io/badge/Chrome-Extension-yellow.svg)
![Manifest](https://img.shields.io/badge/Manifest-V3-orange.svg)

**A powerful Chrome extension for blocking ads, trackers, and analytics scripts.**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Screenshots](#-screenshots) • [Contributing](#-contributing)

</div>

---

## ✨ Features

### 🚫 Comprehensive Ad Blocking
- **120+ blocking rules** covering major ad networks
- Blocks ads from Google, Facebook, Amazon, Twitter, TikTok, and more
- Stops video ads, pop-ups, and banner advertisements

### 📊 Real-time Statistics
- Track blocked ads **daily** and **monthly**
- View **top blocked networks** with visual charts
- See which ad networks are most active

### 🔍 Page Scanner
- **Detect ad networks** on any webpage in real-time
- Identify scripts, iframes, and tracking pixels
- **One-click blocking** for detected networks

### ⚙️ Custom Rules
- Add your own domains to block
- Manage and remove custom rules easily
- Persistent storage across sessions

### 🎨 Modern UI
- Beautiful dark theme design
- Smooth animations and transitions
- Clean, intuitive interface

---

## 📦 Installation

### From Source (Developer Mode)

1. **Clone the repository**
   ```bash
   git clone https://github.com/PrivyXe/ProBlock.git
   ```

2. **Open Chrome Extensions**
   - Navigate to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top right)

3. **Load the extension**
   - Click **Load unpacked**
   - Select the cloned `ProBlock` folder

4. **Done!** The extension icon will appear in your toolbar

---

## 🚀 Usage

### Dashboard
- View protection status (Active/Disabled)
- Toggle protection on/off
- See blocked ads count (today & this month)
- Monitor top blocked ad networks

### Detected Tab
- Scans current page for ad networks
- Shows detected trackers and scripts
- Click **Block** to add to custom rules
- **Rescan** button to refresh results

### Settings Tab
- Add custom domains to block
- View and manage blocked domains
- Reset all statistics

---

## 📸 Screenshots

<div align="center">

| Dashboard | Detected Ads | Settings |
|:---------:|:------------:|:--------:|
| Protection status & stats | Page scanner results | Custom rules |

</div>

---

## 🛠️ Technical Details

### Blocked Categories

| Category | Examples | Count |
|----------|----------|-------|
| **Ad Networks** | Google Ads, DoubleClick, Criteo, Taboola | 40+ |
| **Analytics** | Google Analytics, Hotjar, Mixpanel, Amplitude | 25+ |
| **Social Tracking** | Facebook Pixel, LinkedIn Insight, TikTok | 15+ |
| **Video Ads** | Teads, SpotX, IronSource | 10+ |
| **Pop-ups** | PopAds, PropellerAds, Adsterra | 15+ |
| **Other** | Push notifications, verification services | 15+ |

### Technologies Used
- **Manifest V3** - Latest Chrome extension standard
- **DeclarativeNetRequest API** - Efficient network request blocking
- **Content Scripts** - Page scanning capability
- **Chrome Storage API** - Persistent settings

### Permissions
- `declarativeNetRequest` - Block network requests
- `storage` - Save settings and statistics
- `tabs` - Access current tab for scanning
- `activeTab` - Interact with active page
- `<all_urls>` - Block ads on all websites

---

## 📁 Project Structure

```
ProBlock/
├── manifest.json      # Extension configuration
├── background.js      # Service worker (blocking logic)
├── content.js         # Page scanner script
├── popup.html         # Extension popup UI
├── popup.js           # Popup interaction logic
├── rules.json         # Static blocking rules (120+)
├── icons/
│   └── icon.png       # Extension icon
└── README.md          # This file
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Ideas for Contribution
- Add more blocking rules
- Improve page scanner detection
- Add whitelist functionality
- Localization support
- Firefox/Edge compatibility

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**PrivyXe**

- GitHub: [@PrivyXe](https://github.com/PrivyXe)

---

## ⭐ Show Your Support

If this project helped you, please give it a ⭐ on GitHub!

---

<div align="center">

**Made with ❤️ for a cleaner web experience**

</div>
