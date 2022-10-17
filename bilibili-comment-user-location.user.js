// ==UserScript==
// @name        Bilibili Comment User Location
// @namespace   Hill98
// @description 哔哩哔哩网页版评论区显示用户 IP 归属地
// @version     1.1.2
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

const addLocationToReply = function addLocationToReply(rootid, rpid, userid, location) {
  const id = rootid === 0 ? rpid : rootid;
  const el = document.createElement('span');
  el.classList.add('reply-location')
  el.textContent = location;
  const containers = document.querySelectorAll(`[data-root-reply-id="${id}"][data-user-id="${userid}"]`);
  const container = document.querySelector(`.reply-wrap[data-id="${rpid}"]`);
  if (container) {
    // old page
    const info = container.querySelector('.info');
    info.append(el);
  } else {
    // new page
    for (let i = 0; i < containers.length; i++) {
      const container = containers[i];
      let parentElement = container.parentElement;
      const isSub = parentElement.classList.toString().includes('sub-');
      if (isSub) {
        parentElement = parentElement.parentElement;
      }
      const info = parentElement.querySelector(isSub ? '.sub-reply-info' : '.reply-info');
      if (info && !info.querySelector('.reply-location')) {
        el.style.marginLeft = '18px';
        info.append(el);
        break;
      }
    }
  }
}

const handleReplies = function handleReplies(replies) {
  replies.forEach((reply) => {
    const control = reply.reply_control;
    if (control?.location) {
      try {
        addLocationToReply(reply.root, reply.rpid, reply.mid, control.location);
      } catch (ex) {
        console.error(LOG_PREFIX, ex);
      }
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
    if (json.code === 0) {
      setTimeout(() => {
        handleReplies(json.data.replies ?? []);
        handleReplies(json.data.top_replies ?? []);
      }, 1000);
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

const jsonpObserver = new MutationObserver((mutationList) => {
  mutationList.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeName.toLowerCase() !== 'script') {
        return;
      }
      const u = new URL(node.src);
      if (u.href.startsWith('https://api.bilibili.com/x/v2/reply')) {
        const callbackName = u.searchParams.get('callback');
        const callback = window[callbackName];
        window[callbackName] = function (data) {
          handleResponse(u.href, JSON.stringify(data));
          callback(data);
        };
      }
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  jsonpObserver.observe(document.head, {
    childList: true,
  });
});
