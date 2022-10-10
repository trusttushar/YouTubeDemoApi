const User =require('../models/user');
const bcrypt =require('bcryptjs');
const jwt = require('jsonwebtoken');
module.exports ={
    createUser: async (args)=>{
        console.log("args",args)
        const existingUser = await User.findOne({email:args.email});
        if(existingUser){
            const error = new Error("User already exists!")
            throw error
        }
        const hashedPassword = await bcrypt.hash(args.password,12);
        const newUser = new User({
              email:args.email,
              firstName:args.firstName,
              lastName:args.lastName,
              password:hashedPassword
        })
        const addedUser = await newUser.save();
        const token = jwt.sign({
            userId:addedUser._id.toString(),
            email:addedUser.email
        },
        process.env.SESSION_SECRET,
        {expiresIn: '24h' });
        delete addedUser._doc.password
        return {...addedUser._doc, token: token, _id: addedUser._id.toString()};
    },
    UserSignin: async (args)=>{
        const user = await User.findOne({email:args.email});
        if(!user){
            const error = new Error("User dose not exists!")
            throw error
        }
        const isPassword = await bcrypt.compare(args.password,user.password);
        if(!isPassword){
            const error = new Error("Password is not correct!")
            throw error
        }
        const token = jwt.sign({
            userId:user._id.toString(),
            email:user.email
        },
        process.env.SESSION_SECRET,
        {expiresIn: '24h' })

      return {token:token,userId:user._id.toString()};
    }
}
