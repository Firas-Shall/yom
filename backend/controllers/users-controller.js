const jwt = require('jsonwebtoken')
const User = require('../models/user')
const HttpError = require('../models/http-error')
const bcrypt = require('bcryptjs')
const signupSchema = require('../schemas/signup-schema')
const loginSchema = require('../schemas/login-schema')

const getUsers = async (req, res) => {
    let users;
    try {
        users = await User.find({}, 'username').lean()
    } catch (err) {
        throw new HttpError("Something Went Wrong!", 500)
    }
    res.status(200).json({ Users: users })
}

const search = async (req, res) => {
    const username = req.query.username

    if (!username || typeof username !== 'string') {
        throw new HttpError("Username query required", 400);
    }


    const escaped = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    let users
    try {
        users = await User.find({
            username: {
                $regex: escaped,
                $options: 'i'
            }
        }, 'username').limit(10).lean()
    } catch (err) {
        throw new HttpError("Something Went Wrong!", 500)
    }

    res.status(200).json({ Users: users })
}

const login = async (req, res) => {
    const result = loginSchema.safeParse(req.body)
    if (!result.success) {
        throw new HttpError("Invalid Credentials", 422)
    }

    const { email, password } = result.data

    let identifiedUser

    try {
        identifiedUser = await User.findOne({ email: email })
    } catch (err) {
        throw new HttpError("Something Went Wrong", 500)
    }

    if (!identifiedUser) {
        throw new HttpError("Invalid credentials", 401)
    }

    let isValidPassword
    try {
        isValidPassword = await bcrypt.compare(password, identifiedUser.password)
    } catch (err) {
        throw new HttpError("Something Went Wrong", 500)
    }

    if (!isValidPassword) {
        throw new HttpError("Invalid credentials", 401)
    }

    let token
    try {
        token = await jwt.sign({ userId: identifiedUser.id, email: identifiedUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' })
    } catch (err) {
        throw new HttpError("Something Went Wrong", 500)
    }

    res.json({ userId: identifiedUser.id, email: identifiedUser.email, username: identifiedUser.username, token: token })
}

const signup = async (req, res) => {
    const result = signupSchema.safeParse(req.body)
    if (!result.success) {
        throw new HttpError("Invalid Credentials", 422)
    }

    const { email, username, password } = result.data

    let existingUser
    try {
        existingUser = await User.findOne({ $or: [{ email }, { username }] })
    } catch (err) {
        throw new HttpError("Something Went Wrong", 500)
    }

    if (existingUser) {
        throw new HttpError("User already exists", 409)
    }

    let hashedPassword
    try {
        hashedPassword = await bcrypt.hash(password, 12)
    } catch (err) {
        throw new HttpError('Something went wrong!', 500)
    }

    const createdUser = new User({
        username,
        email,
        password: hashedPassword
    })

    try {
        await createdUser.save()
    } catch (err) {
        throw new HttpError('Could not create new user', 500)
    }

    let token
    try {
        token = jwt.sign({ userId: createdUser.id, username: createdUser.username, email: createdUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' })
    } catch (err) {
        throw new HttpError('Could not create new user', 500)
    }

    res.json({ userId: createdUser.id, username: createdUser.username, email: createdUser.email, token: token })
}

module.exports = { getUsers, search, login, signup }