import mongoose from "mongoose";
const { Schema } = mongoose;

const BookSchema = new Schema({
  userID: {
    type: String,
    required: true,
    unique: false
  },
  SellerID: {
    type: String,
    required: true,
    unique: false,
  },
  FieldID :{
    type: String,
    required: true,
    unique: false,
  },
  WaitList: {
    type: [String],
    required: false,
    default: []
  },
  DateofBook: {
    type: String,  // Use the Date type to store date and time information
    required: true
  },
  TimeOFBook:{
    type:String,
    required:true
  },
  Rated :
  {
    type:Boolean,
    default:false,
    required:false
  },
  AdditionalCosts:{
    type:Number,
    default:0,
    required:false
  }
  
}, {
  timestamps: true
});

// Convert the date string to a JavaScript Date object before saving
BookSchema.pre('save', function(next) {
  if (this.DateofBook && typeof this.DateofBook === 'string') {
    this.DateofBook = new Date(this.DateofBook);
  }
  next();
});

export default mongoose.model("Booking", BookSchema);
