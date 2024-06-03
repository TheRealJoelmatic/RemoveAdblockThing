// ==UserScript==
// @name         Enhanced YouTube Ad Remover
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Removes ads and warnings, ensures main video player works without breaking it
// @author       OHG
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @updateURL    https://github.com/Open-Horizon-Games/RemoveAdblockThing/raw/main/Youtube-Ad-blocker-Reminder-Remover.user.js
// @downloadURL  https://github.com/Open-Horizon-Games/RemoveAdblockThing/raw/main/Youtube-Ad-blocker-Reminder-Remover.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // CSS to hide ad-related elements and the adblock warning
    const style = document.createElement('style');
    style.textContent = `
        .ytd-action-companion-ad-renderer,
        .ytd-display-ad-renderer,
        .ytd-video-masthead-ad-advertiser-info-renderer,
        .ytd-video-masthead-ad-primary-video-renderer,
        .ytd-in-feed-ad-layout-renderer,
        .ytd-ad-slot-renderer,
        .yt-about-this-ad-renderer,
        .yt-mealbar-promo-renderer,
        .ytd-statement-banner-renderer,
        .ytd-banner-promo-renderer-background,
        .ytd-video-masthead-ad-v3-renderer,
        #root.style-scope.ytd-display-ad-renderer.yt-simple-endpoint,
        #sparkles-container.style-scope.ytd-promoted-sparkles-web-renderer,
        #main-container.style-scope.ytd-promoted-video-renderer,
        #player-ads.style-scope.ytd-watch-flexy,
        .ad-slot-renderer,
        .ytm-promoted-sparkles-web-renderer,
        .masthead-ad,
        .tp-yt-iron-overlay-backdrop,
        #masthead-ad,
        .ad-showing,
        .ad-interrupting,
        #adblock-warning {
            display: none !important;
        }
    `;
    document.head.appendChild(style);

    // Function to skip video ads
    function skipVideoAds() {
        const video = document.querySelector('video');
        const ad = document.querySelector('.ad-showing, .ad-interrupting');
        if (ad && video) {
            video.currentTime = video.duration;
            video.play();
        }
    }

    // Function to initialize ad removal and adblock warning removal
    function init() {
        const observer = new MutationObserver(() => {
            skipVideoAds();
        });

        observer.observe(document, { childList: true, subtree: true });

        setInterval(() => {
            skipVideoAds();
        }, 1000);
    }

    // Run the init function
    init();
})();
