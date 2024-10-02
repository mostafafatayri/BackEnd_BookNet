import Users from "../models/Users.model.js";
import Seller from "../models/Seller.model.js";
import Field from '../models/field.model.js';
import Book from '../models/Book.model.js';
import nodemailer from 'nodemailer';
import Blog from "../models/Blog.model.js";

export const DailyJournel = async (req,res,next)=>{

  
}
export const GetBlogs = async (req, res, next) => {
  try {
    console.log("helllllllooooooo bloggggggg dataaa");
    const id = req.params.id;
    const allBlogs = await Blog.find({ AuthorID: id }); // Use find to get all blogs by the author
   console.log(allBlogs+" here is the blog");
    res.status(200).json(allBlogs); // Send allBlogs in the response

  } catch (err) { // Add error parameter to catch block
    console.error(err); // Log the error for debugging
    res.status(500).send("Internal Server Error"); // Corrected the typo in the error message
  }
}
export const AddBlog = async (req, res, next) => {
  try {
   // const { authorID, title, body, image } = req.body;

    console.log("the bodyy is : "+JSON.stringify(req.body));
    // Check if the logged-in user is the author
    if (req.userId !== req.body.AuthorID) {
      return res.status(403).json({ message: "You cannot add a blog not for you" });
    }

    // Create a new blog entry
    const newBlog = new Blog({
      AuthorID: req.body.AuthorID,
      Title: req.body.Title,
      Body: req.body.Body,
      Image: req.body.Image,
    });

    // Save the blog to the database
    await newBlog.save();

    // Send a success response
    res.status(200).json({ message: "Blog added successfully", blog: newBlog });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error trying to submit blog" });
  }
};


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



export const UpdateService = async (req, res, next) => {
  try {
    const body = req.body;
    const fieldID = body.id;
    const sellerID = req.userId;

    console.log(body);
    console.log("the field "+fieldID);

    console.log("seller "+sellerID);
    // Find the field by its ID
    const fieldData = await Field.findById(fieldID);

    if (!fieldData) {
      return res.status(404).send("Field not found");
    }

    // Ensure the field belongs to the seller
    if (fieldData.userID !== sellerID) {
      return res.status(403).send("You do not have permission to update this field");
    }

    console.log("the data to update : "+JSON.stringify(body));
    // Update the field's properties with the new values
    fieldData.Description = body.description || fieldData.Description;
    fieldData.FieldName = body.Name || fieldData.FieldName;
    fieldData.Price = body.price !== undefined ? body.price : fieldData.Price;
    fieldData.rentType = body.rentType || fieldData.rentType;
    fieldData.FieldType = body.fieldType || fieldData.FieldType;
    fieldData.ClosedDates = body.ClosedDates || fieldData.ClosedDates;
    fieldData.OpenAt = body.openAt || fieldData.openAt;
    fieldData.CloseAt = body.closeAt || fieldData.closeAt;
    fieldData.Image = body.imageUrl || fieldData.imageUrl;

    // Save the updated field back to the database
    await fieldData.save();

    res.status(200).send("Field updated successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};


export const DeleteService = async (req, res, next) => {
  try {
    const ServiceID = req.body.serviceID;
    const sellerID = req.userId;

    const FieldData = await Field.findById(ServiceID);

    if (!FieldData) {
      return res.status(404).send("Field is not Found");
    } else {
      if (FieldData.userID != sellerID) {
        return res.status(403).send("You cannot delete a service not owned by you");
      } else {
        // Fetch the seller data to get the booking IDs
        const SellerMacroData = await Seller.findOne({ userID: FieldData.userID });

        if (!SellerMacroData) {
          return res.status(404).send("Seller data not found");
        }

        const ArrayBookings = SellerMacroData.Bookings;

        // Fetch all the bookings using the IDs and filter by FieldID
        const bookingPromises = ArrayBookings.map(bookingID =>
          Book.findOne({ _id: bookingID, FieldID: ServiceID })
        );
        const allBookings = await Promise.all(bookingPromises);

        // Filter out null results (bookings that do not match the FieldID)
        const validBookings = allBookings.filter(booking => booking !== null);

        // Extract the IDs of the valid bookings
        const validBookingIDs = validBookings.map(booking => booking._id);

        // Process the bookings as needed (e.g., sending notifications, preparing emails, etc.)
        console.log("Future bookings: ", validBookings);
        console.log("Booking IDs: ", validBookingIDs);

        // Remove the valid booking IDs from the SellerMacro Bookings array
        await Seller.findOneAndUpdate(
          { userID: FieldData.userID },
          { $pull: { Bookings: { $in: validBookingIDs } } },
          { new: true }
        );

        // Delete the field
       

       prepareEmail(validBookingIDs,FieldData.FieldName) 
       await Field.findByIdAndDelete(ServiceID);
       res.status(200).send("Delete successful");
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting service");
  }
};


/// neeed more work on it 
/*export const DeleteService = async(req,res,next)=>{

  try{

    const ServiceID = req.body.serviceID;
    const sellerID = req.userId;
    //console.log("the field "+FieldID+" the seller "+sellerID);


    const FieldData = await Field.findById(ServiceID);
   // console.log("the field "+FieldData);

    if(!FieldData){
         res.status(404).send("Field is not Found");
    }else {

      if(FieldData.userID!=sellerID){
       return  res.status(304).send("You can not delete a service not for you");
      }
      else{

        const currentDateTime = new Date();
        const futureBookings = await Book.find({ FieldID: ServiceID });
    
        // Filter bookings that are in the future
        const futureBookingIDs = futureBookings
          .filter(booking => new Date(booking.DateofBook.substring(0,15)) >= currentDateTime)
          .map(booking => booking._id);
    
        console.log("Future booking IDs: " +futureBookings+" the id are "+futureBookingIDs);
       // await prepareEmail(futureBookingIDs,FieldData.FieldName);
       // await Field.findByIdAndDelete(FieldID);
         res.status(200).send("Delete successful");

      }


    }

  }catch(err){
    res.status(500).send("Error Delete Service ");
  }

}*/
async function prepareEmail(BooksToDelete,fieldName) {
  try {
    // Fetch the booking details
    const bookings = await Book.find({ _id: { $in: BooksToDelete } }).populate('userID');

    // Prepare email messages
    for (const booking of bookings) {
      const userId = booking.userID;
      const userData = await Users.findByIdAndUpdate(
        userId,
        { $pull: { FutureBooking: booking._id } },
        { new: true }
      ); // Update user data and remove booking ID from FutureBooking array

      const email = userData.email;
      const username = userData.username;
      const DateofBook = booking.DateofBook;
      const time = booking.TimeOFBook;
      
      const message = `Dear ${username},\n\nYour booking for the service at ${fieldName} on ${DateofBook.substring(0,15)} from ${time} has been cancelled because the service is no longer available. We apologize for any inconvenience this may cause.\n\nBest regards,\nBookNet`;
      const Emailsubject = "Booking Cancellation Notice";

      console.log(message+" the email message");
      // Send email
      await sendEmail(email, 'Cancel Booking', message, Emailsubject);
      await Book.findByIdAndDelete(booking._id);

    }
  } catch (error) {
    console.error('Error preparing emails:', error);
    
  }
}



export const ConfirmCheckOut = async (req, res, next) => {
  const { bookingId } = req.body; // Assuming bookingId is passed in the request body
  const addition = req.body.additionalCost?req.body.additionalCost:0;
  try {
    // Step 1: Find the Book document by bookingId
    const book = await Book.findById(bookingId );
    console.log("found book");
    if (!book) {
      return res.status(404).send("Booking not found");
    }

    const {  userID, SellerID } = book;
    console.log(userID+" "+SellerID);
    // Step 2: Update User document
    await Users.findByIdAndUpdate(
      userID,
      { $pull: { FutureBooking: bookingId }, $addToSet: { OldBooking: bookingId } }
    );

    // Step 3: Update Seller document
    await Seller.updateOne(
      { 
        userID: SellerID },
      { $pull: { Bookings: bookingId } }
    );
    console.log("updating seller");

    // Step 4: Update Book document (Optional: if you need to remove the bookingId field)
     await Book.findByIdAndUpdate(
       bookingId ,
      { AdditionalCosts:addition  } // Remove bookingId field from Book if necessary
    );

    // Respond with success message
    res.status(200).send("Checkout confirmed and data updated successfully");

  } catch (err) {
    console.error("Error in ConfirmCheckOut:", err);
    res.status(500).send("Internal server error");
  }
};


export const fetchMyPrevoiusBooking = async(req,res,next)=>{
  try {
    const sellerID = req.body.SellerID;
    const specificDate = req.body.specificDate;

   
    // Fetch all bookings using the booking IDs
    let bookings = await Book.find({ SellerID: sellerID}); 

    // Filter bookings for the specific date if provided
    if (specificDate) {
      const targetDate = new Date(specificDate);
      bookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.DateofBook);
        return (
          bookingDate.getDate() === targetDate.getDate() &&
          bookingDate.getMonth() === targetDate.getMonth() &&
          bookingDate.getFullYear() === targetDate.getFullYear()
        );
      });
    }

    // Prepare the response data
    const bookingDetails = await Promise.all(bookings.map(async booking => {
      // Fetch user and field details separately
      const user = await Users.findById(booking.userID);
      const field = await Field.findById(booking.FieldID);

      return {
        bookingID: booking._id,
        userName: user ? user.username : 'Unknown',
        email: user ? user.email : 'Not assigned',
        fieldName: field ? field.FieldName : 'Unknown',
        bookingDate: booking.DateofBook,
        bookingTime: booking.TimeOFBook,
        price: field ? field.Price : 'Unknown',
        FieldType: field ? field.FieldType : 'Unknown',
      };
    }));

    // Send the response
    res.status(200).json({ bookings: bookingDetails });
  } catch (err) {
    console.error("Error while trying to fetch schedule:", err);
    res.status(500).send("Error while trying to fetch schedule");
  }

};
export const fetchMyBookings = async (req, res, next) => {
  try {
    const sellerID = req.body.SellerID;
    const specificDate = req.body.specificDate;

    // Fetch the seller data
    const sellerData = await Seller.findOne({ userID: sellerID });
    if (!sellerData) {
      return res.status(404).send("Seller not found");
    }

    // Assuming sellerData contains an array of booking IDs
    const bookingIDs = sellerData.Bookings;

    // Fetch all bookings using the booking IDs
    let bookings = await Book.find({ _id: { $in: bookingIDs } });

    // Filter bookings for the specific date if provided
    if (specificDate) {
      const targetDate = new Date(specificDate);
      bookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.DateofBook);
        return (
          bookingDate.getDate() === targetDate.getDate() &&
          bookingDate.getMonth() === targetDate.getMonth() &&
          bookingDate.getFullYear() === targetDate.getFullYear()
        );
      });
    }

    // Prepare the response data
    const bookingDetails = await Promise.all(bookings.map(async booking => {
      // Fetch user and field details separately
      const user = await Users.findById(booking.userID);
      const field = await Field.findById(booking.FieldID);

      return {
        bookingID: booking._id,
        userName: user ? user.username : 'Unknown',
        email: user ? user.email : 'Not assigned',
        fieldName: field ? field.FieldName : 'Unknown',
        bookingDate: booking.DateofBook,
        bookingTime: booking.TimeOFBook,
        price: field ? field.Price : 'Unknown',
        FieldType: field ? field.FieldType : 'Unknown',
      };
    }));

    // Send the response
    res.status(200).json({ bookings: bookingDetails });
  } catch (err) {
    console.error("Error while trying to fetch schedule:", err);
    res.status(500).send("Error while trying to fetch schedule");
  }
};

// neeed to add a check on the seller == the photo add , add token check 
export const UploadPhotos = async (req, res, next) => {
  try {
    const Profile = req.body.ProfilePic;
    const Background = req.body.BackGround;
    const userID = req.body.userId;

    console.log("the user id is : "+userID+req.body);
    // Check if the userID is present
    if (!userID) {
      return res.status(400).send("User ID is required");
    }


    // Initialize the update object
    let updateData = {};

    // Check if ProfilePic is present
    if (Profile) {
      updateData.ProfilePic = Profile;
    }

    // Check if BackGround is present
    if (Background) {
      updateData.BackGround = Background;
    }

  
    
    // Update the seller's collection
    const updatedSeller = await Seller.findOneAndUpdate({userID:userID}, updateData, { new: true });

    // Check if the seller was found and updated
    if (!updatedSeller) {
      return res.status(404).send("Seller not found");
    }

    //console.log("Updated seller data:", updatedSeller);
    res.status(200).send("Photos updated successfully");

  } catch (err) {
    console.error("Error uploading photos:", err);
    res.status(500).send("Error uploading photos");
  }
};

export const AddService = async(req,res,next)=>{

  try {

    

    const data = req.body;



    const fieldJson = new Field({
      userID:data.userId,
      FieldType:data.Type,
      Description: data.Description,
      OpenAt: data.OpenAt,
      CloseAt: data.CloseAt,
      rentType:data.rentType,
      Image:data.Image,
      Price: data.price,
      FieldName : data.FieldName,
      ClosedDays: data.CloseDates
    });

    fieldJson.save();
    console.log("hello testing ..."+JSON.stringify(req.body));
    res.status(200).send("Field Uploaded successfully");
   
  }
  //}
  catch(err){
    res.status(500).send("Error in server");
  }
};

export const GetMyServices= async(req,res,next)=>{

  try{

    console.log("the api is called ....");
    const usrID = req.userId;

    const data = await Field.find({userID:usrID}).sort({createdAt:-1});
    console.log(usrID+" the dta "+data);
    res.status(200).send(data);


  }catch(err){
     res.status(500).send("Server Issue!");
  }



};


