import React from 'react';
import { useSelector } from 'react-redux';

export const useDashboardData = () => {
  const { initialBalance, currentBalance } = useSelector((state) => state.balance);
  const { trades = [], stats: tradeStats = {} } = useSelector((state) => state.trades);
  const { target, targetProgress } = useSelector((state) => state.target);
  
  // Calculate stats seperti di Layout
  const stats = React.useMemo(() => {
    if (Object.keys(tradeStats).length > 0) {
      return {
        ...tradeStats,
        initialBalance: initialBalance || 0,
        currentBalance: currentBalance || 0,
      };
    }

    // Fallback calculation
    const totalTrades = trades.length;
    const wins = trades.filter((e) => e.result?.toLowerCase().includes("win")).length;
    const netProfit = trades.reduce((sum, e) => sum + (e.profit || 0), 0);
    const avgProfit = totalTrades ? Math.round(netProfit / totalTrades) : 0;
    const winRate = totalTrades ? Math.round((wins / totalTrades) * 100) : 0;

    return {
      totalTrades,
      wins,
      netProfit,
      avgProfit,
      winRate,
      currentBalance: currentBalance || 0,
      initialBalance: initialBalance || 0,
    };
  }, [trades, tradeStats, initialBalance, currentBalance]);

  return {
    stats,
    initialBalance: initialBalance || 0,
    currentBalance: currentBalance || 0,
    target,
    targetProgress,
  };
};