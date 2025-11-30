const mongoose=require('mongoose')
const deviceStatusSchema=new mongoose.Schema({
    deviceId:{type:String},
    deviceType:{type:String,required:true},
    os:{type:String,required:true},
    browser:{type:String,required:true},
    status:{type:String,required:true,enum:['active','inactive','blocked'],default:'active'},
    lastActiveAt:{type:Date,default:Date.now().toLocaleString()},
    ip:{type:String,required:true}

})
module.exports=mongoose.model('DeviceStatus',deviceStatusSchema)