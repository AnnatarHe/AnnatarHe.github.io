'use strict';

export const titleShow = () => {
    const title = document.title
    return () => {
        document.title = document.visibilityState === 'hidden' ? '别在其他网站瞎逛游了，快回来～' : title
    }
}

