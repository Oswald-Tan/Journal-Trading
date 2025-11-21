import express from "express";
import {
  handleLogin,
  handleLogout,
  Me,
  updatePassword,
  requestResetOtp,
  verifyResetOtp,
  resetPassword,
  getResetOtpExpiry,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";
import { verifyUser, adminOnly } from "../middleware/authUser.js";

const router = express.Router();

router.post("/login", handleLogin);
router.put("/update-pass/:id", verifyUser, updatePassword);
router.delete("/logout", handleLogout);
router.post("/request-reset-otp", requestResetOtp);
router.patch("/change-password", changePassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);
router.post("/get-reset-otp-expiry", getResetOtpExpiry);
router.get("/me", Me);
router.patch("/update-profile", verifyUser, adminOnly, updateProfile);

export default router;
