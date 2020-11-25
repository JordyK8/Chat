const express = require('express')
const router = express.Router()
const Namespace = require('../db/Namespace')

router.get('/',
async (req, res) => {
    try{ 
        let namespaces = await Namespace.find({})
        res.render('admin', {title: 'Admin', data: namespaces, errorMessage:{text:'',code:''}})
    }
    catch(error){
        console.log(error);
    }
})
module.exports = router