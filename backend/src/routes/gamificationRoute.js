import express from "express";
import {
  getUserGamificationProfile,
  getAllBadges,
  getLeaderboard,
} from "../controllers/gamificationController.js";
import { verifyUser } from "../middleware/authUser.js";

const router = express.Router();

router.get("/profile", verifyUser, getUserGamificationProfile);
router.get("/badges", verifyUser, getAllBadges);
router.get("/leaderboard", verifyUser, getLeaderboard);

export default router;