// import 'babel-polyfill'
// This script for search post by json that jekyll generated
//
// @Author  AnnatarHe
// @Email   annatar.he@gmail.com
// @License MIT

// get the doms
const searchBtn = document.querySelector('.search__action')
const searchText = document.querySelector('.search__input')
const resultDom = document.querySelector('.search__result--lists')

// Search action. 
// First of all. get the input by user.
// Secondly. Using user input comparse with the json file
// Finally. put it in dom!
// Tips: innerHTML maybe good performance 
export const handleSearcher = () => {
    return new Promise((resolve, reject) => {
        let searchVal = searchText.value.toLowerCase().trim()
        let res = posts.filter((item) => {
            return (item.title.toLowerCase().indexOf(searchVal) > 0) || (item.url.toLowerCase().indexOf(searchVal) > 0)
        })
        resolve(res)
    })
    .then(res => {
        // contact the dom string
        let domStr = ''
        for (let post of res ) {
            domStr += `
            <li>
                <a href="${post.url}">
                    <span class="title">${post.title}</span>
                    <span class="url">${post.url}</span>
                </a>
            </li>
            `
        }
        return domStr
    })
    .then(domStr => {
        // render it!
        resultDom.innerHTML = domStr
    })
}

function getSearchInput() {
    const input = document.querySelector('input.__le-search-input')
    if (input) {
        return input
    }

    const _input = document.createElement('input')
    _input.classList.add('.__le-search-input')
    document.body.appendChild(_input)
    return _input
}

export function leSearch(dom) {
    if (typeof dom !== 'string') {
        throw new TypeError('you should pass dom name like className to leSearch')
    }

    const trigger = document.querySelector(dom)

    trigger.addEventListener('click', () => {
        let input = getSearchInput()
    })

}

