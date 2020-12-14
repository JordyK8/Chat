
  const socket = io('http://localhost:3000')
  let nsSocket = ''
  const nsList = document.querySelector('#namespace-list')
// Getting the namespaces and start-message on connection
  socket.on('welcome', (data) => {
    data.nsData.forEach((namespace) => {
      nsList.innerHTML +=`<div class="namespace" ns=${namespace.endpoint}><img src="${namespace.image}" width="50px" height="50px "/></div>`
    })
    const namespacesArray = document.getElementsByClassName('namespace')
       // Adding listeners to the namespaces
      Array.from(namespacesArray).forEach((elem)=>{
        elem.addEventListener('click', (e) => {
          const nsEndpoint = elem.getAttribute('ns')
          Array.from(namespacesArray).forEach((element)=>{
            element.classList.remove('selectedNS')
          })
          joinNS(nsEndpoint, elem)
          console.log(`Clicked on NS: ${nsEndpoint}`);
        })
      })
      joinNS(namespacesArray[0].getAttribute('ns'),namespacesArray[0])
  })

  

 