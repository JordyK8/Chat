
let auth = async (req, res, next)=>{
   console.log('auth middleware running');
    next()
}


module.exports = auth