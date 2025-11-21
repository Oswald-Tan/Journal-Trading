import express from "express";
import {
  getTrades,
  getTrade,
  createTrade,
  updateTrade,
  deleteTrade
} from "../controllers/tradeController.js";
import { verifyUser } from "../middleware/authUser.js";

const router = express.Router();

router.get("/", verifyUser, getTrades);
router.get("/:id", verifyUser, getTrade);
router.post("/", verifyUser, createTrade);
router.put("/:id", verifyUser, updateTrade);
router.delete("/:id", verifyUser, deleteTrade);

export default router;