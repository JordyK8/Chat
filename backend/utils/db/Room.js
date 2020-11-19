const mongoose =  require('mongoose')

const roomSchema = new mongoose.Schema({
    title: String,
    chatHistory: Array
})
const Room = mongoose.model('Room', roomSchema)

module.exports = Room