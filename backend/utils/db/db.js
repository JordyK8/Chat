const mongoose = require('mongoose')

const db = function(){
    mongoose.connect('mongodb://localhost:27017/ChatDB', {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
}
module.exports = db