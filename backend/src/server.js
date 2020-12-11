const express = require('express')
const app = express()
const path = require('path')
const hbs = require('hbs')


// Configuring express to handle json
app.use(express.json())
app.use(express.urlencoded({extended: true}));

// Configuring paths to serve up staticly
const publicDirectoryPath = path.join(__dirname, '../../frontend/public')
const viewsPath = path.join(__dirname, '../../frontend/templates/views')
const partialsPath = path.join(__dirname, '../../frontend/templates/partials')

//DB
const db = require('../utils/db/db')
const Namespace = require('../utils/db/Namespace')
const Room = require('../utils/db/Room')
const ChatMessage = require('../utils/db/ChatMessage')
const cookieParser = require('cookie-parser')
db()

// Set up port for local or developed enviroment
const PORT = process.env.PORT || 3000

//Setting up view enigne
app.use(express.static(publicDirectoryPath))
app.use(cookieParser())
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)
app.use((req, res, next) => {
    if(req.method === 'GET'){
        // res.send('GET requests are deisabled')
        next()
    }else{
        next()
    }
    
})

//Routes setup
app.get('/', (req, res) => { console.log(req.user); res.render('home', {title: 'Home'})})
app.use('/admin', require('../utils/api/admin'))
app.use('/namespace', require('../utils/api/namespace'))
// app.use('/addNamespace', require('../utils/api/namespace'))
// app.use('/updateNamespace', require('../utils/api/updateNamespace'))
// app.use('/deleteNamespace', require('../utils/api/deleteNamespace'))
app.use('/addRoom', require('../utils/api/addRoom'))
// app.use('/signup', require('../utils/api/signup'))
// app.use('/login', require('../utils/api/login'))
app.use('/user', require('../utils/api/user'))

// Server Listener
const expressServer = app.listen(PORT, () => {console.log(`Server is listening on port: ${PORT}`)})

// SOCKET IO
const socketio = require('socket.io')
const io = socketio(expressServer)
const socketApp = require('./socketio')
socketApp(io)



  
  
