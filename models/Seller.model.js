import mongoose from "mongoose";
const { Schema } = mongoose;

const SellerSchema = new Schema({

  userID:{
    type:String,
    required:true,
    unique:true

  },
  businessName: {
    type: String,
    required: true,
    unique: true,
  },
  businessWebsite: {
    type: String,
    required: false,
   // unique: true,
  },
  businessStructure:{
    type: String,
    required:false
  },
  businessDescription: {
    type: String,
    required: true,
  },
  primaryContactName: {
    type: String,
    required: true,
  },
  streetAddress:{
    type:String,
    required:true
  },
  city:{
    type:String,
    required:true
  },
  state:
  {
    type:String,
    required:true
  },
  zip: {
    type: String,
    default:false
  },
  country:{
    type:String,
     required:false
  },
  ProfilePic:{
     type:String,
     default:''
  },
  BackGround:{
    type:String,
    default:'',
    required:false
  },
  Hold:{
    type:Boolean,
    default:false,
    required:false
  },
  Rate:{
    type:Number,
    default:5,
    required:false
  },
  Raters:{
    type:Number,
    default:1,
    required:false
  },
  Bookings:{
    type:[String],
    default:[],
    required:false
  },
  BookingCount:{
    type:Number,
    default:0,
    required:false
  }
  
},{
  timestamps:true
});

export default mongoose.model("SellerMacro", SellerSchema)