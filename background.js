// Cloudflare Worker URL (optional - for advanced filtering)
const WORKER_URL = "https://adblock-worker.haarp1009.workers.dev";

let adblockEnabled = true;
let blockedCount = 0;

// Popup'tan mesaj dinle - En üste taşıdık ki hemen dinlemeye başlasın
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggleAdblock") {
        adblockEnabled = request.enabled;
        chrome.storage.local.set({ adblockEnabled: request.enabled });

        // Kuralları aktif/deaktif et
        if (request.enabled) {
            chrome.declarativeNetRequest.updateEnabledRulesets({
                enableRulesetIds: ["ruleset_1"]
            }).catch(err => console.error("Failed to enable rules:", err));
            console.log("✅ Adblock enabled");
        } else {
            chrome.declarativeNetRequest.updateEnabledRulesets({
                disableRulesetIds: ["ruleset_1"]
            }).catch(err => console.error("Failed to disable rules:", err));
            blockedCount = 0;
            chrome.action.setBadgeText({ text: "" });
            console.log("❌ Adblock disabled");
        }
    } else if (request.action === "getStats") {
        sendResponse({ blockedCount: blockedCount, enabled: adblockEnabled });
    }
    // Asenkron yanıt gerekirse true döndürülmeli, burada senkron olduğu için gerekmez ama zararı yok.
});

// declarativeNetRequest ile engellenen istekleri takip et
try {
    chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((details) => {
        blockedCount++;
        console.log(`🚫 Blocked: ${details.request.url}`);

        // Badge'i güncelle
        chrome.action.setBadgeText({ text: blockedCount.toString() });
        chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
    });
} catch (e) {
    console.warn("onRuleMatchedDebug listener could not be attached (requires unpacked extension):", e);
}

// Başlangıç durumunu yükle
chrome.storage.local.get(["adblockEnabled"], (result) => {
    adblockEnabled = result.adblockEnabled !== false; // Default true

    if (adblockEnabled) {
        chrome.declarativeNetRequest.updateEnabledRulesets({
            enableRulesetIds: ["ruleset_1"]
        }).catch(err => console.error("Startup enable rules failed:", err));
        console.log("✅ Adblock enabled on startup");
    } else {
        chrome.declarativeNetRequest.updateEnabledRulesets({
            disableRulesetIds: ["ruleset_1"]
        }).catch(err => console.error("Startup disable rules failed:", err));
        console.log("❌ Adblock disabled on startup");
    }
});
