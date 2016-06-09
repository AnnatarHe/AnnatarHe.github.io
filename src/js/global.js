'use strict';

export const titleShow = () => {
    var title = document.title
    return () => {
        if (document.visibilityState == 'hidden') {
            document.title = '别在其他网站瞎逛游了，快回来～'
        }else {
            document.title = title
        }
    }
}

