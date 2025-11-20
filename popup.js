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
        chrome.runtime.sendMessage({ action: "getStats" }, (response) => {
            if (response) {
                updateUI(response.enabled, response.blockedCount);
            }
        });
    }

    // Başlangıç durumunu yükle
    chrome.storage.local.get(["adblockEnabled"], (result) => {
        loadStats();
    });

    // Toggle butonu
    toggleBtn.addEventListener('click', () => {
        chrome.storage.local.get(["adblockEnabled"], (result) => {
            const newState = !result.adblockEnabled;
            chrome.runtime.sendMessage({ action: "toggleAdblock", enabled: newState });
            setTimeout(loadStats, 100);
        });
    });

    // İstatistikleri her 1 saniyede güncelle
    setInterval(loadStats, 1000);
});
