const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const keys = require('../config/keys')
const User = require('../models/user')

const privateKEY = keys.privateKEY
const publicKEY = keys.publicKEY

const signOptions = {
    expiresIn: '1825d',
    algorithm: 'RS256'
}

const verifyOptions = {
    expiresIn: '1825d',
    algorithm: ['RS256']
}

module.exports.login = async (req) => {
    let candidate, password, verifyPassword
    if (req.token) {  // user logged in from his device and was stored in localstorage
        const verifying = jwt.verify(req.token, publicKEY, verifyOptions)
        if (!verifying) throw new Error('Verifying is failed')
        verifyPassword = verifying.password
        candidate = await User.findOne({email: verifying.email})
        if (!candidate) throw new Error('User not found')
        password = bcrypt.compareSync(verifying.password, candidate.password)
    } else {  //user logged in from a foreign device or was not saved to localstorage
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
            name: candidate.name,
            avatar: candidate.avatar,
            id: candidate._id,
            remember: candidate.remember,
            token: userToken
        }
    } else {
        throw new Error('Password or email do not match')
    }
}

module.exports.registration = async (req) => {
    if (!req.email || !req.password) {
        throw new Error("Something went wrong")
    }
    const candidate = await User.findOne({email: req.email})

    if (candidate) {
        throw new Error("Such email already exists")
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
                name: user.name,
                avatar: user.avatar,
                id: user._id,
                remember: user.remember,
                token: userToken
            }
        } catch (e) {
            throw e
        }
    }

}