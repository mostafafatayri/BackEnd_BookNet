import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  OTP:{
    type: String,
    required:false
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: false,
  },
  firstname:{
     type:String,
     default:"",
     required:false
  },
  lastname:{
    type:String,
    default:"",
    required:false
  },
  birthday:{
    type:Date,
    required:false
  },
  isVerified:
  {
    type:Boolean,
    default:false
  },
  isSeller: {
    type: Boolean,
    default:false
  },
  tempEmail:{
    type:String,
     required:false
  },
  Following:{
     type:Array,
     default:[]
  },
  FollowingCount:{
    type:Number,
    default:0
  },
  FutureBooking:{
    type:[String],
    default:[],
    required:false
  },
  OldBooking:{ 
    type:[String],
    default:[],
    required:false
  }
},{
  timestamps:true
});

export default mongoose.model("User", userSchema)