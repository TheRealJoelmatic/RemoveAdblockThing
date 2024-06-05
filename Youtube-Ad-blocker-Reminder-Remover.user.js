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
    // Configuration
    const adblocker = true;
    const removePopup = false;
    const updateCheck = true;
    const debugMessages = true;
    const updateModal = {
        enable: true,
        timer: 5000,
    };

    // Variables
    let currentUrl = window.location.href;
    let isVideoPlayerModified = false;
    let hasIgnoredUpdate = false;

    // Setup
    log("Script started");
    if (adblocker) removeAds();
    if (removePopup) popupRemover();
    if (updateCheck) checkForUpdate();

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

    function removeAds() {
        log("removeAds()");

        setInterval(() => {
            if (window.location.href !== currentUrl) {
                currentUrl = window.location.href;
                isVideoPlayerModified = false;
                clearAllPlayers();
                removePageAds();
            }

            if (isVideoPlayerModified) {
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

            let videoID = '';
            const baseURL = 'https://www.youtube.com/watch?v=';
            const startIndex = currentUrl.indexOf(baseURL);

            if (startIndex !== -1) {
                const videoIDStart = startIndex + baseURL.length;
                videoID = currentUrl.substring(videoIDStart);
                const ampersandIndex = videoID.indexOf('&');
                if (ampersandIndex !== -1) {
                    videoID = videoID.substring(0, ampersandIndex);
                }
            } else {
                log("YouTube video URL not found.", "e")
                return null;
            }

            log("Video ID: " + videoID);

            const startOfUrl = "https://www.youtube-nocookie.com/embed/";
            const endOfUrl = "?autoplay=1&modestbranding=1";
            const finalUrl = startOfUrl + videoID + endOfUrl;

            const existingIframe = document.querySelector('.html5-video-player iframe');
            if (existingIframe) {
                existingIframe.remove();
            }

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

    function clearAllPlayers() {
        const videoPlayerElements = document.querySelectorAll('.html5-video-player');
        if (videoPlayerElements.length === 0) {
            console.error("No elements with class 'html5-video-player' found.");
            return false;
        }

        videoPlayerElements.forEach(videoPlayerElement => {
            while (videoPlayerElement.firstChild) {
                videoPlayerElement.removeChild(videoPlayerElement.firstChild);
            }
        });

        console.log("Removed all current players!");
        return true;
    }

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
                    if (childElement?.data.targetId && childElement?.data.targetId !== "engagement-panel-macro-markers-description-chapters") {
                        element.style.display = 'none';
                    }
                });
            }
        });

        log("Removed page ads (✔️)");
    }

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
                    log('You have the latest version of the script. ' + githubVersion + " : " + currentVersion);
                    return;
                }

                console.log('Remove Adblock Thing: A new version is available. Please update your script. ' + githubVersion + " : " + currentVersion);

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
                log("Error checking for updates:", "e", error);
            });
        hasIgnoredUpdate = true;
    }

    function log(log, level, ...args) {
        if (!debugMessages) return;
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
