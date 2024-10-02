import express from "express";
import  {
          register,
          login,
          deleteUser,
          editEmail,
          verifyEmail,
          checkCompany,
          logout,
          LoginSellerOnly
        } from "../controllers/Auth.controller.js";

const router = express.Router();
import { verifyToken } from "../middleware/jwt.js";


router.post("/seller_Login",LoginSellerOnly);
router.post("/register", register)
router.post("/login", login)
router.delete("/DeleteMyAccount",verifyToken,deleteUser)
router.post("/logout", logout)
router.post("/changeEmailAddress",verifyToken,editEmail);
router.get("/verify-email",verifyEmail)
router.post('/apply-seller', checkCompany);

 
export default router;