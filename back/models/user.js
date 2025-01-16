import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userschema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required:true
    },
    displayName:{
        type: String,
        required: true
    },
    projects: [{ 
        type: mongoose.Types.ObjectId,
        ref:'project'
    }]
})
userschema.pre('save', async function(next) {
    if (this.isModified('password')){
        var user =this;
        bcrypt.hash(user.password,10,function(err,hash){
            if(err){
                return next(err)
            }
            user.password=hash;
            next();
        })
    }else{
        next();
    }
    
});
userschema.methods.comparePassword = function(password) {
    return bcrypt.compare(password, this.password);
};
export default mongoose.models.User || mongoose.model('User',userschema)