function joinNS(endpoint, elem){
    let roomList = document.querySelector('#rooms-list')
    while(roomList.firstChild){
        roomList.removeChild(roomList.firstChild)
    }
    elem.classList.add('selectedNS')
    if(nsSocket){
      nsSocket.close()
      document.querySelector('#chat-form').removeEventListener('submit', sendChatMessage)
  
    }
    nsSocket = io(`http://localhost:3000${endpoint}`)
    nsSocket.on('welcome', (msg) => {
    })
    
    nsSocket.on('nsRooms', (nsRooms) => {
        //Join toproom
        console.log(nsRooms[0].title);
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
    })
    
    nsSocket.on('roomNumberUpdate', (data) => {
        const roomItem = document.getElementById(`${data.room}room`)
        console.log(`roomitem:  ${roomItem}`);
        roomItem.innerText = data.users
      })

    nsSocket.on('messageFromServer', (msg) => {
      const newMsg = buildHTML(msg)
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
    document.querySelector('#chat-form').addEventListener('submit', sendChatMessage)
}
  
function sendChatMessage(e){
    e.preventDefault()
    let message = document.querySelector('#chat-input').value
    nsSocket.emit('messageToServer', message)
    document.querySelector('#chat-input').value =''    
}

function joinRoom(room){
    nsSocket.emit('joinRoom', room)
    const messages = document.querySelector('#message-list').innerHTML = ''
}