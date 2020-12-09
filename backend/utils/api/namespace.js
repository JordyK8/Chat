const express = require('express')
const router = express.Router()
const Namespace = require('../db/Namespace')


router.post('/create', 
async (req, res) => {
    try{
        const namespaceExist = await Namespace.find({title: req.body.namespaceTitle})
        if(namespaceExist[0]){
            let namespaces = await Namespace.find({})
                res.render('admin', 
                {
                    title: 'Admin', 
                    data: namespaces, 
                    errorMessage: 
                    {
                        code: '',
                        text: 'A Namespace with this title already exist, please choose a different title for you Namespace.',
                    }
                })
        }else{
            let endpoint = `${req.body.namespaceTitle.toLowerCase()}`
            endpoint = endpoint.replace(/\s/g, '')
            endpoint =`/${endpoint}`
            const newNamespace = new Namespace({
                title: req.body.namespaceTitle,
                endpoint,
                rooms: [{
                    title: 'General', 
                    chatHistory: []
                },
                {
                    title: 'News',
                    chatHistory: []
                }],
                image: req.body.image
            })
            newNamespace.save()
            res.redirect('/admin')
        }
    }
    catch(error){
        console.log(error);
    }
})

router.post('/update', 
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

router.post('/delete', 
async (req, res) => {
    try{
        await Namespace.deleteOne({title: req.body.namespaceTitle})
    }catch(error){
        console.log(error);
    }
    res.redirect('/admin')
})

module.exports = router

