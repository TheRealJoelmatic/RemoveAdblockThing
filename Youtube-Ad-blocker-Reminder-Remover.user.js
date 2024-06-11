// ==UserScript==
// @name         Remove Adblock Thing
// @namespace    http://tampermonkey.net/
// @version      5.6
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

    // Enable The Popup remover (pointless if you have the Undetected Adblocker)
    const removePopup = false;

    // Checks for updates (Removes the popup)
    const updateCheck = true;

    // Enable debug messages into the console
    const debugMessages = true;

    // Fix timestamps in the youtube comments for new method
    const fixTimestamps = true;

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

    // Used for after the player is updated
    let isVideoPlayerModified = false;

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
    if (fixTimestamps) timestampFix();

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
    // undetected adblocker method
    function removeAds() {
        log("removeAds()");

        setInterval(() => {

            if (window.location.href !== currentUrl) {
                currentUrl = window.location.href;
                isVideoPlayerModified = false;
                clearAllPlayers();
                removePageAds();
            }

            // Fix for youtube shorts
            if (window.location.href.includes("shorts")) {
                log("Youtube shorts detected, ignoring...");
                return;
            }

            if (isVideoPlayerModified){
                removeAllDuplicateVideos();
                return;
            }

            log("Video replacement started!");

            //
            // remove ad audio
            //

            var video = document.querySelector('video');
            if (video) video.volume = 0;
            if (video) video.pause();
            if (video) video.remove();

            //
            // Remove the current player
            //

            if (!clearAllPlayers()) {
                return;
            }

            /**
             * remove the "Ad blockers violate YouTube's Terms of Service" screen for safari
             */
            let errorScreen = document.querySelector("#error-screen");
            if (errorScreen) {
                errorScreen.remove();
            }
            
            //
            // Get the video ID from the URL
            //

            let videoID = '';
            let playList = '';
            let timeStamp = '';
            const url = new URL(window.location.href);
            const urlParams = new URLSearchParams(url.search);

            if (urlParams.has('v')) {
                videoID = urlParams.get('v');
            } else {
                const pathSegments = url.pathname.split('/');
                const liveIndex = pathSegments.indexOf('live');
                if (liveIndex !== -1 && liveIndex + 1 < pathSegments.length) {
                    videoID = pathSegments[liveIndex + 1];
                }
            }

            if (urlParams.has('list')) {
                playList = "&listType=playlist&list=" + urlParams.get('list');
            }

            if (urlParams.has('t')) {
                timeStamp = "&start=" + urlParams.get('t').replace('s', '');
            }

            if (!videoID) {
                log("YouTube video URL not found.", "e");
                return null;
            }

            log("Video ID: " + videoID);

            //
            // Create new frame for the video
            //

            const startOfUrl = "https://www.youtube-nocookie.com/embed/";
          
            const endOfUrl = "?autoplay=1&modestbranding=1&rel=0";
            const finalUrl = startOfUrl + videoID + endOfUrl;


            const iframe = document.createElement('iframe');

            iframe.setAttribute('src', finalUrl);
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
            iframe.setAttribute('allowfullscreen', true);
            iframe.setAttribute('mozallowfullscreen', "mozallowfullscreen");
            iframe.setAttribute('msallowfullscreen', "msallowfullscreen");
            iframe.setAttribute('oallowfullscreen', "oallowfullscreen");
            iframe.setAttribute('webkitallowfullscreen', "webkitallowfullscreen");

            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.position = 'absolute';
            iframe.style.top = '0';
            iframe.style.left = '0';
            iframe.style.zIndex = '9999';
            iframe.style.pointerEvents = 'all';

            const videoPlayerElement = document.querySelector('.html5-video-player');
            videoPlayerElement.appendChild(iframe);
            log("Finished");

            isVideoPlayerModified = true;
        }, 500);
        removePageAds();
    }
    //
    // logic functionm
    // 

    function removeAllDuplicateVideos() {
        const videos = document.querySelectorAll('video');

        videos.forEach(video => {
            if (video.src.includes('www.youtube.com')) {
                video.muted = true;
                video.pause();
                video.addEventListener('volumechange', function() {
                    if (!video.muted) {
                        video.muted = true;
                        video.pause();
                        log("Video unmuted detected and remuted");
                    }
                });
                video.addEventListener('play', function() {
                    video.pause();
                    log("Video play detected and repaused");
                });

                log("Duplicate video found and muted");
            }
        });
    }

    function clearAllPlayers() {
    
        const videoPlayerElements = document.querySelectorAll('.html5-video-player');
    
        if (videoPlayerElements.length === 0) {
            console.error("No elements with class 'html5-video-player' found.");
            return false;
        }
    
        videoPlayerElements.forEach(videoPlayerElement => {
        const iframes = videoPlayerElement.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            iframe.remove();
        });
    });
    
        console.log("Removed all current players!");
        return true;
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

    function changeTimestamp(timestamp) {
        const videoPlayerElements = document.querySelectorAll('.html5-video-player');
        videoPlayerElements.forEach(videoPlayerElement => {
            const iframes = videoPlayerElement.querySelectorAll('iframe');
            iframes.forEach(iframe => {
                if (iframe.src.includes("&start=")) {
                    iframe.src = iframe.src.replace(/&start=\d+/, "&start=" + timestamp);
                } else {
                    iframe.src += "&start=" + timestamp;
                }
            });
        });
    }

    function timestampFix() {
        document.addEventListener('click', function(event) {
            const target = event.target;

            if (target.classList.contains('yt-core-attributed-string__link') && target.href.includes('&t=')) {
                event.preventDefault();
                const timestamp = target.href.split('&t=')[1].split('s')[0];
                log(`Timestamp link clicked: ${timestamp} seconds`);
                changeTimestamp(timestamp);
            }
        });
    }

    function observerCallback(mutations) {
        let isVideoAdded = mutations.some(mutation => 
            Array.from(mutation.addedNodes).some(node => node.tagName === 'VIDEO')
        );

        if (isVideoAdded) {
            log("New video detected, checking for duplicates.");
            // Ignore for youtube shorts
            if (window.location.href.includes("shorts")) {
                log("Youtube shorts detected, ignoring...");
                return;
            }
            removeAllDuplicateVideos();
        }
    }

    const observer = new MutationObserver(observerCallback);
    observer.observe(document.body, { childList: true, subtree: true });

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
    function log(log, level, ...args) {

        if(!debugMessages)
            return;

        const prefix = '🔧 Remove Adblock Thing:';
        const message = `${prefix} ${log}`;
        switch (level) {
            case 'error':
                console.error(`❌ ${message}`, ...args);
                break;
            case 'log':
                console.log(`✅ ${message}`, ...args);
                break;
            case 'warning':
                console.warn(`⚠️ ${message}`, ...args);
                break;
            default:
                console.info(`ℹ️ ${message}`, ...args);
        }        
    }

})();
