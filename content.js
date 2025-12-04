// ProBlock Content Script - Page Ad Scanner

// Known ad network patterns with friendly names
const AD_PATTERNS = [
    // Google Ads
    { pattern: /googlesyndication\.com/i, name: 'Google Ads', domain: 'googlesyndication.com' },
    { pattern: /doubleclick\.net/i, name: 'DoubleClick', domain: 'doubleclick.net' },
    { pattern: /googleadservices\.com/i, name: 'Google Ad Services', domain: 'googleadservices.com' },
    { pattern: /adservice\.google/i, name: 'Google AdService', domain: 'adservice.google.com' },

    // Facebook/Meta
    { pattern: /facebook\.com\/tr/i, name: 'Facebook Pixel', domain: 'facebook.com' },
    { pattern: /connect\.facebook\.net/i, name: 'Facebook SDK', domain: 'connect.facebook.net' },
    { pattern: /fbcdn\.net.*ads/i, name: 'Facebook Ads', domain: 'fbcdn.net' },

    // Analytics & Tracking
    { pattern: /google-analytics\.com/i, name: 'Google Analytics', domain: 'google-analytics.com' },
    { pattern: /googletagmanager\.com/i, name: 'Google Tag Manager', domain: 'googletagmanager.com' },
    { pattern: /hotjar\.com/i, name: 'Hotjar', domain: 'hotjar.com' },
    { pattern: /clarity\.ms/i, name: 'Microsoft Clarity', domain: 'clarity.ms' },
    { pattern: /mixpanel\.com/i, name: 'Mixpanel', domain: 'mixpanel.com' },
    { pattern: /segment\.(io|com)/i, name: 'Segment', domain: 'segment.io' },
    { pattern: /amplitude\.com/i, name: 'Amplitude', domain: 'amplitude.com' },
    { pattern: /fullstory\.com/i, name: 'FullStory', domain: 'fullstory.com' },

    // Programmatic Ads
    { pattern: /amazon-adsystem\.com/i, name: 'Amazon Ads', domain: 'amazon-adsystem.com' },
    { pattern: /adnxs\.com/i, name: 'AppNexus', domain: 'adnxs.com' },
    { pattern: /criteo\.com/i, name: 'Criteo', domain: 'criteo.com' },
    { pattern: /taboola\.com/i, name: 'Taboola', domain: 'taboola.com' },
    { pattern: /outbrain\.com/i, name: 'Outbrain', domain: 'outbrain.com' },
    { pattern: /pubmatic\.com/i, name: 'PubMatic', domain: 'pubmatic.com' },
    { pattern: /rubiconproject\.com/i, name: 'Rubicon', domain: 'rubiconproject.com' },
    { pattern: /openx\.net/i, name: 'OpenX', domain: 'openx.net' },
    { pattern: /mediavine\.com/i, name: 'Mediavine', domain: 'mediavine.com' },
    { pattern: /mgid\.com/i, name: 'MGID', domain: 'mgid.com' },
    { pattern: /revcontent\.com/i, name: 'RevContent', domain: 'revcontent.com' },

    // Social Media Tracking
    { pattern: /ads\.twitter\.com/i, name: 'Twitter Ads', domain: 'ads.twitter.com' },
    { pattern: /ads\.linkedin\.com/i, name: 'LinkedIn Ads', domain: 'ads.linkedin.com' },
    { pattern: /snap\.licdn\.com/i, name: 'LinkedIn Insight', domain: 'snap.licdn.com' },
    { pattern: /analytics\.tiktok\.com/i, name: 'TikTok Analytics', domain: 'analytics.tiktok.com' },
    { pattern: /ct\.pinterest\.com/i, name: 'Pinterest Tag', domain: 'ct.pinterest.com' },

    // Video Ads
    { pattern: /teads\.tv/i, name: 'Teads', domain: 'teads.tv' },
    { pattern: /spotxchange\.com/i, name: 'SpotX', domain: 'spotxchange.com' },

    // Pop-up/Aggressive Ads
    { pattern: /popads\.net/i, name: 'PopAds', domain: 'popads.net' },
    { pattern: /propellerads\.com/i, name: 'PropellerAds', domain: 'propellerads.com' },
    { pattern: /adsterra\.com/i, name: 'Adsterra', domain: 'adsterra.com' },

    // Other
    { pattern: /adroll\.com/i, name: 'AdRoll', domain: 'adroll.com' },
    { pattern: /adsrvr\.org/i, name: 'The Trade Desk', domain: 'adsrvr.org' },
    { pattern: /onesignal\.com/i, name: 'OneSignal', domain: 'onesignal.com' },
    { pattern: /comscore\.com/i, name: 'comScore', domain: 'comscore.com' },
    { pattern: /chartbeat\.com/i, name: 'Chartbeat', domain: 'chartbeat.com' }
];

// Scan the page for ads
function scanPage() {
    const detectedAds = new Map(); // Use Map to avoid duplicates

    // Scan all scripts
    document.querySelectorAll('script[src]').forEach(script => {
        const src = script.src;
        AD_PATTERNS.forEach(p => {
            if (p.pattern.test(src)) {
                if (!detectedAds.has(p.name)) {
                    detectedAds.set(p.name, {
                        network: p.name,
                        domain: p.domain,
                        sources: [],
                        type: 'script'
                    });
                }
                detectedAds.get(p.name).sources.push(src);
            }
        });
    });

    // Scan all iframes
    document.querySelectorAll('iframe').forEach(iframe => {
        const src = iframe.src || '';
        AD_PATTERNS.forEach(p => {
            if (p.pattern.test(src)) {
                if (!detectedAds.has(p.name)) {
                    detectedAds.set(p.name, {
                        network: p.name,
                        domain: p.domain,
                        sources: [],
                        type: 'iframe'
                    });
                }
                detectedAds.get(p.name).sources.push(src);
            }
        });
    });

    // Scan images (for tracking pixels)
    document.querySelectorAll('img[src]').forEach(img => {
        const src = img.src;
        // Only check if it looks like a tracking pixel (1x1 or small)
        if (img.width <= 3 && img.height <= 3) {
            AD_PATTERNS.forEach(p => {
                if (p.pattern.test(src)) {
                    if (!detectedAds.has(p.name)) {
                        detectedAds.set(p.name, {
                            network: p.name,
                            domain: p.domain,
                            sources: [],
                            type: 'pixel'
                        });
                    }
                    detectedAds.get(p.name).sources.push(src);
                }
            });
        }
    });

    // Scan link tags (preconnect, dns-prefetch)
    document.querySelectorAll('link[href]').forEach(link => {
        const href = link.href;
        AD_PATTERNS.forEach(p => {
            if (p.pattern.test(href)) {
                if (!detectedAds.has(p.name)) {
                    detectedAds.set(p.name, {
                        network: p.name,
                        domain: p.domain,
                        sources: [],
                        type: 'preconnect'
                    });
                }
                detectedAds.get(p.name).sources.push(href);
            }
        });
    });

    return Array.from(detectedAds.values());
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scanPage') {
        const results = scanPage();
        sendResponse({ ads: results, url: window.location.href });
    }
    return true;
});

// Auto-scan when page loads and notify background
window.addEventListener('load', () => {
    const results = scanPage();
    if (results.length > 0) {
        chrome.runtime.sendMessage({
            action: 'pageScanned',
            ads: results,
            url: window.location.href
        }).catch(() => {
            // Ignore errors if background script isn't ready
        });
    }
});
