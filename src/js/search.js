// Warning:
// this script for search post by json that jekyll generated
// this script is coding. DO NOT use it in production!!!
//
// @Author  AnnatarHe
// @Email   iamhele1994@gmail.com
// @License MIT
'use strict'

// get the doms
const searchBtn = document.querySelector('.search__action')
const searchText = document.querySelector('.search__input')
const resultDom = document.querySelector('.search__result--lists')

// Search action. 
// First of all. get the input by user.
// Secondly. Using user input comparse with the json file
// Finally. put it in dom!
// Tips: innerHTML maybe good performance 
const handleSearcher = () => {
    new Promise((resolve, reject) => {
        let searchVal = searchText.value
        let result = []
        for (let post of posts) {
            if ( post.title.indexOf(searchVal) ) {
                result.push(post)
            }
        }
        resolve(result)
    })
    .then(res => {
        // contact the dom string
        let domStr = '<ul class="search-result">'
        for (let post of res ) {
            domStr += `
            <li>
                <a href="${post.url}">
                    <span>${post.title}</span>
                    <small>${post.url}</small>
                </a>
            </li>
            `
        }
        domStr += '</ul>'
        return domStr
    })
    .then(domStr => {
        // render it!
        resultDom.innerHTML = domStr
    })
}

// listening double event.
searchBtn.addEventListener('input', handleSearcher, false)
searchBtn.addEventListener('keyup', (e) => {
    if (e.keyCode == 13) {
        handleSearcher()
    }
}, false)
