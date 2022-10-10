const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const videoSchema = new Schema({
      title: {type:String,required:true},
      discription: {type:String,required:true},
      thumbnail : {type:String,required:true},
      fileName:{type:String,required:true},
      userId:{type:String},
      user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
          }
},{ timestamps: true });

module.exports = mongoose.model('video',videoSchema);