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
app.get('/contact', (req, res) => {
    res.render('contact', {title: 'Contact'})
})
const expressServer = app.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`)
})

const socketio = require('socket.io')

const namespaces = require('../utils/db/namespaces')
const io = socketio(expressServer)
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.emit('welcome', {message: 'Welcome!', nsData: namespaces})
})

namespaces.forEach((namespace) => {
    io.of(namespace.endpoint).on('connection', (nsSocket) => {
        const nsRooms = namespace.rooms
        nsSocket.emit('nsRooms', nsRooms)
        nsSocket.join(nsRooms[0])
        namespace.rooms.forEach((room) => {
            updateUsersInRoom(namespace, room)
        })
        nsSocket.on('joinRoom',(roomToJoin, numberOfUsersCallBack) => {
            const roomToLeave = Array.from(nsSocket.rooms)[1]
            nsSocket.leave(roomToLeave)
            updateUsersInRoom(namespace, roomToLeave)
            nsSocket.join(roomToJoin)
            updateUsersInRoom(namespace, roomToJoin)
            
        })
        nsSocket.on('messageToServer', (msg) => {
        const messageObject = {
            username: 'Johnny',
            image: 'https://www.flaticon.com/svg/static/icons/svg/21/21104.svg',
            time: new Date(),
            text: ''
        }
            if(msg.includes('@server')){
                messageObject.text = msg
                nsSocket.emit('messageFromServer', messageObject)
                let replySend = false;
                keywords.forEach((keyword) => {
                    keyword.triggerWords.forEach((word) => {
                        if(msg.toLowerCase().includes(word)){
                            messageObject.text = keyword.message
                            messageObject.username = 'Server'
                            nsSocket.emit('messageFromServer', messageObject)
                            replySend = true
                        }
                    })            
                })
                if(replySend === false){
                    messageObject.text = 'I do not understand your message, please try again'
                    messageObject.username = 'Server'
                    nsSocket.emit('messageFromServer', messageObject)
                }else{
                    console.log('reply send');
                }
            }else{
                messageObject.text = msg
                io.of(namespace.endpoint).emit('messageFromServer', messageObject)
            }
        })


        nsSocket.on('keywordTrigger', (keywordsFromClient) => {
            console.log(keywordsFromClient);
            keywordsFromClient.forEach((keyword) => {
                nsSocket.emit('keywordReply', `Here is a link that may match your question http://localhost:3000`)
            })
        })



    })
})


function updateUsersInRoom(namespace, room){
    // all sockets in the "chat" namespace and in the "general" room
const ids = io.of(namespace.endpoint).in(room).allSockets();
    ids.then((ids) => {
        console.log(`${room} has ${Array.from(ids).length} members in it`);
        let users = Array.from(ids).length
        io.of(namespace.endpoint).emit('roomNumberUpdate', {room, users})
    }).catch((error) => {
        console.log(error);
    })
    
}