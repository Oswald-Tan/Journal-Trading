import { Op } from "sequelize";
import db from "../config/database.js";
import Target from "../models/target.js";
import Trade from "../models/trade.js";
import User from "../models/user.js";
import Subscription from "../models/subscription.js";
import {
  Badge,
  UserBadge,
  UserLevel,
  Achievement,
  MonthlyLeaderboard,
} from "../models/gamification.js";
import { generateTradingReportPDF } from "../utils/pdfGenerator.js";
import { calculateStats } from "../utils/statsCalculator.js";

// ==================== TRANSACTION HELPER ====================
const createOptions = (transaction) => {
  const options = {};
  if (transaction) {
    options.transaction = transaction;
  }
  return options;
};

// ==================== GAMIFICATION HELPER FUNCTIONS ====================

// Helper: Get current period (YYYY-MM)
const getCurrentPeriod = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

// Helper: Calculate monthly score
const calculateMonthlyScore = (userStats) => {
  let score = 0;

  // Berdasarkan total profit (40% bobot)
  score += Math.min(userStats.totalProfit / 10000, 100) * 40;

  // Berdasarkan win rate (30% bobot)
  score += userStats.winRate * 30;

  // Berdasarkan jumlah trades (20% bobot)
  score += Math.min(userStats.totalTrades / 50, 100) * 20;

  // Berdasarkan consistency (10% bobot)
  score += Math.min(userStats.dailyActivity / 30, 100) * 10;

  return Math.round(score);
};

// Calculate required XP for a level
const calculateRequiredXP = (level) => {
  return Math.floor(100 * Math.pow(level, 1.5));
};

// Calculate XP from trade
const calculateXpFromTrade = (trade) => {
  let xp = 10; // Base XP untuk menyelesaikan trade

  // Bonus XP untuk profitable trade
  if (trade.profit > 0) {
    xp += Math.min(50, Math.floor(trade.profit / 10));
  }

  // Bonus untuk win streak (jika ada data)
  if (trade.result && trade.result.toLowerCase().includes("win")) {
    xp += 5;
  }

  return xp;
};

// Add experience to user
const addExperience = async (userId, xp, transaction = null) => {
  try {
    let userLevel = await UserLevel.findOne({
      where: { userId },
      ...createOptions(transaction),
    });

    if (!userLevel) {
      userLevel = await UserLevel.create(
        {
          userId,
          level: 1,
          experience: 0,
          totalExperience: 0,
          dailyStreak: 0,
          totalTrades: 0,
          consecutiveWins: 0,
          maxConsecutiveWins: 0,
        },
        createOptions(transaction)
      );
    }

    const newTotalXP = userLevel.totalExperience + xp;
    let currentLevel = userLevel.level;
    let currentXP = userLevel.experience + xp;
    let levelUps = 0;

    // Check for level ups
    while (currentXP >= calculateRequiredXP(currentLevel)) {
      currentXP -= calculateRequiredXP(currentLevel);
      currentLevel++;
      levelUps++;
    }

    await userLevel.update(
      {
        level: currentLevel,
        experience: currentXP,
        totalExperience: newTotalXP,
      },
      createOptions(transaction)
    );

    return { level: currentLevel, experience: currentXP, levelUps };
  } catch (error) {
    console.error("Error adding experience:", error);
    throw error;
  }
};

// Update daily streak
const updateDailyStreak = async (userId, transaction = null) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const userLevel = await UserLevel.findOne({
      where: { userId },
      transaction,
    });

    if (!userLevel) return;

    if (userLevel.lastActiveDate) {
      const lastActive = new Date(userLevel.lastActiveDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (
        lastActive.toISOString().split("T")[0] ===
        yesterday.toISOString().split("T")[0]
      ) {
        // Consecutive day
        await userLevel.update(
          {
            dailyStreak: userLevel.dailyStreak + 1,
            lastActiveDate: today,
          },
          { transaction }
        );
      } else if (lastActive.toISOString().split("T")[0] !== today) {
        // Streak broken
        await userLevel.update(
          {
            dailyStreak: 1,
            lastActiveDate: today,
          },
          createOptions(transaction)
        );
      }
    } else {
      // First time
      await userLevel.update(
        {
          dailyStreak: 1,
          lastActiveDate: today,
        },
        createOptions(transaction)
      );
    }

    return userLevel.dailyStreak;
  } catch (error) {
    console.error("Error updating daily streak:", error);
    throw error;
  }
};

// Update profit streak
const updateProfitStreak = async (userId, tradeProfit, transaction = null) => {
  try {
    const userLevel = await UserLevel.findOne({
      where: { userId },
      ...createOptions(transaction),
    });
    if (!userLevel) return;

    const today = new Date().toISOString().split("T")[0];

    if (tradeProfit > 0) {
      if (userLevel.lastProfitDate === today) {
        // Already updated today
        return userLevel.profitStreak;
      }

      if (userLevel.lastProfitDate) {
        const lastProfit = new Date(userLevel.lastProfitDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (
          lastProfit.toISOString().split("T")[0] ===
          yesterday.toISOString().split("T")[0]
        ) {
          // Consecutive profit day
          await userLevel.update(
            {
              profitStreak: userLevel.profitStreak + 1,
              lastProfitDate: today,
            },
            createOptions(transaction)
          );
        } else if (lastProfit.toISOString().split("T")[0] !== today) {
          // New streak
          await userLevel.update(
            {
              profitStreak: 1,
              lastProfitDate: today,
            },
            createOptions(transaction)
          );
        }
      } else {
        // First profit
        await userLevel.update(
          {
            profitStreak: 1,
            lastProfitDate: today,
          },
          createOptions(transaction)
        );
      }
    } else {
      // Loss - reset streak
      if (userLevel.lastProfitDate !== today) {
        await userLevel.update(
          {
            profitStreak: 0,
            lastProfitDate: today,
          },
          createOptions(transaction)
        );
      }
    }

    return userLevel.profitStreak;
  } catch (error) {
    console.error("Error updating profit streak:", error);
    throw error;
  }
};

// Update consecutive wins
const updateConsecutiveWins = async (
  userId,
  tradeResult,
  transaction = null
) => {
  try {
    const userLevel = await UserLevel.findOne({
      where: { userId },
      ...createOptions(transaction),
    });
    if (!userLevel) return;

    let newConsecutiveWins = userLevel.consecutiveWins;

    if (tradeResult && tradeResult.toLowerCase().includes("win")) {
      newConsecutiveWins += 1;
    } else {
      newConsecutiveWins = 0;
    }

    const maxConsecutiveWins = Math.max(
      userLevel.maxConsecutiveWins || 0,
      newConsecutiveWins
    );

    await userLevel.update(
      {
        consecutiveWins: newConsecutiveWins,
        maxConsecutiveWins: maxConsecutiveWins,
      },
      createOptions(transaction)
    );

    return { consecutiveWins: newConsecutiveWins, maxConsecutiveWins };
  } catch (error) {
    console.error("Error updating consecutive wins:", error);
    throw error;
  }
};

// Check and award badges
const checkAndAwardBadges = async (userId, transaction = null) => {
  try {
    const userLevel = await UserLevel.findOne({
      where: { userId },
      ...createOptions(transaction),
    });

    if (!userLevel) return [];

    const badges = await Badge.findAll(createOptions(transaction));
    const awardedBadges = [];

    for (const badge of badges) {
      const userBadge = await UserBadge.findOne({
        where: { userId, badgeId: badge.id },
        ...createOptions(transaction),
      });

      if (userBadge && userBadge.achievedAt) {
        continue; // Already awarded
      }

      let progress = 0;
      let achieved = false;

      // Pastikan badge.requirement ada
      if (!badge.requirement) continue;

      switch (badge.requirement.type) {
        case "daily_streak":
          progress = userLevel.dailyStreak || 0;
          achieved = progress >= badge.requirement.value;
          break;

        case "profit_streak":
          progress = userLevel.profitStreak || 0;
          achieved = progress >= badge.requirement.value;
          break;

        case "total_trades":
          progress = userLevel.totalTrades || 0;
          achieved = progress >= badge.requirement.value;
          break;

        case "risk_reward_positive":
          // This would require additional tracking
          progress = 0;
          achieved = false;
          break;

        case "stop_loss_used":
          // This would require additional tracking
          progress = 0;
          achieved = false;
          break;
      }

      if (userBadge) {
        await userBadge.update({ progress }, createOptions(transaction));
      } else {
        await UserBadge.create(
          {
            userId,
            badgeId: badge.id,
            progress,
          },
          createOptions(transaction)
        );
      }

      if (achieved && !userBadge?.achievedAt) {
        await UserBadge.update(
          { achievedAt: new Date() },
          {
            where: { userId, badgeId: badge.id },
            ...createOptions(transaction),
          }
        );

        // Award XP
        await addExperience(userId, badge.xpReward || 0, transaction);

        awardedBadges.push(badge);
      }
    }

    return awardedBadges;
  } catch (error) {
    console.error("Error checking badges:", error);
    throw error;
  }
};

// Check for special achievements
const checkSpecialAchievements = async (
  userId,
  tradeData,
  transaction = null
) => {
  try {
    const achievements = [];
    const today = new Date();

    // Check for first trade
    const totalTrades = await Trade.count({
      where: { userId },
      ...createOptions(transaction),
    });
    if (totalTrades === 1) {
      const existingAchievement = await Achievement.findOne({
        where: { userId, type: "first_trade" },
        ...createOptions(transaction),
      });

      if (!existingAchievement) {
        const achievement = await Achievement.create(
          {
            userId,
            type: "first_trade",
            title: "First Trade!",
            description: "Completed your first trade in the journal",
            achievedAt: today,
          },
          createOptions(transaction)
        );
        achievements.push(achievement);
        await addExperience(userId, 50, transaction);
      }
    }

    // Check for first profit
    if (tradeData.profit > 0) {
      const profitableTrades = await Trade.count({
        where: { userId, profit: { [Op.gt]: 0 } },
        ...createOptions(transaction),
      });

      if (profitableTrades === 1) {
        const existingAchievement = await Achievement.findOne({
          where: { userId, type: "first_profit" },
          ...createOptions(transaction),
        });

        if (!existingAchievement) {
          const achievement = await Achievement.create(
            {
              userId,
              type: "first_profit",
              title: "First Profit!",
              description: "Made your first profitable trade",
              achievedAt: today,
            },
            createOptions(transaction)
          );
          achievements.push(achievement);
          await addExperience(userId, 75, transaction);
        }
      }
    }

    return achievements;
  } catch (error) {
    console.error("Error checking special achievements:", error);
    throw error;
  }
};

// Update monthly leaderboard
const updateMonthlyLeaderboard = async (
  userId,
  tradeData = null,
  transaction = null
) => {
  try {
    const period = getCurrentPeriod();
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

    // Get user's monthly trades
    const monthlyTrades = await Trade.findAll({
      where: {
        userId,
        date: {
          [Op.gte]: startOfMonth,
        },
      },
      ...createOptions(transaction),
    });

    // Calculate monthly stats
    const totalTrades = monthlyTrades.length;
    const totalProfit = monthlyTrades.reduce(
      (sum, trade) => sum + (parseFloat(trade.profit) || 0),
      0
    );
    const winTrades = monthlyTrades.filter(
      (trade) => trade.result && trade.result.toLowerCase().includes("win")
    ).length;
    const winRate = totalTrades > 0 ? (winTrades / totalTrades) * 100 : 0;

    // Calculate daily activity (unique days with trades)
    const tradingDays = new Set(monthlyTrades.map((trade) => trade.date)).size;

    // Calculate score
    const score = calculateMonthlyScore({
      totalTrades,
      totalProfit,
      winRate,
      dailyActivity: tradingDays,
    });

    // Update or create monthly leaderboard entry
    await MonthlyLeaderboard.upsert(
      {
        userId,
        period,
        score,
        totalTrades,
        totalProfit,
        winRate,
      },
      { ...createOptions(transaction) }
    );

    // Recalculate ranks for current period
    await recalculateMonthlyRanks(period, transaction);

    return { period, score, rank: null };
  } catch (error) {
    console.error("Error updating monthly leaderboard:", error);
    throw error;
  }
};

// Recalculate monthly ranks
const recalculateMonthlyRanks = async (period, transaction = null) => {
  try {
    // Get all entries for period, sorted by score
    const entries = await MonthlyLeaderboard.findAll({
      where: { period },
      order: [["score", "DESC"]],
      include: [{ model: User }],
      ...createOptions(transaction),
    });

    // Update ranks
    for (let i = 0; i < entries.length; i++) {
      await entries[i].update({ rank: i + 1 }, createOptions(transaction));
    }

    return entries;
  } catch (error) {
    console.error("Error recalculating monthly ranks:", error);
    throw error;
  }
};

// Process trade for gamification
export const processTradeForGamification = async (
  userId,
  tradeData,
  transaction
) => {
  try {
    // Initialize user level if not exists - WITH TRANSACTION
    let userLevel = await UserLevel.findOne({
      where: { userId },
      transaction,
    });

    if (!userLevel) {
      userLevel = await UserLevel.create(
        {
          userId,
          level: 1,
          experience: 0,
          totalExperience: 0,
          dailyStreak: 0,
          totalTrades: 0,
          consecutiveWins: 0,
          maxConsecutiveWins: 0,
        },
        { transaction }
      ); // Important: Pass transaction here
    }

    // Update trade count WITH TRANSACTION
    await userLevel.increment("totalTrades", { transaction });

    // Update streaks and stats WITH TRANSACTION
    await updateDailyStreak(userId, transaction);
    await updateProfitStreak(userId, tradeData.profit, transaction);
    await updateConsecutiveWins(userId, tradeData.result, transaction);

    // Award base XP for completing trade
    await addExperience(userId, 10, transaction);

    // Bonus XP for profitable trade
    if (tradeData.profit > 0) {
      await addExperience(
        userId,
        Math.min(50, Math.floor(tradeData.profit / 10)),
        transaction
      );
    }

    // Check for special achievements
    const newAchievements = await checkSpecialAchievements(
      userId,
      tradeData,
      transaction
    );

    // Check and award badges
    const newBadges = await checkAndAwardBadges(userId, transaction);

    // Update monthly leaderboard
    const monthlyUpdate = await updateMonthlyLeaderboard(
      userId,
      tradeData,
      transaction
    );

    return {
      newAchievements,
      newBadges,
      userLevel: await UserLevel.findOne({
        where: { userId },
        ...createOptions(transaction),
      }),
      monthlyUpdate,
    };
  } catch (error) {
    console.error("Error processing trade for gamification:", error);
    throw error;
  }
};

// Handle trades deletion
const handleTradesDeletion = async (
  userId,
  deletedTradesCount,
  deletedXp,
  transaction = null
) => {
  try {
    const userLevel = await UserLevel.findOne({
      where: { userId },
      ...createOptions(transaction),
    });

    if (userLevel) {
      // Reduce total trades
      const newTotalTrades = Math.max(
        0,
        userLevel.totalTrades - deletedTradesCount
      );

      // Reduce total experience
      const newTotalExperience = Math.max(
        0,
        userLevel.totalExperience - deletedXp
      );

      // Recalculate level based on new total experience
      let currentLevel = 1;
      let currentXP = newTotalExperience;

      while (currentXP >= calculateRequiredXP(currentLevel)) {
        currentXP -= calculateRequiredXP(currentLevel);
        currentLevel++;
      }

      await userLevel.update(
        {
          level: currentLevel,
          experience: currentXP,
          totalExperience: newTotalExperience,
          totalTrades: newTotalTrades,
        },
        createOptions(transaction)
      );

      // Update monthly leaderboard
      await updateMonthlyLeaderboard(userId, null, transaction);

      return {
        success: true,
        newLevel: currentLevel,
        experienceLost: deletedXp,
        newTotalTrades: newTotalTrades,
      };
    }

    return { success: false, message: "User level not found" };
  } catch (error) {
    console.error("Error handling trades deletion:", error);
    throw error;
  }
};

// ==================== TRADE CONTROLLER FUNCTIONS ====================

// Get all trades for user
export const getTrades = async (req, res) => {
  try {
    const userId = req.userId;

    // Pagination parameters
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const type = req.query.type; // 'Buy' or 'Sell'
    const result = req.query.result; // 'Win', 'Lose', 'Break Even', 'Pending'

    const offset = limit * page;

    // Build where clause
    let whereClause = { userId };

    // Search across multiple fields - FIXED: menggunakan Op.like untuk MySQL
    if (search) {
      const searchPattern = `%${search}%`;
      whereClause[Op.or] = [
        { instrument: { [Op.like]: searchPattern } },
        { strategy: { [Op.like]: searchPattern } },
        { market: { [Op.like]: searchPattern } },
        { notes: { [Op.like]: searchPattern } },
      ];

      // Search by date if it matches date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateRegex.test(search)) {
        whereClause[Op.or].push({ date: { [Op.eq]: search } });
      }
    }

    // Filter by type
    if (type && (type === "Buy" || type === "Sell")) {
      whereClause.type = type;
    }

    // Filter by result
    if (result && ["Win", "Lose", "Break Even", "Pending"].includes(result)) {
      whereClause.result = result;
    }

    // Get total count for pagination
    const totalCount = await Trade.count({ where: whereClause });

    // Get paginated data
    const trades = await Trade.findAll({
      where: whereClause,
      order: [
        ["date", "DESC"],
        ["created_at", "DESC"],
      ],
      limit,
      offset,
    });

    // Format data
    const formattedTrades = trades.map((trade) => ({
      ...trade.toJSON(),
      entry: parseFloat(trade.entry),
      exit: trade.exit ? parseFloat(trade.exit) : null,
      stop: trade.stop ? parseFloat(trade.stop) : null,
      take: trade.take ? parseFloat(trade.take) : null,
      lot: parseFloat(trade.lot),
      profit: parseFloat(trade.profit),
      balanceAfter: parseFloat(trade.balanceAfter),
      pips: parseInt(trade.pips),
      riskReward: trade.riskReward ? parseFloat(trade.riskReward) : 0,
    }));

    // Calculate stats (you might want to adjust calculateStats to accept filters)
    const stats = await calculateStats(userId);

    res.json({
      success: true,
      data: formattedTrades,
      stats: stats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: (page + 1) * limit < totalCount,
        hasPrevPage: page > 0,
      },
      message: "Trades retrieved successfully",
    });
  } catch (error) {
    console.error("Get trades error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get single trade
export const getTrade = async (req, res) => {
  try {
    const { id } = req.params;
    const trade = await Trade.findOne({
      where: {
        id: id,
        userId: req.userId,
      },
    });

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: "Trade not found",
      });
    }

    res.json({
      success: true,
      data: trade,
    });
  } catch (error) {
    console.error("Get trade error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Helper functions untuk parse number
const parseNumberWithComma = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const strValue = String(value).replace(",", ".");
  const numValue = parseFloat(strValue);
  return isNaN(numValue) ? null : numValue;
};

const parseIntegerWithComma = (value) => {
  const num = parseNumberWithComma(value);
  return num !== null ? Math.round(num) : null;
};

// Create new trade
export const createTrade = async (req, res) => {
  const transaction = await db.transaction();

  try {
    const {
      date,
      instrument,
      type,
      lot,
      entry,
      stop,
      take,
      exit,
      pips,
      profit,
      result,
      riskReward,
      strategy,
      market,
      emotionBefore,
      emotionAfter,
      screenshot,
      notes,
    } = req.body;

    // Validasi semua field wajib (semua field kecuali screenshot dan notes)
    const requiredFields = {
      date: 'Date',
      instrument: 'Instrument',
      type: 'Type',
      lot: 'Lot',
      entry: 'Entry Price',
      exit: 'Exit Price',
      stop: 'Stop Loss',
      take: 'Take Profit',
      pips: 'Pips',
      profit: 'Profit/Loss',
      result: 'Result',
      riskReward: 'Risk/Reward Ratio',
      strategy: 'Strategy',
      market: 'Market Condition',
      emotionBefore: 'Emotion Before',
      emotionAfter: 'Emotion After',
    };

    const missingFields = [];
    
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!req.body[field] || req.body[field].toString().trim() === '') {
        missingFields.push(label);
      }
    }

    if (missingFields.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Field berikut wajib diisi: ${missingFields.join(', ')}`,
        missingFields,
      });
    }

    // Validasi numerik untuk field yang harus berupa angka
    const numericFields = {
      lot: 'Lot Size',
      entry: 'Entry Price',
      exit: 'Exit Price',
      stop: 'Stop Loss',
      take: 'Take Profit',
      pips: 'Pips',
      profit: 'Profit/Loss',
      riskReward: 'Risk/Reward Ratio',
    };

    const invalidNumericFields = [];
    
    for (const [field, label] of Object.entries(numericFields)) {
      const value = req.body[field];
      const num = parseFloat(String(value).replace(',', '.'));
      if (isNaN(num)) {
        invalidNumericFields.push(label);
      }
    }

    if (invalidNumericFields.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Field berikut harus berupa angka yang valid: ${invalidNumericFields.join(', ')}`,
        invalidNumericFields,
      });
    }

    // Validasi plan free - maksimal 30 entri
    const userSubscription = await Subscription.findOne({
      where: { userId: req.userId },
      transaction,
    });

    const userPlan = userSubscription?.plan || "free";

    if (userPlan === "free") {
      const existingTradesCount = await Trade.count({
        where: { userId: req.userId },
        transaction,
      });

      console.log(
        `User ${req.userId} (${userPlan}) has ${existingTradesCount} trades`
      );

      if (existingTradesCount >= 30) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message:
            "Anda telah mencapai batas maksimal 30 entri untuk plan Free. Silakan upgrade ke Pro untuk entri tak terbatas.",
          requiresUpgrade: true,
          currentPlan: "free",
          maxEntries: 30,
          currentEntries: existingTradesCount,
        });
      }
    }

    // Get user's current balance
    const user = await User.findByPk(req.userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Parse semua nilai numerik
    const parseNumber = (val) => {
      if (val === null || val === undefined || val === "") return null;
      const str = String(val).replace(",", ".");
      const num = parseFloat(str);
      return isNaN(num) ? null : num;
    };

    const parsedLot = parseNumber(lot);
    const parsedEntry = parseNumber(entry);
    const parsedExit = parseNumber(exit);
    const parsedStop = parseNumber(stop);
    const parsedTake = parseNumber(take);
    const parsedProfit = parseNumber(profit);
    const parsedRiskReward = parseNumber(riskReward);

    // Validasi nilai numerik tidak boleh null setelah parsing
    const numericValidation = [];
    if (parsedLot === null) numericValidation.push('Lot Size');
    if (parsedEntry === null) numericValidation.push('Entry Price');
    if (parsedExit === null) numericValidation.push('Exit Price');
    if (parsedStop === null) numericValidation.push('Stop Loss');
    if (parsedTake === null) numericValidation.push('Take Profit');
    if (parsedProfit === null) numericValidation.push('Profit/Loss');
    if (parsedRiskReward === null) numericValidation.push('Risk/Reward Ratio');

    if (numericValidation.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Format angka tidak valid untuk: ${numericValidation.join(', ')}`,
        invalidFields: numericValidation,
      });
    }

    // Validasi nilai minimal
    if (parsedLot <= 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Lot Size harus lebih besar dari 0",
      });
    }

    if (parsedEntry <= 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Entry Price harus lebih besar dari 0",
      });
    }

    if (parsedExit <= 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Exit Price harus lebih besar dari 0",
      });
    }

    if (parsedStop <= 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Stop Loss harus lebih besar dari 0",
      });
    }

    if (parsedTake <= 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Take Profit harus lebih besar dari 0",
      });
    }

    // Handle profit dan result consistency
    let finalProfit = parsedProfit;
    
    if (result.toLowerCase().includes("lose") && finalProfit > 0) {
      finalProfit = -finalProfit;
    } else if (result.toLowerCase().includes("win") && finalProfit < 0) {
      finalProfit = Math.abs(finalProfit);
    } else if (result.toLowerCase().includes("break even")) {
      finalProfit = 0;
    }

    // Hitung pips jika valid
    let finalPips = pips ? parseInt(pips) : 0;
    if (finalPips === null || isNaN(finalPips)) finalPips = 0;

    // Hitung balanceAfter
    const newBalance = parseFloat(user.currentBalance) + (finalProfit || 0);

    // Validasi result konsisten dengan profit
    let finalResult = result;
    const profitValue = parseFloat(finalProfit);
    
    if (result.toLowerCase().includes("win") && profitValue <= 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Result 'Win' harus memiliki Profit yang positif",
      });
    }
    
    if (result.toLowerCase().includes("lose") && profitValue >= 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Result 'Lose' harus memiliki Profit yang negatif",
      });
    }
    
    if (result.toLowerCase().includes("break even") && profitValue !== 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Result 'Break Even' harus memiliki Profit = 0",
      });
    }

    // Debug log
    console.log("🔧 Parsed values:", {
      lot: parsedLot,
      entry: parsedEntry,
      exit: parsedExit,
      stop: parsedStop,
      take: parsedTake,
      profit: finalProfit,
      pips: finalPips,
      riskReward: parsedRiskReward,
    });

    // Create trade
    const trade = await Trade.create(
      {
        userId: req.userId,
        date,
        instrument: instrument.trim(),
        type,
        lot: parsedLot,
        entry: parsedEntry,
        stop: parsedStop,
        take: parsedTake,
        exit: parsedExit,
        pips: finalPips,
        profit: finalProfit,
        balanceAfter: newBalance,
        result: finalResult,
        riskReward: parsedRiskReward,
        strategy: (strategy || "").trim(),
        market: (market || "").trim(),
        emotionBefore: (emotionBefore || "").trim(),
        emotionAfter: (emotionAfter || "").trim(),
        screenshot: screenshot || "",
        notes: notes || "",
      },
      { transaction }
    );

    // Update user's current balance
    await User.update(
      { currentBalance: newBalance },
      { where: { id: req.userId }, transaction }
    );

    const gamificationResult = await processTradeForGamification(
      req.userId,
      {
        profit: finalProfit,
        result: finalResult,
      },
      transaction
    );

    // Get updated stats
    const stats = await calculateStats(req.userId);

    // Commit transaction
    await transaction.commit();

    res.status(201).json({
      success: true,
      message: "Trade created successfully",
      data: trade,
      stats: stats,
      newBalance: newBalance,
      gamification: {
        newAchievements: gamificationResult.newAchievements,
        newBadges: gamificationResult.newBadges,
        levelUps:
          gamificationResult.userLevel.level >
          gamificationResult.userLevel.previousLevel,
        userLevel: gamificationResult.userLevel,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Create trade error:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};

// Update trade
export const updateTrade = async (req, res) => {
  const transaction = await db.transaction();

  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log("Update request for trade:", id);
    console.log("Update data:", updateData);

    // Helper function untuk parse number
    const parseNumber = (val) => {
      if (val === null || val === undefined || val === "") return null;
      const str = String(val).replace(",", ".");
      const num = parseFloat(str);
      return isNaN(num) ? null : num;
    };

    // Cari trade yang akan diupdate
    const trade = await Trade.findOne({
      where: {
        id: id,
        userId: req.userId,
      },
      ...createOptions(transaction),
    });

    if (!trade) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Trade not found",
      });
    }

    // Filter hanya field yang ada di model
    const allowedFields = [
      "date",
      "instrument",
      "type",
      "lot",
      "entry",
      "stop",
      "take",
      "exit",
      "pips",
      "profit",
      "result",
      "riskReward",
      "strategy",
      "market",
      "emotionBefore",
      "emotionAfter",
      "screenshot",
      "notes",
    ];

    const updatedFields = {};
    let hasChanges = false;

    // Simpan profit lama untuk perhitungan
    const oldProfit = parseFloat(trade.profit);

    // Handle profit khusus
    if (updateData.profit !== undefined) {
      let profitValue = parseNumber(updateData.profit);
      if (profitValue === null) profitValue = 0;

      // Sesuaikan tanda profit berdasarkan result
      if (
        updateData.result &&
        updateData.result.toLowerCase().includes("lose") &&
        profitValue > 0
      ) {
        profitValue = -profitValue;
      }
      if (
        updateData.result &&
        updateData.result.toLowerCase().includes("win") &&
        profitValue < 0
      ) {
        profitValue = Math.abs(profitValue);
      }

      // Cek apakah profit berubah
      if (profitValue !== oldProfit) {
        updatedFields.profit = profitValue;
        hasChanges = true;
        console.log("Profit changed:", profitValue);
      }
    }

    // Loop melalui field lainnya
    for (const field of allowedFields) {
      if (field !== "profit" && updateData[field] !== undefined) {
        let newValue = updateData[field];

        // Convert number fields
        if (
          ["lot", "entry", "stop", "take", "exit", "riskReward"].includes(field)
        ) {
          newValue = parseNumber(newValue);
        } else if (field === "pips") {
          // Parse pips sebagai integer
          const parsed = parseNumber(newValue);
          newValue = parsed !== null ? Math.round(parsed) : 0;
        }

        // Handle perbandingan null/undefined
        const oldValue = trade[field];
        const normalizedOldValue =
          oldValue === null || oldValue === undefined ? "" : oldValue;
        const normalizedNewValue =
          newValue === null || newValue === undefined ? "" : newValue;

        // Cek apakah ada perubahan
        if (
          JSON.stringify(normalizedOldValue) !==
          JSON.stringify(normalizedNewValue)
        ) {
          updatedFields[field] = newValue;
          hasChanges = true;
          console.log(`Field ${field} changed:`, {
            old: normalizedOldValue,
            new: normalizedNewValue,
          });
        }
      }
    }

    console.log("Has changes:", hasChanges);
    console.log("Updated fields:", updatedFields);

    // Jika tidak ada perubahan, return tanpa update
    if (!hasChanges) {
      await transaction.rollback();
      return res.json({
        success: true,
        message: "No changes detected",
        data: trade,
        unchanged: true,
      });
    }

    // Update trade
    await trade.update(updatedFields, createOptions(transaction));

    // Jika profit berubah, recalculate balances dan update gamification
    if (updatedFields.profit !== undefined) {
      // Hitung selisih profit
      const profitDifference = updatedFields.profit - oldProfit;

      // Update user balance
      const user = await User.findByPk(req.userId, createOptions(transaction));
      const newBalance = parseFloat(user.currentBalance) + profitDifference;

      await User.update(
        { currentBalance: newBalance },
        { where: { id: req.userId }, ...createOptions(transaction) }
      );

      // Recalculate balances untuk semua trades
      await recalculateBalances(req.userId, transaction);

      // Update monthly leaderboard untuk profit change
      if (profitDifference !== 0) {
        await updateMonthlyLeaderboard(req.userId, null, transaction);
      }
    }

    // Reload trade untuk mendapatkan balanceAfter yang baru
    await trade.reload(createOptions(transaction));

    // Get updated stats
    const stats = await calculateStats(req.userId, transaction);

    // Commit transaction
    await transaction.commit();

    res.json({
      success: true,
      message: "Trade updated successfully",
      data: trade,
      stats: stats,
    });
  } catch (error) {
    // Rollback transaction jika ada error
    await transaction.rollback();
    console.error("Update trade error:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};

// Delete trade
export const deleteTrade = async (req, res) => {
  const transaction = await db.transaction();

  try {
    const { id } = req.params;
    const userId = req.userId;

    const trade = await Trade.findOne({
      where: {
        id: id,
        userId: userId,
      },
      ...createOptions(transaction),
    });

    if (!trade) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Trade not found",
      });
    }

    // Simpan data sebelum dihapus
    const tradeDate = trade.date;
    const tradeMonth = tradeDate
      ? new Date(tradeDate).toISOString().substring(0, 7)
      : null;

    // Hitung XP yang harus dikurangi (sama dengan saat trade dibuat)
    const xpToDeduct = calculateXpFromTrade(trade);

    // Hapus trade
    await trade.destroy(createOptions(transaction));

    // Update gamification stats
    const gamificationResult = await handleTradesDeletion(
      userId,
      1,
      xpToDeduct,
      transaction
    );

    // Jika trade ada di bulan ini, update monthly leaderboard
    if (tradeMonth) {
      const currentMonth = new Date().toISOString().substring(0, 7);
      if (tradeMonth === currentMonth) {
        await updateMonthlyLeaderboard(userId, null, transaction);
      }
    }

    // Recalculate all balances setelah delete
    await recalculateBalances(userId, transaction);

    // Get updated stats
    const stats = await calculateStats(userId, transaction);

    // Commit transaction
    await transaction.commit();

    res.json({
      success: true,
      message: "Trade deleted successfully",
      stats: stats,
      gamification: gamificationResult,
    });
  } catch (error) {
    // Rollback transaction jika ada error
    await transaction.rollback();
    console.error("Delete trade error:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};

// Delete all trades for user
export const deleteAllTrades = async (req, res) => {
  const transaction = await db.transaction();

  try {
    const userId = req.userId;

    // Get all trades untuk menghitung total
    const trades = await Trade.findAll({
      where: { userId },
      ...createOptions(transaction),
    });

    const totalTrades = trades.length;

    // Hitung total XP yang harus dikurangi
    let totalXpToDeduct = 0;
    let totalProfit = 0;

    trades.forEach((trade) => {
      totalXpToDeduct += calculateXpFromTrade(trade);
      totalProfit += parseFloat(trade.profit) || 0;
    });

    // Hapus semua trades
    const deletedCount = await Trade.destroy({
      where: { userId },
      ...createOptions(transaction),
    });

    // Update gamification stats
    const gamificationResult = await handleTradesDeletion(
      userId,
      totalTrades,
      totalXpToDeduct,
      transaction
    );

    // Reset balance ke initial balance
    const user = await User.findByPk(userId, createOptions(transaction));
    let newBalance = user.initialBalance;

    if (user) {
      await user.update(
        {
          currentBalance: user.initialBalance,
        },
        createOptions(transaction)
      );
    }

    // Reset atau nonaktifkan target user dan set targetBalance ke 0
    let targetAction = "none";
    const target = await Target.findOne({
      where: { userId },
      ...createOptions(transaction),
    });

    if (target) {
      if (target.enabled) {
        // Nonaktifkan target karena tidak ada data trades dan set targetBalance ke 0
        await target.update(
          {
            enabled: false,
            targetBalance: 0,
            targetDate: null,
            description: target.description
              ? `${target.description} (Target dinonaktifkan karena semua trades dihapus)`
              : "Target dinonaktifkan karena semua trades dihapus",
            updated_at: new Date(),
          },
          createOptions(transaction)
        );
        targetAction = "disabled";
        console.log(
          `Target disabled and balance reset to 0 for user: ${userId}`
        );
      } else {
        // Jika target sudah dinonaktifkan, pastikan targetBalance = 0
        if (parseFloat(target.targetBalance) !== 0) {
          await target.update(
            {
              targetBalance: 0,
              targetDate: null,
              updated_at: new Date(),
            },
            createOptions(transaction)
          );
          targetAction = "balance_reset";
          console.log(`Target balance reset to 0 for user: ${userId}`);
        } else {
          targetAction = "already_disabled";
        }
      }
    } else {
      targetAction = "no_target";
    }

    // Commit transaction
    await transaction.commit();

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${deletedCount} trades`,
      deletedCount: deletedCount,
      newBalance: newBalance,
      targetAction: targetAction,
      gamification: {
        experienceLost: totalXpToDeduct,
        newLevel: gamificationResult.newLevel,
        newTotalTrades: gamificationResult.newTotalTrades,
      },
      note: "All trades deleted. Gamification stats have been adjusted accordingly.",
    });
  } catch (error) {
    // Rollback transaction jika ada error
    await transaction.rollback();
    console.error("Delete all trades error:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};

// Export PDF Report
export const exportPDFReport = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all trades
    const trades = await Trade.findAll({
      where: { userId: req.userId },
      order: [["date", "DESC"]],
    });

    // Get user info
    const user = await User.findByPk(userId);

    // Calculate stats
    const stats = await calculateStats(userId);

    // Prepare analytics data
    const analyticsData = {
      winLossData: calculateWinLossData(trades),
      instrumentData: calculateInstrumentPerformance(trades),
      dailyPerformanceData: calculateDailyPerformance(trades),
      strategyData: calculateStrategyPerformance(trades),
      timeOfDayData: calculateTimeOfDayPerformance(trades),
      tradeTypeData: calculateTradeTypePerformance(trades),
      monthlyTrendData: calculateMonthlyTrend(trades),
      profitDistributionData: calculateProfitDistribution(trades),
    };

    // Generate PDF
    const pdfBuffer = await generateTradingReportPDF(
      trades,
      stats,
      user,
      analyticsData
    );

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=trading-report-${Date.now()}.pdf`
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Export PDF error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate PDF report",
    });
  }
};

// ==================== HELPER FUNCTIONS ====================

// Recalculate balances helper function
const recalculateBalances = async (userId, transaction = null) => {
  try {
    const trades = await Trade.findAll({
      where: { userId },
      order: [
        ["date", "ASC"],
        ["created_at", "ASC"],
      ],
      ...createOptions(transaction),
    });

    const user = await User.findByPk(userId, createOptions(transaction));
    let runningBalance = parseFloat(user.initialBalance);

    // Update semua balanceAfter berdasarkan urutan kronologis
    for (const trade of trades) {
      runningBalance += parseFloat(trade.profit);
      await trade.update(
        {
          balanceAfter: parseFloat(runningBalance.toFixed(2)),
        },
        createOptions(transaction)
      );
    }

    // Update user's current balance
    await User.update(
      { currentBalance: parseFloat(runningBalance.toFixed(2)) },
      {
        where: { id: userId },
        ...createOptions(transaction),
      }
    );

    return runningBalance;
  } catch (error) {
    console.error("Recalculate balances error:", error);
    throw error;
  }
};

// Analytics helper functions
const calculateWinLossData = (trades) => {
  const resultStats = { Win: 0, Lose: 0, "Break Even": 0 };

  trades.forEach((entry) => {
    if (entry.result) {
      const result = entry.result.toLowerCase();
      if (result.includes("win")) resultStats["Win"]++;
      else if (result.includes("lose")) resultStats["Lose"]++;
      else if (result.includes("break")) resultStats["Break Even"]++;
    }
  });

  return [
    { name: "Wins", value: resultStats["Win"], color: "#10b981" },
    { name: "Losses", value: resultStats["Lose"], color: "#ef4444" },
    { name: "Break Even", value: resultStats["Break Even"], color: "#f59e0b" },
  ].filter((item) => item.value > 0);
};

const calculateInstrumentPerformance = (trades) => {
  const instrumentStats = {};

  trades.forEach((entry) => {
    if (!entry.instrument) return;

    if (!instrumentStats[entry.instrument]) {
      instrumentStats[entry.instrument] = { profit: 0, trades: 0, wins: 0 };
    }
    instrumentStats[entry.instrument].profit += entry.profit || 0;
    instrumentStats[entry.instrument].trades += 1;
    if (entry.result?.toLowerCase().includes("win")) {
      instrumentStats[entry.instrument].wins += 1;
    }
  });

  return Object.entries(instrumentStats)
    .map(([instrument, data]) => ({
      instrument,
      profit: data.profit,
      trades: data.trades,
      winRate: Math.round((data.wins / data.trades) * 100) || 0,
    }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 8);
};

const calculateDailyPerformance = (trades) => {
  if (trades.length === 0) return [];

  const dailyStats = {};
  trades.forEach((entry) => {
    if (!entry.date) return;

    if (!dailyStats[entry.date]) {
      dailyStats[entry.date] = { profit: 0, trades: 0 };
    }
    dailyStats[entry.date].profit += entry.profit || 0;
    dailyStats[entry.date].trades += 1;
  });

  return Object.entries(dailyStats)
    .map(([date, data]) => ({
      date,
      profit: data.profit,
      trades: data.trades,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-30);
};

const calculateStrategyPerformance = (trades) => {
  if (trades.length === 0) return [];

  const strategyStats = {};
  trades.forEach((entry) => {
    const strategy = entry.strategy || "No Strategy";
    if (!strategyStats[strategy]) {
      strategyStats[strategy] = { profit: 0, trades: 0, wins: 0 };
    }
    strategyStats[strategy].profit += entry.profit || 0;
    strategyStats[strategy].trades += 1;
    if (entry.result?.toLowerCase().includes("win")) {
      strategyStats[strategy].wins += 1;
    }
  });

  return Object.entries(strategyStats)
    .map(([strategy, data]) => ({
      strategy:
        strategy.length > 20 ? strategy.substring(0, 20) + "..." : strategy,
      profit: data.profit,
      trades: data.trades,
      winRate: Math.round((data.wins / data.trades) * 100) || 0,
    }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 6);
};

const calculateTimeOfDayPerformance = (trades) => {
  if (trades.length === 0) return [];

  const timeSlots = [
    { name: "Night (00:00-05:59)", min: 0, max: 5 },
    { name: "Morning (06:00-11:59)", min: 6, max: 11 },
    { name: "Afternoon (12:00-17:59)", min: 12, max: 17 },
    { name: "Evening (18:00-23:59)", min: 18, max: 23 },
  ];

  const timeStats = {};
  timeSlots.forEach((slot) => {
    timeStats[slot.name] = { profit: 0, trades: 0, wins: 0 };
  });

  trades.forEach((entry) => {
    if (!entry.date) return;

    const hour = new Date(entry.date).getHours();

    // Cari slot yang sesuai
    const slot = timeSlots.find((s) => hour >= s.min && hour <= s.max);
    if (!slot) return;

    timeStats[slot.name].profit += entry.profit || 0;
    timeStats[slot.name].trades += 1;
    if (entry.result?.toLowerCase().includes("win")) {
      timeStats[slot.name].wins += 1;
    }
  });

  return Object.entries(timeStats)
    .map(([time, data]) => ({
      time,
      profit: data.profit,
      trades: data.trades,
      wins: data.wins,
      winRate:
        data.trades > 0 ? Math.round((data.wins / data.trades) * 100) : 0,
      avgProfit: data.trades > 0 ? Math.round(data.profit / data.trades) : 0,
    }))
    .filter((item) => item.trades > 0);
};

const calculateTradeTypePerformance = (trades) => {
  if (trades.length === 0) return [];

  const typeStats = {
    Buy: { profit: 0, trades: 0, wins: 0 },
    Sell: { profit: 0, trades: 0, wins: 0 },
  };

  trades.forEach((entry) => {
    if (typeStats[entry.type]) {
      typeStats[entry.type].profit += entry.profit || 0;
      typeStats[entry.type].trades += 1;
      if (entry.result?.toLowerCase().includes("win")) {
        typeStats[entry.type].wins += 1;
      }
    }
  });

  return Object.entries(typeStats).map(([type, data]) => ({
    type,
    profit: data.profit,
    trades: data.trades,
    winRate: Math.round((data.wins / data.trades) * 100) || 0,
    avgProfit: Math.round(data.profit / data.trades) || 0,
  }));
};

const calculateMonthlyTrend = (trades) => {
  if (trades.length === 0) return [];

  const monthlyStats = {};
  trades.forEach((entry) => {
    if (!entry.date) return;

    const month = entry.date.substring(0, 7);
    if (!monthlyStats[month]) {
      monthlyStats[month] = { profit: 0, trades: 0 };
    }
    monthlyStats[month].profit += entry.profit || 0;
    monthlyStats[month].trades += 1;
  });

  return Object.entries(monthlyStats)
    .map(([month, data]) => ({
      month,
      profit: data.profit,
      trades: data.trades,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6);
};

const calculateProfitDistribution = (trades) => {
  if (trades.length === 0) return [];

  const profitRanges = {
    "Large Loss (< -500k)": 0,
    "Medium Loss (-500k to -100k)": 0,
    "Small Loss (-100k to 0)": 0,
    "Small Profit (0 to 100k)": 0,
    "Medium Profit (100k to 500k)": 0,
    "Large Profit (> 500k)": 0,
  };

  trades.forEach((entry) => {
    const profit = entry.profit || 0;
    if (profit < -500000) profitRanges["Large Loss (< -500k)"]++;
    else if (profit < -100000) profitRanges["Medium Loss (-500k to -100k)"]++;
    else if (profit < 0) profitRanges["Small Loss (-100k to 0)"]++;
    else if (profit < 100000) profitRanges["Small Profit (0 to 100k)"]++;
    else if (profit < 500000) profitRanges["Medium Profit (100k to 500k)"]++;
    else profitRanges["Large Profit (> 500k)"]++;
  });

  return Object.entries(profitRanges)
    .map(([range, count]) => ({ range, count }))
    .filter((item) => item.count > 0);
};
