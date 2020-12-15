const express = require('express')
const router = express.Router()
const User = require('../db/models/User')
const auth = require('../middleware/auth')

const redirectLogin = (req, res, next)=> {
    if(!req.session.userId){
        res.redirect('/login')
    }else{
        next()
    }
}

const redirectHome = (req, res, next)=> {
    if(req.session.userId){
        res.redirect('/home')
    }else{
        next()
    }
}

//Create user
router.post('/', redirectHome, async (req, res) => {
    const user = new User(req.body)
    try {
        const userExist = await User.findOne({
            email: user.email
        })
        if (userExist) return res.status(400).send({ message: 'email exist'})
        if (user.password != req.body.password2) return res.status(400).send({ message: "password not match"});
        await user.save()
        req.session.userId = user._id
        res.redirect('/home')
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

//Login user
router.post('/login', redirectHome, async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        //const token = await user.generateToken()
        req.session.userId = user._id
        return res.status(200).redirect('/home')
        //Later this will include error messages with redirecting to login page
    } catch (e) {
        res.render('login' ,{ title: 'Home', error: e })
    }
})

///////////////////////////////////////////////      I NEED TO CHECK IF THIS LOGOUT WORKS. I dont know if the methhds on request are async...
// app.post('/logout', redirectLogin, (req, res) => {
//     req.session.destroy(err => {
//         if(err){
//             return res.redirect('/home')
//         }
//         res.clearCookie('sid')
//         res.redirect('/login')
//     })
// })

//Logout current user session with token
router.post('/logout', redirectLogin, async (req, res) => {
    try {
        await req.session.destroy()
        await res.clearCookie('sid')
        await res.redirect('/login')
        
    } catch (e) {
        res.status(500).send(e)
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

//Get current user profile
router.get('/profile', redirectLogin, (req, res) => {
    const { user } = res.locals
    res.render('profile', {user})
})

module.exports = router