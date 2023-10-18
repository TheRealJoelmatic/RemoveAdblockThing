// ==UserScript==
// @name         Remove Adblock Thing
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Removes Adblock Thing
// @author       JoelMatic
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @updateURL    https://github.com/TheRealJoelmatic/RemoveAdblockThing/raw/main/Youtube-Ad-blocker-Reminder-Remover.user.js
// @downloadURL  https://github.com/TheRealJoelmatic/RemoveAdblockThing/raw/main/Youtube-Ad-blocker-Reminder-Remover.user.js
// @grant        none
// ==/UserScript==
(function() {
    //
    //      Config
    //

    // Enable The Undetected Adblocker
    const adblocker = true;

    // Enable The Popup remover
    const removePopup = true;

    // Enable debug messages into the console
    const debug = true;

    //
    //      CODE
    //

    // Observe config
    const observerConfig = {
        childList: true,
        subtree: true,
    };

    // This is used to check if the video has been unpaused already
    let unpausedAfterSkip = 0;

    if (debug) console.log("Remove Adblock Thing: Script started");

    if (adblocker) addblocker();
    if (removePopup) popupRemover();
    if (removePopup) observer.observe(document.body, observerConfig);

    // Remove Them pesski popups
    function popupRemover() {
        setInterval(() => {
            const modalOverlay = document.querySelector("tp-yt-iron-overlay-backdrop");
            const popup = document.querySelector("ytd-popup-container.style-scope");
            const popupButton = document.querySelector("tp-yt-paper-button.style-scope");
            const video = document.querySelector("#movie_player > video.html5-main-video");

            if (modalOverlay) {
                modalOverlay.remove();
            }

            if (popup) {
                if (debug) console.log("Remove Adblock Thing: Popup detected, removing...");

                if (popupButton) popupButton.click();
                popup.remove();
                unpausedAfterSkip = 2;

                if (debug) console.log("Remove Adblock Thing: Popup removed");
            }

            // Check if the video is paused after removing the popup
            if (unpausedAfterSkip > 0) {
                if (video && video.paused) {
                    unPauseVideo();
                }
                unpausedAfterSkip--;
            }
        }, 1000);
    }

    // Undetected adblocker method
    function addblocker() {
        setInterval(() => {
            const skipBtn = document.querySelector('.videoAdUiSkipButton,.ytp-ad-skip-button');
            const ad = document.querySelector('.ad-showing');
            const sidAd = document.querySelector('ytd-action-companion-ad-renderer');

            if (ad) {
                document.querySelector('video').playbackRate = 10;
                document.querySelector('video').volume = 0;
                if (skipBtn) {
                    skipBtn.click();
                }
            }

            if (sidAd) {
                sidAd.remove();
            }
        }, 50);
    }

    // Unpause the video Works most of the time
    function unPauseVideo() {
        // Simulate pressing the "k" key to unpause the video
        const keyEvent = new KeyboardEvent("keydown", {
            key: "k",
            code: "KeyK",
            keyCode: 75,
            which: 75,
            bubbles: true,
            cancelable: true,
            view: window,
        });
        document.dispatchEvent(keyEvent);
        unpausedAfterSkip = 0;
        if (debug) console.log("Remove Adblock Thing: Unpaused video using 'k' key");
    }

    // Observe and remove ads when new content is loaded dynamically
    const observer = new MutationObserver(() => {
        removeJsonPaths();
    });

    function removeJsonPaths() {
        // Specify domains and JSON paths to remove
        const domainsToRemove = [
            '*.youtube-nocookie.com/*'
        ];
        const jsonPathsToRemove = [
            'playerResponse.adPlacements',
            'playerResponse.playerAds',
            'adPlacements',
            'playerAds',
            'playerConfig',
            'auxiliaryUi.messageRenderers.enforcementMessageViewModel'
        ];

        const currentDomain = window.location.hostname;
        if (!domainsToRemove.includes(currentDomain)) return;

        jsonPathsToRemove.forEach(jsonPath => {
            let obj = window;
            const pathParts = jsonPath.split('.');
            for (const part of pathParts) {
                if (obj && obj.hasOwnProperty(part)) {
                    obj = obj[part];
                } else {
                    break;
                }
            }
        });
    }
})();
