const express = require('express')
const mongoose = require('mongoose')
const keys = require('./config/keys')
mongoose.connect(keys.mongoURI, {useNewUrlParser: true})
.then(() => console.log('MongoDB connected'))
.catch((e) => console.log('MongoDB ERROR-->', e))
mongoose.set('useCreateIndex', true) //fixed warning
//create a new express application
const app = express()
app.use(require('cors')())
//require the http module
const http = require('http').Server(app)

// require the socket.io module
const io = require('socket.io')
const {getCommentsByArticleOwnerId} = require("./controllers/comment")
const {createComment} = require("./controllers/comment")
const {registration, login} = require("./controllers/auth")

const port = process.env.PORT || 5000

const socket = io(http)

//To listen to messages
socket.on('connection', (socket) => {
    console.log('user connected')
    socket.on('get all comments by ownerId', function (id) {
        getCommentsByArticleOwnerId(id).then(data => {
            //console.log('get all comments by ownerId--',data)
            socket.emit('all messages', data)
        })
    })

    socket.on("disconnect", () => {
        console.log("user Disconnected")
    })
    socket.on('registration', function (data) {
        registration(data).then(res => {
            console.log('----registration--OK-------')
            socket.emit('registration ok', res)
        }).catch(e => {
            socket.emit('registration ok', e.message)
            console.log('register fail--', e.message)
        })
    })
    socket.on('login', function (data) {
        login(data).then(res => {
            console.log('-----login-OK-------')
            socket.emit('login ok', res)
        }).catch(e => {
            socket.emit('login ok', e.message)
            console.log('login fail--', e.message)
        })
    })
    socket.on('end', function () {
        console.log("user End")
        socket.disconnect(true)
    })
    socket.on("chat message", function (msg) {
        console.log("message: ", msg.article.ownerId)
        // insert comment into database
        createComment(msg).then(res => {
            console.log('comment added?---', res)
            getCommentsByArticleOwnerId(msg.article.ownerId).then(data => {
                socket.broadcast.emit('all messages', data)
            })
        })
    })
})

http.listen(port, () => {
    console.log(`connected to port: ${port}`)
})