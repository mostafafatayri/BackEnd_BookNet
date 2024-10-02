import express from "express";
import  {
        getAllRequest,
        VerifySeller
        } from "../controllers/admin.controller.js";

const router = express.Router();
import { verifyToken } from "../middleware/jwt.js";


router.get("/AllRequests",getAllRequest);
router.post("/verified",VerifySeller);


export default router;