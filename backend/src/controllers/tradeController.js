import Trade from '../models/trade.js';
import User from '../models/user.js';
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