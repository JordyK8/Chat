const express = require('express')
const router = express.Router()
const Namespace = require('../db/Namespace')

router.post('/', 
async (req, res) => {
    try{
        let endpoint = `${req.body.namespaceTitle[0].toLowerCase()}`
        endpoint = endpoint.replace(/[^a-zA-Z ]/g, "")
        endpoint =`/${endpoint}`
        await Namespace.findOneAndUpdate({title: req.body.originalNamespaceTitle},{title: req.body.namespaceTitle[0],image: req.body.image[0], endpoint})
        res.redirect('/admin')
    }catch(error){
        console.log(error);
        res.redirect('/admin')
    }
})

module.exports = router