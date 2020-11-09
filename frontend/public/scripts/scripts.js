const socket = io()
socket.on('welcome',(msg) => {
    console.log(msg);
})