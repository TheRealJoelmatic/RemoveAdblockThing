// ==UserScript==
// @name         Remove Adblock Thing
// @namespace    http://tampermonkey.net/
// @version      5.7
// @description  Removes Adblock Thing
// @author       JoelMatic
// @match        https://*.youtube.com/watch?v=*
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

    // Enable The Popup remover (pointless if you have the Undetected Adblocker)
    const removePopup = false;

    // Checks for updates (Removes the popup)
    const updateCheck = true;

    // Enable debug messages into the console
    const debugMessages = true;

    // Enable custom modal
    // Uses SweetAlert2 library (https://cdn.jsdelivr.net/npm/sweetalert2@11) for the update version modal.
    // When set to false, the default window popup will be used. And the library will not be loaded.
    const updateModal = {
        enable: true, // if true, replaces default window popup with a custom modal
        timer: 5000, // timer: number | false
    };


    //
    //      CODE
    //
    // If you have any suggestions, bug reports,
    // or want to contribute to this userscript,
    // feel free to create issues or pull requests in the GitHub repository.
    //
    // GITHUB: https://github.com/TheRealJoelmatic/RemoveAdblockThing

    //
    // Varables used for adblock
    //

    // Store the initial URL
    let currentUrl = window.location.href;

    // Used for if there is ad found
    let isAdFound = false;

    //used to see how meny times we have loopped with a ad active
    let adLoop = 0;

    //
    // Button click
    //

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

    //
    // Variables used for updater
    //

    let hasIgnoredUpdate = false;

    //
    // Setup
    //

    //Set everything up here
    log("Script started");

    if (adblocker) removeAds();
    if (removePopup) popupRemover();
    if (updateCheck) checkForUpdate();

    // Remove Them pesski popups
    function popupRemover() {

        setInterval(() => {
            const modalOverlay = document.querySelector("tp-yt-iron-overlay-backdrop");
            const popup = document.querySelector(".style-scope ytd-enforcement-message-view-model");
            const popupButton = document.getElementById("dismiss-button");

            var video = document.querySelector('video');

            const bodyStyle = document.body.style;
            bodyStyle.setProperty('overflow-y', 'auto', 'important');

            if (modalOverlay) {
                modalOverlay.removeAttribute("opened");
                modalOverlay.remove();
            }

            if (popup) {
                log("Popup detected, removing...");

                if(popupButton) popupButton.click();

                popup.remove();
                video.play();

                setTimeout(() => {
                    video.play();
                }, 500);

                log("Popup removed");
            }
            // Check if the video is paused after removing the popup
            if (!video.paused) return;
            // UnPause The Video
            video.play();

        }, 1000);
    }
    // undetected adblocker method
    function removeAds()
    {

        log("removeAds()");

        var videoPlayback = 1;

        setInterval(() =>{

            var video = document.querySelector('video');
            const ad = [...document.querySelectorAll('.ad-showing')][0];


            //remove page ads
            if (window.location.href !== currentUrl) {
                currentUrl = window.location.href;
                removePageAds();
            }

            if (ad)
            {
                isAdFound = true;
                adLoop = adLoop + 1;

                log("adLoop: " + adLoop);

                // If we tried 15 times we can assume it won't work this time (This stops the weird pause/freeze on the ads)


                if(adLoop >= 5){
                    //set the add to half to press the skip button
                    if (video.currentTime != undefined || video.currentTime > 0.10){
                        if(video.currentTime < (video.duration / 2)){
                            let randomNumber = Math.floor(Math.random() * 2) + 1;
                            //video.currentTime = (video.duration / 2) + randomNumber || 0;
                            video.playbackRate = 10 - randomNumber;
                        }
                    }
                }

                //
                // ad center method
                //

                if(adLoop <= 5){
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


                var popupContainer = document.querySelector('body > ytd-app > ytd-popup-container > tp-yt-paper-dialog');
                if (popupContainer){
                    // popupContainer persists, lets not spam
                    if (popupContainer.style.display == "")
                        popupContainer.style.display = 'none';
                }

                //
                // Speed Skip Method
                //
                log("Found Ad");


                //This is beacuse youtube keeps changing the class of the skip button for what ever reason
                let skipButtons = [
                'ytp-ad-skip-button-container',
                'ytp-ad-skip-button-modern',
                '.videoAdUiSkipButton',
                '.ytp-ad-skip-button',
                '.ytp-ad-skip-button-modern',
                '.ytp-ad-skip-button',
                '.ytp-ad-skip-button-slot',
                'ytp-skip-ad-button',
                'skip-button'
                ];
                const elementsWithSkipButton = document.querySelectorAll('[class*="skip-button"]');

                const classesFromElements = Array.from(elementsWithSkipButton).map(element => element.className.split(' ')).flat();
                const uniqueClassesFromElements = [...new Set(classesFromElements)];
                
                skipButtons = [...new Set([...skipButtons, ...uniqueClassesFromElements])];

                if (video){

                    //Seems to beh patched and gets dectected
                    //video.playbackRate = 10;
                    video.volume = 0;

                    // Iterate through the array of selectors
                    skipButtons.forEach(selector => {
                        // Select all elements matching the current selector
                        const elements = document.querySelectorAll(selector);

                        // Check if any elements were found
                        if (elements && elements.length > 0) {
                          // Iterate through the selected elements and click
                          elements.forEach(element => {
                            element?.dispatchEvent(event);
                          });
                        }
                    });
                    video.play();

                    //Seems to beh patched and gets dectected
                }

                log("skipped Ad (✔️)");

            } else {

                //check for unreasonale playback speed
                if(video && video?.playbackRate == 10){
                    video.playbackRate = videoPlayback;
                }

                if (isAdFound){
                    isAdFound = false;

                    // this is right after the ad is skipped
                    // fixes if you set the speed to 2x and an ad plays, it sets it back to the default 1x


                    //somthing bugged out default to 1x then
                    if (videoPlayback == 10) videoPlayback = 1;
                    if(video && isFinite(videoPlayback)) video.playbackRate = videoPlayback;

                    //set ad loop back to the defualt
                    adLoop = 0;
                }
                else{
                    if(video) videoPlayback = video.playbackRate;
                }
            }

        }, 50)

        removePageAds();
    }

    //removes ads on the page (not video player ads)
    function removePageAds(){

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

        sponsor?.forEach((element) => {
             if (element.getAttribute("id") === "rendering-content") {
                element.childNodes?.forEach((childElement) => {
                  if (childElement?.data.targetId && childElement?.data.targetId !=="engagement-panel-macro-markers-description-chapters"){
                      //Skipping the Chapters section
                        element.style.display = 'none';
                    }
                   });
            }
         });

        log("Removed page ads (✔️)");
    }

    //
    // Update check
    //

    function checkForUpdate(){

        if (window.top !== window.self && !(window.location.href.includes("youtube.com"))){
            return;
        }

        if (hasIgnoredUpdate){
            return;
        }

        const scriptUrl = 'https://raw.githubusercontent.com/TheRealJoelmatic/RemoveAdblockThing/main/Youtube-Ad-blocker-Reminder-Remover.user.js';

        fetch(scriptUrl)
        .then(response => response.text())
        .then(data => {
            // Extract version from the script on GitHub
            const match = data.match(/@version\s+(\d+\.\d+)/);
            if (!match) {
                log("Unable to extract version from the GitHub script.", "e")
                return;
            }

            const githubVersion = parseFloat(match[1]);
            const currentVersion = parseFloat(GM_info.script.version);

            if (githubVersion <= currentVersion) {
                log('You have the latest version of the script. ' + githubVersion + " : " + currentVersion);
                return;
            }

            console.log('Remove Adblock Thing: A new version is available. Please update your script. ' + githubVersion + " : " + currentVersion);

            if(updateModal.enable){
                // if a version is skipped, don't show the update message again until the next version
                if (parseFloat(localStorage.getItem('skipRemoveAdblockThingVersion')) === githubVersion) {
                    return;
                }
                // If enabled, include the SweetAlert2 library
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
                document.head.appendChild(script);

                const style = document.createElement('style');
                style.textContent = '.swal2-container { z-index: 2400; }';
                document.head.appendChild(style);

                // Wait for SweetAlert to be fully loaded
                script.onload = function () {

                    Swal.fire({
                        position: "top-end",
                        backdrop: false,
                        title: 'Remove Adblock Thing: New version is available.',
                        text: 'Do you want to update?',
                        showCancelButton: true,
                        showDenyButton: true,
                        confirmButtonText: 'Update',
                        denyButtonText:'Skip',
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
                        } else if(result.isDenied) {
                            localStorage.setItem('skipRemoveAdblockThingVersion', githubVersion);
                        }
                    });
                };

                script.onerror = function () {
                    var result = window.confirm("Remove Adblock Thing: A new version is available. Please update your script.");
                    if (result) {
                        window.location.replace(scriptUrl);
                    }
                }
            } else {
                var result = window.confirm("Remove Adblock Thing: A new version is available. Please update your script.");

                if (result) {
                    window.location.replace(scriptUrl);
                }
            }
        })
        .catch(error => {
            hasIgnoredUpdate = true;
            log("Error checking for updates:", "e", error)
        });
        hasIgnoredUpdate = true;
    }

    // Used for debug messages
    function log(log, level = 'l', ...args) {
        if (!debugMessages) return;

        const prefix = 'Remove Adblock Thing:'
        const message = `${prefix} ${log}`;
        switch (level) {
            case 'e':
            case 'err':
            case 'error':
                console.error(message, ...args);
                break;
            case 'l':
            case 'log':
                console.log(message, ...args);
                break;
            case 'w':
            case 'warn':
            case 'warning':
                console.warn(message, ...args);
                break;
            case 'i':
            case 'info':
            default:
        console.info(message, ...args);
        break
    }
    }

})();
