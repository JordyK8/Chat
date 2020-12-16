const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
// const jwt = require('jsonwebtoken')
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
        unique: true 
    },
    password:{
        type: String,
        required: true,
        minlength: 8
    }
})
// Salting and Hashing the PW before saving
userSchema.pre('save', async function (next) {
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})
//Generating a token 
// userSchema.methods.generateToken = async function() {
//     const user = this
//     const token = jwt.sign({ _id: user._id }, SECRET);
//     user.tokens = user.tokens.concat({token})
//     await user.save()
//     return token
// }

//Hiding passwords ant tokens on fetching user
userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    return userObject
}

// Login by credentials method
userSchema.statics.findByCredentials =  async (email, password) => {
    const user = await User.findOne({email})
    if(!user){
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw new Error('Unable to login')
    }
    console.log(user);
    return user
}


//Find Token function
// userSchema.statics.findByToken = function(token, cb){
//     var user = this;

//     jwt.verify(token, SECRET, function(err, decode){
//         user.findOne({"_id": decode, "token":token},function(err, user){
//             if(err) return cb(err);
//             cb(null, user);
//         })
//     })
// }
//Delete Token
// userSchema.methods.deleteToken = function(token, cb){
//     var user = this;

//     user.update({$unset : {token :1}},function(err, user){
//         if(err) return cb(err);
//         cb(null, user);
//     })
// }

const User = mongoose.model('User', userSchema)

module.exports = User