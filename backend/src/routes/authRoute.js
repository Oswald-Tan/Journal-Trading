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
  handleRegister,
  resendVerificationEmail,
  verifyEmail,
} from "../controllers/authController.js";
import { verifyUser } from "../middleware/authUser.js";

const router = express.Router();

router.post("/login", handleLogin);
router.post("/register", handleRegister);
router.post("/resend-verification", resendVerificationEmail);
router.put("/update-pass/:id", verifyUser, updatePassword);
router.delete("/logout", handleLogout);
router.post("/request-reset-otp", requestResetOtp);
router.patch("/change-password", changePassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);
router.post("/get-reset-otp-expiry", getResetOtpExpiry);
router.get("/me", Me);
router.get("/verify-email", verifyEmail);
router.patch("/update-profile", verifyUser, updateProfile);

export default router;
