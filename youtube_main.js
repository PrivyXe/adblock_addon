// ProBlock - YouTube Ad Stripper (Main World)
// Runs directly in the page context to intercept player data

(function () {
    console.log('[ProBlock] Main World Injector Loaded');

    // Helper to strip ads from player response
    function stripAds(data) {
        if (!data) return data;

        // 1. Remove adPlacements (Video Ads)
        if (data.adPlacements) {
            data.adPlacements = [];
            console.log('[ProBlock] Stripped adPlacements');
        }
        if (data.playerAds) {
            data.playerAds = [];
            console.log('[ProBlock] Stripped playerAds');
        }

        // 2. Remove banner ads in adSlots
        if (data.adSlots) {
            data.adSlots = [];
            console.log('[ProBlock] Stripped adSlots');
        }

        return data;
    }

    // Hook critical global variables immediately
    // YouTube stores initial data here
    if (window.ytInitialPlayerResponse) {
        window.ytInitialPlayerResponse = stripAds(window.ytInitialPlayerResponse);
    }

    // Intercept JSON.parse
    // YouTube uses JSON.parse to process network responses for new video navigations
    const originalParse = JSON.parse;
    JSON.parse = function () {
        const data = originalParse.apply(this, arguments);

        // Check if this looks like a player response with ads
        if (data && typeof data === 'object') {
            if (data.adPlacements || data.playerAds) {
                return stripAds(data);
            }
        }

        return data;
    };

    // Also observe object defineProperty to catch when YouTube sets the variable later
    Object.defineProperty(window, 'ytInitialPlayerResponse', {
        get: function () {
            return this._ytInitialPlayerResponse;
        },
        set: function (val) {
            this._ytInitialPlayerResponse = stripAds(val);
        },
        configurable: true
    });

})();
