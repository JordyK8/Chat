const express = require('express')
const app = express()
const path = require('path')
const hbs = require('hbs')
const session = require('express-session')
const User = require('../utils/db/models/User')

const twoHours = 1000*60*60*2
app.use(session({
    name: 'sid',
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || 'sessionsecret',
    cookie: {
        maxAge: twoHours,
        sameSite: true,
        secure: process.env.SECURE_SESSION || false,
        
    }
}))


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

const redirectLogin = (req, res, next)=> {
    if(!req.session.userId){
        res.redirect('/login')
    }else{
        next()
    }
}

const redirectHome = (req, res, next)=> {
    if(req.session.userId){
        res.redirect('/home')
    }else{
        next()
    }
}

app.use(async (req, res, next)=> {
    const { userId } = req.session
    if(userId){
        res.locals.user = await User.findOne({_id:userId})
        
    } 
    next()
})


const users = [
    {id:1, username:'john', email:'a@a.a', password: 'a'},
    {id:2, username:'jane', email:'jane@j.j', password: 'secret'},
    {id:3, username:'henk', email:'henk@j.j', password: 'secret'},
]
//Routes setup












app.use('/', require('../utils/routes/pages'))
app.use('/namespace', require('../utils/api/namespace'))
app.use('/addRoom', require('../utils/api/addRoom'))
app.use('/users', require('../utils/api/user'))

// Server Listener
const expressServer = app.listen(PORT, () => {console.log(`Server is listening on port: ${PORT}`)})

// SOCKET IO
const socketio = require('socket.io')
const io = socketio(expressServer)
const socketApp = require('./socketio')
const { read } = require('fs')
socketApp(io)

