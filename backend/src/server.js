const express = require('express')
const app = express()
const path = require('path')
const hbs = require('hbs')

// Set up port for local or developed enviroment
const PORT = process.env.PORT || 3000
// Configuring express to handle json
app.use(express.json())

// Configuring paths to serve up staticly
const publicDirectoryPath = path.join(__dirname, '../../frontend/public')
const viewsPath = path.join(__dirname, '../../frontend/templates/views')
const partialsPath = path.join(__dirname, '../../frontend/templates/partials')

//Setting up view enigne
app.use(express.static(publicDirectoryPath))
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

// Inserting nessacery files and data
const keywords = require('../utils/db/keywordMapping')
const keywordsArray = ['hoi','doei']

//Testing home route
app.get('/', (req, res) => {
    res.render('home', {title:'Home'})
})
const expressServer = app.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`)
})

const socketio = require('socket.io')

const io = socketio(expressServer)
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.emit('welcome', 'Welcome!')

    socket.on('messageToServer', (msg) => {
        socket.emit('messageFromServer', msg)
        let replySend = false;
        keywords.forEach((keyword) => {
            keyword.triggerWords.forEach((word) => {
                if(msg.includes(word)){
                    socket.emit('messageFromServer', keyword.message)
                    replySend = true
                }
            })            
        })
        if(replySend === false){
            socket.emit('messageFromServer', 'I do not understand your message, please try again')
        }else{
            console.log('reply send');
        }
    })


    socket.on('keywordTrigger', (keywordsFromClient) => {
        console.log(keywordsFromClient);
        keywordsFromClient.forEach((keyword) => {
            socket.emit('keywordReply', `Here is a link that may match your question http://localhost:3000`)
        })
    })
})


module.exports = expressServer