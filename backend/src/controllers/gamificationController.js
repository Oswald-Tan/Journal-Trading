import { Badge, UserBadge, UserLevel, Achievement } from "../models/gamification.js";
import Trade from "../models/trade.js";
import { Op } from "sequelize";
import User from "../models/user.js";

// Calculate required XP for a level
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

    if (!userLevel) return;

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
    if (!userLevel) return;

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
    if (!userLevel) return;

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

// Check and award badges
const checkAndAwardBadges = async (userId) => {
  try {
    const userLevel = await UserLevel.findOne({ where: { userId } });
    const badges = await Badge.findAll();
    const awardedBadges = [];

    for (const badge of badges) {
      const userBadge = await UserBadge.findOne({
        where: { userId, badgeId: badge.id },
      });

      if (userBadge && userBadge.achievedAt) {
        continue; // Already awarded
      }

      let progress = 0;
      let achieved = false;

      switch (badge.requirement.type) {
        case 'daily_streak':
          progress = userLevel.dailyStreak;
          achieved = progress >= badge.requirement.value;
          break;

        case 'profit_streak':
          progress = userLevel.profitStreak;
          achieved = progress >= badge.requirement.value;
          break;

        case 'total_trades':
          progress = userLevel.totalTrades;
          achieved = progress >= badge.requirement.value;
          break;

        case 'risk_reward_positive':
          // This would require additional tracking
          progress = 0;
          achieved = false;
          break;

        case 'stop_loss_used':
          // This would require additional tracking
          progress = 0;
          achieved = false;
          break;
      }

      if (userBadge) {
        await userBadge.update({ progress });
      } else {
        await UserBadge.create({
          userId,
          badgeId: badge.id,
          progress,
        });
      }

      if (achieved && !userBadge?.achievedAt) {
        await UserBadge.update(
          { achievedAt: new Date() },
          { where: { userId, badgeId: badge.id } }
        );

        // Award XP
        await addExperience(userId, badge.xpReward);

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

    // Check and award badges
    const newBadges = await checkAndAwardBadges(userId);

    return {
      newAchievements,
      newBadges,
      userLevel: await UserLevel.findOne({ where: { userId } }),
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

// Get leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const { type = 'level', limit = 20 } = req.query;

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

    const leaders = await UserLevel.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: orderField,
      limit: parseInt(limit),
    });

    // Get current user's rank
    const userId = req.userId;
    const allUsers = await UserLevel.findAll({ order: orderField });
    const userRank = allUsers.findIndex(user => user.userId === userId) + 1;

    res.json({
      success: true,
      data: {
        leaders: leaders.map((leader, index) => ({
          rank: index + 1,
          ...leader.toJSON(),
        })),
        userRank: userRank > 0 ? userRank : null,
        totalUsers: allUsers.length,
      },
    });
  } catch (error) {
    console.error("Get leaderboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};