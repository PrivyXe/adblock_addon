// ProBlock - YouTube Ad Skipper & Blocker
// Handles video ads, banner ads, and suggested sponsored content

const AD_SELECTORS = [
    // Video Player Ads
    '.video-ads.ytp-ad-module',
    '.ytp-ad-player-overlay',
    '.ytp-ad-image-overlay',
    '.ytp-ad-skip-button',
    '.ytp-ad-skip-button-modern',
    '.ytp-ad-skip-button-slot',
    '.ytp-ad-overlay-container',
    '.ytp-ad-text-overlay',

    // Homepage & Sidebar Ads
    '.ytd-ad-slot-renderer',
    'ytd-ad-slot-renderer',
    '#masthead-ad',
    'ytd-promoted-sparkles-web-renderer',
    'ytd-compact-promoted-item-renderer',
    'ytd-display-ad-renderer',
    'ytd-promoted-video-renderer',
    '#player-ads'
];

let lastLog = 0;
function log(msg) {
    // Throttled logging to avoid console spam
    const now = Date.now();
    if (now - lastLog > 1000) {
        console.log(`[ProBlock] ${msg}`);
        lastLog = now;
    }
}

// 1. Video Ad Skipping Logic
function handleVideoAds() {
    const video = document.querySelector('video');

    if (video) {
        // Check if ad is playing
        const adShowing = document.querySelector('.ad-showing') || document.querySelector('.ad-interrupting');

        if (adShowing) {
            // Unmute if muted by us previously? No, keep it muted.
            video.muted = true;

            // Speed up significantly but safe
            video.playbackRate = 8.0;

            // Setting currentTime to duration can break the player state on some versions
            // Instead, we just trust the fast playback and the skip button clicker.
            // If it's a long ad, we can try to seek near the end
            if (video.duration > 5 && video.currentTime < video.duration - 1) {
                video.currentTime = video.duration - 0.5;
            }

            // Try clicking skip buttons immediately
            clickSkipButtons();
            log('Skipped video ad');
        }
    }
}

function clickSkipButtons() {
    const skipButtons = document.querySelectorAll('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button');
    skipButtons.forEach(btn => {
        if (btn && typeof btn.click === 'function') {
            btn.click();
            log('Clicked skip button');
        }
    });

    // Also handle "Skip" overlays that might be distinct
    const overlayClose = document.querySelectorAll('.ytp-ad-overlay-close-button');
    overlayClose.forEach(btn => btn.click());
}

// 2. Static Ad Hiding (CSS/DOM)
function removeStaticAds() {
    AD_SELECTORS.forEach(selector => {
        try {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el && el.style.display !== 'none') {
                    el.style.display = 'none';
                }
            });
        } catch (e) {
            // Ignore invalid selectors
        }
    });

    // Manual handling for :has() equivalent (for older browser compatibility)
    // Find ytd-rich-item-renderer that contains ads
    const adSlots = document.querySelectorAll('ytd-ad-slot-renderer, .ytd-ad-slot-renderer');
    adSlots.forEach(slot => {
        const container = slot.closest('ytd-rich-item-renderer');
        if (container && container.style.display !== 'none') {
            container.style.display = 'none';
            container.remove(); // Safer to remove entirely for grid layout
        }
    });
}

// Main Observer to handle dynamic content
function initObserver() {
    const observer = new MutationObserver((mutations) => {
        let shouldCheck = false;

        // Optimize: Only check if nodes were added or relevant attributes changed
        for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                shouldCheck = true;
                break;
            }
            if (mutation.type === 'attributes' && (mutation.target.classList.contains('ad-showing') || mutation.target.classList.contains('ad-interrupting'))) {
                shouldCheck = true;
                break;
            }
        }

        if (shouldCheck) {
            handleVideoAds();
            removeStaticAds();
        }
    });

    observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
    });

    // Run loop more frequently for video ads explicitly
    setInterval(() => {
        handleVideoAds();
        // clickSkipButtons handled inside handleVideoAds
    }, 500); // 500ms check for video state

    // Run static removal less frequently
    setInterval(removeStaticAds, 2000);
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initObserver);
} else {
    initObserver();
}

console.log('[ProBlock] YouTube Ad Blocker Loaded');
