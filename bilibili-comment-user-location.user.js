// ==UserScript==
// @name        Bilibili Comment User Location
// @namespace   Hill98
// @description 哔哩哔哩网页版评论区显示用户 IP 归属地
// @version     1.0.1
// @author      Hill-98
// @license     MIT
// @icon        https://www.bilibili.com/favicon.ico
// @downloadURL https://github.com/Hill-98/userscripts/raw/main/bilibili-comment-user-location.user.js
// @homepageURL https://github.com/Hill-98/userscripts
// @supportURL  https://github.com/Hill-98/userscripts/issues
// @updateURL   https://github.com/Hill-98/userscripts/raw/main/bilibili-comment-user-location.user.js
// @grant       none
// @match       https://www.bilibili.com/*
// @run-at      document-start
// ==/UserScript==

const LOG_PREFIX = '[bcul]: ';

const console = Object.create(Object.getPrototypeOf(window.console), Object.getOwnPropertyDescriptors(window.console));

const addLocationToReply = function addLocationToReply(id, userid, location) {
  const el = document.createElement('span');
  el.classList.add('reply-location')
  el.style.marginLeft = '18px';
  el.textContent = location;
  const containers = document.querySelectorAll(`[data-root-reply-id="${id}"][data-user-id="${userid}"]`);
  containers.forEach((container) => {
    let parentElement = container.parentElement;
    const isSub = parentElement.classList.toString().includes('sub-');
    if (isSub) {
      parentElement = parentElement.parentElement;
    }
    const info = parentElement.querySelector(isSub ? '.sub-reply-info' : '.reply-info');
    if (info && !info.querySelector('.reply-location')) {
      info.append(el);
    }
  });
}

const handleReplies = function handleReplies(replies) {
  replies.forEach((reply) => {
    const userid = reply.mid;
    const rootid = reply.root === 0 ? reply.rpid : reply.root;
    const control = reply.reply_control;
    if (control?.location) {
      addLocationToReply(rootid, userid, control.location);
    }
    if (reply.replies) {
      handleReplies(reply.replies);
    }
  });
};

const handleResponse = function handleResponse(url, response) {
  if (!url.startsWith('https://api.bilibili.com/x/v2/reply')) {
    return;
  }
  try {
    const json = JSON.parse(response);
    if (json.code === 0 && json.data?.replies) {
      setTimeout(handleReplies.bind(this, json.data.replies), 1000);
    }
  } catch (ex) {
    console.error(LOG_PREFIX, ex);
  }
};

const hackResponse = function hackResponse() {
  if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
    handleResponse(this.responseURL, this.response);
  }
};

window.XMLHttpRequest = class XMLHttpRequestHacker extends window.XMLHttpRequest {
  constructor() {
    super();
    this.addEventListener('readystatechange', hackResponse.bind(this));
  }
};
