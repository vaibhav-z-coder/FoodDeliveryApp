import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    password:{
        type: String,
        select: false
    },
    mobile:{
        type: String,
        required: true, 
    },
    role:{
        type:String,
        enum:["user","owner","deliveryBoy"],
        required:true
    },
    resetOtp:{
        type:String
    },
    isOtpVerified:{
        type:Boolean,
        default:false
    },
    otpExpires:{
        type:Date
    },
    socketId:{
     type:String,
     
    },
    isOnline:{
        type:Boolean,
        default:false
    },
   location:{
type:{type:String,enum:['Point'],default:'Point'},
coordinates:{type:[Number],default:[0,0]}
   },
   currentAddress:{
      type:String,
      default:""
   }
  
}, { timestamps: true })

userSchema.index({location:'2dsphere'})

// Ensure sensitive fields (password, resetOtp, otpExpires) are never leaked in JSON/Object conversions
userSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.resetOtp;
        delete ret.otpExpires;
        return ret;
    }
});

userSchema.set("toObject", {
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.resetOtp;
        delete ret.otpExpires;
        return ret;
    }
});

// Pre-save hook: Hash password with cost factor 12 if modified and not already hashed
userSchema.pre("save", async function (next) {
    if (!this.isModified("password") || !this.password) {
        return next();
    }
    // Prevent double hashing if the password is already a valid bcrypt hash
    const isBcrypt = /^\$2[aby]\$\d{2}\$/.test(this.password);
    if (isBcrypt) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Instance method to compare candidate password against stored password
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    const isBcrypt = /^\$2[aby]\$\d{2}\$/.test(this.password);
    if (isBcrypt) {
        return await bcrypt.compare(candidatePassword, this.password);
    }
    // Fallback comparison for legacy plaintext password
    return this.password === candidatePassword;
};

const User=mongoose.model("User",userSchema)
export default User