const chatButtonMini = document.getElementById('chat-button-minimize')
    const chatButtonOpen = document.getElementById('chat-button-open')
    const chatButtonSmallscreen = document.getElementById('chat-button-smallscreen')
    const chatButtonFullscreen = document.getElementById('chat-button-fullscreen')
    const chatWindow = document.getElementById('chat')
    const chatMenu = document.getElementById('chat-menu')
    const messageBox = document.getElementById('message-box')
    const chatBox = document.getElementById('chatbox')
    const chatForm = document.getElementById('chat-form')
    const chatLayout = document.getElementById('chat-layout')
    const chatInput = document.getElementById('chat-input')
    const chatButton = document.getElementById('chat-button')
    
    let chatWindowStatus = 'small'
    
    chatButtonMini.addEventListener('click', (e) => {
        e.preventDefault()
        chatWindowStatus = 'hidden'
        chatWindow.style.height = '30px'
        chatWindow.style.width = '63px'
        chatMenu.style.width = '58px'
        messageBox.style.height = '325px'
        chatInput.style.width = '265px'
        chatButton.style.width = '60px'
        checkChatMenuButtonStatus()
    })
    chatButtonOpen.addEventListener('click', (e) => {
        e.preventDefault()
        chatWindowStatus = 'small'
        chatWindow.style.height = '475px'
        chatWindow.style.width = '450px'
        chatMenu.style.width = '100%'
        messageBox.style.height = '325px'
        chatInput.style.width = '265px'
        chatButton.style.width = '60px'
        checkChatMenuButtonStatus()
    })
    chatButtonSmallscreen.addEventListener('click', (e) => {
        e.preventDefault()
        chatWindowStatus = 'small'
        chatWindow.style.height = '475px'
        chatWindow.style.width = '450px'
        chatMenu.style.width = '100%'
        messageBox.style.height = '325px'
        chatInput.style.width = '265px'
        chatButton.style.width = '60px'
        checkChatMenuButtonStatus()
        
    })
    chatButtonFullscreen.addEventListener('click', (e) => {
        e.preventDefault()
        chatWindowStatus = 'fullscreen'
        chatMenu.style.width = '100%'
        chatWindow.style.height = '100%'
        chatWindow.style.width = '100%'
        checkChatMenuButtonStatus()
    })

function checkChatMenuButtonStatus(){
    if(chatWindowStatus === 'hidden'){
        chatButtonMini.style.display = 'none'
        chatButtonOpen.style.display = 'inline'
        chatButtonSmallscreen.style.display = 'none'
        chatButtonFullscreen.style.display = 'inline'
    }else if(chatWindowStatus === 'small'){
        chatButtonMini.style.display = 'inline'
        chatButtonOpen.style.display = 'none'
        chatButtonSmallscreen.style.display = 'none'
        chatButtonFullscreen.style.display = 'inline'
    
    } else if(chatWindowStatus === 'fullscreen'){
        chatButtonMini.style.display = 'inline'
        chatButtonOpen.style.display = 'none'
        chatButtonSmallscreen.style.display = 'inline'
        chatButtonFullscreen.style.display = 'none'
        chatBox.style.marginLeft = '100px'
        chatBox.style.float = 'none'
        messageBox.style.height = '70vh'
        messageBox.style.width = '100%'
        chatForm.style.marginLeft = '110px'
        chatForm.style.float = 'none'
        chatLayout.style.width = '100%'
        chatInput.style.width = '90%'
        chatButton.style.width = '10%'

    }
}