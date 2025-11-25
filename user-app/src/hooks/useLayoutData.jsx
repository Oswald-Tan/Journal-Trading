import { useMemo } from "react";
import { useSelector } from "react-redux";
import { subscriptionPlans } from "../constants/subscriptionPlans";

export const useLayoutData = () => {
  const { user } = useSelector((state) => state.auth);
  const {
    target,
    targetProgress,
    isLoading: targetLoading,
  } = useSelector((state) => state.target);
  const {
    initialBalance,
    currentBalance,
    isLoading: balanceLoading,
  } = useSelector((state) => state.balance);
  const { trades = [], stats: tradeStats = {} } = useSelector(
    (state) => state.trades
  );

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    // Gunakan trade stats dari Redux jika available
    if (Object.keys(tradeStats).length > 0) {
      return {
        ...tradeStats,
        initialBalance: initialBalance || 0,
        currentBalance: currentBalance || 0,
        targetProgress: targetProgress || null,
      };
    }

    // Fallback ke perhitungan manual jika tradeStats tidak ada
    const totalTrades = trades.length;
    const wins = trades.filter((e) =>
      e.result?.toLowerCase().includes("win")
    ).length;
    const losses = trades.filter((e) =>
      e.result?.toLowerCase().includes("lose")
    ).length;
    const netProfit = trades.reduce((sum, e) => sum + (e.profit || 0), 0);
    const avgProfit = totalTrades ? Math.round(netProfit / totalTrades) : 0;
    const winRate = totalTrades ? Math.round((wins / totalTrades) * 100) : 0;

    const totalPips = trades.reduce((sum, e) => sum + (e.pips || 0), 0);
    const avgPips = totalTrades ? Math.round(totalPips / totalTrades) : 0;
    const currentBalanceValue = currentBalance || 0;
    const initialBalanceValue = initialBalance || 0;
    const roi =
      initialBalanceValue > 0
        ? (
            ((currentBalanceValue - initialBalanceValue) /
              initialBalanceValue) *
            100
          ).toFixed(2)
        : 0;

    const winTrades = trades.filter((t) => t.profit > 0);
    const lossTrades = trades.filter((t) => t.profit < 0);
    const largestWin =
      winTrades.length > 0 ? Math.max(...winTrades.map((t) => t.profit)) : 0;
    const largestLoss =
      lossTrades.length > 0 ? Math.min(...lossTrades.map((t) => t.profit)) : 0;

    const profitFactor =
      wins > 0 && losses > 0
        ? (wins * avgProfit) / Math.abs(losses * avgProfit)
        : wins > 0
        ? 999
        : 0;

    return {
      totalTrades,
      wins,
      losses,
      netProfit,
      avgProfit,
      winRate,
      currentBalance: currentBalanceValue,
      totalPips,
      avgPips,
      roi,
      largestWin,
      largestLoss,
      initialBalance: initialBalanceValue,
      profitFactor,
      targetProgress: targetProgress || null,
    };
  }, [trades, tradeStats, initialBalance, currentBalance, targetProgress]);

  return {
    user,
    target: target || { enabled: false },
    targetProgress,
    targetLoading,
    initialBalance: initialBalance || 0,
    currentBalance: currentBalance || 0,
    balanceLoading,
    trades,
    tradeStats,
    stats,
    subscriptionPlans
  };
};