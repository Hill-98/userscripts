// ==UserScript==
// @name        Bilibili Comment User Location
// @namespace   Hill98
// @description 哔哩哔哩网页版评论区显示用户 IP 归属地
// @version     1.2.1
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

const console = Object.create(Object.getPrototypeOf(window.console), Object.getOwnPropertyDescriptors(window.console));

const addLocationToReply = function addLocationToReply() {
  const comments = Array.from(document.querySelectorAll('bili-comments')).flatMap((el) => Array.from(el?.shadowRoot.querySelectorAll('bili-comment-thread-renderer')));
  if (comments) {
    comments.forEach((comment) => {
      const bComments = [
        comment,
        ...(comment.shadowRoot?.querySelector('#replies bili-comment-replies-renderer')?.shadowRoot?.querySelectorAll('#expander-contents bili-comment-reply-renderer') ?? [])
      ]
      bComments.forEach((bContent) => {
        const action = bContent.tagName.toLowerCase() === 'bili-comment-thread-renderer'
          ? bContent.shadowRoot?.querySelector('#comment')?.shadowRoot?.querySelector('#footer bili-comment-action-buttons-renderer')?.shadowRoot
          : bContent.shadowRoot?.querySelector('#footer bili-comment-action-buttons-renderer')?.shadowRoot;

        const buttons = bContent.tagName.toLowerCase() === 'bili-comment-thread-renderer'
          ? bContent.shadowRoot?.querySelector('#replies')?.querySelector('bili-comment-replies-renderer')?.shadowRoot?.querySelectorAll('bili-text-button')
          : null;

        if (action) {
          const span = action.querySelector('.reply-location') ?? document.createElement('span');
          span.classList.add('reply-location');
          span.style.marginLeft = '16px';
          span.textContent = bContent.__data.reply_control.location;
          action.querySelector('#pubdate')?.insertAdjacentElement('afterend', span);
        }
      })
    })
  }
};

const $fetch = window.fetch;

window.fetch = async function fetchHacker() {
  const response = await $fetch(...arguments);
  if (response.status === 200 && response.headers.get('content-type')?.includes('application/json')) {
    setTimeout(addLocationToReply, 1000);
  }
  return response;
};
