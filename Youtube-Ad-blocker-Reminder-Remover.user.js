// ==UserScript==
// @name         Remove Adblock Thing
// @namespace    http://tampermonkey.net/
// @version      3.4
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

    // Enable The Popup remover (pointless if you have the Undetected Adblocker)
    const removePopup = false;

    // Checks for updates (Removes the popup)
    const updateCheck = true;

    // Enable debug messages into the console
    const debugMessages = true;

    //
    //      CODE
    //
    // If you have any suggestions, bug reports,
    // or want to contribute to this userscript,
    // feel free to create issues or pull requests in the GitHub repository.
    //
    // GITHUB: https://github.com/TheRealJoelmatic/RemoveAdblockThing


    //
    // Variables used for the Popup Remover
    //
    const keyEvent = new KeyboardEvent("keydown", {
        key: "k", code: "KeyK", keyCode: 75, which: 75, bubbles: true, cancelable: true, view: window
    });

    const mouseEvent = new MouseEvent("click", {
        bubbles: true, cancelable: true, view: window,
    });

    // This is used to check if the video has been unpaused already
    let unpausedAfterSkip = 0;

    //
    // Variables used for adblock
    //

    // Store the initial URL
    let currentUrl = window.location.href;

    // Used for if there is ad found
    let isAdFound = false;

    // used to see how many times we have looped with ad active
    let adLoop = 0;

    //
    // Variables used for updater
    //

    let hasIgnoredUpdate = false;

    //
    // Setup
    //

    // Set everything up here
    if (debugMessages) console.log("Remove Adblock Thing: Script started ");

    if (adblocker) removeAds();
    if (removePopup) popupRemover();
    if (updateCheck) checkForUpdate();

    // Remove Them pesski popups
    function popupRemover() {
        setInterval(() => {

            const selectors = [".ytp-fullscreen-button", "tp-yt-iron-overlay-backdrop", ".style-scope ytd-enforcement-message-view-model", "#dismiss-button", "#movie_player > video.html5-main-video", "#movie_player > .html5-video-container > video"]

            const [fullScreenButton, modalOverlay, popup, popupButton, video1, video2] = document.querySelectorAll(selectors.join(','));

            const bodyStyle = document.body.style;

            bodyStyle.setProperty('overflow-y', 'auto', 'important');

            if (modalOverlay) {
                modalOverlay.removeAttribute("opened");
                modalOverlay.remove();
            }

            if (popup) {
                if (debugMessages) console.log("Remove Adblock Thing: Popup detected, removing...");

                popupButton?.click();

                popup.remove();
                unpausedAfterSkip = 2;

                fullScreenButton.dispatchEvent(mouseEvent);

                setTimeout(() => fullScreenButton.dispatchEvent(mouseEvent), 500);

                if (debugMessages) console.log("Remove Adblock Thing: Popup removed");
            }

            // Check if the video is paused after removing the popup
            if (!unpausedAfterSkip > 0) return;

            // UnPause The Video
            unPauseVideo(video1);
            unPauseVideo(video2);

        }, 1000);
    }

    // undetected adblocker method
    function removeAds() {
        if (debugMessages) console.log("Remove Adblock Thing: removeAds()");

        setInterval(() => {

            let videoPlayback;

            const [video, ad] = document.querySelectorAll('video, .ad-showing');
            if (videoPlayback) videoPlayback = video.playbackRate;

            // remove page ads
            if (window.location.href !== currentUrl) {
                currentUrl = window.location.href;
                removePageAds();
            }

            if (ad) {
                isAdFound = true;
                adLoop = adLoop + 1;

                //
                // ad center method
                //

                // If we tried 10 times we can assume it won't work this time (This stops the weird pause/freeze on the ads)

                if (adLoop < 10) {
                    const selectors = ['.ytp-ad-button-icon', 'body > ytd-app > ytd-popup-container > tp-yt-paper-dialog', 'body > tp-yt-iron-overlay-backdrop', '[label="Block ad"]', '.Eddif [label="CONTINUE"] button', '.zBmRhe-Bz112c', '[label="Block ad"]']
                    const [openAdCenterButton, popupContainer, hidebackdrop, blockAdButton, blockAdButtonConfirm, closeAdCenterButton] = document.querySelectorAll(selectors.join(','))

                    if (popupContainer) popupContainer.style.display = 'none';
                    if (hidebackdrop) hidebackdrop.style.display = 'none';

                    blockAdButton?.click();
                    openAdCenterButton?.click();
                    blockAdButtonConfirm?.click();
                    closeAdCenterButton?.click();
                } else {
                    video?.play();
                }

                //
                // Speed Skip Method
                //
                if (debugMessages) console.log("Remove Adblock Thing: Found Ad");


                const skipButtons = ['ytp-ad-skip-button-container', 'ytp-ad-skip-button-modern', '.videoAdUiSkipButton', '.ytp-ad-skip-button', '.ytp-ad-skip-button-modern', '.ytp-ad-skip-button'];

                // Add a little bit of obfuscation when skipping to the end of the video.
                if (video) {

                    video.playbackRate = 10;
                    video.volume = 0;

                    // Select all elements matching the current selector
                    const elements = document.querySelectorAll(skipButtons.join(','));

                    // Check if any elements were found
                    if (elements.length > 0) {
                        // Iterate through the selected elements and click
                        elements.forEach(element => element?.click());
                    }
                    video.play();

                    const randomNumber = Math.random() * (0.5 - 0.1) + 0.1;
                    video.currentTime = video.duration + randomNumber || 0;
                }

                if (debugMessages) console.log("Remove Adblock Thing: skipped Ad (✔️)");

            } else {

                // check for unreasonable playback speed
                if (video?.playbackRate === 10) {
                    video.playbackRate = videoPlayback;
                }

                if (isAdFound) {
                    isAdFound = false;

                    // this is right after the ad is skipped
                    // fixes if you set the speed to 2x annd a ad plays it sets it back to the dfualt 1x

                    // something bugged out default to 1x then
                    if (videoPlayback === 10) {
                        videoPlayback = 1;

                        const selectors = ['body > ytd-app > ytd-popup-container > tp-yt-paper-dialog', "body > tp-yt-iron-overlay-backdrop"]
                        const [_opupContainer, _idebackdrop] = document.querySelectorAll(selectors.join(','));

                        if (_opupContainer) _opupContainer.style.display = "block";
                        if (_idebackdrop) _idebackdrop.style.display = "block";
                    }

                    if (video) video.playbackRate = videoPlayback;

                    // reset ad loop back
                    adLoop = 0;
                }
            }

        }, 50)

        removePageAds();
    }

    //removes ads on the page (not video player ads)
    function removePageAds() {

        const sponsor = document.querySelectorAll("div#player-ads.style-scope.ytd-watch-flexy, div#panels.style-scope.ytd-watch-flexy");
        const style = document.createElement('style');

        style.textContent = `
            ytd-action-companion-ad-renderer,
            ytd-display-ad-renderer,
            ytd-video-masthead-ad-advertiser-info-renderer,
            ytd-video-masthead-ad-primary-video-renderer,
            ytd-in-feed-ad-layout-renderer,
            ytd-ad-slot-renderer,
            yt-about-this-ad-renderer,
            yt-mealbar-promo-renderer,
            ad-slot-renderer,
            .ytd-video-masthead-ad-v3-renderer,
            div#root.style-scope.ytd-display-ad-renderer.yt-simple-endpoint,
            div#sparkles-container.style-scope.ytd-promoted-sparkles-web-renderer,
            div#main-container.style-scope.ytd-promoted-video-renderer,
            div#player-ads.style-scope.ytd-watch-flexy,

            #masthead-ad {
                display: none !important;
            }
        `;

        document.head.appendChild(style);

        sponsor?.forEach((element) => {
            if (element.id === "rendering-content") {
                [...element.childNodes]
                    .filter(e => e.data?.targetId !== "engagement-panel-macro-markers-description-chapters")
                    .forEach(e => e.style.display = 'none');
            }
        });

        if (debugMessages) console.log("Remove Adblock Thing: Removed page ads (✔️)");
    }

    // Unpause the video Works most of the time
    function unPauseVideo(video) {
        if (!video) return;
        if (video.paused) {
            // Simulate pressing the "k" key to unpause the video
            document.dispatchEvent(keyEvent);
            unpausedAfterSkip = 0;
            if (debugMessages) console.log("Remove Adblock Thing: Unpaused video using 'k' key");
        } else if (unpausedAfterSkip > 0) unpausedAfterSkip--;
    }

    //
    // Update check
    //

    function checkForUpdate() {

        if (!(window.location.href.includes("youtube.com"))) {
            return;
        }

        if (hasIgnoredUpdate) {
            return;
        }

        const scriptUrl = 'https://raw.githubusercontent.com/TheRealJoelmatic/RemoveAdblockThing/main/Youtube-Ad-blocker-Reminder-Remover.user.js';

        fetch(scriptUrl)
            .then(response => response.text())
            .then(data => {
                // Extract version from the script on GitHub
                const match = data.match(/@version\s+(\d+\.\d+)/);
                if (match) {
                    const githubVersion = parseFloat(match[1]);
                    const currentVersion = parseFloat(GM_info.script.version);

                    if (githubVersion > currentVersion) {
                        console.log('Remove Adblock Thing: A new version is available. Please update your script.');

                        const result = window.confirm("Remove Adblock Thing: A new version is available. Please update your script.");

                        if (result) {
                            window.location.replace(scriptUrl);
                        }

                    } else {
                        console.log('Remove Adblock Thing: You have the latest version of the script.');
                    }
                } else {
                    console.error('Remove Adblock Thing: Unable to extract version from the GitHub script.');
                }
            })
            .catch(error => {
                hasIgnoredUpdate = true;
                console.error('Remove Adblock Thing: Error checking for updates:', error);
            });
        hasIgnoredUpdate = true;
    }
})();
