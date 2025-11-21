import express from "express";
import {
  getSubscription,
  checkSubscriptionStatus,
  updateSubscription
} from "../controllers/subscriptionController.js";
import { verifyUser } from "../middleware/authUser.js";

const router = express.Router();

router.get("/", verifyUser, getSubscription);
router.get('/status', verifyUser, checkSubscriptionStatus);
router.put('/update', verifyUser, updateSubscription);

export default router;