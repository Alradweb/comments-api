const mongoose = require('mongoose')
const Schema = mongoose.Schema

const commentSchema = new Schema({
    author: {
        ref: 'users',
        type: Schema.Types.ObjectId
    },
    content: {
        type: String,
        required: true
    },
    datetime: {
        type: Date,
        default: Date.now
    },
    article: {
        ref: 'article',
        type: Schema.Types.ObjectId
    }
})

module.exports = mongoose.model('comment', commentSchema)