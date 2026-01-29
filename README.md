# 🛡️ ProBlock - Advanced Ad & Tracker Blocker

<div align="center">

[![Version](https://img.shields.io/badge/Version-4.0-blue?style=for-the-badge&logo=google-chrome)](https://github.com/PrivyXe/adblock_addon/releases)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-orange?style=for-the-badge&logo=google-chrome)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Privacy Focused](https://img.shields.io/badge/Privacy-Focused-red?style=for-the-badge&logo=shield)](CONTRIBUTING.md)

**Reclaim your browsing experience. Block ads, disable trackers, and skip video interruptions automatically.**

[Key Features](#-key-features) • [Installation](#-installation) • [YouTube Protection](#-youtube-protection) • [Privacy](#-privacy--security) • [Contributing](#-contributing) 

</div>

---

## 🚀 Overview

**ProBlock** is a high-performance Chrome extension designed to provide a cleaner, faster, and safer web experience. Built continuously on the modern **Manifest V3** platform, it leverages the `declarativeNetRequest` API to block ads at the network level before they load, ensuring minimal impact on browser performance.

Beyond standard ad blocking, ProBlock includes a dedicated **YouTube Ad Skipper**, real-time page scanning for invisible trackers, and a comprehensive dashboard to visualize what's being blocked.

## ✨ Key Features

### 🛡️ Enterprise-Grade Blocking
- **Network-Level Blocking**: Stops ads and trackers before they even download using 120+ optimized rule sets.
- **Universal Coverage**: effectively blocks content on major platforms including Google, Facebook, Amazon, Twitter/X, and TikTok.
- **Resource Saver**: Reduces data usage and speeds up page load times by preventing heavy ad media from loading.

### 🎥 Specialized YouTube Protection
ProBlock goes beyond simple blocking for streaming sites:
- **Auto-Skip Video Ads**: Instantly skips pre-roll and mid-roll video ads.
- **Ad Acceleration**: If an ad cannot be skipped, it is sped up to 8x speed and muted.
- **Clean UI**: Hides banner ads, sponsored cards, and "Promoted" videos from the homepage and sidebar.

### 🔍 Advanced Page Scanner
- **Deep Scan**: Analyzes the current page DOM for inserted tracking scripts, invisible pixels, and malicious iframes.
- **Visual Feedback**: Instantly see a list of all detected trackers on the active tab.
- **One-Click Block**: Easily add any detected domain to your personal blocklist.

### 📊 Insightful Dashboard
- **Real-Time Stats**: Monitor daily and monthly blocked items.
- **Visual Analytics**: Interactive charts showing top blocked ad networks.
- **Control Center**: Toggle protection globally or for specific sites with a single switch.

---

## 📦 Installation

ProBlock is currently available for *Developer Preview* installation.

### Prerequisites
- Google Chrome (Version 88+)
- Git (optional, for cloning)

### Steps

1. **Download the Source**
   ```bash
   git clone https://github.com/PrivyXe/adblock_addon.git
   # OR download the ZIP from the specific repository
   ```

2. **Open Extension Management**
   - Type `chrome://extensions/` in your address bar.
   - Toggle **Developer mode** on the top right corner.

3. **Load the Extension**
   - Click the **Load unpacked** button.
   - Navigate to the `ProBlock` directory (ensure it contains `manifest.json`).
   - Select the folder.

4. **Pin & Browse**
   - Pin the ProBlock shield icon to your toolbar for easy access.
   - Enjoy an ad-free web!

---

## 🛠️ Technical Architecture

ProBlock is built with performance and privacy as first principles.

| Component | Technology | Description |
|-----------|------------|-------------|
| **Core** | Manifest V3 | Uses the latest secure extension standard. |
| **Blocking** | DeclarativeNetRequest | Blocks requests in the browser kernel, not JavaScript, for zero latency. |
| **Logic** | Service Workers | Background processing that suspends when not in use to save RAM. |
| **Storage** | Chrome Storage API | Persists user preferences and statistics securely. |

### Blocked Categories
| Category | Examples |
|----------|----------|
| **Ad Networks** | DoubleClick, AdSense, Criteo, Taboola |
| **Analytics** | Google Analytics, Hotjar, Mixpanel, Segment |
| **Social Trackers** | Facebook Pixel, LinkedIn Insight, TikTok Ads |
| **Intrusive Media** | Autoplay videos, Pop-ups, Pop-unders |

---

## 🔒 Privacy & Security

**Your data stays on your device.**
ProBlock operates entirely client-side. We do not collect browsing history, extensive usage data, or personal information.

- **No External Servers**: All blocking logic happens locally within your browser.
- **Open Source**: The code is transparent and available for audit.
- **Permission Scoping**: We only request permissions necessary for blocking functionality (`tams`, `storage`, `declarativeNetRequest`).

---

## 🤝 Contributing

We welcome contributions from the community! Whether it's adding new blocking rules, fixing bugs, or improving the UI.

1. **Fork** the repository.
2. **Create** your feature branch (`git checkout -b feature/NewBlockingRule`).
3. **Commit** your changes (`git commit -m 'Add rule for ExampleAds'`).
4. **Push** to the branch (`git push origin feature/NewBlockingRule`).
5. **Open** a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**ProBlock** — Making the internet habitable again.
<br>
Developed by [PrivyXe](https://github.com/PrivyXe)

</div>
