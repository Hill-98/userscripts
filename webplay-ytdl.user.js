// ==UserScript==
// @name        WebPlay for ytdl
// @namespace   Hill98
// @description Show WebPlay play button on some ytdl protocol supported pages
// @version     1.0.3
// @author      Hill-98
// @license     MIT
// @icon        https://www.google.com/s2/favicons?domain=mpv.io
// @downloadURL https://github.com/Hill-98/userscripts/raw/main/webplay-ytdl.user.js
// @homepageURL https://github.com/Hill-98/userscripts
// @supportURL  https://github.com/Hill-98/userscripts/issues
// @updateURL   https://github.com/Hill-98/userscripts/raw/main/webplay-ytdl.user.js
// @grant       none
// @match       https://space.bilibili.com/*/channel/collectiondetail?*
// @match       https://www.bilibili.com/bangumi/play/*
// @match       https://www.bilibili.com/video/*
// @match       https://www.youtube.com/watch?*
// @match       https://www.youtube.com/playlist?*
// ==/UserScript==

const style = document.createElement('style');
style.innerHTML = `
.play-button {
  background: linear-gradient(to right, #7f7fd5, #86a8e7, #91eae4);
  border-color: rgba(0, 0, 0, 0.2);
  color: #f1f2f3;
  cursor: pointer;
  font-size: 1rem;
  position: fixed;
  top: 0px;
  right: 0px;
  z-index: 99999;
}
`;

const playButton = document.createElement('button');
playButton.classList.add('play-button');
playButton.textContent = '▶ WebPlay';
playButton.title = 'Double click to hide';
playButton.addEventListener('click', () => {
  clearTimeout(Number(playButton.dataset.timer));
  playButton.dataset.timer = setTimeout(() => {
    delete playButton.dataset.timer;
    const params = new URLSearchParams();
    const video = document.querySelector('video');
    params.append('url', window.location.href);
    params.append('parse', 1);
    if (video !== null) {
      params.append('start', video.currentTime);
    }
    const url = 'webplay:?' + params.toString();
    location.assign(url);
    video.pause();
  }, 250);
});
playButton.addEventListener('dblclick', () => {
  clearTimeout(Number(playButton.dataset.timer));
  playButton.remove();
});

const container = document.createElement('div');
container.id = 'webplay-ytdl-' + Number.parseInt(Math.random() * 100);

const shadow = container.attachShadow({ mode: 'open' });
shadow.append(style);
shadow.append(playButton);

document.body.append(container);

document.addEventListener('fullscreenchange', () => {
  playButton.style.opacity = document.fullscreenElement ? '0' : '1';
});
