const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const salt = 10;
const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET || 'mysecret'

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        maxlength: 40
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: 1    
    },
    password:{
        type: String,
        required: true,
        minlength: 8
    },
    password2:{
        type: String,
        required: true,
        minlength: 8
    },
    token: {
        type: String
    }
})
// Salting and Hashing the PW before saving
userSchema.pre('save', async function (next) {
    const user = this
    if(user.isModified('password')){
        bcrypt.genSalt(salt, function(err, salt){
            if(err) return next(err)
            bcrypt.hash(user.password ,salt, function(err, hash) {
                if(err) return next(err)
                user.password = hashuser.password2 = hash
                next()
            })
        })
    }else{
        next()
    }
})
// Login compare password method
userSchema.methods.comparepassword = function(password,cb){
    bcrypt.compare(password,this.password,function(err,isMatch){
        if(err) return cb(next);
        cb(null,isMatch);
    });
}
//Login assign Token function
userSchema.methods.generateToken = function(cb){
    var user =this;
    var token=jwt.sign(user._id.toHexString(),confiq.SECRET);

    user.token=token;
    user.save(function(err,user){
        if(err) return cb(err);
        cb(null,user);
    })
}

const User = mongoose.model('User', userSchema)

module.exports = User