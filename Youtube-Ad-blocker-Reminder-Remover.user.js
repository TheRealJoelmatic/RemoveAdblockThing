// ==UserScript==
// @name         Remove Adblock Thing
// @namespace    http://tampermonkey.net/
// @version      6.0
// @description  Removes Adblock Thing
// @author       JoelMatic
// @match        https://www.youtube.com/watch*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @updateURL    https://github.com/TheRealJoelmatic/RemoveAdblockThing/raw/main/Youtube-Ad-blocker-Reminder-Remover.user.js
// @downloadURL  https://github.com/TheRealJoelmatic/RemoveAdblockThing/raw/main/Youtube-Ad-blocker-Reminder-Remover.user.js
// @run-at       document-start
// @inject-into  page
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


    // Used to stop reload spam
    let isReloading = false;


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
                if (video) video.play();


                setTimeout(() => {
                    if (video) video.play();
                }, 500);


                    log("Popup removed");
            }


            if (!video) return;
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


        setGoogleAdStatus("startup");


        try {
            Object.defineProperty(window, 'google_ad_status', {
                configurable: false,
                enumerable: true,
                get() {
                    return 1;
                },
                set(value) {
                    log("Blocked google_ad_status overwrite: " + value + " -> 1");
                }
            });


            log("google_ad_status lock installed");
        } catch (error) {
            log("Unable to lock google_ad_status", "error", error);
            setGoogleAdStatus("fallback after lock failed");
        }


        hookUrlChanges();


        setInterval(() => {
            checkUrlChange("interval check");
            setGoogleAdStatus("interval keep alive");
            removePageAds();
        }, 500);


        removePageAds();
    }


    //
    // logic functionm
    //


    function setGoogleAdStatus(reason) {
        try {
            window.google_ad_status = 1;
            log("Set window.google_ad_status = 1 (" + reason + ")");
        } catch (error) {
            log("Failed to set window.google_ad_status", "error", error);
        }
    }


    function forceRefresh(reason) {
        if (isReloading) {
            return;
        }


        isReloading = true;
        setGoogleAdStatus("before forced refresh");


        log("URL changed, forcing full refresh (" + reason + ")");


        window.location.reload();
    }


    function checkUrlChange(reason) {
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            forceRefresh(reason);
        }
    }


    function hookUrlChanges() {
        const originalPushState = history.pushState;
        history.pushState = function (...args) {
            setGoogleAdStatus("before history.pushState");


            const result = originalPushState.apply(this, args);


            setTimeout(() => {
                checkUrlChange("history.pushState");
            }, 0);


            return result;
        };


        const originalReplaceState = history.replaceState;
        history.replaceState = function (...args) {
            setGoogleAdStatus("before history.replaceState");


            const result = originalReplaceState.apply(this, args);


            setTimeout(() => {
                checkUrlChange("history.replaceState");
            }, 0);


            return result;
        };


        window.addEventListener('popstate', () => {
            setGoogleAdStatus("popstate");
            setTimeout(() => {
                checkUrlChange("popstate");
            }, 0);
        }, true);


        document.addEventListener('yt-navigate-start', () => {
            setGoogleAdStatus("yt-navigate-start");
            setTimeout(() => {
                checkUrlChange("yt-navigate-start");
            }, 0);
        }, true);


        document.addEventListener('yt-navigate-finish', () => {
            setGoogleAdStatus("yt-navigate-finish");
            setTimeout(() => {
                checkUrlChange("yt-navigate-finish");
            }, 0);
        }, true);


        document.addEventListener('yt-page-data-updated', () => {
            setGoogleAdStatus("yt-page-data-updated");
            setTimeout(() => {
                checkUrlChange("yt-page-data-updated");
            }, 0);
        }, true);


        log("URL change hooks installed");
    }


    //removes ads on the page (not video player ads)
    function removePageAds(){


        const sponsor = document.querySelectorAll("div#player-ads.style-scope.ytd-watch-flexy, div#panels.style-scope.ytd-watch-flexy");


        if (!document.getElementById("remove-adblock-thing-style")) {
            const style = document.createElement('style');
            style.id = "remove-adblock-thing-style";


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
        }


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
            const currentVersion = typeof GM_info !== "undefined" ? parseFloat(GM_info.script.version) : 6.0;

            if (githubVersion <= currentVersion) {
                log('You have the latest version of the script. ' + githubVersion + " : " + currentVersion);
                return;
            }

            console.log('Remove Adblock Thing: A new version is available. Please update your script. ' + githubVersion + " : " + currentVersion);

            if(updateModal.enable && typeof Swal !== "undefined"){
                // if a version is skipped, don't show the update message again until the next version
                if (parseFloat(localStorage.getItem('skipRemoveAdblockThingVersion')) === githubVersion) {
                    return;
                }

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
            } else {
                // YouTube blocks setting script.src because of Trusted Types.
                // Use the default browser popup instead of loading SweetAlert2 here.
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
            case 'e':
                console.error(`❌ ${message}`, ...args);
                break;
            case 'log':
                console.log(`✅ ${message}`, ...args);
                break;
            case 'warning':
            case 'w':
                console.warn(`⚠️ ${message}`, ...args);
                break;
            default:
                console.info(`ℹ️ ${message}`, ...args);
        }
    }


})();
