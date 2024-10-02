import mongoose from "mongoose";
const { Schema } = mongoose;

const RequestSchema = new Schema({

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
  primaryContactPhone:{
     type:String,
     default:"",
     required:true
  },
  streetAddress:{
    type:String,
    required:true
  },
  city:{
    type:String,
    required:true
  },
  Countrystate:
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
  documentUrl:{
     type:Array,
     default:[]
  },
  State:{
    type:Boolean,
    default:false
  }
},{
  timestamps:true
});

export default mongoose.model("CompanyRequests", RequestSchema)