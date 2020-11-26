const express = require('express')
const app = express()
const path = require('path')
const hbs = require('hbs')

// Set up port for local or developed enviroment
const PORT = process.env.PORT || 3000

// Configuring express to handle json
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}));

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
    res.render('home', {
        title: 'Home'
    })
    
})

//Routes setup
app.use('/admin', require('../utils/api/admin'))
app.use('/addNamespace', require('../utils/api/namespace'))
app.use('/updateNamespace', require('../utils/api/updateNamespace'))
app.use('/deleteNamespace', require('../utils/api/deleteNamespace'))
app.use('/addRoom', require('../utils/api/addRoom'))

// Server Listener
const expressServer = app.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`)
})

//DB
const db = require('../utils/db/db')
const Namespace = require('../utils/db/Namespace')
const Room = require('../utils/db/Room')
const ChatMessage = require('../utils/db/ChatMessage')
db()

//SOCKET IO
const socketio = require('socket.io')
const io = socketio(expressServer)

io.on('disconnect', (socket) => {
    const roomToLeave = Array.from(socket.rooms)[1]
    socket.leave(roomToLeave)
    socket.close()
})
io.on('connection', (socket) => {
    console.log('a user connected');
    const namespaces = Namespace.find({})
    namespaces.then((namespaces) => {
        socket.emit('welcome', {
            message: 'Welcome!',
            nsData: namespaces
        })
        namespaces.forEach((namespace) => {
            socket.removeAllListeners()
            io.of(namespace.endpoint).on('connection', (nsSocket) => {
                nsSocket.removeAllListeners()
                const nsRooms = namespace.rooms
                nsSocket.emit('nsRooms', nsRooms)
                namespace.rooms.forEach((room) => {
                    updateUsersInRoom(namespace, room.title)
                })
                io.of(namespace.endpoint).on('disconnect', (nsSocket) => {
                    console.log('disconnected from: ', namespace.title);
                    const roomToLeave = Array.from(nsSocket.rooms)[1]
                    nsSocket.leave(roomToLeave)
                    nsSocket.close()
                })
                nsSocket.on('joinRoom', (roomToJoin) => {
                    if (Array.from(nsSocket.rooms).length > 1) {
                        const roomToLeave = Array.from(nsSocket.rooms)[1]
                        nsSocket.leave(roomToLeave)
                        updateUsersInRoom(namespace, roomToLeave)
                    }
                    nsSocket.join(roomToJoin)
                    updateUsersInRoom(namespace, roomToJoin)
                    nsSocket.emit('chatHistory',namespace.)
                })
                nsSocket.on('messageToServer', (msg) => {
                    // Inserting nessacery files and data
                    const keywords = require('../utils/db/keywordMapping')
                    const keywordsArray = ['hoi', 'doei']
                    const messageObject = {
                        username: 'Johnny',
                        image: 'https://www.flaticon.com/svg/static/icons/svg/21/21104.svg',
                        time: new Date(),
                        text: ''
                    }
                    if (msg.includes('@server')) {
                        messageObject.text = msg
                        nsSocket.emit('messageFromServer', messageObject)
                        let replySend = false;
                        keywords.forEach((keyword) => {
                            keyword.triggerWords.forEach((word) => {
                                if (msg.toLowerCase().includes(word)) {
                                    messageObject.text = keyword.message
                                    messageObject.username = 'Server'
                                    nsSocket.emit('messageFromServer', messageObject)
                                    replySend = true
                                }
                            })
                        })
                        if (replySend === false) {
                            messageObject.text = 'I do not understand your message, please try again'
                            messageObject.username = 'Server'
                            nsSocket.emit('messageFromServer', messageObject)
                        } else {
                            console.log('reply send');
                        }
                    } else {
                        //Getting the room in which the message was send from by Socket
                        const roomTitle = Array.from(nsSocket.rooms)[1];
                        messageObject.text = msg
                        index = namespace.rooms.findIndex(x => x.title === roomTitle)
                        namespace.rooms[index].chatHistory.push(messageObject);
                        namespace.save()
                        let pushChatHistory = Namespace.findOneAndUpdate({title: namespace.title},{rooms: namespace.rooms})
                        pushChatHistory.then(()=>{
                        }).catch((error) =>{
                            console.log(error);
                        })
                        io.of(namespace.endpoint).to(roomTitle).emit('messageFromServer', messageObject)
                    }
                })

            })
        })
    })
})





function updateUsersInRoom(namespace, room) {
    // all sockets in the "chat" namespace and in the "general" room
    const ids = io.of(namespace.endpoint).in(room).allSockets();
    ids.then((ids) => {
        let users = Array.from(ids).length
        io.of(namespace.endpoint).emit('roomNumberUpdate', {
            room,
            users
        })
    }).catch((error) => {
        console.log(error);
    })

}