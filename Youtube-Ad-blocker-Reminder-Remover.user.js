// ==UserScript==
// @name         Remove Adblock Thing
// @namespace    http://tampermonkey.net/
// @version      2.3
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

    if (debug) console.log("Remove Adblock Thing: Remove Adblock Thing: Script started");
    // Old variable but could work in some cases
    window.__ytplayer_adblockDetected = false;

    if (adblocker) addblocker();
    if (removePopup) popupRemover();
    //if (removePopup) observer.observe(document.body, observerConfig);

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

        }, 1000);
    }
    // undetected adblocker method
    function addblocker() {
        handleAds();

        // Add a popup if the cookie does not exist
        setTimeout(() => {
            if (!getGotItState()) {
                document.body.insertAdjacentHTML("beforeend", addCss() + addHtml());

                const modal = document.getElementById("myModal");
                const span = document.getElementsByClassName("close")[0];

                modal.style.display = "block";

                span.onclick = function () {
                    modal.style.display = "none";
                }

                document.querySelector('.gotIt').onclick = function () {
                    setGotItState(true);
                    modal.style.display = "none";
                }
            }
        }, 1000);

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

    // Observe and remove ads when new content is loaded dynamically
    /*const observer = new MutationObserver(() => {
        removeJsonPaths(domainsToRemove, jsonPathsToRemove);
    });*/

    function getGotItState() {
        return localStorage.getItem('yAdbgotIt') === 'true';
    }

    function setGotItState(state) {
        localStorage.setItem('yAdbgotIt', state.toString());
    }

    function addCss() {
        return `
            <style>
                .modal {
                    display: none;
                    position: fixed;
                    z-index: 99999;
                    padding-top: 100px;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    overflow: auto;
                    background-color: rgb(0,0,0);
                    background-color: rgba(0,0,0,0.4);
                    font-size: 16px;
                    max-width: 500px;
                }

                .modal .content { 
                     margin-top: 30px;
                }
                
                .modal-content {
                    background-color: #fefefe;
                    margin: auto;
                    padding: 20px;
                    border: 1px solid #888;
                    width: 80%;
                    border: 5px #f90000 solid;
                    border-radius: 10px;
                }
                
                .close {
                    color: #aaaaaa;
                    float: right;
                    font-size: 28px;
                    font-weight: bold;
                }
                
                .close:hover,
                .close:focus {
                    color: #000;
                    text-decoration: none;
                    cursor: pointer;
                }
            </style>
        `;
    }


    function addHtml() {
        if (/fr/.test(navigator.language)) {
            return `
                <div id="myModal" class="modal">
                    <div class="modal-content">
                    <span class="close">&times;</span>
                    <div class="content">
                        <b> AdSkip YouTube </b>:<br>
                        <b>Pour que ce plugin fonctionne, désactivez votre bloqueur de publicités :</b> ajoutez YouTube à la liste blanche de toutes les extensions Firefox qui bloquent les publicités ou de tout élément tiers qui désactive les publicités. Ne vous inquiétez pas, ce script supprime les publicités intrusives sur les vidéos.
                        <br><br>
                        <button class="gotIt">J'ai compris !</button>
                    </div>
                </div>
            </div>
        `;
        } else {
            return `
                <div id="myModal" class="modal">
                    <div class="modal-content">
                        <span class="close">&times;</span>
                        <div class="content">
                            <b> AdSkip YouTube </b>:<br>
                            <b>For this plugin to work, turn off your ad blocker :</b> Add YouTube to the whitelist of all Firefox extensions that block ads or any third-party items that disable ads. Don't worry, this script removes intrusive ads on videos.
                            <br><br>
                            <button class="gotIt">Got it !</button>
                        </div>
                    </div>

                </div>
            `;
        }
    }


    function handleAds() {
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
            '.ytd-banner-promo-renderer' // Removes the large banner that occasionally appears at the top of the home page offering to subscribe to Premium
        ];
        const sponsorSelectors = ['div#player-ads.style-scope.ytd-watch-flexy', 'div#panels.style-scope.ytd-watch-flexy'];
        const nonVidSelector = '.ytp-ad-skip-button-modern';
    
        const observerCallback = (mutationsList, observer) => {
            removeJsonPaths(domainsToRemove, jsonPathsToRemove);
            for (const mutation of mutationsList) {
                if (mutation.addedNodes.length > 0) {
                    const video = document.querySelector('video');
                    const skipBtn = document.querySelector(skipBtnSelector);
                    const ad = document.querySelector(adSelector);
    
                    if (ad) {
                        video.playbackRate = 10;
                        video.volume = 0;
                        video.currentTime = video.duration;
                        skipBtn?.click();
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

                    // On the home page (desktop) at the top left
                    // It works, but sometimes it causes the current page to lag.
                    /*
                    const parentElement = document.querySelector('ytd-ad-slot-renderer');
                    if (parentElement) {
                        const richItemRenderers = parentElement.closest('ytd-app').querySelector('ytd-rich-item-renderer');
                        richItemRenderers?.remove();
                    }*/
                }
            }
        };
    
        const observer = new MutationObserver(observerCallback);
        observer.observe(document.body, observerConfig);
    }
    

    

})();
