// ==UserScript==
// @name         Enhanced Remove Adblock Thing
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Removes Adblock Thing and improves YouTube experience without breaking video playback
// @author       OHG
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @updateURL    https://github.com/Open-Horizon-Games/RemoveAdblockThing/raw/main/Youtube-Ad-blocker-Reminder-Remover.user.js
// @downloadURL  https://github.com/Open-Horizon-Games/RemoveAdblockThing/raw/main/Youtube-Ad-blocker-Reminder-Remover.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to remove ad elements and ad blocker warnings
    function removeAdsAndWarnings() {
        const adElements = [
            'ytd-action-companion-ad-renderer',
            'ytd-display-ad-renderer',
            'ytd-video-masthead-ad-advertiser-info-renderer',
            'ytd-video-masthead-ad-primary-video-renderer',
            'ytd-in-feed-ad-layout-renderer',
            'ytd-ad-slot-renderer',
            'yt-about-this-ad-renderer',
            'yt-mealbar-promo-renderer',
            'ytd-statement-banner-renderer',
            'ytd-banner-promo-renderer-background',
            '.ytd-video-masthead-ad-v3-renderer',
            'div#root.style-scope.ytd-display-ad-renderer.yt-simple-endpoint',
            'div#sparkles-container.style-scope.ytd-promoted-sparkles-web-renderer',
            'div#main-container.style-scope.ytd-promoted-video-renderer',
            'div#player-ads.style-scope.ytd-watch-flexy',
            'ad-slot-renderer',
            'ytm-promoted-sparkles-web-renderer',
            'masthead-ad',
            'tp-yt-iron-overlay-backdrop',
            '#masthead-ad',
            'yt-upsell-dialog-renderer',
            'ytp-ad-player-overlay',
            'ytd-popup-container',
            'tp-yt-paper-dialog',
            '.ad-showing', // Target ad overlay during video playback
            '.video-ads' // Target video ads container
        ];

        adElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => element.remove());
        });
    }

    // Function to specifically remove ad blocker warnings
    function removeAdBlockerWarnings() {
        const warningElements = [
            '.ytp-ad-player-overlay',
            '.html5-video-info-panel',
            '#player-ads',
            '#consent-bump',
            '#message' // Specific ad blocker warning element
        ];

        warningElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => element.remove());
        });
    }

    // Block ad-related scripts
    function blockAdScripts() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.tagName === 'SCRIPT' && node.src.includes('ad')) {
                        node.remove();
                    }
                });
            });
        });

        observer.observe(document, { childList: true, subtree: true });
    }

    // Additional CSS to hide ad-related overlays and messages
    function injectCSS() {
        const style = document.createElement('style');
        style.textContent = `
            .ytp-ad-player-overlay,
            .html5-video-info-panel,
            #player-ads,
            #consent-bump,
            #message {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Function to skip video ads
    function skipVideoAds() {
        const video = document.querySelector('video');
        if (video) {
            const adOverlay = document.querySelector('.ad-showing');
            if (adOverlay) {
                video.currentTime = video.duration;
                video.play();
            }
        }
    }

    // Initialize ad removal and script blocking
    function init() {
        injectCSS();
        removeAdsAndWarnings();
        removeAdBlockerWarnings();
        blockAdScripts();
        setInterval(() => {
            removeAdsAndWarnings();
            removeAdBlockerWarnings();
            skipVideoAds();
        }, 1000);
    }

    // Run the init function
    init();
})();
