const express = require('express')
const router = express.Router()
const Namespace = require('../db/Namespace')

router.post('/', 
async (req, res) => {
    try{
        await Namespace.deleteOne({title: req.body.namespaceTitle})
    }catch(error){
        console.log(error);
    }
    res.redirect('/admin')
})

module.exports = router