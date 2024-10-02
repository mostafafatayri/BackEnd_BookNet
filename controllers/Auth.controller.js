import User from "../models/Users.model.js";
import createError from "../utils/createError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer'
import otpGenerator from "otp-generator";
import Request from "../models/CompanyVerify.model.js";
import Seller from "../models/Seller.model.js";
import { v4 as uuidv4 } from 'uuid'; // UUID library for generating unique IDs




export const LoginSellerOnly = async (req, res, next) => {
  try {
    console.log("Seller login attempt...");

    // Find user by username
    const user = await User.findOne({ username: req.body.username }).select('-FutureBooking -OldBooking');
    if (!user) {
      // User not found, send error response
      return res.status(404).json({ message: "User not found!" });
    }

    // Ensure the user is a seller
    if (!user.isSeller) {
      // User is not a seller, send error response
      return res.status(403).json({ message: "Only sellers are allowed to log in." });
    }

    // Check password
    const isCorrect = bcrypt.compareSync(req.body.password, user.password);
    if (!isCorrect) {
      // Incorrect password or username, send error response
      return res.status(400).json({ message: "Wrong password or username!" });
    }

    // Generate a session ID and JWT token
    const loginSessionId = uuidv4();
    const token = jwt.sign(
      {
        sessionId: loginSessionId,
        id: user._id,
        isSeller: user.isSeller,
        loginTime: Date.now(),
      },
      process.env.JWT_KEY,
    );

    console.log("Seller token generated:", token);

    // Exclude password from the response
    const { password, ...info } = user._doc;

    // Fetch seller-specific data if user is a seller
    const sellerData = await Seller.findOne({ userID: user._id });
    if (!sellerData) {
      // Seller data not found, send error response
      return res.status(404).json({ message: "Seller data not found!" });
    }

    // Return the response with the token, user info, and seller data
    return res.status(200).json({ token, info, sellerData });
  } catch (err) {
    // Log the error and send a generic error response to the client
    console.error("An error occurred during login:", err);
    return res.status(500).json({ message: "An error occurred during login. Please try again later." });
  }
};

export const checkCompany = async (req, res) => {
  const  allBody = req.body;
  try {
    const requestData = new Request({
      userID: allBody.UserID,
      businessName : allBody.businessName,
      businessWebsite : allBody.businessWebsite? allBody.businessWebsite:'',
      businessStructure: allBody.businessStructure?allBody.businessStructure:'',
      businessDescription: allBody.businessDescription,
      primaryContactName: allBody.primaryContactName,
      primaryContactEmail: allBody.primaryContactEmail,
      primaryContactPhone: allBody.primaryContactPhone,
      streetAddress: allBody.streetAddress,
      city: allBody.city,
      Countrystate:allBody.Countrystate,
      zip:allBody.zip,
      country:allBody.country,
      documentUrl: allBody.documentUrl,
      Countrystate:allBody.state
    })
    // Save the application details to the database
    await requestData.save();

    console.log("the ap is working "+JSON.stringify(allBody));
    res.status(200).json({ message: 'Application submitted successfully. We will review it shortly.' });
  } catch (error) {
    console.error("Error submitting seller application:", error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
};

//// not finished yet need to work after finilizing add feature .
export const ChangePassword = async (req, res, next) => {
  try {
    
    if(req.userId==req.body.id){
      const user = await User.findById(req.body.id);
    const token = jwt.sign({ userId: req.body.id, email: req.body.email },  process.env.JWT_CHANGE_EMAIL , { expiresIn: '1h' });

    
    const verificationLink = `http://localhost:4488/api/auth/verify-email?token=${token}`;

    sendEmail(req.body.email ,user.username, verificationLink,req.body.id,"changePass")
    console.log("Verification link:", verificationLink);

    res.status(200).send("Verification email sent");
    }else {
      res.status(304).send("You can not change a email if it is not ur account");
    }
  } catch (error) {
    console.error("Error sending verification email:", error);
    res.status(500).send("Error sending verification email");
  }
};
////

export const verifyEmail = async (req, res, next) => {
  try {

    const { token } = req.query;
    const decodedToken = jwt.verify(token,process.env.JWT_CHANGE_EMAIL );
    console.log(" decodedToken.userId :"+ decodedToken.userId +" the email: "+  decodedToken.email);

    // Update user's email address in the database
   // await User.updateOne({ _id: decodedToken.userId }, { email: decodedToken.email });
   await User.findByIdAndUpdate({_id:decodedToken.userId},{ email: decodedToken.email }  );

    res.status(200).send("Email verified successfully");
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).send("Error verifying email");
  }
};

// change the email :
export const editEmail = async (req, res, next) => {
  try {
    
    if(req.userId==req.body.id){
      const user = await User.findById(req.body.id);
    const token = jwt.sign({ userId: req.body.id, email: req.body.email },  process.env.JWT_CHANGE_EMAIL , { expiresIn: '1h' });

    
    const verificationLink = `http://localhost:4488/api/auth/verify-email?token=${token}`;

    sendEmail(req.body.email ,user.username, verificationLink,req.body.id,"changeAccount")
    console.log("Verification link:", verificationLink);

    res.status(200).send("Verification email sent");
    }else {
      res.status(304).send("You can not change a email if it is not ur account");
    }
  } catch (error) {
    console.error("Error sending verification email:", error);
    res.status(500).send("Error sending verification email");
  }
};

// delete user
export const deleteUser = async (req, res, next) => {
    console.log("the delete user is activating"+"the id from the verify is : "+req.userId);

    const user = await User.findById(req.body.userId);
  
    if (req.userId !== user._id.toString()) {
      return next(createError(403, "You can delete only your account!"));
    }
    
    await User.findByIdAndDelete(req.body.userId);
    res.status(200).send("deleted.");
  };
  
// send email for verification 
function sendEmail(email,username, otp,userId,action) {
    return new Promise((resolve, reject) => {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'mostafafatayri@gmail.com',
          pass: process.env.EMAIL,
        },
      });
  
      let SIGN_UP_VERIFY = 'Account Verification';
      let SIGN_UP_TEXT =`Dear ${username},\nI hope this message finds you well. We value your continued trust in our services and are committed to ensuring the security of your account. As part of our ongoing efforts to enhance account security, we are implementing a two-step verification process. This is the OTP code that is required to complete the verification.\n\nOTP Code: ${otp}\n\nIf you did not initiate this verification process or have any concerns regarding the security of your account, please contact our support team immediately at [Your Support Contact Information].\n\nThank you for your prompt attention to this matter. We appreciate your cooperation in helping us maintain the highest standards of security for your account.\n\nBest regards. `;
    
      let CHANGE_EMAIL_VERIFY = "New Email Verification";
      let CHANGE_EMAIL_TEXT = `Dear ${username},\nI hope this message finds you well. We value your continued trust in our services and are committed to ensuring the security of your account. As part of your request to change the email of your account , we are implementing a two-step verification process. This is the Verification  code that is required to complete the verification of the new email.\n\nPress on this  Link: ${otp}\n\nIf you did not initiate this change  process or have any concerns regarding the security of your account, please contact our support team immediately at [Your Support Contact Information].\n\nThank you for your prompt attention to this matter. We appreciate your cooperation in helping us maintain the highest standards of security for your account.\n\nBest regards. `
    


      let EmailSubject ='';
      let EmailText='';
      if (action==='signUp'){
        EmailSubject=SIGN_UP_VERIFY;
        EmailText=SIGN_UP_TEXT;

      }
      if(action==='changeAccount'){
        EmailSubject=CHANGE_EMAIL_VERIFY;
        EmailText=CHANGE_EMAIL_TEXT;

      }
      const mailConfigs = {
        from: 'mostafafatayri@gmail.com',
        to: email,
        subject: EmailSubject,
        text: EmailText,
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
  
  
// register of a user
export const register = async (req, res, next) => {
    try {
    
      console.log("connection acccepted")
      console.log("the data is : "+JSON.stringify(req.body));
      const otpCode = otpGenerator.generate(6, { numeric: true ,digits: false, alphabets: false, upperCase: false, specialChars: false });
  
  
      const hash = bcrypt.hashSync(req.body.password, 5);
      const newUser = new User({
        ...req.body,
        password: hash,
        OTP:otpCode
      });
  
      await newUser.save();
  
      
      const userId = newUser._id;
      ///console.log(userId);
  
     
     sendEmail(req.body.email,req.body.username,otpCode,userId,"signUp"); 
   
  
      res.status(200).send("User has been created.");
    } catch (err) {
      next(err);
    }
  };
  
// log in of a user
/**export const login = async (req, res, next) => {
    try {
        console.log("the login connect is on")
     const user = await User.findOne({ username: req.body.username }).select('-FutureBooking -OldBooking');
  
      if (!user) return next(createError(404, "User not found!"));
  
      const isCorrect = bcrypt.compareSync(req.body.password, user.password);
      if (!isCorrect)
        return next(createError(400, "Wrong password or username!"));
  
      const token = jwt.sign(
        {
          id: user._id,
          isSeller: user.isSeller,
        },
        process.env.JWT_KEY
      );
  
      const { password, ...info } = user._doc;
      const isSeller = info.isSeller; // is true or false 
 
      if (isSeller==true){
         const sellerData= await Seller.findOne({userID:user._id});
       //  console.log("the seller data: "+sellerData);
         res.status(200).json({ token ,info,sellerData});
       }
       else  res.status(200).json({ token ,info});
      //res.status(200).send("testing");
    } catch (err) {
      next(err);
    }
  };
  
**/

export const logout = async (req, res) => {
    //const token = req.cookies.accessToken; /// check after come back 

    const token = req.headers.authorization
    console.log("\nthe access token is : "+token);
    res
      .clearCookie("accessToken", {
        sameSite: "none",
        secure: true,
      })
      .status(200)
      .send("User has been logged out."+token);
  };


export const login = async (req, res, next) => {
    try {
      console.log("the login connect is on");
  
      // Find user by username
      const user = await User.findOne({ username: req.body.username }).select('-FutureBooking -OldBooking');
      if (!user) return next(createError(404, "User not found!"));
  
      // Check password
      const isCorrect = bcrypt.compareSync(req.body.password, user.password);
      if (!isCorrect) return next(createError(400, "Wrong password or username!"));
  
      const loginSessionId = uuidv4();

     
      // Create token with additional data
      const token = jwt.sign(
        {
          sessionId: loginSessionId,
          id: user._id,
          isSeller: user.isSeller,
          loginTime: Date.now(), // Adding a timestamp to ensure the token varies with each login
        },
        process.env.JWT_KEY,
      //  { expiresIn: '1h' } // Token expires in 1 hour
      );
      console.log(token);
      // Exclude password from the response
      const { password, ...info } = user._doc;
      const isSeller = info.isSeller;
  
      // Include seller data if user is a seller
      if (isSeller) {
        const sellerData = await Seller.findOne({ userID: user._id });
        res.status(200).json({ token, info, sellerData });
      } else {
        res.status(200).json({ token, info });
      }
    } catch (err) {
      next(err);
    }
  };