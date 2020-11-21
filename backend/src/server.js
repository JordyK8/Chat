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

// Inserting nessacery files and data
const keywords = require('../utils/db/keywordMapping')
const keywordsArray = ['hoi','doei']

//Testing home route
app.get('/', (req, res) => {
    res.render('home', {title:'Home'})
})
app.get('/admin', (req, res) => {
    res.render('admin', {title: 'Admin'})
})
app.post('/updateNamespace', (req, res) => {
    const newNamespace = new Namespace({
        title: req.body.namespaceTitle,
        endpoint: req.body.endpoint,
        rooms: [{
            title:req.body.room1, 
            chatHistory: []
        }],
        image: req.body.image
    })
    newNamespace.save()
    res.redirect('admin')
})
const expressServer = app.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`)
})

//DB
const db = require('../utils/db/db')
const Namespace = require('../utils/db/Namespace')
const Room = require('../utils/db/Room')
const ChatMessage = require('../utils/db/ChatMessage')
db()


const socketio = require('socket.io')
const io = socketio(expressServer)
const namespaces = Namespace.find({})
namespaces.then((namespaces) => {
    io.on('connection', (socket) => {
        console.log('a user connected');
        socket.emit('welcome', {message: 'Welcome!', nsData: namespaces})
    })
    namespaces.forEach((namespace) => {
        io.of(namespace.endpoint).on('connection', (nsSocket) => {
            const nsRooms = namespace.rooms
            nsSocket.emit('nsRooms', nsRooms)
            namespace.rooms.forEach((room) => {
                updateUsersInRoom(namespace, room.title)
            })
            nsSocket.on('joinRoom',(roomToJoin) => {
                if(Array.from(nsSocket.rooms).length > 1){
                    const roomToLeave = Array.from(nsSocket.rooms)[1]
                    nsSocket.leave(roomToLeave)
                    updateUsersInRoom(namespace, roomToLeave)
                }
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
                    //Getting the room in which the message was send from by Socket
                    const roomTitle = Array.from(nsSocket.rooms)[1];
                    messageObject.text = msg
                    io.of(namespace.endpoint).to(roomTitle).emit('messageFromServer', messageObject)
                    Namespace.find({},(namespace)=>{
                        console.log(namespace);
                    })
                }
            })
        })
    })
})





function updateUsersInRoom(namespace, room){
    // all sockets in the "chat" namespace and in the "general" room
const ids = io.of(namespace.endpoint).in(room).allSockets();
    ids.then((ids) => {
        let users = Array.from(ids).length
        io.of(namespace.endpoint).emit('roomNumberUpdate', {room, users})
    }).catch((error) => {
        console.log(error);
    })
    
}













//OLD ONE SHOULD STILL WORK!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


// namespaces.forEach((namespace) => {
//     io.of(namespace.endpoint).on('connection', (nsSocket) => {
//         const nsRooms = namespace.rooms
//         nsSocket.emit('nsRooms', nsRooms)
//         nsSocket.join(nsRooms[0])
//         namespace.rooms.forEach((room) => {
//             updateUsersInRoom(namespace, room)
            
//         })
//         nsSocket.on('joinRoom',(roomToJoin, numberOfUsersCallBack) => {
//             const roomToLeave = Array.from(nsSocket.rooms)[1]
//             nsSocket.leave(roomToLeave)
//             updateUsersInRoom(namespace, roomToLeave)
//             nsSocket.join(roomToJoin)
//             updateUsersInRoom(namespace, roomToJoin)
            
//         })
//         nsSocket.on('messageToServer', (msg) => {
//             const messageObject = {
//                 username: 'Johnny',
//                 image: 'https://www.flaticon.com/svg/static/icons/svg/21/21104.svg',
//                 time: new Date(),
//                 text: ''
//             }
//             if(msg.includes('@server')){
//                 messageObject.text = msg
//                 nsSocket.emit('messageFromServer', messageObject)
//                 let replySend = false;
//                 keywords.forEach((keyword) => {
//                     keyword.triggerWords.forEach((word) => {
//                         if(msg.toLowerCase().includes(word)){
//                             messageObject.text = keyword.message
//                             messageObject.username = 'Server'
//                             nsSocket.emit('messageFromServer', messageObject)
//                             replySend = true
//                         }
//                     })            
//                 })
//                 if(replySend === false){
//                     messageObject.text = 'I do not understand your message, please try again'
//                     messageObject.username = 'Server'
//                     nsSocket.emit('messageFromServer', messageObject)
//                 }else{
//                     console.log('reply send');
//                 }
//             }else{
//                 //Getting the room in which the message was send from by Socket
//                 const roomTitle = Array.from(nsSocket.rooms)[1];
//                 messageObject.text = msg
//                 io.of(namespace.endpoint).to(roomTitle).emit('messageFromServer', messageObject)
//             }
//         })


//         nsSocket.on('keywordTrigger', (keywordsFromClient) => {
//             console.log(keywordsFromClient);
//             keywordsFromClient.forEach((keyword) => {
//                 nsSocket.emit('keywordReply', `Here is a link that may match your question http://localhost:3000`)
//             })
//         })



//     })
// })