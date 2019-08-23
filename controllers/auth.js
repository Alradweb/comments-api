const bcrypt = require('bcryptjs')
//const validator = require('email-validator')
const jwt = require('jsonwebtoken')
const keys = require('../config/keys')
const User = require('../models/user')
const privateKEY = keys.privateKEY
const publicKEY = keys.publicKEY

const signOptions = {
    expiresIn: "1825d",
    algorithm: "RS256"
}
const payload = {
    password: '111112',
    email: 'qwerty@mail.com'
}
//var token = jwt.sign (payload, privateKEY, signOptions);
//console.log ("Токен -", token )

const verifyOptions = {
    expiresIn: "1825d",
    algorithm: ["RS256"]
}
//const legit = jwt.verify(token, publicKEY, verifyOptions);
//console.log("\nJWT verification result: " + JSON.stringify(legit));
module.exports.login = async (req) => {
    //console.log('from client--',req)
    let candidate, password, verifyPassword
    if (req.token) {
        const verifying = jwt.verify(req.token, publicKEY, verifyOptions)
        if (!verifying) throw new Error('Verifying is failed')
        verifyPassword = verifying.password
        candidate = await User.findOne({email: verifying.email})
        if (!candidate) throw new Error('User not found')
        password = bcrypt.compareSync(verifying.password, candidate.password)
        // console.log('verifying', verifying)
    } else {
        candidate = await User.findOne({email: req.data.email})
        if (!candidate) throw new Error('User not found')
        password = bcrypt.compareSync(req.data.password, candidate.password)

    }
    if (password) {
        const clientData = {
            email: candidate.email,
            password: verifyPassword ? verifyPassword : req.data.password
        }
        const userToken = jwt.sign(clientData, privateKEY, signOptions)
        return {
            message: 'login Ok',
            name: candidate.name,
            avatar: candidate.avatar,
            id: candidate._id,
            remember: candidate.remember,
            token: userToken
        }
    } else {
        throw new Error('Passwords do not match')
    }
}

module.exports.registration = async (req) => {
    if (!req.email || !req.password) {
        throw new Error("Something went wrong. Try again.")
    }
    const candidate = await User.findOne({email: req.email})
    console.log('reg from --client--', req)
    if (candidate) {
        throw new Error("Such email already exists. Try again.")
    } else {
        const salt = bcrypt.genSaltSync(10)
        const password = req.password
        const hash = bcrypt.hashSync(password, salt)
        const user = new User({
            email: req.email,
            name: req.name ? req.name : 'Я здесь инкогнито',
            password: hash,
            avatar: req.avatar || '',
            remember: req.remember
        })
        try {
            await user.save()
            const clientData = {
                email: req.email,
                password: req.password
            }
            const userToken = jwt.sign(clientData, privateKEY, signOptions)
            return {
                message: 'Ok',
                name: user.name,
                avatar: user.avatar,
                id: user._id,
                remember: user.remember,
                token: userToken
            }
        } catch (e) {
            console.log('from register--', e)
            throw e
        }
    }

}