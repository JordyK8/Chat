//DB
const db = require('../utils/db/db')
const Namespace = require('../utils/db/Namespace')
const Room = require('../utils/db/Room')
const ChatMessage = require('../utils/db/ChatMessage')
db()
const username = 

module.exports = function(io){

let checkConnection = 0
io.on('connection', (socket) => {
    socket.on('disconnect', (reason) => {
        console.log('Main socket closed');
        socket.removeAllListeners()
        //if(socket) return socket.close()
    })
    checkConnection++
    const namespaces = Namespace.find({})
    namespaces.then((namespaces) => {
        socket.emit('welcome', {
            message: 'Welcome!',
            nsData: namespaces
        })
        socket.once('disconnect', (socket) => {
            const roomToLeave = Array.from(socket.rooms)[1]
            socket.leave(roomToLeave)
            socket.close()
        })
        namespaces.forEach((namespace) => {
            socket.removeAllListeners()
            // For some reason the connections are stacking on refresh. The checkConnection is to make sure only once the listeners run for a connection.
            
            io.of(namespace.endpoint).on('connection', (nsSocket) => {
                
            if(checkConnection > 1){
                
                nsSocket.removeAllListeners()
                const nsRooms = namespace.rooms
                nsSocket.emit('nsRooms', nsRooms)
                namespace.rooms.forEach((room) => {
                    updateUsersInRoom(namespace, room.title)
                })
                nsSocket.on('disconnect', (reason) => {
                    nsSocket.removeAllListeners()
                    console.log('disconnected from: ', namespace.title);
                    nsSocket.disconnect()
                })
                nsSocket.on('joinRoom', (roomToJoin) => {
                    if (Array.from(nsSocket.rooms).length > 1) {
                        const roomToLeave = Array.from(nsSocket.rooms)[1]
                        nsSocket.leave(roomToLeave)
                        updateUsersInRoom(namespace, roomToLeave)
                    }
                    nsSocket.join(roomToJoin)
                    updateUsersInRoom(namespace, roomToJoin)
                    let index = namespace.rooms.findIndex(x => x.title === roomToJoin)
                    const chatHistory = namespace.rooms[index].chatHistory
                    nsSocket.emit('chatHistory', chatHistory)
                    
                })
                nsSocket.on('messageToServer', (msg) => {
                    console.log(msg);
                    // Inserting nessacery files and data
                    const keywords = require('../utils/db/keywordMapping')
                    const keywordsArray = ['hoi', 'doei']
                    const messageObject = {
                        username: msg.username,
                        image: 'https://www.flaticon.com/svg/static/icons/svg/21/21104.svg',
                        time: new Date(),
                        text: ''
                    }
                    if (msg.message.includes('@server')) {
                        messageObject.text = msg.message
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
                        messageObject.text = msg.message
                        let index = namespace.rooms.findIndex(x => x.title === roomTitle)
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
            }
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
}