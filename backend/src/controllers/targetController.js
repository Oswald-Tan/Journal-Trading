import Target from '../models/target.js';
import Trade from '../models/trade.js';
import User from '../models/user.js';

// Get user target
export const getTarget = async (req, res) => {
  try {
    const target = await Target.findOne({
      where: { userId: req.userId }
    });

    // Cek apakah user memiliki trades
    const tradeCount = await Trade.count({
      where: { userId: req.userId }
    });

    // Jika tidak ada trades, nonaktifkan target yang aktif dan set balance ke 0
    if (tradeCount === 0 && target && target.enabled) {
      await target.update({
        enabled: false,
        targetBalance: 0, // Set targetBalance ke 0
        description: target.description || ''
      });
      
      return res.json({
        success: true,
        data: {
          enabled: false,
          targetBalance: 0, // Pastikan 0
          targetDate: '',
          description: target.description || '',
          startDate: new Date().toISOString().split('T')[0],
          useDailyTarget: false,
          dailyTargetPercentage: 0,
          dailyTargetAmount: 0
        },
        message: 'Target auto-disabled and balance reset to 0 because no trades data'
      });
    }

    if (!target) {
      return res.json({
        success: true,
        data: {
          enabled: false,
          targetBalance: 0, // Default 0
          targetDate: '',
          description: '',
          startDate: new Date().toISOString().split('T')[0],
          useDailyTarget: false,
          dailyTargetPercentage: 0,
          dailyTargetAmount: 0
        }
      });
    }

    // Pastikan targetBalance tidak null/undefined
    const targetData = target.get({ plain: true });
    if (!targetData.enabled) {
      targetData.targetBalance = 0; // Set ke 0 jika target dinonaktifkan
      targetData.targetDate = ''; // Reset tanggal
    }

    res.json({
      success: true,
      data: targetData
    });
  } catch (error) {
    console.error('Get target error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create or update target dengan validasi trades
export const updateTarget = async (req, res) => {
  try {
    const { 
      enabled, 
      targetBalance, 
      targetDate, 
      description,
      useDailyTarget,
      dailyTargetPercentage 
    } = req.body;

    console.log('Received target update:', { 
      enabled, 
      targetBalance, 
      targetDate, 
      description,
      useDailyTarget,
      dailyTargetPercentage 
    });

    // Validasi: Cek apakah user memiliki trades
    const tradeCount = await Trade.count({
      where: { userId: req.userId }
    });

    // Jika ingin mengaktifkan target tetapi tidak ada trades
    if (enabled && tradeCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat mengaktifkan target karena belum ada data trading. Silakan buat entri trading terlebih dahulu.'
      });
    }

    // Cari atau buat target
    let target = await Target.findOne({
      where: { userId: req.userId }
    });

    if (enabled) {
      // Validasi untuk target dengan tanggal
      if (!useDailyTarget) {
        if (!targetBalance || !targetDate) {
          return res.status(400).json({
            success: false,
            message: 'Target balance and target date are required when using date-based target'
          });
        }

        if (targetBalance <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Target balance must be greater than 0'
          });
        }

        const today = new Date();
        const selectedDate = new Date(targetDate);
        if (selectedDate <= today) {
          return res.status(400).json({
            success: false,
            message: 'Target date must be in the future'
          });
        }
      }

      // Validasi untuk target harian
      if (useDailyTarget) {
        if (!dailyTargetPercentage || dailyTargetPercentage <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Daily target percentage is required and must be greater than 0'
          });
        }

        if (dailyTargetPercentage > 1000) {
          return res.status(400).json({
            success: false,
            message: 'Daily target percentage cannot exceed 1000%'
          });
        }
      }

      // Dapatkan user untuk menghitung daily target amount
      const user = await User.findByPk(req.userId);
      const initialBalance = parseFloat(user.initialBalance);
      
      // Hitung daily target amount jika menggunakan target harian
      const dailyTargetAmount = useDailyTarget ? 
        (initialBalance * dailyTargetPercentage) / 100 : 0;

      if (target) {
        await target.update({
          enabled,
          targetBalance: enabled && !useDailyTarget ? targetBalance : 0,
          targetDate: enabled && !useDailyTarget ? targetDate : null,
          description: enabled ? description : '',
          startDate: enabled ? (target.startDate || new Date()) : target.startDate,
          useDailyTarget: enabled ? useDailyTarget : false,
          dailyTargetPercentage: enabled && useDailyTarget ? dailyTargetPercentage : 0,
          dailyTargetAmount: enabled && useDailyTarget ? dailyTargetAmount : 0
        });
      } else {
        target = await Target.create({
          userId: req.userId,
          enabled,
          targetBalance: enabled && !useDailyTarget ? targetBalance : 0,
          targetDate: enabled && !useDailyTarget ? targetDate : null,
          description: enabled ? description : '',
          startDate: enabled ? new Date() : null,
          useDailyTarget: enabled ? useDailyTarget : false,
          dailyTargetPercentage: enabled && useDailyTarget ? dailyTargetPercentage : 0,
          dailyTargetAmount: enabled && useDailyTarget ? dailyTargetAmount : 0
        });
      }
    } else {
      // Jika menonaktifkan target, reset semua nilai
      if (target) {
        await target.update({
          enabled: false,
          targetBalance: 0, // Reset ke 0
          targetDate: null, // Reset tanggal
          description: description || target.description,
          useDailyTarget: false,
          dailyTargetPercentage: 0,
          dailyTargetAmount: 0,
          updated_at: new Date()
        });
      } else {
        target = await Target.create({
          userId: req.userId,
          enabled: false,
          targetBalance: 0,
          targetDate: null,
          description: description || '',
          startDate: new Date(),
          useDailyTarget: false,
          dailyTargetPercentage: 0,
          dailyTargetAmount: 0
        });
      }
    }

    return res.json({
      success: true,
      message: enabled ? 'Target updated successfully' : 'Target disabled and balance reset to 0',
      data: target.get({ plain: true })
    });

  } catch (error) {
    console.error('Update target error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// Calculate target progress
export const getTargetProgress = async (req, res) => {
  try {
    const target = await Target.findOne({
      where: { userId: req.userId }
    });

    if (!target || !target.enabled) {
      return res.json({
        success: true,
        data: null
      });
    }

    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const initialBalance = parseFloat(user.initialBalance);
    const currentBalance = parseFloat(user.currentBalance);
    const today = new Date();
    const startDate = new Date(target.startDate);

    let progressData;

    if (target.useDailyTarget) {
      // PERHITUNGAN UNTUK TARGET HARIAN
      const achieved = currentBalance - initialBalance;
      const daysPassed = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
      
      // Target yang diharapkan berdasarkan daily percentage
      const expectedAmount = initialBalance * (target.dailyTargetPercentage / 100) * daysPassed;
      const progress = Math.min(100, Math.max(0, (achieved / expectedAmount) * 100));
      
      // Hitung daily performance
      const dailyAchieved = daysPassed > 0 ? achieved / daysPassed : 0;
      const onTrack = achieved >= expectedAmount;

      progressData = {
        currentBalance,
        progress,
        achieved,
        totalNeeded: expectedAmount,
        daysPassed,
        totalDays: null, // Tidak ada total days untuk target harian
        daysLeft: null, // Tidak ada days left untuk target harian
        onTrack,
        neededDaily: target.dailyTargetAmount,
        dailyTarget: target.dailyTargetAmount,
        dailyAchieved,
        isCompleted: false, // Target harian tidak pernah completed
        isExpired: false, // Target harian tidak pernah expired
        startDate: target.startDate,
        targetDate: null,
        useDailyTarget: true,
        dailyTargetPercentage: target.dailyTargetPercentage,
        expectedAmount,
        performanceStatus: achieved >= expectedAmount ? 'On Track' : 'Behind'
      };
    } else {
      // PERHITUNGAN UNTUK TARGET DENGAN TANGGAL (sebelumnya)
      const targetBalance = parseFloat(target.targetBalance);
      const targetDate = new Date(target.targetDate);

      const totalNeeded = targetBalance - initialBalance;
      const achieved = currentBalance - initialBalance;
      const progress = Math.min(100, Math.max(0, (achieved / totalNeeded) * 100));

      const totalDays = Math.ceil((targetDate - startDate) / (1000 * 60 * 60 * 24));
      const daysPassed = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
      const daysLeft = Math.max(0, Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24)));

      const dailyTarget = totalNeeded / Math.max(1, totalDays);
      const dailyAchieved = achieved / Math.max(1, daysPassed);
      const neededDaily = (totalNeeded - achieved) / Math.max(1, daysLeft);

      const isCompleted = currentBalance >= targetBalance;
      const isExpired = daysLeft <= 0 && !isCompleted;
      const onTrack = dailyAchieved >= dailyTarget;

      progressData = {
        currentBalance,
        progress,
        achieved,
        totalNeeded,
        daysLeft,
        daysPassed,
        totalDays,
        onTrack,
        neededDaily,
        dailyTarget,
        dailyAchieved,
        isCompleted,
        isExpired,
        startDate: target.startDate,
        targetDate: target.targetDate,
        useDailyTarget: false,
        performanceStatus: onTrack ? 'On Track' : 'Behind'
      };
    }

    res.json({
      success: true,
      data: progressData
    });
  } catch (error) {
    console.error('Get target progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};