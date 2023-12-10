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
    // Varables used for the Popup Remover
    //
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

    //Set everything up here
    if (debugMessages) console.log("Remove Adblock Thing: Script started");

    if(adblocker) addblocker();
    if(removePopup) popupRemover();

    // Remove Them pesski popups
    function popupRemover() {
        setInterval(() => {

            const fullScreenButton = document.querySelector(".ytp-fullscreen-button");
            const modalOverlay = document.querySelector("tp-yt-iron-overlay-backdrop");
            const popup = document.querySelector(".style-scope ytd-enforcement-message-view-model");
            const popupButton = document.getElementById("dismiss-button");

            const video1 = document.querySelector("#movie_player > video.html5-main-video");
            const video2 = document.querySelector("#movie_player > .html5-video-container > video");

            const bodyStyle = document.body.style;

            bodyStyle.setProperty('overflow-y', 'auto', 'important');

            if (modalOverlay) {
                modalOverlay.removeAttribute("opened");
                modalOverlay.remove();
            }

            if (popup) {
                if (debugMessages) console.log("Remove Adblock Thing: Popup detected, removing...");

                if(popupButton) popupButton.click();

                popup.remove();
                unpausedAfterSkip = 2;

                fullScreenButton.dispatchEvent(mouseEvent);

                setTimeout(() => {
                  fullScreenButton.dispatchEvent(mouseEvent);
                }, 500);

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
    function addblocker()
    {
        setInterval(() =>{
            const ad = [...document.querySelectorAll('.ad-showing')][0];
            const popupAd = document.querySelector("style-scope, .yt-about-this-ad-renderer");
            const skipBtn = document.querySelector('.videoAdUiSkipButton,.ytp-ad-skip-button');
            const sidAd = document.querySelector('ytd-action-companion-ad-renderer');
            const displayAd = document.querySelector('div#root.style-scope.ytd-display-ad-renderer.yt-simple-endpoint');
            const sparklesContainer = document.querySelector('div#sparkles-container.style-scope.ytd-promoted-sparkles-web-renderer');
            const mainContainer = document.querySelector('div#main-container.style-scope.ytd-promoted-video-renderer');
            const feedAd = document.querySelector('ytd-in-feed-ad-layout-renderer');
            const mastheadAd = document.querySelector('.ytd-video-masthead-ad-v3-renderer');
            const sponsor = document.querySelectorAll("div#player-ads.style-scope.ytd-watch-flexy, div#panels.style-scope.ytd-watch-flexy");
            const nonVid = document.querySelector(".ytp-ad-skip-button-modern");
            const youtubepremium = document.getElementById('masthead-ad');

            if(popupAd){
              popupAd.parentElement.parentElement.remove();
                console.log("Remove Adblock Thing: Popup Ad Center removed!");
            }

            if (ad)
            {
                if (debugMessages) console.log("Remove Adblock Thing: Found Ad");

                const video = document.querySelector('video');
                const openAdCenterButton = document.querySelector('.ytp-ad-button-icon');
                const blockAdButton = document.querySelector('[label="Block ad"]');
                const blockAdButtonConfirm = document.querySelector('.Eddif [label="CONTINUE"] button');

                if (video) video.playbackRate = 10;
                if (video) video.volume = 0;
                if (video) video.currentTime = video.duration || 0;

                if (video) skipBtn?.click();

                openAdCenterButton?.click();
                blockAdButton?.click();
                blockAdButtonConfirm?.click();

                if (debugMessages) console.log("Remove Adblock Thing: skipped Ad (✔️)");
            }

            sidAd?.remove();
            displayAd?.remove();
            sparklesContainer?.remove();
            mainContainer?.remove();
            feedAd?.remove();
            youtubepremium?.remove();
            mastheadAd?.remove();
            sponsor?.forEach((element) => {
                 if (element.getAttribute("id") === "panels") {
                    element.childNodes?.forEach((childElement) => {
                      if (childElement.data.targetId && childElement.data.targetId !=="engagement-panel-macro-markers-description-chapters"){
                          //Skipping the Chapters section
                            childElement.remove();
                        }
                       });
                } else {
                    element.remove();
                }
             });
            nonVid?.click();
        }, 50)
    }
    // Unpause the video Works most of the time
    function unPauseVideo(video)
    {
        if (!video) return;
        if (video.paused) {
            // Simulate pressing the "k" key to unpause the video
            document.dispatchEvent(keyEvent);
            unpausedAfterSkip = 0;
            if (debugMessages) console.log("Remove Adblock Thing: Unpaused video using 'k' key");
        } else if (unpausedAfterSkip > 0) unpausedAfterSkip--;
    }
})();
