import express from "express";
import {
  getUserGamificationProfile,
  getAllBadges,
  getLeaderboard,
  getLeaderboardHistory,
  resetMonthlyLeaderboard,
} from "../controllers/gamificationController.js";
import { verifyUser } from "../middleware/authUser.js";

const router = express.Router();

router.get("/profile", verifyUser, getUserGamificationProfile);
router.get("/badges", verifyUser, getAllBadges);
router.get("/leaderboard", verifyUser, getLeaderboard);
router.get("/leaderboard/history", verifyUser, getLeaderboardHistory);

// Admin route for manual reset (optional)
router.post("/leaderboard/reset", verifyUser, resetMonthlyLeaderboard);

export default router;