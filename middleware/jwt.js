import jwt from "jsonwebtoken";
import createError from "../utils/createError.js";

export const verifyToken = (req, res, next) => {

 const token = req.headers.authorization?.split(' ')[1];
  //const token = req.cookies.accessToken;
   // const extractedToken = JSON.parse(token).token;
   // console.log("Token value: from the jwt form : ", extractedToken);

   console.log("from jwt token:"+token);
  if (!token) return next(createError(401,"You are not authenticated!"))


  jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
    if (err) return next(createError(403,"Token is not valid!"))
    req.userId = payload.id;
    req.isSeller = payload.isSeller;
    console.log("the userID +"+ payload.id)
    next()

  });

};