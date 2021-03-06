function joinNS(endpoint, elem){
    let roomList = document.querySelector('#rooms-list')
    while(roomList.firstChild){
        roomList.removeChild(roomList.firstChild)
    }
    elem.classList.add('selectedNS')
    if(nsSocket){
        console.log('Socket exist');
      nsSocket.close()
      document.querySelector('#chat-form').removeEventListener('submit', sendChatMessage)
  
    }
    nsSocket = io(`http://localhost:3000${endpoint}`)
    nsSocket.on('nsRooms', (nsRooms) => {
        //Join toproom
        joinRoom(nsRooms[0].title)
        let roomList = document.querySelector('#rooms-list')
        roomList.innerHTML = ''
        nsRooms.forEach(room => {
            roomList.innerHTML += `<li class="room">${room.title}</li><img class="membersImage" src="https://cdn4.iconfinder.com/data/icons/browser-ui-small-size-optimized-set/154/user-login-human-man-body-512.png" width="15px" heigth="15px"/><span class="roomUsers" id="${room.title}room" class='numberOfMembers'></span></div>`
        });
        let roomNodes = document.getElementsByClassName('room')
        Array.from(roomNodes)[0].classList.add('selectedRoom')
        //Adding the listeners to all the rooms
        Array.from(roomNodes).forEach((room) => {
            room.addEventListener('click', (e) => {
                Array.from(roomNodes).forEach((rm) => {
                    rm.classList.remove('selectedRoom')
                })
                joinRoom(e.target.innerText)
                room.classList.add('selectedRoom')
            })
        })
        nsSocket.removeListener('nsRooms')
    })
    
    nsSocket.on('roomNumberUpdate', (data) => {
        const roomItem = document.getElementById(`${data.room}room`)
        roomItem.innerText = data.users
      })

    nsSocket.on('messageFromServer', (msg) => {
        const newMsg = buildHTML(msg)
        const messagesUl = document.querySelector('#message-list')
        messagesUl.innerHTML += newMsg
        messagesUl.lastElementChild.scrollIntoView()
    })
  
    nsSocket.on('keywordReply', (msg) => {
        let messageContainer = document.querySelector('#message-list')
        let li = document.createElement('li')
        li.innerText = msg
        messageContainer.appendChild(li) 
    })
    nsSocket.on('chatHistory', (chatHistory) => {
        const messagesUl = document.querySelector('#message-list')
        chatHistory.forEach((chatMessage) => {
            const newMsg = buildHTML(chatMessage)
            messagesUl.innerHTML += newMsg
            messagesUl.lastElementChild.scrollIntoView()
        })
        
    })
//chatform listener
    document.querySelector('#chat-form').addEventListener('submit', sendChatMessage)
}
  
function sendChatMessage(e){
    e.preventDefault()
    let message = document.querySelector('#chat-input').value
    let username = document.querySelector('#chat-input').getAttribute('username')
    nsSocket.emit('messageToServer', {message,username})
    document.querySelector('#chat-input').value =''    
}

function joinRoom(room){
    nsSocket.emit('joinRoom', room)
    const messages = document.querySelector('#message-list').innerHTML = ''
}
function buildHTML(msg){
    const convertedDate = new Date(msg.time).toLocaleString()
    const newHTML = `<li>
      <div class="message-img">
          <img src="${msg.image}" height="25px" width="25px" alt="">
          <div class="message-info"> ${msg.username}<span>${convertedDate}</span> </div>
      </div>
      <div> 
          <div class="message-text"><span>${msg.text}</span></div>
      </div>
      </li>`
    return newHTML
  }

