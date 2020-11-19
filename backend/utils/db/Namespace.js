const { mongo, Mongoose } = require("mongoose");

const mongoose = require('mongoose')
const namespaceSchema = new mongoose.Schema({
    title: String,
    image: String,
    endpoint: String,
    rooms: Array 

})
const Namespace = mongoose.model('Namespace', namespaceSchema)

module.exports = Namespace