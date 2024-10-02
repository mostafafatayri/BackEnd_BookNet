import express from 'express'
import {
    UploadPhotos,
    AddService,
    GetMyServices,
    fetchMyBookings,
    fetchMyPrevoiusBooking,
    ConfirmCheckOut,
    DeleteService,
    UpdateService,
    AddBlog,
    GetBlogs
} from "../controllers/Seller.controller.js" /// this is the actions of the seller

const router = express.Router();
import { verifyToken } from "../middleware/jwt.js";

router.post("/blogs/uploadBlog",verifyToken,AddBlog);
router.get("/blogs/GetSellerBlogs/:id",GetBlogs); // blogs
router.get("/getMyServices",verifyToken,GetMyServices);
router.post("/uploadPhotos",UploadPhotos);
router.post("/addService",verifyToken,AddService);
router.post("/getMyschedule",fetchMyBookings);
router.post("/previous/getMyschedule",fetchMyPrevoiusBooking);
router.post("/Confirm/Checkout",ConfirmCheckOut);  // this should add the token to check teh seller authorization 
router.delete("/deleteMyService",verifyToken,DeleteService);
router.put("/services/updateService/:id",verifyToken,UpdateService);

export default router;
