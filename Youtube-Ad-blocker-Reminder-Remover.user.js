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

    // Fix timestamps in the youtube comments for new method
    const fixTimestamps = true;

    // Enable custom modal
    // Uses SweetAlert2 library (https://cdn.jsdelivr.net/npm/sweetalert2@11) for the update version modal.
    // When set to false, the default window popup will be used. And the library will not be loaded.
    const updateModal = {
        enable: true, // if true, replaces default window popup with a custom modal
        timer: 10000, // timer: number | false
    };

    //
    //      CODE
    //

    // Variables used for adblock
    let currentUrl = window.location.href;
    let isVideoPlayerModified = false;

    // Variables used for updater
    let hasIgnoredUpdate = false;

    // Setup
    log("Script started");

    if (adblocker) removeAds();
    if (removePopup) popupRemover();
    if (updateCheck) checkForUpdate();
    if (fixTimestamps) timestampFix();

    // Function to enable autoplay for the next video
    function enableAutoplayNextVideo() {
        const video = document.querySelector('video');
        if (video) {
            video.addEventListener('ended', function() {
                log("Video ended, attempting to play the next video.");
                const nextButton = document.querySelector('.ytp-next-button');
                if (nextButton) {
                    nextButton.click(); // Click the next button to play the next video
                    log("Clicked the next video button.");
                } else {
                    log("Next video button not found. Autoplay might be disabled or no video in the queue.", "e");
                }
            });
        } else {
            log("No video element found.", "e");
        }
    }

    // Function to setup MutationObserver
    function setupMutationObserver() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    enableAutoplayNextVideo(); // Apply the autoplay function to new content
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
        log("MutationObserver setup to monitor for new video elements.");
    }

    // Call setupMutationObserver after the page is loaded
    window.addEventListener('load', function() {
        setupMutationObserver();
    });

    // Function to remove ads
    function removeAds() {
        log("removeAds() called");

        setInterval(() => {
            if (window.location.href !== currentUrl) {
                currentUrl = window.location.href;
                isVideoPlayerModified = false;
                clearAllPlayers();
                removePageAds();
            }

            if (window.location.href.includes("shorts")) {
                log("Youtube shorts detected, ignoring...");
                return;
            }

            if (isVideoPlayerModified){
                removeAllDuplicateVideos();
                return;
            }

            log("Video replacement started!");

            var video = document.querySelector('video');
            if (video) video.volume = 0;
            if (video) video.pause();
            if (video) video.remove();

            if (!clearAllPlayers()) {
                return;
            }

            let errorScreen = document.querySelector("#error-screen");
            if (errorScreen) {
                errorScreen.remove();
            }

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

    // Function to remove duplicate videos
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

    // Function to clear all players
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

    // Function to remove page ads
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
            ytd-statement-banner-renderer,
            ytd-ad-slot-renderer,
            ytd-in-feed-ad-layout-renderer,
            ytd-banner-promo-renderer-background,
            statement-banner-style-type-compact,
            .ytd-video-masthead-ad-v3-renderer,
            div#root.style-scope.ytd-display-ad-renderer.yt-simple-endpoint,
            div#sparkles-container.style-scope.ytd-promoted-sparkles-web-renderer,
            div#main-container.style-scope.ytd-promoted-video-renderer,
            div#player-ads.style-scope.ytd-watch-flexy,
            ad-slot-renderer,
            ytm-promoted-sparkles-web-renderer,
            masthead-ad-video,
            #title-container.style-scope.ytd-watch-flexy,
            .ytd-watch-flexy {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
        sponsor.forEach(s => s.remove());
    }

    // Function to check for updates
    function checkForUpdate() {
        const request = new XMLHttpRequest();
        request.open('GET', 'https://github.com/TheRealJoelmatic/RemoveAdblockThing/raw/main/Youtube-Ad-blocker-Reminder-Remover.user.js');
        request.onload = function() {
            const response = request.responseText;
            const latestVersion = response.match(/@version\s+(\d+\.\d+)/)[1];
            const currentVersion = GM_info.script.version;

            log("Current version: " + currentVersion);
            log("Latest version: " + latestVersion);

            if (latestVersion > currentVersion) {
                log("Update available!");
                if (updateModal.enable) {
                    Swal.fire({
                        title: 'Update Available!',
                        text: 'A new version of the script is available. Click OK to be redirected to the download page.',
                        icon: 'info',
                        confirmButtonText: 'OK',
                        timer: updateModal.timer,
                        timerProgressBar: true,
                    }).then(() => {
                        window.location.href = 'https://github.com/TheRealJoelmatic/RemoveAdblockThing';
                    });
                } else {
                    if (!hasIgnoredUpdate) {
                        if (confirm('A new version of the script is available. Click OK to update now.')) {
                            window.location.href = 'https://github.com/TheRealJoelmatic/RemoveAdblockThing';
                        } else {
                            hasIgnoredUpdate = true;
                        }
                    }
                }
            }
        };
        request.send();
    }

    // Function to fix timestamps in comments
    function timestampFix() {
        document.querySelectorAll('yt-formatted-string.yt-simple-endpoint').forEach(element => {
            const textContent = element.textContent;
            if (textContent.match(/(\d+):(\d+)/)) {
                element.textContent = textContent.replace(/(\d+):(\d+)/g, (match, p1, p2) => {
                    return `${p1}m ${p2}s`;
                });
            }
        });
    }

    // Function to log messages
    function log(message, type = 'i') {
        if (debugMessages) {
            console[type](message);
        }
    }



})();
