const express = require('express')
const router = express.Router()
const Namespace = require('../db/Namespace')

router.post('/', 
async (req, res) => {
    let newRoom = {
        title: req.body.roomTitle,
        chatHistory: []
    }
    try{
        await Namespace.findOneAndUpdate({title: req.body.namespaceTitle}, { $push: { rooms: newRoom } })
        res.redirect('/admin')
    }
    catch(error){
        console.log(error);
    }
    
})
module.exports = router