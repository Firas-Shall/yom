const mongoose = require('mongoose')
const Schema = mongoose.Schema

const journalSchema = new Schema({
    content: { type: String, required: true, minlength: 10 },
    date: { type: Date, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }
}, {
    toJSON: { getters: true },
    toObject: { getters: true }
})

journalSchema.index({ userId: 1, date: -1 })

module.exports = mongoose.model('Journal', journalSchema)