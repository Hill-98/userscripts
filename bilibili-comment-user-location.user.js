// ==UserScript==
// @name        Bilibili Comment User Location
// @namespace   Hill98
// @description 哔哩哔哩网页版评论区显示用户 IP 归属地
// @version     1.1.10
// @author      Hill-98
// @license     GPL-3.0
// @icon        https://www.bilibili.com/favicon.ico
// @downloadURL https://github.com/Hill-98/userscripts/raw/main/bilibili-comment-user-location.user.js
// @homepageURL https://github.com/Hill-98/userscripts
// @supportURL  https://github.com/Hill-98/userscripts/issues
// @updateURL   https://github.com/Hill-98/userscripts/raw/main/bilibili-comment-user-location.user.js
// @grant       none
// 主站
// @match       https://www.bilibili.com/*
// 直播 (直播间底部的主播动态)
// @match       https://live.bilibili.com/*
// 用户详情页
// @match       https://space.bilibili.com/*
// 动态
// @match       https://t.bilibili.com/*
// @run-at      document-start
// ==/UserScript==

const API_PREFIX = 'https://api.bilibili.com/x/v2/reply';

const console = Object.create(Object.getPrototypeOf(window.console), Object.getOwnPropertyDescriptors(window.console));

const addLocationToReply = function addLocationToReply(rootId, rpId, userId, location, count = 1) {
  const id = rootId === 0 ? rpId : rootId;
  const container = document.querySelector(`.reply-wrap[data-id="${rpId}"]`);
  const containers = document.querySelectorAll(`[data-root-reply-id="${id}"][data-user-id="${userId}"]`);

  // 如果评论元素未找到，则在一定时间内重复尝试数次。
  if (container === null && containers.length === 0) {
    if (count <= 10) {
      const args = Array.from(arguments).slice(0, arguments.length);
      args.push(count + 1);
      setTimeout(addLocationToReply, 50, ...args);
    }
    return;
  }

  const el = document.createElement('span');
  el.classList.add('reply-location');
  el.textContent = location;

  if (container) {
    // old page: 直接在对应评论元素插入IP位置
    const info = container.querySelector('.info');
    const time = info.querySelector('.time-location');
    if (time) {
      el.style.marginLeft = '-8px';
      info.insertBefore(el, time.nextSibling);
    } else {
      const tags = container.querySelector('.reply-tags');
      if (tags) {
        info.insertBefore(el, tags);
      } else {
        info.append(el);
      }
    }
  } else {
    // new page: 由于无法直接定位评论元素，只能先定位其他有标识符的元素（比如用户头像），然后使用其父元素间接定位评论元素。
    for (let i = 0; i < containers.length; i++) {
      const container = containers[i];
      let parentElement = container.parentElement;
      const isSub = parentElement.classList.toString().includes('sub-');
      if (isSub) {
        parentElement = parentElement.parentElement;
      }
      const info = parentElement.querySelector(isSub ? '.sub-reply-info' : '.reply-info');
      if (info && !info.querySelector('.reply-location')) {
        const time = info.querySelector('.reply-time,.sub-reply-time');
        el.style.marginRight = '16px';
        if (time) {
          el.style.marginLeft = '-8px';
          info.insertBefore(el, time.nextSibling);
        } else {
          info.append(el);
        }
        break;
      }
    }
  }
};

const handleReplies = function handleReplies(replies) {
  replies.forEach((reply) => {
    const control = reply.reply_control || {};
    if (control.location) {
      try {
        addLocationToReply(reply.root, reply.rpid, reply.mid, control.location);
      } catch (ex) {
        console.error(ex);
      }
    }
    if (reply.replies) {
      handleReplies(reply.replies);
    }
  });
};

const handleResponse = async function handleResponse(url, response) {
  if (!url.startsWith(API_PREFIX)) {
    return;
  }
  const body = response instanceof Response ? await response.clone().text() : response.toString();
  try {
    const json = JSON.parse(body);
    if (json.code === 0) {
      setTimeout(() => {
        handleReplies(Array.isArray(json.data.replies) ? json.data.replies : []);
        handleReplies(Array.isArray(json.data.top_replies) ? json.data.top_replies : []);
      }, 50);
    }
  } catch (ex) {
    console.error(ex);
  }
};

const $fetch = window.fetch;

window.fetch = async function fetchHacker() {
  const response = await $fetch(...arguments);
  if (response.status === 200) {
    await handleResponse(response.url, response);
  }
  return response;
};

const onReadyStateChange = function onReadyStateChange() {
  if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
    handleResponse(this.responseURL, this.response);
  }
};

const jsonpHacker = new MutationObserver((mutationList) => {
  mutationList.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeName.toLowerCase() !== 'script' || node.src.trim() === '') {
        return;
      }
      const u = new URL(node.src);
      if (u.searchParams.has('callback')) {
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
  jsonpHacker.observe(document.head, {
    childList: true,
  });
});

window.XMLHttpRequest = class XMLHttpRequestHacker extends window.XMLHttpRequest {
  constructor() {
    super();
    this.addEventListener('readystatechange', onReadyStateChange.bind(this));
  }
};
