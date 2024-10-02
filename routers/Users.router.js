import express from "express";
import  {
           editAccount,
           GetFields,
           GetSellerInfo,
           BookAField,
           getMyBookings,
           getMyOldBookings,
           RateSeller,
           cancelBook,
           GetFullSellerDetails,
           getOneField,
           checkAvailability,
           enterWaitList
           
        } from "../controllers/Users.controller.js";

const router = express.Router();
import { verifyToken } from "../middleware/jwt.js";


router.post("/editAccount/:id",verifyToken,editAccount);
router.post("/Category/getFeilds",GetFields);
router.post("/seller/getSellerData",GetSellerInfo);
router.post("/user/booking",BookAField);
router.post("/getFutureBookings",getMyBookings)
router.post("/getMyRentHistory",getMyOldBookings);
router.post("/rate/seller",RateSeller);
router.post("/book/cancel",cancelBook);
router.post("/fetchSellerData",GetFullSellerDetails);
router.post("/Fields/getAField",getOneField);
router.post("/getAvailbileSpots",checkAvailability);

router.post("/joinWaitlist",enterWaitList);

export default router;