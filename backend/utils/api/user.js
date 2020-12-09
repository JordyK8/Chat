const express = require('express')
const router = express.Router()
const User = require('../db/models/User')
const {auth} =require('../auth');

router.post('/register', async (req, res) => {
    const newUser = await new User(req.body)
    if(newUser.password != newUser.password2)return res.status(400).json({message: "password not match"});
    const user = await User.findOne({email: newUser.email})
    if(user) return res.status(400).json({auth : false, message: 'email exist'})
        newUser.save((err, doc) => {
            if(err){ return res.status(400).json({ succes: false})}
            res.status(200).json({
                succes: true,
                user: doc
            })
        })
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
            const user = User.findOne({'email': req.body.email})
            user.then((user)=> {
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
            }).catch((error) => {console.log(error);})
        }
    })
    
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