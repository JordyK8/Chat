const editButtons = document.querySelectorAll('.editButton')
    const cancleButtons = document.querySelectorAll('.cancleButton')
    const addRoomButtons = document.querySelectorAll('.addRoomButton')
    Array.from(editButtons).forEach((button) => {
        button.addEventListener('click', (e) => {
            e.preventDefault()
            document.getElementById(`${e.target.name}form`).classList.remove('hiddenForm') 
        })
    })
    Array.from(cancleButtons).forEach((button) => {
        button.addEventListener('click', (e) => {
            e.preventDefault()
            if(e.target.part.contains('ns')){
            return document.getElementById(`${e.target.name}form`).classList.add('hiddenForm')
            }else if(e.target.part.contains('addn')){
                return document.getElementById(`addNSform`).classList.add('hiddenForm')
            }
             document.getElementById(`${e.target.name}roomform`).classList.add('hiddenForm')
        })
    })
    Array.from(addRoomButtons).forEach((button) => {
        button.addEventListener('click', (e) => {
            e.preventDefault()
            document.getElementById(`${e.target.name}roomform`).classList.remove('hiddenForm') 
        })
    })
    document.getElementById('addNS').addEventListener('click', (e) => {
        e.preventDefault()
        document.getElementById('addNSform').classList.remove('hiddenForm')
    })