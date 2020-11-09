const socketio = require('socket.io')
const expressServer = require('../src/server')
const io = socketio(expressServer)
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.emit('welcome', 'Welcome!')
})