'use strict';
// if env is `production`, comment this
export checkoutHttps = () => {
    if ( window.location.protocol.indexOf('s') < 0) {
        window.location.protocol = 'https'
    }
}

export titleShow = () => {
    var title = document.title
    return () => {
        if (document.visibilityState == 'hidden') {
            document.title = '别在其他网站瞎逛游了，快回来～'
        }else {
            document.title = title
        }
    }
}

document.addEventListener('visibilitychange', titleShow())
