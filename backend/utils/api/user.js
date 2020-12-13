const express = require('express')
const router = express.Router()
const User = require('../db/models/User')
const auth = require('../middleware/auth')

//Create user
router.post('/', async (req, res) => {
    const user = new User(req.body)
    try {
        const userExist = await User.findOne({
            email: user.email
        })
        if (userExist) return res.status(400).send({
            auth: false,
            message: 'email exist'
        })
        if (user.password != req.body.password2) return res.status(400).send({
            message: "password not match"
        });
        await user.save()
        await user.generateToken()
        res.status(201).send(user)
    } catch (e) {
        res.status(400).send('Unable to create user' + e)
    }
})

//Update user
router.patch('/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['username', 'email', 'password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    
    if (!isValidOperation) {return res.status(400).send({error: 'invalid updates!'})}
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        
        res.send(req.user)
    } catch (e) {
        res.status(404).send(e)
    }
})

//Delete user
router.delete('/me', auth, async (req, res) => {
    console.log(req.user);
    try {
        await User.findByIdAndRemove(req.user._id)
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

// Get users
router.get('/', auth, async (req, res) => {
    try {
        const users = await User.find({})
        res.send({
            users
        })
    } catch (error) {
        res.status(400).send('Error getting users')
    }

})
//Get current loged in user
router.get('/me', auth, async (req, res) => {
    res.send(req.user)
})

//Login user
router.post('/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateToken()
        res.status(200).render('home', {user,token})
    } catch (e) {
        res.status(400).send('Somthing went wrong')
    }
})

//Logout current user session with token
router.post('/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//Logout all sessions with tokens
router.post('/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})


module.exports = router