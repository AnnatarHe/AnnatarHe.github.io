(function() {
    'use strict';
    // if env is `production`, comment this
    if ( window.location.protocol.indexOf('s') < 0) {
        window.location.protocol = 'https'
    }

    document.addEventListener("visibilitychange", (function() {
        var title = document.title
        return function() {
            if (document.visibilityState == 'hidden') {
                document.title = '别在其他网站瞎逛游了，快回来～'
            }else {
                document.title = title
            }
        }
    })())
})()