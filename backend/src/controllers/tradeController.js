import Target from '../models/target.js';
import Trade from '../models/trade.js';
import User from '../models/user.js';
import { generateTradingReportPDF } from '../utils/pdfGenerator.js';
import { calculateStats } from '../utils/statsCalculator.js';
import { processTradeForGamification } from './gamificationController.js';

// Get all trades for user
export const getTrades = async (req, res) => {
  try {
    const trades = await Trade.findAll({
      where: { userId: req.userId },
      order: [['date', 'DESC'], ['created_at', 'DESC']],
    });

    // Format data untuk memastikan konsistensi number
    const formattedTrades = trades.map(trade => ({
      ...trade.toJSON(),
      entry: parseFloat(trade.entry),
      exit: trade.exit ? parseFloat(trade.exit) : null,
      stop: trade.stop ? parseFloat(trade.stop) : null,
      take: trade.take ? parseFloat(trade.take) : null,
      lot: parseFloat(trade.lot),
      profit: parseFloat(trade.profit),
      balanceAfter: parseFloat(trade.balanceAfter),
      pips: parseInt(trade.pips),
      riskReward: trade.riskReward ? parseFloat(trade.riskReward) : 0
    }));

    res.json({
      success: true,
      data: formattedTrades,
      count: trades.length,
      message: 'Trades retrieved successfully'
    });
  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
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
        userId: req.userId 
      }
    });

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: 'Trade not found'
      });
    }

    res.json({
      success: true,
      data: trade
    });
  } catch (error) {
    console.error('Get trade error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create new trade
export const createTrade = async (req, res) => {
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
      notes
    } = req.body;

    // Validate required fields
    if (!date || !instrument || !type || !lot || !entry) {
      return res.status(400).json({
        success: false,
        message: 'Date, instrument, type, lot, and entry are required'
      });
    }

    // Get user's current balance
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Parse semua nilai numerik
    const parsedLot = parseFloat(lot);
    const parsedEntry = parseFloat(entry);
    const parsedExit = exit ? parseFloat(exit) : null;
    const parsedStop = stop ? parseFloat(stop) : null;
    const parsedTake = take ? parseFloat(take) : null;

    // Handle profit berdasarkan result
    let finalProfit = profit ? parseFloat(profit) : 0;
    
    // Jika result adalah "Lose" dan profit positif, ubah menjadi negatif
    if (result && result.toLowerCase().includes('lose') && finalProfit > 0) {
      finalProfit = -finalProfit;
    }
    
    // Jika result adalah "Win" dan profit negatif, ubah menjadi positif
    if (result && result.toLowerCase().includes('win') && finalProfit < 0) {
      finalProfit = Math.abs(finalProfit);
    }

    // Hitung pips jika tidak disediakan
    let finalPips = pips ? parseInt(pips) : 0;
    if (!pips && parsedExit && parsedEntry) {
      // Hitung pips otomatis berdasarkan perbedaan entry dan exit
      finalPips = Math.abs(Math.round((parsedExit - parsedEntry) * 10000));
    }

    // Hitung balanceAfter dengan benar
    const newBalance = parseFloat(user.currentBalance) + finalProfit;

    // Tentukan result secara otomatis jika tidak disediakan
    let finalResult = result;
    if (!result || result === "Pending") {
      finalResult = finalProfit > 0 ? 'Win' : finalProfit < 0 ? 'Lose' : 'Break Even';
    }

    // Hitung riskReward jika tidak disediakan
    let finalRiskReward = riskReward ? parseFloat(riskReward) : 0;
    if (!riskReward && parsedStop && parsedTake && parsedEntry) {
      const risk = Math.abs(parsedEntry - parsedStop);
      const reward = Math.abs(parsedTake - parsedEntry);
      if (risk > 0) {
        finalRiskReward = parseFloat((reward / risk).toFixed(2));
      }
    }

    // Create trade
    const trade = await Trade.create({
      userId: req.userId,
      date,
      instrument,
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
      riskReward: finalRiskReward,
      strategy: strategy || '',
      market: market || '',
      emotionBefore: emotionBefore || '',
      emotionAfter: emotionAfter || '',
      screenshot: screenshot || '',
      notes: notes || ''
    });

    // Update user's current balance
    await User.update(
      { currentBalance: newBalance },
      { where: { id: req.userId } }
    );

    // Process gamification
    const gamificationResult = await processTradeForGamification(req.userId, {
      profit: finalProfit,
      result: finalResult,
      // other trade data if needed
    });


    // Get updated stats
    const stats = await calculateStats(req.userId);

    res.status(201).json({
      success: true,
      message: 'Trade created successfully',
      data: trade,
      stats: stats,
      newBalance: newBalance,
      gamification: gamificationResult,
    });

  } catch (error) {
    console.error('Create trade error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update trade - DIPERBAIKI dengan logika yang lebih baik
export const updateTrade = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('Update request for trade:', id);
    console.log('Update data:', updateData);

    // Cari trade yang akan diupdate
    const trade = await Trade.findOne({
      where: {
        id: id,
        userId: req.userId
      }
    });

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: 'Trade not found'
      });
    }

    // Filter hanya field yang ada di model
    const allowedFields = [
      'date', 'instrument', 'type', 'lot', 'entry', 'stop', 'take', 'exit', 
      'pips', 'profit', 'result', 'riskReward', 'strategy', 'market', 
      'emotionBefore', 'emotionAfter', 'screenshot', 'notes'
    ];

    const updatedFields = {};
    let hasChanges = false;

    // Handle profit khusus
    if (updateData.profit !== undefined) {
      let profitValue = parseFloat(updateData.profit);
      
      // Sesuaikan tanda profit berdasarkan result
      if (updateData.result && updateData.result.toLowerCase().includes('lose') && profitValue > 0) {
        profitValue = -profitValue;
      }
      if (updateData.result && updateData.result.toLowerCase().includes('win') && profitValue < 0) {
        profitValue = Math.abs(profitValue);
      }
      
      // Cek apakah profit berubah
      if (profitValue !== parseFloat(trade.profit)) {
        updatedFields.profit = profitValue;
        hasChanges = true;
        console.log('Profit changed:', profitValue);
      }
    }

    // Loop melalui field lainnya
    for (const field of allowedFields) {
      if (field !== 'profit' && updateData[field] !== undefined) {
        let newValue = updateData[field];
        
        // Convert number fields
        if (['lot', 'entry', 'stop', 'take', 'exit', 'riskReward'].includes(field)) {
          newValue = newValue !== null && newValue !== '' ? parseFloat(newValue) : null;
        } else if (field === 'pips') {
          newValue = newValue !== null && newValue !== '' ? parseInt(newValue) : 0;
        }

        // Handle perbandingan null/undefined
        const oldValue = trade[field];
        const normalizedOldValue = oldValue === null || oldValue === undefined ? '' : oldValue;
        const normalizedNewValue = newValue === null || newValue === undefined ? '' : newValue;

        // Cek apakah ada perubahan
        if (JSON.stringify(normalizedOldValue) !== JSON.stringify(normalizedNewValue)) {
          updatedFields[field] = newValue;
          hasChanges = true;
          console.log(`Field ${field} changed:`, { old: normalizedOldValue, new: normalizedNewValue });
        }
      }
    }

    console.log('Has changes:', hasChanges);
    console.log('Updated fields:', updatedFields);

    // Jika tidak ada perubahan, return tanpa update
    if (!hasChanges) {
      return res.json({
        success: true,
        message: 'No changes detected',
        data: trade,
        unchanged: true
      });
    }

    // Update trade
    await trade.update(updatedFields);

    // Jika profit berubah, recalculate balances
    if (updatedFields.profit !== undefined) {
      await recalculateBalances(req.userId);
      // Reload trade untuk mendapatkan balanceAfter yang baru
      await trade.reload();
    }

    // Get updated stats
    const stats = await calculateStats(req.userId);

    res.json({
      success: true,
      message: 'Trade updated successfully',
      data: trade,
      stats: stats
    });

  } catch (error) {
    console.error('Update trade error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// Delete trade
export const deleteTrade = async (req, res) => {
  try {
    const { id } = req.params;
    
    const trade = await Trade.findOne({
      where: {
        id: id,
        userId: req.userId
      }
    });

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: 'Trade not found'
      });
    }

    // Hapus trade
    await trade.destroy();

    // Recalculate all balances setelah delete
    await recalculateBalances(req.userId);

    // Get updated stats
    const stats = await calculateStats(req.userId);

    res.json({
      success: true,
      message: 'Trade deleted successfully',
      stats: stats
    });

  } catch (error) {
    console.error('Delete trade error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Recalculate balances helper function
const recalculateBalances = async (userId) => {
  try {
    const trades = await Trade.findAll({
      where: { userId },
      order: [['date', 'ASC'], ['created_at', 'ASC']]
    });

    const user = await User.findByPk(userId);
    let runningBalance = parseFloat(user.initialBalance);

    // Update semua balanceAfter berdasarkan urutan kronologis
    for (const trade of trades) {
      runningBalance += parseFloat(trade.profit);
      await trade.update({ 
        balanceAfter: parseFloat(runningBalance.toFixed(2))
      });
    }

    // Update user's current balance
    await User.update(
      { currentBalance: parseFloat(runningBalance.toFixed(2)) },
      { where: { id: userId } }
    );

    return runningBalance;
  } catch (error) {
    console.error('Recalculate balances error:', error);
    throw error;
  }
};

// Delete all trades for user
export const deleteAllTrades = async (req, res) => {
  try {
    const userId = req.userId;
    
    console.log(`Deleting all trades and resetting target for user: ${userId}`);
    
    // Cek apakah user memiliki trades
    const tradeCount = await Trade.count({
      where: { userId }
    });

    console.log(`Found ${tradeCount} trades to delete`);

    if (tradeCount === 0) {
      return res.status(200).json({
        success: true,
        message: 'No trades to delete',
        deletedCount: 0
      });
    }

    // 1. Hapus semua trades user
    const deletedCount = await Trade.destroy({
      where: { userId }
    });

    console.log(`Deleted ${deletedCount} trades successfully`);

    // 2. Reset balance ke initial balance
    const user = await User.findByPk(userId);
    let newBalance = user.initialBalance;
    
    if (user) {
      await user.update({
        currentBalance: user.initialBalance
      });
      console.log(`Reset balance to initial: ${user.initialBalance}`);
    }

    // 3. Reset atau nonaktifkan target user dan set targetBalance ke 0
    let targetAction = 'none';
    const target = await Target.findOne({
      where: { userId }
    });

    if (target) {
      if (target.enabled) {
        // Nonaktifkan target karena tidak ada data trades dan set targetBalance ke 0
        await target.update({
          enabled: false,
          targetBalance: 0, // Set targetBalance menjadi 0
          targetDate: null, // Reset targetDate
          description: target.description ? 
            `${target.description} (Target dinonaktifkan karena semua trades dihapus)` : 
            'Target dinonaktifkan karena semua trades dihapus',
          updated_at: new Date()
        });
        targetAction = 'disabled';
        console.log(`Target disabled and balance reset to 0 for user: ${userId}`);
      } else {
        // Jika target sudah dinonaktifkan, pastikan targetBalance = 0
        if (parseFloat(target.targetBalance) !== 0) {
          await target.update({
            targetBalance: 0,
            targetDate: null,
            updated_at: new Date()
          });
          targetAction = 'balance_reset';
          console.log(`Target balance reset to 0 for user: ${userId}`);
        } else {
          targetAction = 'already_disabled';
        }
      }
    } else {
      targetAction = 'no_target';
    }

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${deletedCount} trades`,
      deletedCount: deletedCount,
      newBalance: newBalance,
      targetAction: targetAction,
      note: targetAction === 'disabled' ? 
        'Target telah dinonaktifkan dan balance direset ke 0 karena semua data trading dihapus' : 
        targetAction === 'balance_reset' ? 
        'Target balance direset ke 0 karena semua data trading dihapus' : undefined
    });

  } catch (error) {
    console.error('Delete all trades error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
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
      order: [['date', 'DESC']],
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
      profitDistributionData: calculateProfitDistribution(trades)
    };

    // Generate PDF
    const pdfBuffer = await generateTradingReportPDF(trades, stats, user, analyticsData);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=trading-report-${Date.now()}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Send PDF
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Export PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF report'
    });
  }
};

// Helper functions for analytics data
const calculateWinLossData = (trades) => {
  const resultStats = { Win: 0, Lose: 0, 'Break Even': 0 };
  
  trades.forEach(entry => {
    if (entry.result) {
      const result = entry.result.toLowerCase();
      if (result.includes('win')) resultStats['Win']++;
      else if (result.includes('lose')) resultStats['Lose']++;
      else if (result.includes('break')) resultStats['Break Even']++;
    }
  });
  
  return [
    { name: 'Wins', value: resultStats['Win'], color: '#10b981' },
    { name: 'Losses', value: resultStats['Lose'], color: '#ef4444' },
    { name: 'Break Even', value: resultStats['Break Even'], color: '#f59e0b' }
  ].filter(item => item.value > 0);
};

const calculateInstrumentPerformance = (trades) => {
  const instrumentStats = {};
  
  trades.forEach(entry => {
    if (!entry.instrument) return;
    
    if (!instrumentStats[entry.instrument]) {
      instrumentStats[entry.instrument] = { profit: 0, trades: 0, wins: 0 };
    }
    instrumentStats[entry.instrument].profit += entry.profit || 0;
    instrumentStats[entry.instrument].trades += 1;
    if (entry.result?.toLowerCase().includes('win')) {
      instrumentStats[entry.instrument].wins += 1;
    }
  });
  
  return Object.entries(instrumentStats)
    .map(([instrument, data]) => ({
      instrument,
      profit: data.profit,
      trades: data.trades,
      winRate: Math.round((data.wins / data.trades) * 100) || 0
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
  timeSlots.forEach(slot => {
    timeStats[slot.name] = { profit: 0, trades: 0, wins: 0 };
  });

  trades.forEach((entry) => {
    if (!entry.date) return;

    const hour = new Date(entry.date).getHours();
    
    // Cari slot yang sesuai
    const slot = timeSlots.find(s => hour >= s.min && hour <= s.max);
    if (!slot) return; // Jika tidak ditemukan (seharusnya tidak terjadi)

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
      winRate: data.trades > 0 ? Math.round((data.wins / data.trades) * 100) : 0,
      avgProfit: data.trades > 0 ? Math.round(data.profit / data.trades) : 0,
    }))
    .filter((item) => item.trades > 0);
};

// Tambahkan juga fungsi-fungsi tambahan lainnya yang mungkin dibutuhkan
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