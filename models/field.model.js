import mongoose from "mongoose";
const { Schema } = mongoose;

const FieldSchema = new Schema({

  userID:{
    type:String,
    required:true,
  unique:false

  },
  FieldType: {
    type: String,
    required: true,
    
  },
  Description: {
    type: String,
    required: true,
    unique: true,
  },
  OpenAt:{
    type: String,
    required:true
  },
  CloseAt: {
    type: String,
    required: true,
  },
  rentType: {
    type: String,
    required: true,
  },
  Image:{
    type:String,
    required:true
  },
  Price:{
    type:Number,
    required:true,

  },
  Visible:{
    type:Boolean,
    default:true,
    required:false
  },
  FieldName:{
    type:String,
    required:true,
    unique:false

  },
  ClosedDays :
  {
    type:[String],
    required:true,
    unique:false
  }
  
},{
  timestamps:true
});

export default mongoose.model("Field", FieldSchema)