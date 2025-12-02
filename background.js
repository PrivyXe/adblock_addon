

let adblockEnabled = true;
// Cache stats in memory to minimize storage writes
let currentDailyStats = {};

// Initialize
chrome.storage.local.get(["adblockEnabled", "dailyStats"], (result) => {
    adblockEnabled = result.adblockEnabled !== false;
    currentDailyStats = result.dailyStats || {};

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
        chrome.storage.local.get(["dailyStats"], (result) => {
            sendResponse({
                enabled: adblockEnabled,
                dailyStats: result.dailyStats || {}
            });
        });
        return true; // Async response
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

        // Update storage
        chrome.storage.local.set({ dailyStats: currentDailyStats });

        updateBadge();
        console.log(`🚫 Blocked: ${details.request.url}`);
    });
} catch (e) {
    console.warn("onRuleMatchedDebug listener could not be attached:", e);
}

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
