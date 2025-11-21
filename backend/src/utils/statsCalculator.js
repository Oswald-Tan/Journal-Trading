import Trade from '../models/trade.js';
import User from '../models/user.js';

export const calculateStats = async (userId) => {
  try {
    const trades = await Trade.findAll({
      where: { userId },
      order: [['date', 'ASC']]
    });

    const user = await User.findByPk(userId);

    const totalTrades = trades.length;
    const wins = trades.filter(trade => trade.result === 'Win').length;
    const losses = trades.filter(trade => trade.result === 'Lose').length;
    const breakEvens = trades.filter(trade => trade.result === 'Break Even').length;
    
    const netProfit = trades.reduce((sum, trade) => sum + parseFloat(trade.profit), 0);
    const avgProfit = totalTrades > 0 ? netProfit / totalTrades : 0;
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;

    const totalPips = trades.reduce((sum, trade) => sum + (trade.pips || 0), 0);
    const avgPips = totalTrades > 0 ? totalPips / totalTrades : 0;

    const roi = user.initialBalance > 0 ? 
      ((user.currentBalance - user.initialBalance) / user.initialBalance) * 100 : 0;

    const profitTrades = trades.filter(t => t.profit > 0);
    const lossTrades = trades.filter(t => t.profit < 0);
    
    const largestWin = profitTrades.length > 0 ? 
      Math.max(...profitTrades.map(t => t.profit)) : 0;
    const largestLoss = lossTrades.length > 0 ? 
      Math.min(...lossTrades.map(t => t.profit)) : 0;

    const totalWins = profitTrades.reduce((sum, t) => sum + t.profit, 0);
    const totalLosses = Math.abs(lossTrades.reduce((sum, t) => sum + t.profit, 0));
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 999 : 0;

    return {
      totalTrades,
      wins,
      losses,
      breakEvens,
      netProfit,
      avgProfit,
      winRate: Math.round(winRate * 100) / 100,
      currentBalance: user.currentBalance,
      initialBalance: user.initialBalance,
      totalPips,
      avgPips: Math.round(avgPips),
      roi: Math.round(roi * 100) / 100,
      largestWin,
      largestLoss,
      profitFactor: Math.round(profitFactor * 100) / 100
    };
  } catch (error) {
    console.error('Stats calculation error:', error);
    throw error;
  }
};