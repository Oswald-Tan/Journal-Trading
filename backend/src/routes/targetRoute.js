import express from 'express';
import {
  getTarget,
  updateTarget,
  getTargetProgress
} from '../controllers/targetController.js';
import { verifyUser } from '../middleware/authUser.js';

const router = express.Router();

router.get('/', verifyUser, getTarget);
router.post('/', verifyUser, updateTarget);
router.get('/progress', verifyUser, getTargetProgress);

export default router;