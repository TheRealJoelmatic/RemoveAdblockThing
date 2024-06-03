// ==UserScript==
// @name         Lightweight YouTube Ad Blocker
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Blocks YouTube ads by removing ad scripts and elements
// @author       JoelMatic
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to remove ad elements
    function removeAds() {
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
            '#masthead-ad'
        ];

        adElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => element.remove());
        });

        const videoAds = document.querySelectorAll('.ad-showing');
        videoAds.forEach(ad => {
            const video = document.querySelector('video');
            if (video) {
                video.currentTime = video.duration;
                video.play();
            }
            ad.remove();
        });
    }

    // Block ad-related scripts
    function blockAdScripts() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(node => {
                        if (node.tagName === 'SCRIPT' && node.src.includes('ad')) {
                            node.remove();
                        }
                    });
                }
            });
        });

        observer.observe(document, { childList: true, subtree: true });
    }

    // Initialize ad removal and script blocking
    function init() {
        removeAds();
        blockAdScripts();
        setInterval(removeAds, 1000);
    }

    // Run the init function
    init();
})();
