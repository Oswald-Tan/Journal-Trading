import express from "express";
import {
  getTrades,
  getTrade,
  createTrade,
  updateTrade,
  deleteTrade,
  deleteAllTrades,
  exportPDFReport
} from "../controllers/tradeController.js";
import { verifyUser } from "../middleware/authUser.js";

const router = express.Router();

router.get("/", verifyUser, getTrades);
router.get("/:id", verifyUser, getTrade);
router.get("/export/pdf", verifyUser, exportPDFReport);
router.post("/", verifyUser, createTrade);
router.put("/:id", verifyUser, updateTrade);
router.delete("/delete-all", verifyUser, deleteAllTrades);
router.delete("/:id", verifyUser, deleteTrade);

export default router;