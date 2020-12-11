const express = require('express')
const router = express.Router()
const User = require('../db/models/User')
const auth = require('../../middleware/auth')


router.post('/register', async (req, res) => {
    const user = new User(req.body)
    const userExist = await User.findOne({email: user.email})
    try{
        if(userExist) return res.status(400).json({auth : false, message: 'email exist'})
        if(user.password != req.body.password2)return res.status(400).json({message: "password not match"});
        await user.save()
        await user.generateToken()
        res.status(201).send(user)
    }
    catch(e){
        res.status(400).send('Unable to create user' , e)
    }
})

router.post('/login', async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        console.log(user);
        await user.generateToken()
        res.status(200).send({ user })
    } catch(e){
        res.status(400).send('Somthing went wrong')
    }
})

// get logged in user
router.get('/profile',auth,function(req, res){
    res.json({
        isAuth: true,
        id: req.user._id,
        email: req.user.email,
        name: req.user.firstname + req.user.lastname
        
    })
})


//logout user
router.get('/logout',auth,function(req, res){
    req.user.deleteToken(req.token,(err, user)=>{
        if(err) return res.status(400).send(err)
        res.sendStatus(200)
    })
})


module.exports = router