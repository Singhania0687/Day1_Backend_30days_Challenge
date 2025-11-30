const jsonwebtoken=require('jsonwebtoken')
const secretKey='abhi_lbsnaa'

const authMiddleWare=(req,res,next)=>{
    const token=req.cookies.token
    if(!token){
        return res.status(401).json({message:'Authentication token missing'})
    }
    else{
        try{
             const decoded=jsonwebtoken.verify(token,secretKey)
             req.user=decoded
             next()
        }
        catch(err){
            return res.status(403).json({message:'Invalid token'})
        }
    }
}
module.exports=authMiddleWare
