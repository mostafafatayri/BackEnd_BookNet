import User from "../models/Users.model.js";
import createError from "../utils/createError.js";
import Field from "../models/field.model.js";
import SellerMacro from "../models/Seller.model.js";
import Book from "../models/Book.model.js";
import jwt from "jsonwebtoken";

import nodemailer from 'nodemailer'

export const enterWaitList = async (req, res, next) => {
  try {
    const { userID, bookID } = req.body;

    console.log("hello waitlist");
    // Validate input
    if (!userID || !bookID) {
      console.log("there is an erorr joining waitlist /missing id")
      return res.status(400).send("userID and bookID are required");
    }

    // Add userID to the WaitList array of the booking document
    const updatedBooking = await Book.findByIdAndUpdate(
      bookID,
      { $push: { WaitList: userID } },
      { new: true }
    );

    // Check if the booking document was found and updated
    if (!updatedBooking) {
      console.log("there is an erorr joining waitlist / not found")
      return res.status(404).send("Booking not found");
    }

    console.log(`UserID: ${userID} added to waitlist for BookingID: ${bookID}`);
    res.status(200).send("Added to waitlist");
  } catch (err) {
    console.error("Error entering waitlist:", err);
    res.status(500).send("Error entering waitlist");
  }
};

export const BookAField = async (req, res, next) => {
  try {
    console.log("user " + req.body.userID);
    console.log("seller " + req.body.SellerID);
    console.log("field " + req.body.FieldID);
    console.log("date of book " + req.body.DateofBook);
    console.log("time " + req.body.TimeOFBook);

    const dateChoosed = new Date(req.body.DateofBook);
    // Check if there is an existing booking with the same sellerID, fieldID, and DateofBook
    const existingBooking = await Book.findOne({
      SellerID: req.body.SellerID,
      FieldID: req.body.FieldID,
      DateofBook: dateChoosed,
      TimeOFBook: req.body.TimeOFBook,
    });

    console.log("the arry "+existingBooking);
    if (existingBooking) {
      // If there is an existing booking, inform the user
      return res.status(400).send("This slot has already been booked.");
    }

  
    // If no existing booking, proceed to create a new booking
    const newRent = new Book({
      userID: req.body.userID,
      SellerID: req.body.SellerID,
      FieldID: req.body.FieldID,
      DateofBook: req.body.DateofBook,
      TimeOFBook: req.body.TimeOFBook,
    });

    // Save the new booking
    const savedRent = await newRent.save();

    // Retrieve the ID of the new booking
    const rentId = savedRent._id;

    // Update the user's FutureBooking field
    await User.findByIdAndUpdate(
      req.body.userID,
      { $push: { FutureBooking: rentId } },
      { new: true }
    );

    // Update the seller's booking array field
    await SellerMacro.findOneAndUpdate(
      { userID: req.body.SellerID },
      { $push: { Bookings: rentId } },
      { new: true }
    );

    res.status(200).send("The user booked successfully");
  } catch (err) {
    res.status(500).send("Internal server error");
  }
};
// not this 

// updated it to look only for this specific field 
export const checkAvailability = async (req, res, next) => {
  try {
    const sellerID = req.body.sellerID;
    const dateChoosed = new Date(req.body.date); // Convert the input date string to a Date object
    const fieldID = req.body.FieldID;
 console.log(fieldID+"the field id is ");
    const sellerData = await SellerMacro.findOne({ userID: sellerID });

    if (!sellerData) {
      return res.status(404).send("Seller not found");
    }

    // Fetch all bookings for the seller and filter by fieldID
    const bookingPromises = sellerData.Bookings.map(bookingID =>
      Book.findById(bookingID)
    );
    const allBookings = await Promise.all(bookingPromises);

    // Convert chosen date to match the format of DateofBook
    const dateChoosedString = dateChoosed.toDateString(); // e.g., "Wed Jun 21 2023"

    
    const bookingsOnDate = allBookings.filter(booking => {
      if (booking.FieldID === fieldID) {
        const bookingDateString = new Date(booking.DateofBook).toDateString();
        return bookingDateString === dateChoosedString;
      }
      return false;
    });

    // Return only the _id and TimeOFBook for each booking
    const result = bookingsOnDate.map(booking => ({
      _id: booking._id,
      TimeOfBook: booking.TimeOFBook
    }));

    console.log("all the booking on "+result);
    res.status(200).json(result);

  } catch (err) {
    console.error(err);
    res.status(500).send("There is an error in checking availability");
  }
};

export const getOneField = async(req,res,next)=>{

  try{
    const fId = req.body.FieldId;
    const Fdata = await Field.findById(fId);
    res.status(200).send(Fdata);


  }catch(err)
  {
    res.status(500).send("errorr while fetching feild");
  }
}
//
export const GetFullSellerDetails = async (req, res, next) => {
  try {
    console.log("check is going")
    const sellerID = req.body.sellerID;

    // Fetch seller details
    const sellerDetails = await SellerMacro.find({userID:sellerID});
    if (!sellerDetails) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Fetch all fields for the seller
    const fields = await Field.find({ userID: sellerID });

    return res.status(200).json({
      seller: sellerDetails,
      fields: fields
    });
  } catch (error) {
    console.error("Fetching data error:", error);
    return res.status(500).json({ message: "Fetching data error" });
  }
};

export const GetFields = async (req, res, next) => {
  try {
    console.log("hello world");

    // Perform the aggregation to join Field and Seller data
    const fields = await Field.aggregate([
      {
        $match: {
          FieldType: req.body.field,
        },
      },
      {
        $lookup: {
          from: "sellermacros", // The collection name of SellerMacro
          localField: "userID", // Field's userId
          foreignField: "userID", // SellerMacro's userId
          as: "sellerData", // The name of the field to store the joined data
        },
      },
      {
        $unwind: "$sellerData", // Deconstruct the array field from the lookup
      },
      {
        $project: {
          _id: 1,
          FieldType: 1,
          OpenAt: 1,
          CloseAt: 1,
          Image: 1,
          Price: 1,
          Description:1,
          rentType:1,
          ClosedDays:1,
          userID:"$sellerData.userID",
         // Add other Field fields you need
          sellerProfilePic: "$sellerData.ProfilePic",
          businessName: "$sellerData.businessName",
          
          // Add other Seller fields you need
        },
      },
    ]);

    console.log(fields);
    res.status(200).send(fields);
  } catch (err) {
    console.error(err);
    res.status(500).send("The issue is in the server");
  }
};


// Edit Account of the  user
export const editAccount = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userId } = req;

        console.log(`Request body: ${JSON.stringify(req.body)}`);
        console.log(`Param ID: ${id}, Token User ID: ${userId}`);

        if (id !== userId) {
            return res.status(403).json({ message: "Unauthorized: IDs do not match" });
        }

        // Proceed with the update logic if the IDs match
        // Assume `User` is a Mongoose model for user documents
        const updatedUser = await User.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Error updating profile:", error);
        next(error);
    }
};


export const GetSellerInfo = async(req,res,next)=>{


  try{

    console.log("the data is ready");
    const sellerID = await SellerMacro.findOne({userID:req.body.userID});

    console.log("the data is ready"+sellerID);
    res.status(200).send(sellerID);

  }catch (err){

    res.status(500).send("internal server error ");

  }



}



export const getMyBookings = async (req, res, next) => {
  try {
    console.log("here we goooo it is connected");
    const myID = req.body.userID;

    // Fetch the user document and select only the FutureBooking field
    const user = await User.findById(myID).select('FutureBooking');
    if (!user) return res.status(404).send("User not found!");

    // Fetch booking details for each booking ID in the FutureBooking array
    const bookings = await Promise.all(
      user.FutureBooking.map(async (bookingID) => {
        const booking = await Book.findById(bookingID);
        if (booking) {
          // Parse the DateofBook to a Date object
          const bookingDate = new Date(booking.DateofBook);

          // Check if the booking date is in the future
          //if (bookingDate >= new Date()) {
            // Fetch additional field details for the FieldID
            const field = await Field.findById(booking.FieldID).select('Image FieldType Price FieldName');
            return {
              ...booking.toObject(),
              fieldImage: field ? field.Image : null,
              FieldType: field ? field.FieldType : null,
              Price: field ? field.Price : null,
              Name: field ? field.FieldName : null,
              // fieldSellerID: field ? field.sellerID : null
            };
         // }
        }
        return null;
      })
    );

    // Filter out any null values in the bookings array
    const filteredBookings = bookings.filter(booking => booking !== null);
    res.status(200).json(filteredBookings);
  } catch (err) {
    res.status(500).send("Internal server error");
  }
};

export const getMyOldBookings = async (req, res, next) => {
  try {
    console.log("here we goooo it is connected from the OLD G");
    const myID = req.body.userID;
    
    // Fetch the user docment and select only the FutureBooking field
    const user = await User.findById(myID).select('OldBooking');
    if (!user) return res.status(404).send("User not found!");

    // Fetch booking details for each booking ID in the FutureBooking array
    const bookings = await Promise.all(
      user.OldBooking.map(async (bookingID) => {
        const booking = await Book.findById(bookingID);
        if (booking) {
          // Parse the DateofBook to a Date object
          const bookingDate = new Date(booking.DateofBook);

          // Check if the booking date is in the future
          if (bookingDate < new Date()) {
            // Fetch additional field details for the FieldID
            const field = await Field.findById(booking.FieldID).select('Image FieldType Price FieldName');
            return {
              ...booking.toObject(),
              fieldImage: field ? field.Image : null,
              FieldType: field ? field.FieldType : null,
              Price: field ? field.Price : null,
              Name: field ? field.FieldName : null,
              // fieldSellerID: field ? field.sellerID : null
            };
          }
        }
        return null;
      })
    );

    // Filter out any null values in the bookings array
    const filteredBookings = bookings.filter(booking => booking !== null);
    res.status(200).json(filteredBookings);
  } catch (err) {
    res.status(500).send("Internal server error");
  }
};


export const RateSeller = async (req, res, next) => {
  try {
    const SellerID = req.body.SellerID;
    const stars = req.body.stars;
    const updateSeller = await SellerMacro.findOneAndUpdate(
      { userID: SellerID },
      { $inc: { Rate: stars , Raters:1} },
      
    );

    const updateBook = await Book.findByIdAndUpdate(req.body.bookId,{Rated:true});
    // Optionally, you can send a response indicating success
    if (updateSeller) {
      console.log(" the rate is well")
      res.status(200).send("Seller rating updated successfully");
    } else {
      res.status(404).send("Seller not found");
    }

  } catch (err) {
    res.status(500).send("Error while trying to rate seller");
  }
}

/*** 
export const CancleBook = async (req, res, next) => {
  try {
    console.log("The cancel operation is on");
    const { BookID, userID } = req.body;

    // Find the book by ID and delete it
    const bookData = await Book.findByIdAndDelete(BookID);

    if (!bookData) {
      return res.status(404).send("Booking not found");
    }

    // Remove the booking ID from the user's future bookings
    await User.findByIdAndUpdate(userID, { $pull: { FutureBooking: BookID } });

    // Remove the booking ID from the seller's bookings
    console.log("the wait list on this book is ");
    await SellerMacro.findByIdAndUpdate(bookData.userID, { $pull: { Bookings: BookID } });

    const FieldData = await Field.findById(bookData.FieldID);

    prepareEmail(bookData.WaitList,FieldData.FieldName,FieldData.FieldType,bookData.TimeOFBook,bookData.DateofBook)
    res.status(200).send("The booking was canceled successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server issue");
  }
};



async function prepareEmail(users,fieldName,fieldType,time,dateOfBook) {
  try {

    // Prepare email messages
    var count = users.length;
    for (const user of users) {
    
      const userData = await Users.findById(
        user
      ); // Updae user data and remove booking ID from FutureBooking array

      const email = userData.email;
      const username = userData.username;
     
      
      const message = `We hope this message finds you well.\n
      We are excited to inform you that a booking slot has become available for a ${fieldType}  reservation on ${dateOfBook}, at ${time}. 
      There are ${count} on the waitlist for this booking , and however will come first will be able to confirm the slot`;
      
      const Emailsubject = "Booking Availability Notification";

      console.log(message+" the email message");
      // Send email
      await sendEmail(email, 'Book available', message, Emailsubject);
      await Book.findByIdAndDelete(booking._id);

    }
  } catch (error) {
    console.error('Error preparing emails:', error);
    
  }
}

function sendEmail(email,action,message,Emailsubject) {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'mostafafatayri@gmail.com',
        pass: process.env.EMAIL,
      },
    });

    const mailConfigs = {
      from: 'mostafafatayri@gmail.com',
      to: email,
      subject: Emailsubject,
      text: message,
    };
    transporter.sendMail(mailConfigs, (error, info) => {
      if (error) {
        console.log(error);
        reject({ message: 'Boss, we got an error' });
      } else {
        resolve({ message: 'Email sent successfully' });
      }
    });
  });
}
***/


export const cancelBook = async (req, res, next) => {
  try {
    console.log("The cancel operation is on");
    const { BookID, userID } = req.body;

    // Find the book by ID and delete it
    const bookData = await Book.findByIdAndDelete(BookID);

    if (!bookData) {
      return res.status(404).send("Booking not found");
    }

    // Remove the booking ID from the user's future bookings
    await User.findByIdAndUpdate(userID, { $pull: { FutureBooking: BookID } });

    // Remove the booking ID from the seller's bookings
    await SellerMacro.findOneAndUpdate({ userID: bookData.userID }, { $pull: { Bookings: BookID } });


    // Get field data
    const fieldData = await Field.findById(bookData.FieldID);

    
    // Prepare and send emails to users in the waitlist
    await prepareEmail(
      bookData.WaitList,
      fieldData.FieldName,
      fieldData.FieldType,
      bookData.TimeOFBook,
      bookData.DateofBook
    );

    res.status(200).send("The booking was canceled successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server issue");
  }
};

async function prepareEmail(users, fieldName, fieldType, time, dateOfBook) {
  try {
    // Prepare email messages
    const count = users.length;
    for (const user of users) {
      const userData = await User.findById(user);
      if (userData) {
        const email = userData.email;
        const username = userData.username;

        const message = `Dear ${username},\n\nWe hope this message finds you well.\n\nWe are excited to inform you that a booking slot has become available for a ${fieldType} reservation on ${dateOfBook} at ${time}.\n\nThere are ${count} users on the list for this booking. Whoever responds first will be able to confirm the slot.\n\nBest regards,\nYour Team`;

        const emailSubject = "Booking Availability Notification";

        console.log(message + " the email message");
        // Send email
        await sendEmail(email, emailSubject, message);
      }
    }
  } catch (error) {
    console.error('Error preparing emails:', error);
  }
}

function sendEmail(email, subject, message) {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'mostafafatayri@gmail.com',
        pass: process.env.EMAIL,//"dser bmrr aila lasb", // Make sure to set EMAIL_PASS in your environment variables
      },
    });

    const mailConfigs = {
      from: 'mostafafatayri@gmail.com',
      to: email,
      subject: subject,
      text: message,
    };

    transporter.sendMail(mailConfigs, (error, info) => {
      if (error) {
        console.log(error);
        reject({ message: 'Error sending email' });
      } else {
        resolve({ message: 'Email sent successfully' });
      }
    });
  });
}
