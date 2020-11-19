const mongoose = require('mongoose')

const chatMessageSchema = new mongoose.Schema({
    username: String,
    image: String,
    time: Date,
    text: String
})

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema)

module.exports = ChatMessage