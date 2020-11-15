 
function joinNS(endpoint){

    if(nsSocket){
      nsSocket.close()
      document.querySelector('#chat-form').removeEventListener('submit', sendChatMessage)
  
    }
    nsSocket = io(`http://localhost:3000${endpoint}`)
    nsSocket.on('welcome', (msg) => {
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
    document.querySelector('#chat-input').value =''
      nsSocket.emit('messageToServer', message)    
  }