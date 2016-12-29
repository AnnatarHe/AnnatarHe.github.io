/**
 * @author AnnatarHe
 * @email iamhele1994@gmail.com
 * @date 2016.12.29
 */


export function toTopFunc() {
    const toTop = document.body.scrollTop
    const speed = Math.ceil(toTop / 10)
    document.body.scrollTop = toTop - speed
    if (toTop > 0) {
        requestAnimationFrame(toTopFunc)
    }
}

