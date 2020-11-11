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
    const keywords = ['werkervaring','werk ervaring','portfolio','kennis','skills']
    console.log('a user connected');
    socket.emit('welcome', 'Welcome!')

    socket.on('messageToServer', (msg) => {
        io.emit('messageFromServer', msg)
    })
    socket.on('keywordTrigger', (keywordsFromClient) => {
        console.log(keywordsFromClient);
    })
})


module.exports = expressServer