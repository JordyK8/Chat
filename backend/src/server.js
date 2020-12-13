const express = require('express')
const app = express()
const path = require('path')
const hbs = require('hbs')
const session = require('express-session')

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
app.use((req, res, next) => {
    if(req.method === 'GET'){
        // res.send('GET requests are deisabled')
        next()
    }else{
        next()
    }
    
})




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

app.use((req, res, next)=> {
    const { userId } = req.session
    if(userId){
        res.locals.user = users.find(
            user => user.id === userId
        )
    } 
    next()
})


const users = [
    {id:1, name:'john', email:'john@j.j', password: 'secret'},
    {id:2, name:'jane', email:'jane@j.j', password: 'secret'},
    {id:3, name:'henk', email:'henk@j.j', password: 'secret'},
]
//Routes setup
app.get('/', (req, res) => { 
    const { userId } = req.session
    console.log('userId: ',userId);
    res.send(`
    <h1>Welcome!</h1>
    ${userId ? `
    <a href='/home'>Home</a>
    <form method='post' action='/logout'>
    <button>logout</button>
    </form>
    `:`
    <a href='/login'>login</a>
    <a href='/register'>register</a>
    `}
    `)
    
    // res.send('home', {title: 'Home'})
})
app.get('/home', redirectLogin, (req, res) => {
    const { user } = res.locals
    res.send(`
    <h1>home</h1>
    <a href='/'>Main</a>
    <ul>
    <li>Name: ${user.name}</li>
    <li>Email: ${user.email}</li>
    </ul>`
    )
})

app.get('/profile', redirectLogin, (req, res) => {
    const { user } = res.locals
    res.send(user)
})


app.get('/login', redirectHome, (req, res) => {
    res.send(`
    <h1>Login</h1>
    <form method='post' action='/login'>
    <input type='email' name='email' placeholder='Email' required />
    <input type='password' name='password' placeholder='Password' required />
    <input type='submit' />
    </form>
    <a href='/register'>register</a>
    `)
    //req.session.userId = 
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
app.post('/login', redirectHome, (req, res) => {
    const { email, password} = req.body
    console.log(email, password);
    if(email && password){
        console.log('testone')
        const user = users.find(user => user.email === email && user.password === password)
        if(user){
            console.log(user);
            req.session.userId = user.id
            return res.redirect('/home')
        }
    }console.log('no user');
    res.redirect('/login')
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

