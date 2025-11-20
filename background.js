// Cloudflare Worker URL (optional - for advanced filtering)
const WORKER_URL = "https://adblock-worker.haarp1009.workers.dev";

let adblockEnabled = true;
let blockedCount = 0;

// declarativeNetRequest ile engellenen istekleri takip et
chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((details) => {
    blockedCount++;
    console.log(`🚫 Blocked: ${details.request.url}`);

    // Badge'i güncelle
    chrome.action.setBadgeText({ text: blockedCount.toString() });
    chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
});

// Popup'tan mesaj dinle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggleAdblock") {
        adblockEnabled = request.enabled;
        chrome.storage.local.set({ adblockEnabled: request.enabled });

        // Kuralları aktif/deaktif et
        if (request.enabled) {
            chrome.declarativeNetRequest.updateEnabledRulesets({
                enableRulesetIds: ["ruleset_1"]
            });
            console.log("✅ Adblock enabled");
        } else {
            chrome.declarativeNetRequest.updateEnabledRulesets({
                disableRulesetIds: ["ruleset_1"]
            });
            blockedCount = 0;
            chrome.action.setBadgeText({ text: "" });
            console.log("❌ Adblock disabled");
        }
    } else if (request.action === "getStats") {
        sendResponse({ blockedCount: blockedCount, enabled: adblockEnabled });
    }
});

// Başlangıç durumunu yükle
chrome.storage.local.get(["adblockEnabled"], (result) => {
    adblockEnabled = result.adblockEnabled !== false; // Default true
    if (adblockEnabled) {
        console.log("✅ Adblock enabled on startup");
    }
});
