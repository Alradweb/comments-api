const  mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email : {
        type: String,
        required : true,
        lowercase: true,
        unique : true
    },
    name: {
        type: String,
        default: ''
    },
    password : {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
    },
    remember: Boolean
});
module.exports = mongoose.model('users', userSchema);