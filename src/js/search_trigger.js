'use strict'
export const trigger = document.querySelector('.searchTrigger')
const close = document.querySelector('.search__close')

export const searchMaskBtn = document.querySelector('.search__mask')
const searchMask = searchMaskBtn.classList

// handle close
// just css animation
const handleCloseEvent = () => {
    searchMask.remove('show')
    searchMask.add('hide')
}

export const showModal = () => {
    searchMask.remove('hide')
    searchMask.add('show')
}

export const closeModalWithMask = e => {
    let targetClassList = e.target.classList
    let isMaskClicked = targetClassList.contains('search__mask') ? true : false
    let isCloseBtnClicked = targetClassList.contains('search__close') ? true : false
    let isCloseIconClicked = targetClassList.contains('fa-close') ? true : false
    // if clicked is target 
    // then trigger close event
    return isMaskClicked || isCloseBtnClicked || isCloseIconClicked ? handleCloseEvent() : null
}


export const closeModalEvent = e => searchMask.contains('show') && e.keyCode === 27 ? handleCloseEvent() : null

