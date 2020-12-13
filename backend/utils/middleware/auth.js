const jwt = require('jsonwebtoken')
const User = require('../db/models/User')
const SECRET = process.env.SECRET || 'mysecret'

const auth = async (req, res, next)=>{
    try{
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, SECRET)
        const user = User.findOne({_id: decoded._id, 'tokens.token': token})
    
        if(!user) {
            throw new Error()
        }
        req.token = token
        req.user = (await user).toObject()
        next()
    }
    catch(e){
        res.status(401).send({error: 'Plese authenticate'})
    }
    }

module.exports = auth