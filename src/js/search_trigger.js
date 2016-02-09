'use strict'

const trigger = document.querySelector('.searchTrigger')
const close = document.querySelector('.search__close')

const searchMaskBtn = document.querySelector('.search__mask')
const searchMask = searchMaskBtn.classList

trigger.addEventListener('click', () => {
	searchMask.remove('hide')
	searchMask.add('show')
},false)

// handle close event
searchMaskBtn.addEventListener('click', e => {
	e.preventDefault()
	let targetClassList = e.target.classList
	let isMaskClicked = targetClassList.contains('search__mask') ? true : false
	let isCloseBtnClicked = targetClassList.contains('search__close') ? true : false
	let isCloseIconClicked = targetClassList.contains('fa-close') ? true : false
	// if clicked is target 
	// then trigger close event
	if (isMaskClicked || isCloseBtnClicked || isCloseIconClicked) {
		handleCloseEvent()
	}else {
		return
	}
}, false)

// handle close
// just css animation
function handleCloseEvent() {
	searchMask.remove('show')
	searchMask.add('hide')
}