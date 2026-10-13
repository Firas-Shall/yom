const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    username: { type: String, required: true, minlength: 5, maxlength: 10},
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true, minlength: 8}
}, {
    toJSON: { getters: true },
    toObject: { getters: true }
})

userSchema.index({ username: 1 })

module.exports = mongoose.model('User', userSchema)