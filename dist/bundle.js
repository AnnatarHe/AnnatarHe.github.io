!function(){"use strict";document.querySelector(".search__action");var e=document.querySelector(".search__input"),t=document.querySelector(".search__result--lists"),n=function(){return new Promise(function(t,n){var r=e.value.toLowerCase().trim();t(posts.filter(function(e){return e.title.toLowerCase().indexOf(r)>0||e.url.toLowerCase().indexOf(r)>0}))}).then(function(e){var t="",n=!0,r=!1,c=void 0;try{for(var o,i=e[Symbol.iterator]();!(n=(o=i.next()).done);n=!0){var a=o.value;t+='\n            <li>\n                <a href="'+a.url+'">\n                    <span class="title">'+a.title+'</span>\n                    <span class="url">'+a.url+"</span>\n                </a>\n            </li>\n            "}}catch(e){r=!0,c=e}finally{try{!n&&i.return&&i.return()}finally{if(r)throw c}}return t}).then(function(e){t.innerHTML=e})};var r=document.querySelector(".searchTrigger"),c=(document.querySelector(".search__close"),document.querySelector(".search__mask")),o=c.classList,i=function(){o.remove("show"),o.add("hide")};function a(){var e=document.body.scrollTop,t=Math.ceil(e/10);document.body.scrollTop=e-t,e>0&&requestAnimationFrame(a)}var u,s=document.querySelector(".back-to-top"),l=document.querySelector(".search__action"),d=document.querySelector(".search__input");document.addEventListener("visibilitychange",(u=document.title,function(){document.title="hidden"===document.visibilityState?"别在其他网站瞎逛游了，快回来～":u})),d.addEventListener("input",n,!1),l.addEventListener("click",n,!1),s.addEventListener("click",function(e){a()}),r.addEventListener("click",function(){o.remove("hide"),o.add("show"),document.querySelector(".search__input").focus()},!1),c.addEventListener("click",function(e){var t=e.target.classList,n=!!t.contains("search__mask"),r=!!t.contains("search__close"),c=!!t.contains("fa-close");return n||r||c?i():null},!1),document.body.addEventListener("keydown",function(e){return o.contains("show")&&27===e.keyCode?i():null},!1),function(e){if("string"!=typeof e)throw new TypeError("you should pass dom name like className to leSearch");document.querySelector(e).addEventListener("click",function(){!function(){var e=document.querySelector("input.__le-search-input");if(e)return e;var t=document.createElement("input");t.classList.add(".__le-search-input"),document.body.appendChild(t)}()})}(".searchTrigger")}();
