const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/ChatDB', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})
