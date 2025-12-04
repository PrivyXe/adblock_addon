// ProBlock Background Service Worker

let adblockEnabled = true;
// Cache stats in memory to minimize storage writes
let currentDailyStats = {};
let networkStats = {}; // Per-network blocking statistics
let lastPageAds = {}; // Store detected ads per tab

// Network name mapping for known domains
const NETWORK_NAMES = {
    'doubleclick.net': 'DoubleClick',
    'googlesyndication.com': 'Google Ads',
    'googleadservices.com': 'Google Ad Services',
    'adservice.google.com': 'Google AdService',
    'google-analytics.com': 'Google Analytics',
    'googletagmanager.com': 'Google Tag Manager',
    'facebook.com': 'Facebook',
    'connect.facebook.net': 'Facebook SDK',
    'fbcdn.net': 'Facebook CDN',
    'ads.twitter.com': 'Twitter Ads',
    'ads.linkedin.com': 'LinkedIn Ads',
    'amazon-adsystem.com': 'Amazon Ads',
    'adnxs.com': 'AppNexus',
    'criteo.com': 'Criteo',
    'taboola.com': 'Taboola',
    'outbrain.com': 'Outbrain',
    'pubmatic.com': 'PubMatic',
    'rubiconproject.com': 'Rubicon',
    'openx.net': 'OpenX',
    'mediavine.com': 'Mediavine',
    'hotjar.com': 'Hotjar',
    'clarity.ms': 'Microsoft Clarity',
    'mixpanel.com': 'Mixpanel',
    'amplitude.com': 'Amplitude',
    'segment.io': 'Segment',
    'fullstory.com': 'FullStory',
    'teads.tv': 'Teads',
    'mgid.com': 'MGID',
    'popads.net': 'PopAds',
    'propellerads.com': 'PropellerAds',
    'adsterra.com': 'Adsterra',
    'onesignal.com': 'OneSignal',
    'comscore.com': 'comScore'
};

// Get friendly network name from domain
function getNetworkName(hostname) {
    // Check direct match
    if (NETWORK_NAMES[hostname]) {
        return NETWORK_NAMES[hostname];
    }

    // Check if any known domain is a suffix
    for (const [domain, name] of Object.entries(NETWORK_NAMES)) {
        if (hostname.endsWith(domain) || hostname.includes(domain)) {
            return name;
        }
    }

    // Return cleaned hostname
    return hostname.replace(/^www\./, '').split('.').slice(-2).join('.');
}

// Initialize
chrome.storage.local.get(["adblockEnabled", "dailyStats", "networkStats"], (result) => {
    adblockEnabled = result.adblockEnabled !== false;
    currentDailyStats = result.dailyStats || {};
    networkStats = result.networkStats || {};

    updateBadge();

    if (adblockEnabled) {
        chrome.declarativeNetRequest.updateEnabledRulesets({
            enableRulesetIds: ["ruleset_1"]
        }).catch(err => console.error("Startup enable rules failed:", err));
    } else {
        chrome.declarativeNetRequest.updateEnabledRulesets({
            disableRulesetIds: ["ruleset_1"]
        }).catch(err => console.error("Startup disable rules failed:", err));
    }
});

// Helper to get today's date string YYYY-MM-DD
function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

function updateBadge() {
    const today = getTodayString();
    const count = currentDailyStats[today] || 0;
    chrome.action.setBadgeText({ text: count > 0 ? count.toString() : "" });
    chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
}

// Debounced storage save
let saveTimeout = null;
function saveStats() {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        chrome.storage.local.set({
            dailyStats: currentDailyStats,
            networkStats: networkStats
        });
    }, 1000);
}

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggleAdblock") {
        adblockEnabled = request.enabled;
        chrome.storage.local.set({ adblockEnabled: request.enabled });

        if (request.enabled) {
            chrome.declarativeNetRequest.updateEnabledRulesets({
                enableRulesetIds: ["ruleset_1"]
            });
            console.log("✅ Adblock enabled");
        } else {
            chrome.declarativeNetRequest.updateEnabledRulesets({
                disableRulesetIds: ["ruleset_1"]
            });
            chrome.action.setBadgeText({ text: "" });
            console.log("❌ Adblock disabled");
        }
        sendResponse({ success: true });
    }
    else if (request.action === "getStats") {
        // Return full stats for the UI
        sendResponse({
            enabled: adblockEnabled,
            dailyStats: currentDailyStats,
            networkStats: networkStats
        });
    }
    else if (request.action === "getNetworkStats") {
        // Return network-specific statistics
        const sortedStats = Object.entries(networkStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10); // Top 10
        sendResponse({ networkStats: sortedStats });
    }
    else if (request.action === "resetStats") {
        currentDailyStats = {};
        networkStats = {};
        chrome.storage.local.set({ dailyStats: {}, networkStats: {} });
        updateBadge();
        sendResponse({ success: true });
    }
    else if (request.action === "addCustomRule") {
        addCustomRule(request.domain).then(() => {
            sendResponse({ success: true });
        }).catch(err => {
            sendResponse({ success: false, error: err.message });
        });
        return true;
    }
    else if (request.action === "removeCustomRule") {
        removeCustomRule(request.id).then(() => {
            sendResponse({ success: true });
        }).catch(err => {
            sendResponse({ success: false, error: err.message });
        });
        return true;
    }
    else if (request.action === "getCustomRules") {
        chrome.storage.local.get(["customRules"], (result) => {
            sendResponse({ rules: result.customRules || [] });
        });
        return true;
    }
    else if (request.action === "pageScanned") {
        // Store detected ads from content script
        if (sender.tab && sender.tab.id) {
            lastPageAds[sender.tab.id] = {
                ads: request.ads,
                url: request.url,
                timestamp: Date.now()
            };
        }
        sendResponse({ received: true });
    }
    else if (request.action === "getPageAds") {
        // Return ads detected on the current tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && lastPageAds[tabs[0].id]) {
                sendResponse(lastPageAds[tabs[0].id]);
            } else {
                sendResponse({ ads: [], url: '' });
            }
        });
        return true;
    }
});

// Track blocked requests
// Note: onRuleMatchedDebug requires the extension to be unpacked.
try {
    chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((details) => {
        const today = getTodayString();

        if (!currentDailyStats[today]) {
            currentDailyStats[today] = 0;
        }
        currentDailyStats[today]++;

        // Extract network name from blocked URL
        try {
            const url = new URL(details.request.url);
            const networkName = getNetworkName(url.hostname);

            if (!networkStats[networkName]) {
                networkStats[networkName] = 0;
            }
            networkStats[networkName]++;
        } catch (e) {
            // URL parse failed, ignore
        }

        // Save stats (debounced)
        saveStats();
        updateBadge();

        console.log(`🚫 Blocked: ${details.request.url}`);
    });
} catch (e) {
    console.warn("onRuleMatchedDebug listener could not be attached:", e);
}

// Clean up old tab data
chrome.tabs.onRemoved.addListener((tabId) => {
    delete lastPageAds[tabId];
});

// Custom Rules Logic
async function addCustomRule(domain) {
    if (!domain) return;

    // Create a unique ID (timestamp based for simplicity, or random)
    // Dynamic rule IDs must be integers. We'll use a range starting from 1000.
    const id = Math.floor(Math.random() * 100000) + 1000;

    const rule = {
        id: id,
        priority: 1,
        action: { type: "block" },
        condition: {
            urlFilter: `*${domain}*`,
            resourceTypes: ["main_frame", "sub_frame", "script", "image", "xmlhttprequest"]
        }
    };

    await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [rule],
        removeRuleIds: []
    });

    // Save to storage for UI
    const result = await chrome.storage.local.get(["customRules"]);
    const rules = result.customRules || [];
    rules.push({ id: id, domain: domain, enabled: true });
    await chrome.storage.local.set({ customRules: rules });
}

async function removeCustomRule(id) {
    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [id]
    });

    const result = await chrome.storage.local.get(["customRules"]);
    let rules = result.customRules || [];
    rules = rules.filter(r => r.id !== id);
    await chrome.storage.local.set({ customRules: rules });
}
