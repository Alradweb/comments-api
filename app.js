const path = require('path')
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
app.get('/',(req, res)=> res.sendFile(path.join(__dirname + '/cat.html')))
const io = require('socket.io')
const {getCommentsByArticleOwnId, createComment} = require("./controllers/comment")
const {registration, login} = require("./controllers/auth")

const port = process.env.PORT || 5000

const socket = io(http)

//To listen to comments
socket.on('connection', (socket) => {
    console.log('user connected')
    socket.on('get all comments by ownId', function (id) {
        getCommentsByArticleOwnId(id).then(data => {
            console.log('get all comments by ownId--', data)
            socket.emit('all messages', data)
        })
    })

    socket.on("disconnect", () => {
        console.log("user Disconnected")
    })
    socket.on('registration', function (data) {
        registration(data).then(res => {
            console.log('----registration--OK-------')
            socket.emit('registration ok?', res)
        }).catch(e => {
            socket.emit('registration ok?', e.message)
            console.log('register fail--', e.message)
        })
    })
    socket.on('login', function (data) {
        login(data)
          .then(res => {
            console.log('-----login-OK-------')
            socket.emit('login ok?', res)
        }).catch(e => {
            socket.emit('login ok?', e.message)
            console.log('login fail--', e.message)
        })
    })
    socket.on('end', function () {
        console.log("user End")
        socket.disconnect(true)
    })
    socket.on("add comment", function (comment) {
        console.log("comment: ", comment.article.ownId)
        // insert comment into database
        createComment(comment)
          .then(res => {
            console.log('comment added---', res)
            getCommentsByArticleOwnId(comment.article.ownId).then(data => {
                socket.broadcast.emit('all messages', data)
            })
        }).catch(e => {
            console.log('comment rejected', e.message)
        })
    })
})

http.listen(port, () => {
    console.log(`connected to port: ${port}`)
})