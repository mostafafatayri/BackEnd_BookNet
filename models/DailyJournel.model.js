import mongoose from "mongoose";
const { Schema } = mongoose;

// Define the schema for DailyJournal
const DailyJournalSchema = new Schema({
  DayOf: {
    type: Date,
    required: true
  },
  SellerID: {
    type: String,
    required: true
  },
  Transactions: [
    {
      transactionId: {
        type: String,  // Reference to the transaction ID
        required: true
      },
      amount: {
        type: Number,  // Final price of the transaction
        required: true
      }
    }
  ],
  TransactionAmount: {
    type: Number,  // Total amount for all transactions
    default: 0
  },
  Last_Update: {
    type: Date,
    default: Date.now  // Automatically sets the last update to the current date
  }
}, {
  timestamps: true
});

// TTL index on "DayOf" field for 90 days expiration
DailyJournalSchema.index({ "DayOf": 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Export the DailyJournal model
export default mongoose.model("DailyJournal", DailyJournalSchema);
