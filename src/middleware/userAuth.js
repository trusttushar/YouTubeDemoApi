const jwt = require('jsonwebtoken');
module.exports = async (req,res,next)=>{
const AuthToken = req.get('Authorization');

if(!AuthToken){
    req.user = false;
    return next();
}
const token = AuthToken.split(' ')[1];
let decodedToken = await jwt.verify(token,process.env.SESSION_SECRET)

if(!decodedToken){
    req.user = false;
    return next(); 
}
req.user = {id:decodedToken.userId,email:decodedToken.email};
return next();
}