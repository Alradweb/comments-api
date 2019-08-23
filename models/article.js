const mongoose = require('mongoose')
const Schema = mongoose.Schema

const articleSchema = new Schema({
    ownId: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('article', articleSchema)