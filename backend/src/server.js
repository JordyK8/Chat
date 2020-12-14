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
app.get('/', (req, res) => { 
    const { userId } = req.session
    if(userId){
        res.redirect('/home')
    }else{
        res.redirect('/login')
    }
})
app.get('/home', redirectLogin, (req, res) => {
    const { user } = res.locals
    console.log('userrrrrrrrr::::::: ', user);
    res.render('home', user)
})

app.get('/profile', redirectLogin, (req, res) => {
    const { user } = res.locals
    res.send(user)
})


app.get('/login', redirectHome, (req, res) => {
    res.render('login')
    // <h1>Login</h1>
    // <form method='post' action='/login'>
    // <input type='email' name='email' placeholder='Email' required />
    // <input type='password' name='password' placeholder='Password' required />
    // <input type='submit' />
    // </form>
    // <a href='/register'>register</a>
    
    //req.session.userId = 
})

app.post('/login', redirectHome, (req, res) => {
    const { email, password} = req.body
    if(email && password){
        const user = users.find(user => user.email === email && user.password === password)
        if(user){
            req.session.userId = user.id
            return res.redirect('/home')
        }
    }console.log('no user');
    res.redirect('/login')
})

app.get('/register', redirectHome, (req, res) => {
    res.send(`
    <h1>Register</h1>
    <form method='post' action='/register'>
    <input type='name' name='name' placeholder='Name' required />
    <input type='email' name='email' placeholder='Email' required />
    <input type='password' name='password' placeholder='Password' required />
    <input type='submit' />
    </form>
    <a href='/login'>login</a>
    `)
    //req.session.userId = 
})

app.post('/register', redirectHome, (req, res) => {
    const { name, email, password} = req.body
    if(name && email && password){
        const exists = users.some(
            user => user.email === email
        )
        if(!exists){
            const user = {
                id: users.length + 1,
                name,
                email,
                password
            }

            users.push(user)
            req.session.userId = user.id
            return res.redirect('/home')
        }
    }
    res.redirect('/register')
})

app.post('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if(err){
            return res.redirect('/home')
        }
        res.clearCookie('sid')
        res.redirect('/login')
    })
})






app.use('/admin', require('../utils/api/admin'))
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

