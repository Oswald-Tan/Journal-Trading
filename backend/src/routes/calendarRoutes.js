import express from 'express';
import {
  getCalendarEvents,
  getDateEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  toggleEventCompletion,
  getCalendarSummary,
  getTotalEventCount  
} from '../controllers/calendarController.js';
import { verifyUser } from '../middleware/authUser.js';

const router = express.Router();

router.get('/events', verifyUser, getCalendarEvents);
router.get('/events/total-count', verifyUser, getTotalEventCount);
router.get('/events/date/:date', verifyUser, getDateEvents);
router.get('/summary', verifyUser, getCalendarSummary);
router.post('/events', verifyUser, createCalendarEvent);
router.put('/events/:id', verifyUser, updateCalendarEvent);
router.delete('/events/:id', verifyUser, deleteCalendarEvent);
router.patch('/events/:id/toggle', verifyUser, toggleEventCompletion);

export default router;