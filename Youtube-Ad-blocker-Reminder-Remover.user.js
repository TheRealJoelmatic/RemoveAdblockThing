// ==UserScript==
// @name         Enhanced Remove Adblock Thing
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Removes Adblock Thing and improves YouTube experience
// @author       JoelMatic
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @updateURL    https://github.com/Open-Horizon-Games/RemoveAdblockThing/raw/main/Youtube-Ad-blocker-Reminder-Remover.user.js
// @downloadURL  https://github.com/Open-Horizon-Games/RemoveAdblockThing/raw/main/Youtube-Ad-blocker-Reminder-Remover.user.js
// @grant        none
// ==/UserScript==

(function() {
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

    // Enable custom modal
    const updateModal = {
        enable: true, // if true, replaces default window popup with a custom modal
        timer: 5000, // timer: number | false
    };

    //
    //      CODE
    //

    // Variables used for adblock
    let currentUrl = window.location.href;
    let isAdFound = false;
    let adLoop = 0;

    // Button click event
    const event = new PointerEvent('click', {
        pointerId: 1,
        bubbles: true,
        cancelable: true,
        view: window,
        detail: 1,
        screenX: 0,
        screenY: 0,
        clientX: 0,
        clientY: 0,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
        button: 0,
        buttons: 1,
        width: 1,
        height: 1,
        pressure: 0.5,
        tiltX: 0,
        tiltY: 0,
        pointerType: 'mouse',
        isPrimary: true
    });

    // Variables used for updater
    let hasIgnoredUpdate = false;

    // Setup
    log("Script started");

    if (adblocker) removeAds();
    if (removePopup) popupRemover();
    if (updateCheck) checkForUpdate();

    // Function to remove popups
    function popupRemover() {
        setInterval(() => {
            const modalOverlay = document.querySelector("tp-yt-iron-overlay-backdrop");
            const popup = document.querySelector(".style-scope ytd-enforcement-message-view-model");
            const popupButton = document.getElementById("dismiss-button");

            const video = document.querySelector('video');

            document.body.style.setProperty('overflow-y', 'auto', 'important');

            if (modalOverlay) {
                modalOverlay.remove();
            }

            if (popup) {
                log("Popup detected, removing...");

                if (popupButton) popupButton.click();

                popup.remove();
                video.play();

                setTimeout(() => {
                    video.play();
                }, 500);

                log("Popup removed");
            }

            if (!video.paused) return;
            video.play();

        }, 1000);
    }

    // Function to remove video ads
    function removeAds() {
        log("removeAds()");

        let videoPlayback = 1;

        setInterval(() => {
            const video = document.querySelector('video');
            const ad = document.querySelector('.ad-showing');

            // Remove page ads
            if (window.location.href !== currentUrl) {
                currentUrl = window.location.href;
                removePageAds();
            }

            if (ad) {
                isAdFound = true;
                adLoop++;

                log("adLoop: " + adLoop);

                if (adLoop >= 5 && video.currentTime < (video.duration / 2)) {
                    video.playbackRate = 10;
                }

                if (adLoop <= 5) {
                    if (video) video.pause();

                    const openAdCenterButton = document.querySelector('.ytp-ad-button-icon');
                    openAdCenterButton?.dispatchEvent(event);

                    const blockAdButton = document.querySelector('[label="Block ad"]');
                    blockAdButton?.dispatchEvent(event);

                    const blockAdButtonConfirm = document.querySelector('.Eddif [label="CONTINUE"] button');
                    blockAdButtonConfirm?.dispatchEvent(event);

                    const closeAdCenterButton = document.querySelector('.zBmRhe-Bz112c');
                    closeAdCenterButton?.dispatchEvent(event);

                    if (video) video.play();
                }

                const popupContainer = document.querySelector('body > ytd-app > ytd-popup-container > tp-yt-paper-dialog');
                if (popupContainer && popupContainer.style.display === "") {
                    popupContainer.style.display = 'none';
                }

                log("Found Ad");

                const skipButtons = Array.from(document.querySelectorAll('[class*="skip-button"]'))
                    .map(element => element.className.split(' '))
                    .flat()
                    .filter((value, index, self) => self.indexOf(value) === index);

                if (video) {
                    video.volume = 0;
                    skipButtons.forEach(selector => {
                        const elements = document.querySelectorAll(`.${selector}`);
                        elements.forEach(element => element.dispatchEvent(event));
                    });
                    video.play();
                }

                log("skipped Ad (✔️)");

            } else {
                if (video?.playbackRate === 10) {
                    video.playbackRate = videoPlayback;
                }

                if (isAdFound) {
                    isAdFound = false;
                    if (videoPlayback === 10) videoPlayback = 1;
                    if (video && isFinite(videoPlayback)) video.playbackRate = videoPlayback;
                    adLoop = 0;
                } else {
                    if (video) videoPlayback = video.playbackRate;
                }
            }
        }, 50);

        removePageAds();
    }

    // Function to remove page ads
    function removePageAds() {
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
            ytd-statement-banner-renderer,
            ytd-ad-slot-renderer,
            ytd-in-feed-ad-layout-renderer,
            ytd-banner-promo-renderer-background
            statement-banner-style-type-compact,
            .ytd-video-masthead-ad-v3-renderer,
            div#root.style-scope.ytd-display-ad-renderer.yt-simple-endpoint,
            div#sparkles-container.style-scope.ytd-promoted-sparkles-web-renderer,
            div#main-container.style-scope.ytd-promoted-video-renderer,
            div#player-ads.style-scope.ytd-watch-flexy,
            ad-slot-renderer,
            ytm-promoted-sparkles-web-renderer,
            masthead-ad,
            tp-yt-iron-overlay-backdrop,
            #masthead-ad {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
        log("Removed page ads (✔️)");
    }

    // Function to check for script updates
    function checkForUpdate() {
        if (window.top !== window.self && !(window.location.href.includes("youtube.com"))) {
            return;
        }

        if (hasIgnoredUpdate) {
            return;
        }

        const scriptUrl = 'https://raw.githubusercontent.com/TheRealJoelmatic/RemoveAdblockThing/main/Youtube-Ad-blocker-Reminder-Remover.user.js';

        fetch(scriptUrl)
            .then(response => response.text())
            .then(data => {
                const match = data.match(/@version\s+(\d+\.\d+)/);
                if (!match) {
                    log("Unable to extract version from the GitHub script.", "e");
                    return;
                }

                const githubVersion = parseFloat(match[1]);
                const currentVersion = parseFloat(GM_info.script.version);

                if (githubVersion <= currentVersion) {
                    log(`You have the latest version of the script. ${githubVersion} : ${currentVersion}`);
                    return;
                }

                console.log(`Remove Adblock Thing: A new version is available. Please update your script. ${githubVersion} : ${currentVersion}`);

                if (updateModal.enable) {
                    if (parseFloat(localStorage.getItem('skipRemoveAdblockThingVersion')) === githubVersion) {
                        return;
                    }

                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
                    document.head.appendChild(script);

                    const style = document.createElement('style');
                    style.textContent = '.swal2-container { z-index: 2400; }';
                    document.head.appendChild(style);

                    script.onload = function() {
                        Swal.fire({
                            position: "top-end",
                            backdrop: false,
                            title: 'Remove Adblock Thing: New version is available.',
                            text: 'Do you want to update?',
                            showCancelButton: true,
                            showDenyButton: true,
                            confirmButtonText: 'Update',
                            denyButtonText: 'Skip',
                            cancelButtonText: 'Close',
                            timer: updateModal.timer ?? 5000,
                            timerProgressBar: true,
                            didOpen: (modal) => {
                                modal.onmouseenter = Swal.stopTimer;
                                modal.onmouseleave = Swal.resumeTimer;
                            }
                        }).then((result) => {
                            if (result.isConfirmed) {
                                window.location.replace(scriptUrl);
                            } else if (result.isDenied) {
                                localStorage.setItem('skipRemoveAdblockThingVersion', githubVersion);
                            }
                        });
                    };

                    script.onerror = function() {
                        const result = window.confirm("Remove Adblock Thing: A new version is available. Please update your script.");
                        if (result) {
                            window.location.replace(scriptUrl);
                        }
                    }
                } else {
                    const result = window.confirm("Remove Adblock Thing: A new version is available. Please update your script.");
                    if (result) {
                        window.location.replace(scriptUrl);
                    }
                }
            })
            .catch(error => {
                hasIgnoredUpdate = true;
                log("Error checking for updates:", "e", error);
            });
        hasIgnoredUpdate = true;
    }

    // Used for debug messages
    function log(message, level = 'log', ...args) {
        if (!debugMessages) return;

        const prefix = 'Remove Adblock Thing:';
        switch (level) {
            case 'error':
                console.error(`${prefix} ${message}`, ...args);
                break;
            case 'warn':
                console.warn(`${prefix} ${message}`, ...args);
                break;
            case 'info':
                console.info(`${prefix} ${message}`, ...args);
                break;
            default:
                console.log(`${prefix} ${message}`, ...args);
        }
    }

})();
