// ==UserScript==
// @name         Remove Adblock Thing
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Removes Adblock Thing
// @author       JoelMatic
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
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

  //This is used to check if the video has been unpaused already
  let unpausedAfterSkip = 0;

  if (debug) console.log("Remove Adblock Thing: Remove Adblock Thing: Script started");
  // Old variable but could work in some cases
  window.__ytplayer_adblockDetected = false;

  if (adblocker) addblocker();
  if (removePopup) popupRemover();
  if (removePopup) observer.observe(document.body, observerConfig);

  // Remove Them pesski popups
  function popupRemover() {
    removeJsonPaths(domainsToRemove, jsonPathsToRemove);
    setInterval(() => {

      const popup = document.querySelector(".style-scope ytd-enforcement-message-view-model");

      const video1 = document.querySelector("#movie_player > video.html5-main-video");
      const video2 = document.querySelector("#movie_player > .html5-video-container > video");

      const modalOverlay = document.querySelector("tp-yt-iron-overlay-backdrop");

      if (popup) {
        if (debug) console.log("Remove Adblock Thing: Popup detected, removing...");
        popup.remove();
        if (modalOverlay) modalOverlay.removeAttribute("opened");
        unpausedAfterSkip = 2;
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

    }, 1000);
  }
  // undetected adblocker method
  function addblocker() {
    setInterval(() => {
      const skipBtn = document.querySelector('.videoAdUiSkipButton,.ytp-ad-skip-button');
      const ad = [...document.querySelectorAll('.ad-showing')][0];
      const sidAd = document.querySelector('ytd-action-companion-ad-renderer');
      if (ad) {
        document.querySelector('video').playbackRate = 10;
        if (skipBtn) {
          skipBtn.click();
        }
      }

      if (sidAd) {
        sidAd.remove();
      }
    }, 50)
  }
  // Unpause the video Works most of the time
  function unPauseVideo() {
    // Simulate pressing the "k" key to unpause the video
    const keyEvent = new KeyboardEvent("keydown", {
      key: "k",
      code: "KeyK",
      keyCode: 75,
      which: 75,
      bubbles: true,
      cancelable: true,
      view: window
    });
    document.dispatchEvent(keyEvent);
    unpausedAfterSkip = 0;
    if (debug) console.log("Remove Adblock Thing: Unpaused video using 'k' key");
  }
  function removeJsonPaths(domains, jsonPaths) {
    const currentDomain = window.location.hostname;
    if (!domains.includes(currentDomain)) return;

    jsonPaths.forEach(jsonPath => {
      const pathParts = jsonPath.split('.');
      let obj = window;
      for (const part of pathParts) {
        if (obj.hasOwnProperty(part)) {
          obj = obj[part];
        }
        else {
          break;
        }
      }
      obj = undefined;
    });
  }
  // Observe and remove ads when new content is loaded dynamically
  const observer = new MutationObserver(() => {
    removeJsonPaths(domainsToRemove, jsonPathsToRemove);
  });
})();
