const express = require('express')
const router = express.Router()
const Namespace = require('../db/Namespace')

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

router.get('/admin', redirectLogin ,async (req, res) => {
    try{ 
        let namespaces = await Namespace.find({})
        res.render('admin', {title: 'Admin', data: namespaces, errorMessage:{text:'',code:''}})
    }
    catch(error){
        console.log(error);
    }
})
router.get('/login', redirectHome, (req, res) => {
    res.render('login')
})
router.get('/register', redirectHome, (req, res) => {
    res.render('register')
})

router.get('/', (req, res) => { 
    const { userId } = req.session
    if(userId){
        res.redirect('/home')
    }else{
        res.redirect('/login')
    }
})

router.get('/home', redirectLogin, (req, res) => {
    const { user } = res.locals
    res.render('home', user)
})

router.get('/profile', redirectLogin, (req, res) => {
    const { user } = res.locals
    res.render('profile', {user})
    //WIll become res.render('profile', { user })
})



module.exports = router