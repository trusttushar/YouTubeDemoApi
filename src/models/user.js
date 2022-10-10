const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
      email: {type:String,required:true},
      firstName: {type:String,required:true},
      lastName : {type:String,required:true},
      password:{type:String,required:true},
      video: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'video'
      }]
},{ timestamps: true });

module.exports = mongoose.model('user',userSchema);