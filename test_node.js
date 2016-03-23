'use strict'

const http = require('http')
const qs = require('querystring')
const url = require('url')

function router (req, res) {
    let pathname = url.parse(req.url).pathname
    console.log(`pathname is : ${pathname}`)

}

const server = http.createServer((req, res) => {
    console.log('request is here')
    router(req, res)

    res.writeHead('content-type', 'text/html')
    res.write('Hello world')
    res.end()
})

server.listen(8888)