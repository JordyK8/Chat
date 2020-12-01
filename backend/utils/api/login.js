const express = require('express')
const router = express.Router()
const User = require('../db/models/User')
const bcrypt = require('bcrypt')

//Compare hashed PW with posted PW
const compareFunction = async (password, hash) => {
     return await bcrypt.compare(password, hash)
}

router.post('/', async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    const user = await User.findOne({email})
    if(compareFunction(password, user.password)){
        console.log('Successfully logedin!');
    }else{
        console.log('something went wrong...');
    }
    try{
        res.redirect('/')
    }
    catch(error){
        console.log(error);
    }
})

module.exports = router