// ==UserScript==
// @name        Fuck QQ URL
// @namespace   Hill98
// @description Skip Unsafe Link Warning in Desktop QQ Client
// @version     1.2.1
// @author      Hill-98
// @license     MIT
// @icon        https://qzonestyle.gtimg.cn/qzone/qzact/act/external/tiqq/logo.png
// @downloadURL https://github.com/Hill-98/userscripts/raw/main/fuck-qq-url.user.js
// @homepageURL https://github.com/Hill-98/userscripts
// @supportURL  https://github.com/Hill-98/userscripts/issues
// @updateURL   https://github.com/Hill-98/userscripts/raw/main/fuck-qq-url.user.js
// @grant       none
// @match       https://c.pc.qq.com/middlem.html?*
// @match       https://c.pc.qq.com/pc.html?*
// ==/UserScript==

const usp = new URLSearchParams(location.search);
let url = usp.get('pfurl') || usp.get('url');
if (url !== null) {
  url = url.match(/^https?:\/\//) === null ? `http://${url}` : url;
  const meta = document.createElement('meta');
  meta.content = `0; url='${url}'`;
  meta.httpEquiv = 'refresh';
  document.head.innerHTML = meta.outerHTML;
  const tips = document.createElement('p');
  tips.style.fontSize = '2rem';
  tips.textContent = 'If there is no jump. ';
  const tipsLink = document.createElement('a');
  tipsLink.href = url;
  tipsLink.textContent = 'click here';
  tips.append(tipsLink);
  document.body.innerHTML = tips.outerHTML;
}
