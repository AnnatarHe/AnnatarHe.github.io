!function(){"use strict";function e(){var e=document.querySelector("input.__le-search-input");if(e)return e;var t=document.createElement("input");return t.classList.add(".__le-search-input"),document.body.appendChild(t),t}function t(t){if("string"!=typeof t)throw new TypeError("you should pass dom name like className to leSearch");var n=document.querySelector(t);n.addEventListener("click",function(){e()})}function n(){var e=document.body.scrollTop,t=Math.ceil(e/10);document.body.scrollTop=e-t,e>0&&requestAnimationFrame(n)}var r=function(){var e=document.title;return function(){document.title="hidden"===document.visibilityState?"别在其他网站瞎逛游了，快回来～":e}},c=(document.querySelector(".search__action"),document.querySelector(".search__input")),o=document.querySelector(".search__result--lists"),i=function(){return new Promise(function(e,t){var n=c.value.toLowerCase().trim(),r=posts.filter(function(e){return e.title.toLowerCase().indexOf(n)>0||e.url.toLowerCase().indexOf(n)>0});e(r)}).then(function(e){var t="",n=!0,r=!1,c=void 0;try{for(var o,i=e[Symbol.iterator]();!(n=(o=i.next()).done);n=!0){var a=o.value;t+='\n            <li>\n                <a href="'+a.url+'">\n                    <span class="title">'+a.title+'</span>\n                    <span class="url">'+a.url+"</span>\n                </a>\n            </li>\n            "}}catch(u){r=!0,c=u}finally{try{!n&&i["return"]&&i["return"]()}finally{if(r)throw c}}return t}).then(function(e){o.innerHTML=e})},a=document.querySelector(".searchTrigger"),u=(document.querySelector(".search__close"),document.querySelector(".search__mask")),s=u.classList,l=function(){s.remove("show"),s.add("hide")},d=function(){s.remove("hide"),s.add("show")},m=function(e){var t=e.target.classList,n=!!t.contains("search__mask"),r=!!t.contains("search__close"),c=!!t.contains("fa-close");return n||r||c?l():null},h=function(e){return s.contains("show")&&27===e.keyCode?l():null},f=document.querySelector(".back-to-top"),y=document.querySelector(".search__action"),v=document.querySelector(".search__input");document.addEventListener("visibilitychange",r()),v.addEventListener("input",i,!1),y.addEventListener("click",i,!1),f.addEventListener("click",function(e){n()}),a.addEventListener("click",d,!1),u.addEventListener("click",m,!1),document.body.addEventListener("keydown",h,!1),t(".searchTrigger")}();
