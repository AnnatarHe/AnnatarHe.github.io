(function() {
	'use strict'
	const trigger = document.querySelector('.searchTrigger')
	const close = document.querySelector('.search__close')

	const searchMaskBtn = document.querySelector('.search__mask')
	const searchMask = searchMaskBtn.classList

	// handle close
	// just css animation
	const handleCloseEvent = () => {
		searchMask.remove('show')
		searchMask.add('hide')
	}

	trigger.addEventListener('click', () => {
		searchMask.remove('hide')
		searchMask.add('show')
	},false)

	// handle close event
	searchMaskBtn.addEventListener('click', e => {
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

	document.body.addEventListener('keydown', e => {
		let eCode = e.keyCode
		if (searchMask.contains('show') && eCode == 27) {
			handleCloseEvent()
		}else {
			return
		}
	}, false)


})()