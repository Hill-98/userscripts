// ==UserScript==
// @name        Disable BiliBili banner AD
// @namespace   Hill98
// @description Disable BiliBili banner advertise
// @version     1.1.1
// @author      Hill-98
// @license     MIT
// @icon        https://www.bilibili.com/favicon.ico
// @downloadURL https://github.com/Hill-98/userscripts/raw/main/disable-bilibili-banner-ad.user.js
// @homepageURL https://github.com/Hill-98/userscripts
// @updateURL   https://github.com/Hill-98/userscripts/raw/main/disable-bilibili-banner-ad.user.js
// @supportURL  https://github.com/Hill-98/userscripts/issues
// @grant       none
// @match       https://www.bilibili.com/
// @run-at      document-start
// ==/UserScript==

const DISABLE_HANDLE_KEY = '__dbba_$$disable_handle$$';

if (sessionStorage.getItem(DISABLE_HANDLE_KEY)) {
    sessionStorage.removeItem(DISABLE_HANDLE_KEY);
    return;
}

let __INITIAL_DATA__ = null;

class FakeString extends String {
    indexOf(str) {
        document.querySelector('.logo-img').src = str;
        return 1;
    }
}

Object.defineProperty(window, '__INITIAL_DATA__', {
    get() {
        return __INITIAL_DATA__;
    },
    set(value) {
        __INITIAL_DATA__ = value.map((item) => {
            const request = item.request;
            if (request.url.includes('//api.bilibili.com/x/web-show/page/header')) {
                item.response.litpic = new FakeString('');
            }
            return item;
        });
    },
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('a.inner-logo')?.addEventListener('dblclick', () => {
        sessionStorage.setItem(DISABLE_HANDLE_KEY, 'true');
        location.reload();
    });
});
