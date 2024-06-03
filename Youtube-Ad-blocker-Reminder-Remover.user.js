// ==UserScript==
// @name         YouTube Ad-Free Player
// @namespace    http://tampermonkey.net/
// @version      1.9
// @description  Plays YouTube videos in a custom HTML5 player without ads
// @author       OHG
// @match        https://www.youtube.com/watch?v=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      youtube.com
// @connect      googlevideo.com
// ==/UserScript==

(function() {
    'use strict';

    // Custom CSS for the HTML5 video player
    GM_addStyle(`
        #custom-video-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: black;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        }
        #custom-video-player {
            width: 80%;
            height: 80%;
            background: black;
        }
    `);

    // Function to fetch the video URL
    function fetchVideoUrl(videoId, callback) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: `https://www.youtube.com/get_video_info?video_id=${videoId}`,
            onload: function(response) {
                const urlParams = new URLSearchParams(response.responseText);
                const playerResponse = JSON.parse(urlParams.get('player_response'));
                const streamingData = playerResponse.streamingData;
                if (streamingData && streamingData.formats) {
                    const videoUrl = streamingData.formats[0].url;
                    callback(videoUrl);
                } else {
                    alert('Unable to fetch video URL');
                }
            },
            onerror: function() {
                alert('Error fetching video URL');
            }
        });
    }

    // Function to create and play the video in a custom HTML5 player
    function createCustomPlayer(videoUrl) {
        const videoContainer = document.createElement('div');
        videoContainer.id = 'custom-video-container';

        const videoPlayer = document.createElement('video');
        videoPlayer.id = 'custom-video-player';
        videoPlayer.src = videoUrl;
        videoPlayer.controls = true;
        videoPlayer.autoplay = true;

        videoContainer.appendChild(videoPlayer);
        document.body.appendChild(videoContainer);

        // Remove the custom player when the video ends
        videoPlayer.onended = function() {
            videoContainer.remove();
        };
    }

    // Get the video ID from the URL
    const videoId = new URLSearchParams(window.location.search).get('v');

    if (videoId) {
        fetchVideoUrl(videoId, createCustomPlayer);
    }
})();
