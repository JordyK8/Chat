const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

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
    },
    avatar: {
        type: String,
        default: '/uploads/user-avatars/default.svg',
        required: false
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


//Hiding passwords on fetching data
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


const User = mongoose.model('User', userSchema)

module.exports = User