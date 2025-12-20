import { Op } from 'sequelize';
import CalendarEvent from '../models/calendarEvent.js';
import Subscription from '../models/subscription.js';

// Get all events for a specific month
export const getCalendarEvents = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: 'Year and month are required'
      });
    }

    // Hitung tanggal awal dan akhir bulan
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const events = await CalendarEvent.findAll({
      where: {
        userId: req.userId,
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['date', 'ASC'], ['time', 'ASC']]
    });

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get events for a specific date
export const getDateEvents = async (req, res) => {
  try {
    const { date } = req.params;
    
    const events = await CalendarEvent.findAll({
      where: {
        userId: req.userId,
        date: date
      },
      order: [['time', 'ASC']]
    });

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Get date events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get total event count for user
export const getTotalEventCount = async (req, res) => {
  try {
    const count = await CalendarEvent.count({
      where: { userId: req.userId }
    });

    res.json({
      success: true,
      data: count
    });
  } catch (error) {
    console.error('Get total event count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create new calendar event
export const createCalendarEvent = async (req, res) => {
  try {
    const {
      date,
      title,
      type = "journal_entry",
      description = "",
      time = "",
      impact = "none",
      instrument = "",
      strategy = "",
      sentiment = "neutral",
      color = "#8b5cf6",
      isCompleted = false,
      relatedTradeId = null
    } = req.body;

    // ============ VALIDASI WAJIB ============
    const requiredFields = {
      date: "Date",
      title: "Title",
      description: "Description",
    };

    const missingFields = [];
    const fieldErrors = {};

    // Validasi field tidak boleh kosong
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!req.body[field] || req.body[field].toString().trim() === "") {
        missingFields.push(label);
        fieldErrors[field] = `${label} is required`;
      }
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `The following fields are required: ${missingFields.join(", ")}`,
        missingFields,
        fieldErrors,
        code: "VALIDATION_ERROR"
      });
    }

    // Validasi format date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (date && !dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
        fieldErrors: { date: "Invalid date format. Use YYYY-MM-DD" },
        code: "VALIDATION_ERROR"
      });
    }

    // Validasi time format jika ada
    if (time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      return res.status(400).json({
        success: false,
        message: "Invalid time format. Use HH:mm",
        fieldErrors: { time: "Invalid time format. Use HH:mm" },
        code: "VALIDATION_ERROR"
      });
    }

    // Cek subscription user untuk limit
    const subscription = await Subscription.findOne({
      where: { userId: req.userId }
    });

    const userPlan = subscription?.plan || 'free';

    // Jika user free, cek batas 10 event
    if (userPlan === 'free') {
      const eventCount = await CalendarEvent.count({
        where: { userId: req.userId }
      });

      if (eventCount >= 10) {
        return res.status(403).json({
          success: false,
          message: 'Free plan limited to 10 calendar events. Upgrade to Pro for unlimited events.',
          code: 'EVENT_LIMIT_REACHED',
          limit: 10,
          currentCount: eventCount,
          requiresUpgrade: true,
          currentPlan: "free"
        });
      }
    }

    // Buat event
    const event = await CalendarEvent.create({
      userId: req.userId,
      date: date.trim(),
      title: title.trim(),
      type: type || 'journal_entry',
      description: description.trim(),
      time: time || null,
      impact: impact || 'none',
      instrument: instrument || null,
      strategy: strategy || null,
      sentiment: sentiment || 'neutral',
      color: color || '#8b5cf6',
      isCompleted: isCompleted || false,
      relatedTradeId: relatedTradeId || null
    });

    res.status(201).json({
      success: true,
      message: 'Calendar event created successfully',
      data: event,
      userPlan,
      currentEventCount: await CalendarEvent.count({ where: { userId: req.userId } })
    });
  } catch (error) {
    console.error('Create calendar event error:', error);
    
    if (error.message && error.message.includes('Free plan limited')) {
      return res.status(403).json({
        success: false,
        message: 'Free plan limited to 10 calendar events. Upgrade to Pro for unlimited events.',
        code: 'EVENT_LIMIT_REACHED',
        requiresUpgrade: true
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
      code: "SERVER_ERROR"
    });
  }
};

// Update calendar event
export const updateCalendarEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const event = await CalendarEvent.findOne({
      where: {
        id,
        userId: req.userId
      }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Calendar event not found'
      });
    }

    // ============ VALIDASI WAJIB ============
    const fieldErrors = {};

    // Validasi field yang diupdate
    if (updateData.date !== undefined) {
      if (!updateData.date || updateData.date.toString().trim() === "") {
        fieldErrors.date = "Date is required";
      } else {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(updateData.date)) {
          fieldErrors.date = "Invalid date format. Use YYYY-MM-DD";
        }
      }
    }

    if (updateData.title !== undefined) {
      if (!updateData.title || updateData.title.toString().trim() === "") {
        fieldErrors.title = "Title is required";
      }
    }

    if (updateData.description !== undefined) {
      if (!updateData.description || updateData.description.toString().trim() === "") {
        fieldErrors.description = "Description is required";
      }
    }

    // Validasi time format jika diupdate
    if (updateData.time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(updateData.time)) {
      fieldErrors.time = "Invalid time format. Use HH:mm";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        fieldErrors,
        code: "VALIDATION_ERROR"
      });
    }

    // Update data yang valid
    const updateFields = {};
    
    if (updateData.date !== undefined) updateFields.date = updateData.date.trim();
    if (updateData.title !== undefined) updateFields.title = updateData.title.trim();
    if (updateData.type !== undefined) updateFields.type = updateData.type;
    if (updateData.description !== undefined) updateFields.description = updateData.description.trim();
    if (updateData.time !== undefined) updateFields.time = updateData.time || null;
    if (updateData.impact !== undefined) updateFields.impact = updateData.impact;
    if (updateData.instrument !== undefined) updateFields.instrument = updateData.instrument;
    if (updateData.strategy !== undefined) updateFields.strategy = updateData.strategy;
    if (updateData.sentiment !== undefined) updateFields.sentiment = updateData.sentiment;
    if (updateData.color !== undefined) updateFields.color = updateData.color;
    if (updateData.isCompleted !== undefined) updateFields.isCompleted = updateData.isCompleted;
    if (updateData.relatedTradeId !== undefined) updateFields.relatedTradeId = updateData.relatedTradeId;

    await event.update(updateFields);

    res.json({
      success: true,
      message: 'Calendar event updated successfully',
      data: event
    });
  } catch (error) {
    console.error('Update calendar event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// Delete calendar event
export const deleteCalendarEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await CalendarEvent.findOne({
      where: {
        id,
        userId: req.userId
      }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Calendar event not found'
      });
    }

    await event.destroy();

    res.json({
      success: true,
      message: 'Calendar event deleted successfully'
    });
  } catch (error) {
    console.error('Delete calendar event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Toggle event completion
export const toggleEventCompletion = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await CalendarEvent.findOne({
      where: {
        id,
        userId: req.userId
      }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Calendar event not found'
      });
    }

    await event.update({
      isCompleted: !event.isCompleted
    });

    res.json({
      success: true,
      message: `Event marked as ${!event.isCompleted ? 'completed' : 'pending'}`,
      data: event
    });
  } catch (error) {
    console.error('Toggle event completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get calendar summary for month
export const getCalendarSummary = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: 'Year and month are required'
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    // Hitung statistik untuk bulan tersebut
    const events = await CalendarEvent.findAll({
      where: {
        userId: req.userId,
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: ['date', 'type', 'impact', 'isCompleted']
    });

    // Group by date
    const summary = {};
    events.forEach(event => {
      if (!summary[event.date]) {
        summary[event.date] = {
          totalEvents: 0,
          highImpact: 0,
          completed: 0,
          types: {}
        };
      }
      
      summary[event.date].totalEvents++;
      if (event.impact === 'high') summary[event.date].highImpact++;
      if (event.isCompleted) summary[event.date].completed++;
      
      if (!summary[event.date].types[event.type]) {
        summary[event.date].types[event.type] = 0;
      }
      summary[event.date].types[event.type]++;
    });

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get calendar summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};