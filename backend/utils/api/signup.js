const express = require('express')
const router = express.Router()
const User = require('../db/models/User')

router.post('/', async (req, res) => {
    const username = req.body.username
    const email = req.body.email
    const password = req.body.password
    const newUser = await new User({
        username,
        email,
        password
    })
    try{
        await newUser.save()
        res.redirect('/')
    }catch(error){
        console.log(error);
    }
})
module.exports = router