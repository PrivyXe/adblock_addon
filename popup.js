document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.content');
    const statusText = document.getElementById('statusText');
    const toggleBtn = document.getElementById('toggleBtn');
    const todayCountEl = document.getElementById('todayCount');
    const monthCountEl = document.getElementById('monthCount');
    const domainInput = document.getElementById('domainInput');
    const addBtn = document.getElementById('addBtn');
    const rulesList = document.getElementById('rulesList');

    // Tab Switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
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

            const { enabled, dailyStats } = response;

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

            todayCountEl.textContent = todayCount;
            monthCountEl.textContent = monthCount;
        });
    }

    // Update Settings UI
    function updateSettings() {
        chrome.runtime.sendMessage({ action: "getCustomRules" }, (response) => {
            if (chrome.runtime.lastError || !response) return;

            rulesList.innerHTML = '';
            response.rules.forEach(rule => {
                const li = document.createElement('li');
                li.className = 'rule-item';
                li.innerHTML = `
                    <span>${rule.domain}</span>
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
    setInterval(updateDashboard, 1000);
});
