import express from "express";
import {
  getSubscription,
  checkSubscriptionStatus,
  getUserSubscription,
  getMySubscription,
  updateSubscription,
  downgradeToFree  
} from "../controllers/subscriptionController.js";
import { verifyUser } from "../middleware/authUser.js";

const router = express.Router();

router.get("/", verifyUser, getSubscription);
router.get('/status', verifyUser, checkSubscriptionStatus);
router.get('/user', verifyUser, getUserSubscription);
router.get('/my-subscription', verifyUser, getMySubscription);
router.put('/update', verifyUser, updateSubscription);
router.post('/downgrade-free', verifyUser, downgradeToFree);

export default router;