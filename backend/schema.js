const mongoose=require('mongoose')
const bcrypt=require('bcrypt')
const schema=new mongoose.Schema({
    fname:String,
    lname:String,
    email:{type:String,unique:true},
    password:String,
    isverified:{type:Boolean,default:false}
})
const User=new mongoose.model('User',schema)
module.exports=User