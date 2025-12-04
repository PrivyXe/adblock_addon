document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.content');
    const statusText = document.getElementById('statusText');
    const toggleBtn = document.getElementById('toggleBtn');
    const todayCountEl = document.getElementById('todayCount');
    const monthCountEl = document.getElementById('monthCount');
    const networkListEl = document.getElementById('networkList');
    const domainInput = document.getElementById('domainInput');
    const addBtn = document.getElementById('addBtn');
    const rulesList = document.getElementById('rulesList');
    const resetBtn = document.getElementById('resetBtn');
    const detectedListEl = document.getElementById('detectedList');
    const scanStatusEl = document.getElementById('scanStatus');
    const rescanBtn = document.getElementById('rescanBtn');

    // Tab Switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');

            // Refresh data when switching tabs
            if (tab.dataset.tab === 'detected') {
                scanCurrentPage();
            } else if (tab.dataset.tab === 'settings') {
                updateSettings();
            }
        });
    });

    // Helper: Get Today's Date YYYY-MM-DD
    function getTodayString() {
        return new Date().toISOString().split('T')[0];
    }

    // Helper: Get Current Month YYYY-MM
    function getMonthString() {
        return new Date().toISOString().slice(0, 7);
    }

    // Update Dashboard UI
    function updateDashboard() {
        chrome.runtime.sendMessage({ action: "getStats" }, (response) => {
            if (chrome.runtime.lastError || !response) return;

            const { enabled, dailyStats, networkStats } = response;

            // Status
            if (enabled) {
                statusText.textContent = "Protection Active";
                statusText.className = "status-text on";
                toggleBtn.textContent = "Disable Protection";
                toggleBtn.className = "toggle-btn on";
            } else {
                statusText.textContent = "Protection Disabled";
                statusText.className = "status-text off";
                toggleBtn.textContent = "Enable Protection";
                toggleBtn.className = "toggle-btn off";
            }

            // Stats
            const today = getTodayString();
            const currentMonth = getMonthString();

            let todayCount = dailyStats[today] || 0;
            let monthCount = 0;

            Object.keys(dailyStats).forEach(date => {
                if (date.startsWith(currentMonth)) {
                    monthCount += dailyStats[date];
                }
            });

            todayCountEl.textContent = formatNumber(todayCount);
            monthCountEl.textContent = formatNumber(monthCount);

            // Network Stats
            updateNetworkStats(networkStats);
        });
    }

    // Format large numbers
    function formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // Update network statistics display
    function updateNetworkStats(networkStats) {
        networkListEl.innerHTML = '';

        if (!networkStats || Object.keys(networkStats).length === 0) {
            networkListEl.innerHTML = `
                <li class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <div>No data yet. Browse some pages!</div>
                </li>
            `;
            return;
        }

        // Sort and get top 5
        const sorted = Object.entries(networkStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const maxCount = sorted[0] ? sorted[0][1] : 1;

        sorted.forEach(([network, count]) => {
            const percentage = (count / maxCount) * 100;
            const li = document.createElement('li');
            li.className = 'network-item';
            li.innerHTML = `
                <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="network-name">${escapeHtml(network)}</span>
                        <span class="network-count">${formatNumber(count)}</span>
                    </div>
                    <div class="network-bar">
                        <div class="network-bar-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
            networkListEl.appendChild(li);
        });
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Scan current page for ads
    function scanCurrentPage() {
        scanStatusEl.textContent = 'Scanning page...';
        detectedListEl.innerHTML = '';

        // First try to get cached results from background
        chrome.runtime.sendMessage({ action: "getPageAds" }, (response) => {
            if (chrome.runtime.lastError) {
                showScanError();
                return;
            }

            if (response && response.ads && response.ads.length > 0) {
                displayDetectedAds(response.ads);
            } else {
                // Try to scan directly via content script
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (!tabs[0]) {
                        showScanError();
                        return;
                    }

                    chrome.tabs.sendMessage(tabs[0].id, { action: 'scanPage' }, (result) => {
                        if (chrome.runtime.lastError || !result) {
                            showNoAdsFound();
                            return;
                        }

                        if (result.ads && result.ads.length > 0) {
                            displayDetectedAds(result.ads);
                        } else {
                            showNoAdsFound();
                        }
                    });
                });
            }
        });
    }

    // Display detected ads
    function displayDetectedAds(ads) {
        detectedListEl.innerHTML = '';
        scanStatusEl.textContent = `Found ${ads.length} ad network${ads.length > 1 ? 's' : ''}`;

        // Get existing custom rules to check if already blocked
        chrome.runtime.sendMessage({ action: "getCustomRules" }, (response) => {
            const existingRules = response?.rules || [];
            const blockedDomains = existingRules.map(r => r.domain.toLowerCase());

            ads.forEach(ad => {
                const isBlocked = blockedDomains.some(d =>
                    ad.domain.toLowerCase().includes(d) || d.includes(ad.domain.toLowerCase())
                );

                const li = document.createElement('li');
                li.className = 'detected-item';
                li.innerHTML = `
                    <div class="detected-info">
                        <div class="detected-network">${escapeHtml(ad.network)}</div>
                        <div class="detected-type">${escapeHtml(ad.type)} • ${escapeHtml(ad.domain)}</div>
                    </div>
                    <button class="block-btn ${isBlocked ? 'blocked' : ''}" data-domain="${escapeHtml(ad.domain)}">
                        ${isBlocked ? '✓ Blocked' : 'Block'}
                    </button>
                `;
                detectedListEl.appendChild(li);
            });

            // Add click handlers for block buttons
            detectedListEl.querySelectorAll('.block-btn:not(.blocked)').forEach(btn => {
                btn.addEventListener('click', () => {
                    const domain = btn.dataset.domain;
                    blockNetwork(domain, btn);
                });
            });
        });
    }

    // Show no ads found state
    function showNoAdsFound() {
        scanStatusEl.textContent = 'Scan complete';
        detectedListEl.innerHTML = `
            <li class="empty-state">
                <div class="empty-state-icon">✨</div>
                <div>No ad networks detected on this page!</div>
            </li>
        `;
    }

    // Show scan error
    function showScanError() {
        scanStatusEl.textContent = 'Cannot scan this page';
        detectedListEl.innerHTML = `
            <li class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <div>Cannot scan this page (chrome:// or extension pages)</div>
            </li>
        `;
    }

    // Block a network
    function blockNetwork(domain, btn) {
        chrome.runtime.sendMessage({
            action: "addCustomRule",
            domain: domain
        }, (response) => {
            if (response && response.success) {
                btn.textContent = '✓ Blocked';
                btn.classList.add('blocked');
                btn.disabled = true;
            }
        });
    }

    // Update Settings UI
    function updateSettings() {
        chrome.runtime.sendMessage({ action: "getCustomRules" }, (response) => {
            if (chrome.runtime.lastError || !response) return;

            rulesList.innerHTML = '';

            if (response.rules.length === 0) {
                rulesList.innerHTML = `
                    <li class="empty-state" style="padding: 20px;">
                        <div>No custom rules yet</div>
                    </li>
                `;
                return;
            }

            response.rules.forEach(rule => {
                const li = document.createElement('li');
                li.className = 'rule-item';
                li.innerHTML = `
                    <span class="rule-domain">${escapeHtml(rule.domain)}</span>
                    <button class="delete-btn" data-id="${rule.id}">×</button>
                `;
                rulesList.appendChild(li);
            });

            // Add delete listeners
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.target.dataset.id);
                    deleteRule(id);
                });
            });
        });
    }

    // Actions
    toggleBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: "getStats" }, (response) => {
            if (response) {
                chrome.runtime.sendMessage({
                    action: "toggleAdblock",
                    enabled: !response.enabled
                }, () => {
                    setTimeout(updateDashboard, 50);
                });
            }
        });
    });

    addBtn.addEventListener('click', () => {
        const domain = domainInput.value.trim();
        if (domain) {
            chrome.runtime.sendMessage({
                action: "addCustomRule",
                domain: domain
            }, (response) => {
                if (response && response.success) {
                    domainInput.value = '';
                    updateSettings();
                }
            });
        }
    });

    // Enter key support for input
    domainInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addBtn.click();
        }
    });

    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all statistics?')) {
            chrome.runtime.sendMessage({ action: "resetStats" }, () => {
                updateDashboard();
            });
        }
    });

    rescanBtn.addEventListener('click', () => {
        scanCurrentPage();
    });

    function deleteRule(id) {
        chrome.runtime.sendMessage({
            action: "removeCustomRule",
            id: id
        }, (response) => {
            if (response && response.success) {
                updateSettings();
            }
        });
    }

    // Initial Load
    updateDashboard();
    updateSettings();

    // Refresh stats periodically
    setInterval(updateDashboard, 2000);
});
