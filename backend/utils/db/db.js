const mongoose = require('mongoose')
const SECRET = process.env.SECRET || 'mysecret'
const DATABASE = process.env.MONGODB_URI || 'mongodb://localhost:27017/ChatDB'

const db = function(){
    mongoose.connect(DATABASE, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
}
module.exports = db