import { titleShow } from './global'
import { handleSearcher } from './search'
import { trigger, searchMaskBtn, showModal, closeModalWithMask, closeModalEvent } from './search_trigger'


const searchBtn = document.querySelector('.search__action')
const searchText = document.querySelector('.search__input')

document.addEventListener('visibilitychange', titleShow())
// listening double event.
searchText.addEventListener('input', handleSearcher, false)
searchBtn.addEventListener('click', handleSearcher, false)


trigger.addEventListener('click', showModal, false)

// handle close event
searchMaskBtn.addEventListener('click', closeModalWithMask, false)

document.body.addEventListener('keydown', closeModalEvent, false)