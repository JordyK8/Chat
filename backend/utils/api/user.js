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

function checkUpdates(){
    if(!req.body.password || !req.body.password2){
        //Make this more dynamicly -- it needs to return all other fields not just static fields. Need to be a filter or something. Do it later please!!!!
        return ['username','email']
    }
    return Object.keys(req.body)
}

//Create user
const fs = require('fs')
router.post('/fileupload', redirectLogin, async (req, res) => {
    const { user } = res.locals
    try{
        if(!req.files) throw new Error('No file found in upload.')
        // Filepath name needs to be hashed and send to the DB 
        let avatar = req.files.filetoupload
        const filePath = `uploads/user-avatars/${user._id}@${user.username}-${avatar.name}`

        await fs.writeFile(filePath, avatar.data, 'binary', function(err){})
        res.render('profile', {title: 'Profile', alert: { title: 'Upload succes!', message: 'Your profile picturte has been uploaded!', type: 'alert-info'}})

    }
    catch(e){
        res.render('profile', {title: 'Profile', alert: { title: 'Unable to upload file', message: e, type: 'alert-warning'}})
    }
})


router.post('/', redirectHome, async (req, res) => {
    const user = new User(req.body)
    try {
        const userExist = await User.findOne({
            email: user.email
        })
        if (userExist) throw new Error('This email has already been registered.')
        if (user.password != req.body.password2) throw new Error('Given passwords don\'t seem to match.')
        await user.save()
        req.session.userId = user._id
        res.redirect('/home')
    } catch (e) {
        res.render( 'register',{title: 'Register', alert:{title: 'Unable te create user!', message: e, type: 'alert-danger'}})
    }
})

//Update user
router.post('/update', redirectLogin, async (req, res) => {
    const { user } = res.locals
    let updates = checkUpdates(Object.keys(req.body))
    const allowedUpdates = ['username', 'email', 'password', 'password2']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    
    try {
        if (!isValidOperation) throw new Error('The given updates are not valid updates. Some of the fields your trying to update might be rescricted by the server.')
        if(req.body.password !== req.body.password2) throw new Error('Given passwords don\'t match. Please try again.')
    
        updates.forEach((update) => user[update] = req.body[update])
        await user.save()
        
        res.render('profile', {title: 'Profile', alert:{title:'Update success!', message: 'Your updates have been approved and registered in our database.', type: 'alert-info'}})
    } catch (e) {
        res.render('profile', {title: 'Profile', alert:{ title: 'Unable to update profile', message: e, type: 'alert-danger'}})
    }
})

//Delete user
router.delete('/me', redirectLogin, async (req, res) => {
    console.log(req.user);
    try {
        await User.findByIdAndRemove(req.user._id)
        res.send(req.user)
    } catch (e) {
        res.render('profile', {title: 'Profile', alert: { title: 'Unable to delete user', message: e , type: 'alert-danger' }})
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
        res.render('login' ,{ title: 'Login', alert:{title: 'Login failed!', type: 'alert-danger', message: e } })
    }
})

router.post('/logout', redirectLogin, async (req, res) => {
    try {
        await req.session.destroy()
        await res.clearCookie('sid')
        await res.redirect('/login')
        
    } catch (e) {
        res.render('home', { title:'Home', alert:{ type: 'alert-warning', title:'Unable to logout', message: e}})
    }
})

//Get current user profile
router.get('/me', redirectLogin, (req, res) => {
    const { user } = res.locals
    res.render('profile', {title: 'Profile', user})
})

module.exports = router