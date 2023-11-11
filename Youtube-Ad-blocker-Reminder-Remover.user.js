// ==UserScript==
// @name         Remove Adblock Thing
// @namespace    http://tampermonkey.net/
// @version      2.5
// @description  Removes Adblock Thing
// @author       JoelMatic
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @updateURL    https://github.com/TheRealJoelmatic/RemoveAdblockThing/raw/main/Youtube-Ad-blocker-Reminder-Remover.user.js
// @downloadURL  https://github.com/TheRealJoelmatic/RemoveAdblockThing/raw/main/Youtube-Ad-blocker-Reminder-Remover.user.js
// @grant        none
// ==/UserScript==

(function () {
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

    // Observe config
    const observerConfig = {
        childList: true,
        subtree: true
    };

    const keyEvent = new KeyboardEvent("keydown", {
        key: "k",
        code: "KeyK",
        keyCode: 75,
        which: 75,
        bubbles: true,
        cancelable: true,
        view: window
    });

    let mouseEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
    });

    //This is used to check if the video has been unpaused already
    let unpausedAfterSkip = 0;

    //Allows elements to be deleted more quickly as soon as the page has just been loaded
    const intervalChanger = {
        addblocker: 10,
        popupRemover: 100
    }

    setTimeout(() => {
        //Reset to default
        intervalChanger.addblocker = 50;
        intervalChanger.popupRemover = 1000;
    }, 5000);

    if (debug) console.log("Remove Adblock Thing: Remove Adblock Thing: Script started");
    // Old variable but could work in some cases
    window.__ytplayer_adblockDetected = false;

    if (adblocker) addblocker();
    if (removePopup) popupRemover();

    // Observe and remove ads when new content is loaded dynamically
    const observer = new MutationObserver(() => {
        removeJsonPaths(domainsToRemove, jsonPathsToRemove);
    });

    if (removePopup) observer.observe(document.body, observerConfig);

    // Remove Them pesski popups
    function popupRemover() {
        removeJsonPaths(domainsToRemove, jsonPathsToRemove);
        setInterval(() => {

            const fullScreenButton = document.querySelector(".ytp-fullscreen-button");
            const modalOverlay = document.querySelector("tp-yt-iron-overlay-backdrop");
            const popup = document.querySelector(".style-scope ytd-enforcement-message-view-model");
            const popupButton = document.getElementById("dismiss-button");
            // const popupButton2 = document.getElementById("ytp-play-button ytp-button");

            const video1 = document.querySelector("#movie_player > video.html5-main-video");
            const video2 = document.querySelector("#movie_player > .html5-video-container > video");

            const bodyStyle = document.body.style;

            bodyStyle.setProperty('overflow-y', 'auto', 'important');

            if (modalOverlay) {
                modalOverlay.removeAttribute("opened");
                modalOverlay.remove();
            }

            if (popup) {
                if (debug) console.log("Remove Adblock Thing: Popup detected, removing...");

                if (popupButton) popupButton.click();
                // if(popupButton2) popupButton2.click();
                popup.remove();
                unpausedAfterSkip = 2;

                fullScreenButton.dispatchEvent(mouseEvent);

                setTimeout(() => {
                    fullScreenButton.dispatchEvent(mouseEvent);
                }, 500);

                if (debug) console.log("Remove Adblock Thing: Popup removed");
            }

            // Check if the video is paused after removing the popup
            if (!unpausedAfterSkip > 0) return;

            // UnPause The Video
            unPauseVideo(video1);
            unPauseVideo(video2);

        }, intervalChanger.popupRemover);
    }
    // undetected adblocker method
    function addblocker() {

        // Do not display as they will be deleted
        const css =
            `
            .ad-showing, .videoAdUiSkipButton, .ytp-ad-skip-button, .ytp-ad-skip-button-modern { display: none; }
            ytd-action-companion-ad-renderer { display: none; }
            div#root.style-scope.ytd-display-ad-renderer.yt-simple-endpoint { display: none; }
            div#sparkles-container.style-scope.ytd-promoted-sparkles-web-renderer { display: none; }
            div#main-container.style-scope.ytd-promoted-video-renderer { display: none; }
            ytd-in-feed-ad-layout-renderer { display: none; }
            .ytd-video-masthead-ad-v3-renderer { display: none; }
            ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-ads"] { display: none; }
            ytd-merch-shelf-renderer { display: none; }
            .ytd-banner-promo-renderer { display: none; }
            ytd-statement-banner-renderer, ytd-ad-slot-renderer { display: none; }
        `;
        const head = document.head || document.getElementsByTagName('head')[0];
        const styleElement = document.createElement('style');
        styleElement.type = 'text/css';
        styleElement.id = 'adSkip'; // for debug: document.querySelector('#adSkip').remove()
        styleElement.innerHTML = css;
        head.appendChild(styleElement);

        const skipBtnSelector = '.videoAdUiSkipButton, .ytp-ad-skip-button';
        const adSelector = '.ad-showing';
        const adRemovalSelectors = [
            'ytd-action-companion-ad-renderer',
            'div#root.style-scope.ytd-display-ad-renderer.yt-simple-endpoint',
            'div#sparkles-container.style-scope.ytd-promoted-sparkles-web-renderer',
            'div#main-container.style-scope.ytd-promoted-video-renderer',
            'ytd-in-feed-ad-layout-renderer',
            '.ytd-video-masthead-ad-v3-renderer',
            'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-ads"]',
            'ytd-merch-shelf-renderer', // Remove store stuff below videos : https://www.zupimages.net/up/23/45/1npf.png
            '.ytd-banner-promo-renderer', // Removes the large banner that occasionally appears at the top of the home page offering to subscribe to Premium
            'ytd-statement-banner-renderer', // removes large banners that occasionally appear in content on the home page offering to subscribe to Premium
        ];
        const sponsorSelectors = ['div#player-ads.style-scope.ytd-watch-flexy', 'div#panels.style-scope.ytd-watch-flexy'];
        const nonVidSelector = '.ytp-ad-skip-button-modern';

        setInterval(() => {
            if (window.location.pathname !== '/') {
                const video = document.querySelector('video');
                const skipBtn = document.querySelector(skipBtnSelector);
                const ad = document.querySelector(adSelector);

                if (ad) {
                    video.playbackRate = 10;
                    video.volume = 0;
                    video.currentTime = video.duration;
                    skipBtn?.click();
                }
            }


            for (const removalSelector of adRemovalSelectors) {
                const element = document.querySelector(removalSelector);
                element?.remove();
            }

            const sponsorElements = document.querySelectorAll(sponsorSelectors.join(', '));
            sponsorElements.forEach((element) => {
                if (element.getAttribute("id") === "panels") {
                    element.childNodes?.forEach((childElement) => {
                        if (childElement.data?.targetId && childElement.data.targetId !== "engagement-panel-macro-markers-description-chapters") {
                            //Skipping the Chapters section
                            childElement.remove();
                        }
                    });
                } else {
                    element.remove();
                }
            });

            const nonVid = document.querySelector(nonVidSelector);
            nonVid?.click();
        }, intervalChanger.addblocker);
    }

    // Unpause the video Works most of the time
    function unPauseVideo(video) {
        if (!video) return;
        if (video.paused) {
            // Simulate pressing the "k" key to unpause the video
            document.dispatchEvent(keyEvent);
            unpausedAfterSkip = 0;
            if (debug) console.log("Remove Adblock Thing: Unpaused video using 'k' key");
        } else if (unpausedAfterSkip > 0) unpausedAfterSkip--;
    }
    function removeJsonPaths(domains, jsonPaths) {
        const currentDomain = window.location.hostname;
        if (!domains.includes(currentDomain)) return;

        jsonPaths.forEach(jsonPath => {
            const pathParts = jsonPath.split('.');
            let obj = window;
            let previousObj = null;
            let partToSetUndefined = null;

            for (const part of pathParts) {
                if (obj.hasOwnProperty(part)) {
                    previousObj = obj; // Keep track of the parent object.
                    partToSetUndefined = part; // Update the part that we may set to undefined.
                    obj = obj[part];
                } else {
                    break; // Stop when we reach a non-existing part.
                }
            }

            // If we've identified a valid part to set to undefined, do so.
            if (previousObj && partToSetUndefined !== null) {
                previousObj[partToSetUndefined] = undefined;
            }
        });
    }



})();
