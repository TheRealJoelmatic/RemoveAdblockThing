// ==UserScript==
// @name         Enhanced Remove Adblock Thing
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Removes Adblock Thing and improves YouTube experience
// @author       OHG
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @updateURL    https://github.com/Open-Horizon-Games/RemoveAdblockThing/raw/main/Youtube-Ad-blocker-Reminder-Remover.user.js
// @downloadURL  https://github.com/Open-Horizon-Games/RemoveAdblockThing/raw/main/Youtube-Ad-blocker-Reminder-Remover.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to remove ad elements and ad blocker warning
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
            '#message'  // ID of the ad blocker warning element
        ];

        adElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => element.remove());
        });

        // Check for video ads and skip them
        const video = document.querySelector('video');
        if (video) {
            const observer = new MutationObserver(() => {
                const adContainer = document.querySelector('.ad-showing');
                if (adContainer) {
                    video.currentTime = video.duration;
                    video.play();
                }
            });

            observer.observe(document, { childList: true, subtree: true });
        }
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

    // Initialize ad removal and script blocking
    function init() {
        removeAdsAndWarnings();
        blockAdScripts();
        setInterval(removeAdsAndWarnings, 1000);
    }

    // Run the init function
    init();
})();
