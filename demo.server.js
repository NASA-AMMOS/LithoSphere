const http = require('http')
const path = require('path')
const express = require('express')

const app = express()
const port = process.env.PORT || 9000

const options = { requestCert: false }

app.set('view engine', 'html')

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache')
    res.render(path.join(__dirname, 'public/index.html'))
})

const server = http.createServer(options, app)

server.listen(port, function () {
    console.log(
        `LithoSphere Demo server is listening on port: ${server.address().port}`
    )
})

app.listen(server)
