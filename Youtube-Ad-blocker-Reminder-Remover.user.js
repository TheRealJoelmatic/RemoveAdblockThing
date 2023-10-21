// ==UserScript==
// @name         Remove Adblock Thing
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Removes Adblock Thing
// @author       JoelMatic
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @updateURL    https://github.com/TheRealJoelmatic/RemoveAdblockThing/raw/main/Youtube-Ad-blocker-Reminder-Remover.user.js
// @downloadURL  https://github.com/TheRealJoelmatic/RemoveAdblockThing/raw/main/Youtube-Ad-blocker-Reminder-Remover.user.js
// @grant        none
// ==/UserScript==

(function()
 {
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

    if (debug) console.log("Remove Adblock Thing: Remove Adblock Thing: Script started");
    // Old variable but could work in some cases
    window.__ytplayer_adblockDetected = false;

    if(adblocker) addblocker();
    if(removePopup) popupRemover();
    if(removePopup) observer.observe(document.body, observerConfig);

    // Remove Them pesski popups
    function popupRemover() {
        removeJsonPaths(domainsToRemove, jsonPathsToRemove);
        const removePopupLoop = () => {
            requestIdleCallback(removePopupLoop, {timeout: 500});

            const fullScreenButton = document.querySelector(".ytp-fullscreen-button");
            const modalOverlay = document.querySelector("tp-yt-iron-overlay-backdrop");
            const popup = document.querySelector(".style-scope ytd-enforcement-message-view-model");
            const popupButton = document.getElementById("dismiss-button");
            // const popupButton2 = document.getElementById("ytp-play-button ytp-button");

            const video1 = document.querySelector("#movie_player > video.html5-main-video");
            const video2 = document.querySelector("#movie_player > .html5-video-container > video");

            const bodyStyle = document.body.style;

            bodyStyle.setProperty('overflow-y', 'scroll', 'important');

            if (modalOverlay) {
                modalOverlay.removeAttribute("opened");
                modalOverlay.remove();
            }

            if (popup) {
                if (debug) console.log("Remove Adblock Thing: Popup detected, removing...");

                if(popupButton) popupButton.click();
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


            if (video1) {
                // UnPause The Video
                if (video1.paused) unPauseVideo();
                else if (unpausedAfterSkip > 0) unpausedAfterSkip--;
            }
            if (video2) {
                if (video2.paused) unPauseVideo();
                else if (unpausedAfterSkip > 0) unpausedAfterSkip--;
            }
        }
        requestIdleCallback(removePopupLoop);
    }
    // undetected adblocker method
    function addblocker()
    {
        const adblockerFunc = () => {
            requestIdleCallback(adblockerFunc, {timeout: 50});

            const skipBtn = document.querySelector('.videoAdUiSkipButton,.ytp-ad-skip-button');
            const ad = [...document.querySelectorAll('.ad-showing')][0];
            const sidAd = document.querySelector('ytd-action-companion-ad-renderer');
            const displayAd = document.querySelector('div#root.style-scope.ytd-display-ad-renderer.yt-simple-endpoint');
            const sparklesContainer = document.querySelector('div#sparkles-container.style-scope.ytd-promoted-sparkles-web-renderer');
            const mainContainer = document.querySelector('div#main-container.style-scope.ytd-promoted-video-renderer');
            const feedAd = document.querySelector('ytd-in-feed-ad-layout-renderer');
            const mastheadAd = document.querySelector('.ytd-video-masthead-ad-v3-renderer');

            if (ad)
            {
                const video = document.querySelector('video');
                video.playbackRate = 10;
                video.volume = 0;
                video.currentTime = video.duration;
                skipBtn?.click();
            }

            sidAd?.remove();
            displayAd?.remove();
            sparklesContainer?.remove();
            mainContainer?.remove();
            feedAd?.remove();
            mastheadAd?.remove();
        }
        requestIdleCallback(adblockerFunc);
    }
    // Unpause the video Works most of the time
    function unPauseVideo()
    {
        // Simulate pressing the "k" key to unpause the video
        document.dispatchEvent(keyEvent);
        unpausedAfterSkip = 0;
        if (debug) console.log("Remove Adblock Thing: Unpaused video using 'k' key");
    }
    function removeJsonPaths(domains, jsonPaths)
    {
        const currentDomain = window.location.hostname;
        if (!domains.includes(currentDomain)) return;

        jsonPaths.forEach(jsonPath =>{
            const pathParts = jsonPath.split('.');
            let obj = window;
            for (const part of pathParts)
            {
                if (obj.hasOwnProperty(part))
                {
                    obj = obj[part];
                }
                else
                {
                    break;
                }
            }
            obj = undefined;
        });
    }
    // Observe and remove ads when new content is loaded dynamically
    const observer = new MutationObserver(() =>
    {
        removeJsonPaths(domainsToRemove, jsonPathsToRemove);
    });
})();
