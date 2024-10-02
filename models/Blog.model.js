import mongoose from "mongoose";
const { Schema } = mongoose;

const BlogSchema = new Schema({
  AuthorID: {
    type: String,
    required: true,
    unique: false
  },
  Title: {
    type: String,
    required: true,
    unique: false,
  },
  Body :{
    type: String,
    required: true,
    unique: false,
  },
  Image: {
    type: String,
    required: true,
    
  },
 
  
}, {
  timestamps: true
});



export default mongoose.model("Blog", BlogSchema);
