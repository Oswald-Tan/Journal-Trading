import { Badge, UserBadge, UserLevel, Achievement, MonthlyLeaderboard } from "../models/gamification.js";
import Trade from "../models/trade.js";
import { Op } from "sequelize";
import User from "../models/user.js";

// Helper: Get current period (YYYY-MM)
const getCurrentPeriod = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// Helper: Calculate required XP for a level
const calculateRequiredXP = (level) => {
  return Math.floor(100 * Math.pow(level, 1.5));
};

// Add experience to user
const addExperience = async (userId, xp) => {
  try {
    let userLevel = await UserLevel.findOne({ where: { userId } });
    
    if (!userLevel) {
      userLevel = await UserLevel.create({
        userId,
        level: 1,
        experience: 0,
        totalExperience: 0,
        dailyStreak: 0,
        totalTrades: 0,
        consecutiveWins: 0,
        maxConsecutiveWins: 0,
      });
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

    await userLevel.update({
      level: currentLevel,
      experience: currentXP,
      totalExperience: newTotalXP,
    });

    return { level: currentLevel, experience: currentXP, levelUps };
  } catch (error) {
    console.error("Error adding experience:", error);
    throw error;
  }
};

// Update daily streak
const updateDailyStreak = async (userId) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const userLevel = await UserLevel.findOne({ where: { userId } });

    if (!userLevel) return 0;

    if (userLevel.lastActiveDate) {
      const lastActive = new Date(userLevel.lastActiveDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActive.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
        // Consecutive day
        await userLevel.update({
          dailyStreak: userLevel.dailyStreak + 1,
          lastActiveDate: today,
        });
      } else if (lastActive.toISOString().split('T')[0] !== today) {
        // Streak broken
        await userLevel.update({
          dailyStreak: 1,
          lastActiveDate: today,
        });
      }
    } else {
      // First time
      await userLevel.update({
        dailyStreak: 1,
        lastActiveDate: today,
      });
    }

    return userLevel.dailyStreak;
  } catch (error) {
    console.error("Error updating daily streak:", error);
    throw error;
  }
};

// Update profit streak
const updateProfitStreak = async (userId, tradeProfit) => {
  try {
    const userLevel = await UserLevel.findOne({ where: { userId } });
    if (!userLevel) return 0;

    const today = new Date().toISOString().split('T')[0];

    if (tradeProfit > 0) {
      if (userLevel.lastProfitDate === today) {
        // Already updated today
        return userLevel.profitStreak;
      }

      if (userLevel.lastProfitDate) {
        const lastProfit = new Date(userLevel.lastProfitDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastProfit.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
          // Consecutive profit day
          await userLevel.update({
            profitStreak: userLevel.profitStreak + 1,
            lastProfitDate: today,
          });
        } else if (lastProfit.toISOString().split('T')[0] !== today) {
          // New streak
          await userLevel.update({
            profitStreak: 1,
            lastProfitDate: today,
          });
        }
      } else {
        // First profit
        await userLevel.update({
          profitStreak: 1,
          lastProfitDate: today,
        });
      }
    } else {
      // Loss - reset streak
      if (userLevel.lastProfitDate !== today) {
        await userLevel.update({
          profitStreak: 0,
          lastProfitDate: today,
        });
      }
    }

    return userLevel.profitStreak;
  } catch (error) {
    console.error("Error updating profit streak:", error);
    throw error;
  }
};

// Update consecutive wins
const updateConsecutiveWins = async (userId, tradeResult) => {
  try {
    const userLevel = await UserLevel.findOne({ where: { userId } });
    if (!userLevel) return { consecutiveWins: 0, maxConsecutiveWins: 0 };

    let newConsecutiveWins = userLevel.consecutiveWins;

    if (tradeResult.toLowerCase().includes('win')) {
      newConsecutiveWins += 1;
    } else {
      newConsecutiveWins = 0;
    }

    const maxConsecutiveWins = Math.max(userLevel.maxConsecutiveWins, newConsecutiveWins);

    await userLevel.update({
      consecutiveWins: newConsecutiveWins,
      maxConsecutiveWins: maxConsecutiveWins,
    });

    return { consecutiveWins: newConsecutiveWins, maxConsecutiveWins };
  } catch (error) {
    console.error("Error updating consecutive wins:", error);
    throw error;
  }
};

// Check and award badges - FIXED VERSION
const checkAndAwardBadges = async (userId) => {
  try {
    const userLevel = await UserLevel.findOne({ where: { userId } });
    if (!userLevel) {
      console.log(`UserLevel not found for userId: ${userId}`);
      return [];
    }

    const badges = await Badge.findAll();
    if (!badges || badges.length === 0) {
      console.log('No badges found in database');
      return [];
    }

    const awardedBadges = [];

    for (const badge of badges) {
      try {
        const userBadge = await UserBadge.findOne({
          where: { userId, badgeId: badge.id },
        });

        // Skip if already achieved
        if (userBadge && userBadge.achievedAt) {
          continue;
        }

        let progress = 0;
        let achieved = false;

        // Parse requirement
        const requirement = badge.requirement;
        if (!requirement || !requirement.type) {
          console.warn(`Badge ${badge.id} has invalid requirement:`, requirement);
          continue;
        }

        // Calculate progress based on requirement type
        switch (requirement.type) {
          case 'daily_streak':
            progress = userLevel.dailyStreak || 0;
            achieved = progress >= (requirement.value || 0);
            break;

          case 'profit_streak':
            progress = userLevel.profitStreak || 0;
            achieved = progress >= (requirement.value || 0);
            break;

          case 'total_trades':
            progress = userLevel.totalTrades || 0;
            achieved = progress >= (requirement.value || 0);
            break;

          // Add more requirement types as needed
          default:
            console.warn(`Unknown requirement type: ${requirement.type} for badge ${badge.id}`);
            continue;
        }

        // Create or update user badge record
        if (userBadge) {
          await userBadge.update({ 
            progress,
            ...(achieved && !userBadge.achievedAt ? { achievedAt: new Date() } : {})
          });
        } else {
          await UserBadge.create({
            userId,
            badgeId: badge.id,
            progress,
            ...(achieved ? { achievedAt: new Date() } : {})
          });
        }

        // If achieved now, award XP and add to list
        if (achieved && (!userBadge || !userBadge.achievedAt)) {
          // Award XP
          if (badge.xpReward && badge.xpReward > 0) {
            await addExperience(userId, badge.xpReward);
          }
          
          awardedBadges.push({
            id: badge.id,
            name: badge.name,
            description: badge.description,
            type: 'badge',
            xp: badge.xpReward,
            icon: badge.icon,
            color: badge.color,
            rarity: badge.rarity
          });
          
          console.log(`Badge awarded: ${badge.name} to user ${userId}`);
        }
      } catch (badgeError) {
        console.error(`Error processing badge ${badge.id}:`, badgeError);
      }
    }

    return awardedBadges;
  } catch (error) {
    console.error("Error in checkAndAwardBadges:", error);
    return [];
  }
};

// Check for special achievements
const checkSpecialAchievements = async (userId, tradeData) => {
  try {
    const achievements = [];
    const today = new Date();

    // Check for first trade
    const totalTrades = await Trade.count({ where: { userId } });
    if (totalTrades === 1) {
      const existingAchievement = await Achievement.findOne({
        where: { userId, type: 'first_trade' },
      });

      if (!existingAchievement) {
        const achievement = await Achievement.create({
          userId,
          type: 'first_trade',
          title: 'First Trade!',
          description: 'Completed your first trade in the journal',
          achievedAt: today,
        });
        achievements.push(achievement);
        await addExperience(userId, 50);
      }
    }

    // Check for first profit
    if (tradeData.profit > 0) {
      const profitableTrades = await Trade.count({
        where: { userId, profit: { [Op.gt]: 0 } },
      });

      if (profitableTrades === 1) {
        const existingAchievement = await Achievement.findOne({
          where: { userId, type: 'first_profit' },
        });

        if (!existingAchievement) {
          const achievement = await Achievement.create({
            userId,
            type: 'first_profit',
            title: 'First Profit!',
            description: 'Made your first profitable trade',
            achievedAt: today,
          });
          achievements.push(achievement);
          await addExperience(userId, 75);
        }
      }
    }

    return achievements;
  } catch (error) {
    console.error("Error checking special achievements:", error);
    return [];
  }
};

// Calculate monthly score
const calculateMonthlyScore = (userStats) => {
  let score = 0;
  
  // Based on total profit (40% weight)
  score += Math.min(userStats.totalProfit / 10000, 100) * 40;
  
  // Based on win rate (30% weight)
  score += userStats.winRate * 30;
  
  // Based on number of trades (20% weight)
  score += Math.min(userStats.totalTrades / 50, 100) * 20;
  
  // Based on consistency (10% weight)
  score += Math.min(userStats.dailyActivity / 30, 100) * 10;
  
  return Math.round(score);
};

// Update monthly leaderboard
const updateMonthlyLeaderboard = async (userId, tradeData = null) => {
  try {
    const period = getCurrentPeriod();
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    // Get user's monthly trades
    const monthlyTrades = await Trade.findAll({
      where: {
        userId,
        date: {
          [Op.gte]: startOfMonth,
        },
      },
    });
    
    // Calculate monthly stats
    const totalTrades = monthlyTrades.length;
    const totalProfit = monthlyTrades.reduce((sum, trade) => sum + (parseFloat(trade.profit) || 0), 0);
    const winTrades = monthlyTrades.filter(trade => trade.result?.toLowerCase().includes('win')).length;
    const winRate = totalTrades > 0 ? (winTrades / totalTrades) * 100 : 0;
    
    // Calculate daily activity (unique days with trades)
    const tradingDays = new Set(monthlyTrades.map(trade => trade.date)).size;
    
    // Calculate score
    const score = calculateMonthlyScore({
      totalTrades,
      totalProfit,
      winRate,
      dailyActivity: tradingDays,
    });
    
    // Update or create monthly leaderboard entry
    await MonthlyLeaderboard.upsert({
      userId,
      period,
      score,
      totalTrades,
      totalProfit,
      winRate,
    });
    
    // Recalculate ranks for current period
    await recalculateMonthlyRanks(period);
    
    return { period, score, rank: null };
  } catch (error) {
    console.error("Error updating monthly leaderboard:", error);
    throw error;
  }
};

// Recalculate monthly ranks
const recalculateMonthlyRanks = async (period) => {
  try {
    // Get all entries for period, sorted by score
    const entries = await MonthlyLeaderboard.findAll({
      where: { period },
      order: [['score', 'DESC']],
      include: [{ model: User }],
    });
    
    // Update ranks
    for (let i = 0; i < entries.length; i++) {
      await entries[i].update({ rank: i + 1 });
    }
    
    return entries;
  } catch (error) {
    console.error("Error recalculating monthly ranks:", error);
    throw error;
  }
};

// Main function to process trade for gamification
export const processTradeForGamification = async (userId, tradeData) => {
  try {
    // Initialize user level if not exists
    let userLevel = await UserLevel.findOne({ where: { userId } });
    if (!userLevel) {
      userLevel = await UserLevel.create({
        userId,
        level: 1,
        experience: 0,
        totalExperience: 0,
        dailyStreak: 0,
        totalTrades: 0,
        consecutiveWins: 0,
        maxConsecutiveWins: 0,
      });
    }

    // Update trade count
    await userLevel.increment('totalTrades');

    // Update streaks and stats
    await updateDailyStreak(userId);
    await updateProfitStreak(userId, tradeData.profit);
    await updateConsecutiveWins(userId, tradeData.result);

    // Award base XP for completing trade
    await addExperience(userId, 10);

    // Bonus XP for profitable trade
    if (tradeData.profit > 0) {
      await addExperience(userId, Math.min(50, Math.floor(tradeData.profit / 10)));
    }

    // Check for special achievements
    const newAchievements = await checkSpecialAchievements(userId, tradeData);

    // Check and award badges - FIXED: Now returns awarded badges
    const newBadges = await checkAndAwardBadges(userId);

    // Update monthly leaderboard
    const monthlyUpdate = await updateMonthlyLeaderboard(userId, tradeData);

    // Get updated user level
    const updatedUserLevel = await UserLevel.findOne({ where: { userId } });

    return {
      newAchievements,
      newBadges, // This will contain badges that were just awarded
      userLevel: updatedUserLevel,
      monthlyUpdate,
    };
  } catch (error) {
    console.error("Error processing trade for gamification:", error);
    throw error;
  }
};

// Get user gamification profile
export const getUserGamificationProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const userLevel = await UserLevel.findOne({ where: { userId } });
    const userBadges = await UserBadge.findAll({
      where: { userId },
      include: [{ model: Badge }],
      order: [['achievedAt', 'DESC']],
    });

    const recentAchievements = await Achievement.findAll({
      where: { userId },
      order: [['achievedAt', 'DESC']],
      limit: 10,
    });

    const nextLevelXP = userLevel ? calculateRequiredXP(userLevel.level) : 100;

    res.json({
      success: true,
      data: {
        level: userLevel || {
          level: 1,
          experience: 0,
          totalExperience: 0,
          dailyStreak: 0,
          totalTrades: 0,
          consecutiveWins: 0,
          maxConsecutiveWins: 0,
          profitStreak: 0,
        },
        badges: userBadges,
        recentAchievements,
        nextLevelXP,
        levelProgress: userLevel ? (userLevel.experience / nextLevelXP) * 100 : 0,
      },
    });
  } catch (error) {
    console.error("Get gamification profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get all available badges
export const getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.findAll({
      order: [['type', 'ASC'], ['requirement', 'ASC']],
    });

    const userId = req.userId;
    const userBadges = await UserBadge.findAll({
      where: { userId },
      include: [{ model: Badge }],
    });

    const badgesWithProgress = badges.map(badge => {
      const userBadge = userBadges.find(ub => ub.badgeId === badge.id);
      return {
        ...badge.toJSON(),
        progress: userBadge?.progress || 0,
        achieved: !!userBadge?.achievedAt,
        achievedAt: userBadge?.achievedAt,
      };
    });

    res.json({
      success: true,
      data: badgesWithProgress,
    });
  } catch (error) {
    console.error("Get all badges error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get leaderboard with period support
export const getLeaderboard = async (req, res) => {
  try {
    const { type = 'level', limit = 20, period = 'current' } = req.query;
    const userId = req.userId;
    
    let leaders = [];
    let userRank = null;
    let totalUsers = 0;
    let currentPeriod = '';
    
    if (period === 'current' || period === getCurrentPeriod()) {
      // Get current monthly leaderboard
      currentPeriod = getCurrentPeriod();
      
      const leaderEntries = await MonthlyLeaderboard.findAll({
        where: { period: currentPeriod },
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email'],
          },
        ],
        order: [['rank', 'ASC']],
        limit: parseInt(limit),
      });
      
      // Convert to plain objects
      leaders = leaderEntries.map(entry => {
        const entryData = entry.get({ plain: true });
        return {
          userId: entryData.userId,
          User: entryData.User,
          rank: entryData.rank,
          score: entryData.score,
          level: Math.floor(entryData.score / 1000) + 1,
          experience: entryData.score % 1000,
          totalExperience: entryData.score,
          dailyStreak: 0,
          totalTrades: entryData.totalTrades,
          profitStreak: 0,
          totalProfit: entryData.totalProfit,
          winRate: entryData.winRate,
        };
      });
      
      // Get user's rank
      const userEntry = await MonthlyLeaderboard.findOne({
        where: { userId, period: currentPeriod },
      });
      userRank = userEntry?.rank || null;
      totalUsers = await MonthlyLeaderboard.count({ where: { period: currentPeriod } });
      
    } else if (period === 'all') {
      // Existing all-time leaderboard logic
      let orderField;
      switch (type) {
        case 'level':
          orderField = [['level', 'DESC'], ['experience', 'DESC']];
          break;
        case 'experience':
          orderField = [['totalExperience', 'DESC']];
          break;
        case 'streak':
          orderField = [['dailyStreak', 'DESC']];
          break;
        case 'trades':
          orderField = [['totalTrades', 'DESC']];
          break;
        default:
          orderField = [['level', 'DESC']];
      }
      
      const leaderEntries = await UserLevel.findAll({
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email'],
          },
        ],
        order: orderField,
        limit: parseInt(limit),
      });
      
      // Convert to plain objects
      leaders = leaderEntries.map(entry => entry.get({ plain: true }));
      
      // Get current user's rank
      const allUsers = await UserLevel.findAll({ order: orderField });
      const userIndex = allUsers.findIndex(user => user.userId === userId);
      userRank = userIndex >= 0 ? userIndex + 1 : null;
      totalUsers = allUsers.length;
      currentPeriod = 'all';
    }
    
    res.json({
      success: true,
      data: {
        leaders,
        userRank,
        totalUsers,
        period: currentPeriod,
        type: period === 'all' ? type : 'monthly',
      },
    });
  } catch (error) {
    console.error("Get leaderboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};

// Get leaderboard history (previous months)
export const getLeaderboardHistory = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const userId = req.userId;
    
    // Get unique periods
    const periods = await MonthlyLeaderboard.findAll({
      attributes: ['period'],
      group: ['period'],
      order: [['period', 'DESC']],
      limit: parseInt(limit),
    });
    
    // Get user's history for each period
    const history = await Promise.all(
      periods.map(async (period) => {
        const entry = await MonthlyLeaderboard.findOne({
          where: {
            userId,
            period: period.period,
          },
          include: [{ model: User }],
        });
        
        if (entry) {
          return {
            period: entry.period,
            rank: entry.rank,
            score: entry.score,
            totalTrades: entry.totalTrades,
            totalProfit: entry.totalProfit,
            winRate: entry.winRate,
          };
        }
        return null;
      })
    );
    
    res.json({
      success: true,
      data: history.filter(Boolean),
    });
  } catch (error) {
    console.error("Get leaderboard history error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Reset monthly leaderboard (cron job)
export const resetMonthlyLeaderboard = async () => {
  try {
    const currentPeriod = getCurrentPeriod();
    
    // Archive current leaderboard (optional)
    console.log(`Archiving leaderboard for period: ${currentPeriod}`);
    
    // Leaderboard baru akan dibuat otomatis saat user trading di bulan baru
    return { success: true, message: `Leaderboard ready for new period` };
  } catch (error) {
    console.error("Error resetting monthly leaderboard:", error);
    throw error;
  }
};

// Update gamification when trades are deleted
export const handleTradesDeletion = async (userId, deletedTradesCount, deletedProfit) => {
  try {
    const userLevel = await UserLevel.findOne({ where: { userId } });
    
    if (userLevel) {
      // Reduce total trades
      const newTotalTrades = Math.max(0, userLevel.totalTrades - deletedTradesCount);
      
      // Reduce total experience (optional)
      const experiencePenalty = Math.floor(deletedProfit / 100); // 1 XP per 100 profit lost
      const newTotalExperience = Math.max(0, userLevel.totalExperience - experiencePenalty);
      
      // Recalculate level based on new total experience
      let currentLevel = 1;
      let currentXP = newTotalExperience;
      
      while (currentXP >= calculateRequiredXP(currentLevel)) {
        currentXP -= calculateRequiredXP(currentLevel);
        currentLevel++;
      }
      
      await userLevel.update({
        level: currentLevel,
        experience: currentXP,
        totalExperience: newTotalExperience,
        totalTrades: newTotalTrades,
      });
      
      // Update monthly leaderboard
      await updateMonthlyLeaderboard(userId);
      
      return {
        success: true,
        newLevel: currentLevel,
        experienceLost: experiencePenalty,
      };
    }
    
    return { success: false, message: "User level not found" };
  } catch (error) {
    console.error("Error handling trades deletion:", error);
    throw error;
  }
};