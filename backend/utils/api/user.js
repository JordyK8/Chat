const express = require('express')
const router = express.Router()
const User = require('../db/models/User')
const {auth} =require('../auth');

router.post('/register', async (req, res) => {
    const username = req.body.username
    const email = req.body.email
    const password = req.body.username
    const password2 = req.body.password2
    if(password != password2)return res.status(400).json({message: "password not match"});
    const newUser = await new User({
        username,
        email,
        password
    })
    const user = await User.findOne({email})
    if(user) return res.status(400).json({auth : false, message: 'email exist'})
    try{
        const doc = await newUser.save()
        res.status(200).json({
            succes: true,
            user: doc
        })
    }catch(error){
        console.log(error);
    }
})

router.post('/login', async (req, res) => {
    let token = req.cookies.auth
    User.findByToken(token, (err, user) => {
        if(err) return res(err)
        if(user) return res.status(400).json({
            error: true,
            message: 'You are already logged in'
        })
        else{
            const user = await User.findOne({'email': req.body.email})
            if(!user) return res.json({isAuth : false, message: 'Auth failed, email not found'})
            user.comparepassword(req.body.password,(err, isMatch) => {
                if(!isMatch) return res.json({isAuth: false, message: 'password doesnt match'})
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err)
                res.cookie('auth', user.token).json({
                    isAuth : true,
                    id : user._id,
                    email: user.email
                })
            })
            })
        }
    })
    
})

// get logged in user
app.get('/profile',auth,function(req, res){
    res.json({
        isAuth: true,
        id: req.user._id,
        email: req.user.email,
        name: req.user.firstname + req.user.lastname
        
    })
})


//logout user
app.get('/logout',auth,function(req, res){
    req.user.deleteToken(req.token,(err, user)=>{
        if(err) return res.status(400).send(err)
        res.sendStatus(200)
    })
})

module.exports = router