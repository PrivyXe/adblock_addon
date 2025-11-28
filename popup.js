document.addEventListener('DOMContentLoaded', () => {
    const statusDiv = document.getElementById('status');
    const toggleBtn = document.getElementById('toggleBtn');
    const statsDiv = document.getElementById('stats');

    function updateUI(enabled, blockedCount = 0) {
        if (enabled) {
            statusDiv.textContent = "Adblock: ON";
            statusDiv.className = "status on";
            toggleBtn.textContent = "Disable Adblock";
            statsDiv.textContent = `Blocked: ${blockedCount} ads`;
        } else {
            statusDiv.textContent = "Adblock: OFF";
            statusDiv.className = "status off";
            toggleBtn.textContent = "Enable Adblock";
            statsDiv.textContent = "No ads blocked";
        }
    }

    // İstatistikleri yükle
    function loadStats() {
        try {
            chrome.runtime.sendMessage({ action: "getStats" }, (response) => {
                if (chrome.runtime.lastError) {
                    console.warn("Background connection failed:", chrome.runtime.lastError.message);
                    // Fallback: Storage'dan oku ama background çalışmıyorsa buton işlevsiz olabilir
                    chrome.storage.local.get(["adblockEnabled"], (result) => {
                        updateUI(result.adblockEnabled !== false, 0);
                    });
                    return;
                }
                if (response) {
                    updateUI(response.enabled, response.blockedCount);
                }
            });
        } catch (e) {
            console.error("SendMessage threw:", e);
        }
    }

    // Başlangıç durumunu yükle
    chrome.storage.local.get(["adblockEnabled"], (result) => {
        loadStats();
    });

    // Toggle butonu
    toggleBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: "getStats" }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Cannot toggle, background not ready:", chrome.runtime.lastError.message);
                alert("Extension background service is not ready. Please reload the extension.");
                return;
            }
            if (response) {
                const newState = !response.enabled;
                chrome.runtime.sendMessage({ action: "toggleAdblock", enabled: newState });
                setTimeout(loadStats, 50);
            }
        });
    });

    // İstatistikleri her 1 saniyede güncelle
    setInterval(loadStats, 1000);
});
