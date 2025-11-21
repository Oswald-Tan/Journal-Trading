import express from "express";
import {
  getBalance,
  updateBalance,
  updateCurrentBalance,
} from "../controllers/balanceController.js";
import { verifyUser } from "../middleware/authUser.js";

const router = express.Router();

router.get("/", verifyUser, getBalance);
router.patch("/update-initial", verifyUser, updateBalance);
router.patch("/update-current", verifyUser, updateCurrentBalance);

export default router;