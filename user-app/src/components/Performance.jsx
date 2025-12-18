import React, { useEffect, useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { getTrades } from "../features/tradeSlice";
import {
  formatCurrency,
  formatBalance,
  formatCompactCurrency,
} from "../utils/currencyFormatter";
import {
  BarChart3,
  Target,
  Zap,
  TrendingUp,
  PieChart,
  DollarSign,
  Award,
  TrendingDown,
  Shield,
  ArrowUpDown,
  FileText,
  AlertTriangle,
  Download,
  Plus,
  Calendar,
  Star,
  Crown,
  Trophy,
  Lock,
  Rocket,
  Users,
  Clock,
  ChartBar,
  Target as TargetIcon,
} from "lucide-react";
import UpgradeRequiredModal from "../components/modals/UpgradeRequiredModal";
import Swal from "sweetalert2";

// Komponen LockedOverlay dengan min-height yang lebih baik
const LockedOverlay = ({ onUpgrade, title = "Advanced Feature" }) => (
  <Motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="absolute inset-0 bg-linear-to-b from-white/95 via-white/90 to-white/85 backdrop-blur-sm rounded-3xl z-10 flex flex-col items-center justify-center p-6 border border-white/50 min-h-[320px]"
  >
    <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center mb-4 border-2 border-violet-400/30 shadow-inner">
      <Lock className="w-8 h-8 text-violet-700" />
    </div>
    <h4 className="text-slate-800 text-xl text-center font-bold mb-2">
      {title} Locked
    </h4>
    <p className="text-slate-700 text-center mb-6 font-medium max-w-sm">
      Upgrade to Pro plan to unlock this premium feature
    </p>
    <Motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onUpgrade}
      className="bg-linear-to-r from-violet-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 hover:from-violet-700 hover:to-purple-700"
    >
      <Zap className="w-5 h-5" />
      Upgrade to Pro
    </Motion.button>
  </Motion.div>
);

// Komponen StatCard
const StatCard = ({
  label,
  value,
  color,
  bg,
  border,
  icon,
  isLocked = false,
  onUpgrade,
}) => (
  <Motion.div
    whileHover={{ scale: isLocked ? 1 : 1.03, y: isLocked ? 0 : -2 }}
    className={`p-5 rounded-2xl border-2 ${border} ${bg} shadow-sm hover:shadow-sm transition-all duration-300 relative ${
      isLocked ? "cursor-pointer" : ""
    }`}
    onClick={isLocked ? onUpgrade : undefined}
  >
    {isLocked && (
      <div className="absolute -top-2 -right-2">
        <span className="text-xs bg-violet-600 text-white px-2 py-1 rounded-full font-bold">
          PRO
        </span>
      </div>
    )}
    <div className="flex items-center justify-between mb-2">
      <div className="text-sm text-slate-700 font-medium">{label}</div>
      <div className={`${color} ${isLocked ? "opacity-50" : ""}`}>{icon}</div>
    </div>
    <div
      className={`text-xl md:text-2xl font-bold ${color} ${
        isLocked ? "blur-sm select-none" : ""
      }`}
    >
      {isLocked ? "••••" : value}
    </div>
    {isLocked && (
      <div className="mt-2 text-xs text-violet-600 font-medium flex items-center gap-1">
        <Lock className="w-3 h-3" />
        Upgrade to view
      </div>
    )}
  </Motion.div>
);

// Komponen PerformanceTable dengan min-height yang fleksibel
// TAMBAHKAN PARAMETER currency DAN formatAvgProfit
const PerformanceTable = ({
  title,
  data,
  icon,
  isLocked = false,
  onUpgrade,
  currency, // TAMBAHKAN
  formatAvgProfit, // TAMBAHKAN
}) => {
  const navigate = useNavigate();

  // Hitung tinggi minimum berdasarkan apakah ada data atau tidak
  const minHeightClass = isLocked 
    ? data.length > 0 ? 'min-h-[400px]' : 'min-h-[320px]'
    : '';

  return (
    <div className={`relative ${minHeightClass}`}>
      {isLocked && <LockedOverlay onUpgrade={onUpgrade} title={title} />}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 overflow-hidden shadow-sm h-full ${
          isLocked ? "opacity-70" : ""
        }`}
        style={isLocked ? { minHeight: data.length > 0 ? '400px' : '320px' } : {}}
      >
        <div className="p-6 border-b-2 border-slate-200 bg-linear-to-r from-slate-50 to-violet-50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {icon}
            {title}
            {isLocked && (
              <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full font-bold">
                PRO
              </span>
            )}
          </h3>
        </div>
        <div className="overflow-x-auto h-full">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-linear-to-r from-slate-50 to-violet-50 whitespace-nowrap">
                <th className="text-left p-4 text-sm font-bold text-slate-800">
                  Instrument
                </th>
                <th className="text-left p-4 text-sm font-bold text-slate-800">
                  Trades
                </th>
                <th className="text-left p-4 text-sm font-bold text-slate-800">
                  Win Rate
                </th>
                <th className="text-left p-4 text-sm font-bold text-slate-800">
                  Total Profit
                </th>
                <th className="text-left p-4 text-sm font-bold text-slate-800">
                  Avg Profit
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <Motion.tr
                  key={`${item.instrument}-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-slate-100 hover:bg-linear-to-r hover:from-slate-50 hover:to-violet-50 transition-all whitespace-nowrap"
                >
                  <td className="p-4 text-sm font-bold text-violet-700">
                    {item.instrument}
                  </td>
                  <td className="p-4 text-sm text-slate-700 font-medium">
                    {item.trades}
                  </td>
                  <td className="p-4 text-sm font-bold text-violet-600">
                    {isLocked ? "••%" : `${item.winRate}%`}
                  </td>
                  {/* GUNAKAN currency DARI PROPS */}
                  <td className="p-4 text-sm font-bold text-slate-600">
                    {isLocked ? "••••" : formatBalance(item.profit, currency)}
                  </td>
                  {/* GUNAKAN formatAvgProfit DARI PROPS */}
                  <td className="p-4 text-sm font-bold text-slate-600">
                    {isLocked ? "••••" : formatAvgProfit(item.avgProfit)}
                  </td>
                </Motion.tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                    <p className="font-medium">No data available</p>
                    <p className="text-sm mt-1 font-light">
                      Start adding trades to see performance data
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Motion.div>
    </div>
  );
};

// Komponen ChartCard dengan min-height yang fleksibel
const ChartCard = ({
  title,
  children,
  className = "",
  icon,
  isLocked = false,
  onUpgrade,
}) => {
  const navigate = useNavigate();

  return (
    <div className={`relative ${isLocked ? 'min-h-[300px]' : ''} ${className}`}>
      {isLocked && <LockedOverlay onUpgrade={onUpgrade} title={title} />}
      <div
        className={`bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 h-full ${
          isLocked ? "opacity-70" : ""
        }`}
        style={isLocked ? { minHeight: '300px' } : {}}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {icon}
            {title}
            {isLocked && (
              <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full font-bold">
                PRO
              </span>
            )}
          </h3>
        </div>
        {children}
      </div>
    </div>
  );
};

const Performance = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State untuk tracking data loading
  const [dataFetched, setDataFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeModalConfig, setUpgradeModalConfig] = useState({
    featureKey: "",
    featureName: "",
    customDescription: "",
  });

  // Ambil data dari Redux store
  const { trades = [], stats: reduxStats = {} } = useSelector(
    (state) => state.trades
  );
  const { initialBalance, currentBalance, currency } = useSelector(
    (state) => state.balance
  );
  const { subscription } = useSelector((state) => state.subscription);

  // Cek apakah user memiliki akses Pro
  const hasProAccess =
    subscription?.plan === "pro" || subscription?.plan === "lifetime";

  // Fungsi untuk membuka modal upgrade
  const openUpgradeModal = (featureKey, featureName, customDescription) => {
    setUpgradeModalConfig({
      featureKey,
      featureName,
      customDescription,
    });
    setShowUpgradeModal(true);
  };

  // Debug log
  useEffect(() => {
    console.log("🔍 Performance Data Check:");
    console.log("- Trades count:", trades.length);
    console.log("- Redux stats:", reduxStats);
    console.log("- Currency:", currency);
    console.log("- Subscription plan:", subscription?.plan);
    console.log("- Has Pro Access:", hasProAccess);

    if (trades.length > 0) {
      console.log("- Sample trade:", trades[0]);
    }
  }, [trades, reduxStats, currency, subscription, hasProAccess]);

  // Fetch data dengan kondisi yang lebih ketat
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (trades.length === 0) {
          console.log("🔄 Performance: Fetching trades...");
          await dispatch(getTrades()).unwrap();
          console.log("✅ Performance: Trades fetched successfully");
        }
      } catch (error) {
        console.error("❌ Performance: Failed to fetch trades:", error);
      } finally {
        setIsLoading(false);
        setDataFetched(true);
      }
    };

    fetchData();
  }, [dispatch, trades.length]);

  // Hitung statistik dari trades
  const calculateStatsFromTrades = (tradesData, initialBal) => {
    if (!tradesData || tradesData.length === 0) {
      return {
        netProfit: 0,
        winRate: 0,
        profitFactor: 0,
        avgProfit: 0,
        roi: 0,
        totalPips: 0,
        totalTrades: 0,
        wins: 0,
        losses: 0,
        largestWin: 0,
        largestLoss: 0,
      };
    }

    let netProfit = 0;
    let totalPips = 0;
    let wins = 0;
    let losses = 0;
    let breakEven = 0;
    let totalWinAmount = 0;
    let totalLossAmount = 0;
    let largestWin = 0;
    let largestLoss = 0;

    tradesData.forEach((trade) => {
      const profit = parseFloat(trade.profit) || 0;
      netProfit += profit;
      totalPips += parseInt(trade.pips) || 0;

      if (trade.result?.toLowerCase().includes("win")) {
        wins++;
        totalWinAmount += Math.max(profit, 0);
        if (profit > largestWin) largestWin = profit;
      } else if (trade.result?.toLowerCase().includes("lose")) {
        losses++;
        totalLossAmount += Math.abs(Math.min(profit, 0));
        if (profit < largestLoss) largestLoss = profit;
      } else if (trade.result?.toLowerCase().includes("break")) {
        breakEven++;
      }
    });

    const totalTrades = tradesData.length;
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    const profitFactor =
      totalLossAmount > 0
        ? totalWinAmount / totalLossAmount
        : totalWinAmount > 0
        ? Infinity
        : 0;
    const avgProfit = totalTrades > 0 ? netProfit / totalTrades : 0;
    const roi = initialBal > 0 ? (netProfit / initialBal) * 100 : 0;

    return {
      netProfit,
      winRate: Math.round(winRate * 100) / 100,
      profitFactor: isFinite(profitFactor)
        ? Math.round(profitFactor * 100) / 100
        : 0,
      avgProfit: Math.round(avgProfit * 100) / 100,
      roi: Math.round(roi * 100) / 100,
      totalPips,
      totalTrades,
      wins,
      losses,
      breakEven,
      largestWin,
      largestLoss,
    };
  };

  // Gabungkan stats dari Redux dan perhitungan manual
  const safeStats = useMemo(() => {
    const calculatedStats = calculateStatsFromTrades(trades, initialBalance);

    // Prioritaskan stats dari Redux, gunakan calculated sebagai fallback
    const merged = {
      ...calculatedStats,
      ...reduxStats,
    };

    console.log("📊 Merged Stats:", {
      reduxStats,
      calculatedStats,
      merged,
      avgProfit: merged.avgProfit,
      avgProfitFromRedux: reduxStats.avgProfit,
      avgProfitFromCalculated: calculatedStats.avgProfit,
    });

    return merged;
  }, [trades, reduxStats, initialBalance]);

  // Monthly performance data
  const monthlyData = useMemo(() => {
    console.log(
      "📈 Calculating monthly performance from:",
      trades.length,
      "trades"
    );

    if (trades.length === 0) {
      console.log("⚠️ No trades for monthly performance");
      return [];
    }

    const monthlyStats = {};

    trades.forEach((entry, index) => {
      if (!entry.date) {
        console.warn(`Entry ${index} has no date! Skipping.`, entry);
        return;
      }

      // Parse tanggal dengan benar
      let dateObj;
      try {
        dateObj = new Date(entry.date);
        if (isNaN(dateObj.getTime())) {
          console.warn(`Entry ${index} has invalid date format: ${entry.date}`);
          return;
        }
      } catch (error) {
        console.warn(`Entry ${index} date parsing error:`, error);
        return;
      }

      // Format bulan: YYYY-MM
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const monthKey = `${year}-${month}`;

      // Inisialisasi data bulanan jika belum ada
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = {
          profit: 0,
          trades: 0,
          wins: 0,
          losses: 0,
          breakEven: 0,
          totalProfit: 0,
        };
      }

      // Tambahkan data
      const profit = parseFloat(entry.profit) || 0;
      monthlyStats[monthKey].profit += profit;
      monthlyStats[monthKey].totalProfit += profit;
      monthlyStats[monthKey].trades += 1;

      if (entry.result?.toLowerCase().includes("win")) {
        monthlyStats[monthKey].wins += 1;
      } else if (entry.result?.toLowerCase().includes("lose")) {
        monthlyStats[monthKey].losses += 1;
      } else if (entry.result?.toLowerCase().includes("break")) {
        monthlyStats[monthKey].breakEven += 1;
      }
    });

    // Konversi ke array dan hitung statistik turunan
    const result = Object.entries(monthlyStats)
      .map(([month, data]) => {
        const winRate =
          data.trades > 0 ? Math.round((data.wins / data.trades) * 100) : 0;
        const avgProfit =
          data.trades > 0
            ? parseFloat((data.profit / data.trades).toFixed(2))
            : 0;

        return {
          month,
          profit: data.profit,
          totalProfit: data.totalProfit,
          trades: data.trades,
          wins: data.wins,
          losses: data.losses,
          breakEven: data.breakEven,
          winRate,
          avgProfit,
        };
      })
      .sort((a, b) => a.month.localeCompare(b.month));

    console.log("📊 Monthly Performance Data:", result);
    if (result.length > 0) {
      console.log("📊 First month sample:", result[0]);
      console.log(
        "📊 AvgProfit values:",
        result.map((m) => ({ month: m.month, avgProfit: m.avgProfit }))
      );
    }

    return result;
  }, [trades]);

  // Best performing instruments
  const bestInstruments = useMemo(() => {
    if (trades.length === 0) return [];

    const instrumentStats = {};
    trades.forEach((entry) => {
      if (!entry.instrument) return;

      if (!instrumentStats[entry.instrument]) {
        instrumentStats[entry.instrument] = { profit: 0, trades: 0, wins: 0 };
      }
      instrumentStats[entry.instrument].profit += parseFloat(entry.profit) || 0;
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
        winRate:
          data.trades > 0 ? Math.round((data.wins / data.trades) * 100) : 0,
        avgProfit:
          data.trades > 0
            ? parseFloat((data.profit / data.trades).toFixed(2))
            : 0,
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);
  }, [trades]);

  // Worst performing instruments
  const worstInstruments = useMemo(() => {
    if (trades.length === 0) return [];

    const instrumentStats = {};
    trades.forEach((entry) => {
      if (!entry.instrument) return;

      if (!instrumentStats[entry.instrument]) {
        instrumentStats[entry.instrument] = { profit: 0, trades: 0, wins: 0 };
      }
      instrumentStats[entry.instrument].profit += parseFloat(entry.profit) || 0;
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
        winRate:
          data.trades > 0 ? Math.round((data.wins / data.trades) * 100) : 0,
        avgProfit:
          data.trades > 0
            ? parseFloat((data.profit / data.trades).toFixed(2))
            : 0,
      }))
      .sort((a, b) => a.profit - b.profit)
      .slice(0, 5);
  }, [trades]);

  // Weekly performance trend
  const weeklyTrendData = useMemo(() => {
    if (trades.length === 0) return [];

    const weeklyStats = {};
    trades.forEach((entry) => {
      if (!entry.date) return;

      try {
        const date = new Date(entry.date);
        const weekNumber = Math.ceil(
          (date.getDate() + (date.getDay() || 7)) / 7
        );
        const week = `${date.getFullYear()}-W${String(weekNumber).padStart(
          2,
          "0"
        )}`;

        if (!weeklyStats[week]) {
          weeklyStats[week] = { profit: 0, trades: 0 };
        }
        weeklyStats[week].profit += parseFloat(entry.profit) || 0;
        weeklyStats[week].trades += 1;
      } catch (error) {
        console.error("Error parsing date:", entry.date, error);
        console.warn("Invalid date for weekly trend:", entry.date);
      }
    });

    return Object.entries(weeklyStats)
      .map(([week, data]) => ({
        week,
        profit: data.profit,
        trades: data.trades,
        avgProfit:
          data.trades > 0
            ? parseFloat((data.profit / data.trades).toFixed(2))
            : 0,
      }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-8);
  }, [trades]);

  // Performance metrics - BEBAS untuk semua user
  const performanceMetrics = [
  {
    label: "Total Profit",
    value: formatCompactCurrency(safeStats.netProfit || 0, currency),
    color: safeStats.netProfit >= 0 ? "text-emerald-600" : "text-rose-600",
    bg:
      safeStats.netProfit >= 0
        ? "bg-linear-to-br from-violet-50 via-emerald-50 to-violet-100"
        : "bg-linear-to-br from-violet-50 via-rose-50 to-violet-100",
    border:
      safeStats.netProfit >= 0 
        ? "border border-emerald-200/70" 
        : "border border-rose-200/70",
    icon: <DollarSign className="w-6 h-6" />,
    isLocked: false,
  },
  {
    label: "Win Rate",
    value: `${safeStats.winRate?.toFixed(1) || 0}%`,
    color: "text-violet-600",
    bg: "bg-linear-to-br from-violet-50 via-purple-50 to-violet-100",
    border: "border border-violet-200/70",
    icon: <Target className="w-6 h-6" />,
    isLocked: false,
  },
  {
    label: "Profit Factor",
    value: safeStats.profitFactor?.toFixed(2) || "0.00",
    color: "text-purple-600",
    bg: "bg-linear-to-br from-violet-50 via-purple-50 to-violet-100",
    border: "border border-purple-200/70",
    icon: <Zap className="w-6 h-6" />,
    isLocked: !hasProAccess, // LOCKED untuk Free
  },
  {
    label: "Avg Profit / Trade",
    value: formatBalance(safeStats.avgProfit || 0, currency),
    color: safeStats.avgProfit >= 0 ? "text-emerald-600" : "text-rose-600",
    bg:
      safeStats.avgProfit >= 0
        ? "bg-linear-to-br from-violet-50 via-emerald-50 to-violet-100"
        : "bg-linear-to-br from-violet-50 via-rose-50 to-violet-100",
    border:
      safeStats.avgProfit >= 0 
        ? "border border-emerald-200/70" 
        : "border border-rose-200/70",
    icon: <BarChart3 className="w-6 h-6" />,
    isLocked: !hasProAccess, // LOCKED untuk Free
  },
  {
    label: "Return on Investment",
    value: `${safeStats.roi?.toFixed(1) || 0}%`,
    color: Number(safeStats.roi) >= 0 ? "text-emerald-600" : "text-rose-600",
    bg:
      Number(safeStats.roi) >= 0
        ? "bg-linear-to-br from-violet-50 via-emerald-50 to-violet-100"
        : "bg-linear-to-br from-violet-50 via-rose-50 to-violet-100",
    border:
      Number(safeStats.roi) >= 0 
        ? "border border-emerald-200/70" 
        : "border border-rose-200/70",
    icon: <TrendingUp className="w-6 h-6" />,
    isLocked: false,
  },
  {
    label: "Total Pips",
    value: safeStats.totalPips?.toLocaleString() || "0",
    color: "text-amber-600",
    bg: "bg-linear-to-br from-violet-50 via-amber-50 to-violet-100",
    border: "border border-amber-200/70",
    icon: <PieChart className="w-6 h-6" />,
    isLocked: !hasProAccess, // LOCKED untuk Free
  },
];

  // Calculate consistency metrics
  const consistencyMetrics = useMemo(() => {
    if (trades.length === 0) {
      return {
        maxConsecutiveWins: 0,
        maxConsecutiveLosses: 0,
        maxDrawdown: 0,
        recoveryFactor: "0.0",
        currentStreak: 0,
      };
    }

    let consecutiveWins = 0;
    let maxConsecutiveWins = 0;
    let consecutiveLosses = 0;
    let maxConsecutiveLosses = 0;
    let currentStreak = 0;
    let maxDrawdown = 0;
    let peak = initialBalance || 0;
    let runningBalance = initialBalance || 0;

    // Sort entries by date
    const sortedEntries = [...trades].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    sortedEntries.forEach((entry) => {
      runningBalance += parseFloat(entry.profit) || 0;

      // Track peak and drawdown
      if (runningBalance > peak) {
        peak = runningBalance;
      }
      const drawdown = peak - runningBalance;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }

      // Track streaks
      if (entry.result?.toLowerCase().includes("win")) {
        consecutiveWins++;
        consecutiveLosses = 0;
        if (consecutiveWins > maxConsecutiveWins) {
          maxConsecutiveWins = consecutiveWins;
        }
        currentStreak = Math.max(currentStreak, consecutiveWins);
      } else if (entry.result?.toLowerCase().includes("lose")) {
        consecutiveLosses++;
        consecutiveWins = 0;
        if (consecutiveLosses > maxConsecutiveLosses) {
          maxConsecutiveLosses = consecutiveLosses;
        }
        currentStreak = Math.min(currentStreak, -consecutiveLosses);
      }
    });

    const recoveryFactor =
      maxDrawdown > 0 ? Math.abs(safeStats.netProfit / maxDrawdown) : 0;

    return {
      maxConsecutiveWins,
      maxConsecutiveLosses,
      maxDrawdown,
      recoveryFactor: recoveryFactor.toFixed(1),
      currentStreak: currentStreak > 0 ? currentStreak : currentStreak,
    };
  }, [trades, safeStats.netProfit, initialBalance]);

  // Custom Tooltip Formatter untuk chart
  const renderTooltipContent = (value, name) => {
    if (name === "profit" || name === "avgProfit" || name === "totalProfit") {
      return [
        formatCurrency(value, currency),
        name === "totalProfit" ? "Total Profit" : name,
      ];
    } else if (name === "winRate") {
      return [`${value}%`, "Win Rate"];
    }
    return [value, name];
  };

  // Format fungsi untuk avgProfit
  const formatAvgProfit = (value) => {
    // Jika value undefined/null, return 0
    if (value === undefined || value === null) {
      return formatBalance(0, currency);
    }

    // Convert ke number jika string
    const numValue = typeof value === "string" ? parseFloat(value) : value;

    // Jika NaN, return 0
    if (isNaN(numValue)) {
      return formatBalance(0, currency);
    }

    // Format dengan 4 desimal untuk nilai sangat kecil
    if (Math.abs(numValue) < 0.01 && numValue !== 0) {
      return `${currency} ${numValue.toFixed(4)}`;
    }

    // Format normal
    return formatBalance(numValue, currency);
  };

  // Format bulan untuk tampilan
  const formatMonthDisplay = (monthString) => {
    const [year, month] = monthString.split("-");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">
            Loading performance data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modal Upgrade */}
      {showUpgradeModal && (
        <UpgradeRequiredModal
          setShowUpgradeModal={() => setShowUpgradeModal(false)}
          featureKey={upgradeModalConfig.featureKey}
          featureName={upgradeModalConfig.featureName}
          customDescription={upgradeModalConfig.customDescription}
        />
      )}

      <div className="space-y-6 min-h-screen">
        {/* Header */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-violet-600" />
              Performance Metrics
            </h1>
            <p className="text-sm sm:text-sm md:text-base text-slate-600 mt-1 font-light">
              Detailed analysis of your trading performance
            </p>
          </div>

          <Motion.div whileHover={{ scale: 1.05 }} className="flex gap-3">
            <div
              className={`px-6 py-3 rounded-2xl shadow-sm border-2 ${
                safeStats.netProfit >= 0
                  ? "bg-linear-to-br from-emerald-100 to-green-100 text-emerald-800 border-emerald-300"
                  : "bg-linear-to-br from-rose-100 to-red-100 text-rose-800 border-rose-300"
              }`}
            >
              <div className="text-sm font-medium">Net P/L</div>
              <div className="font-bold text-xl">
                {formatCompactCurrency(safeStats.netProfit || 0, currency)}
              </div>
            </div>
          </Motion.div>
        </Motion.div>

        {/* Show message if no data */}
        {trades.length === 0 && (
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm p-12 text-center border border-slate-100"
          >
            <div className="max-w-md mx-auto">
              <Motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="mb-4"
              >
                <BarChart3 className="w-16 h-16 mx-auto text-slate-400" />
              </Motion.div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                No Trading Data Yet
              </h3>
              <p className="text-slate-600 mb-6 font-light">
                Start adding trades to see detailed performance metrics and
                insights.
              </p>
              <Motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/trades")}
                className="bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all shadow-sm font-medium flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Add Your First Trade
              </Motion.button>
            </div>
          </Motion.div>
        )}

        {/* Charts - Only show if there's data */}
        {trades.length > 0 && (
          <>
            {/* Key Metrics */}
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {performanceMetrics.map((metric, index) => (
                <StatCard
                  key={index}
                  label={metric.label}
                  value={metric.value}
                  color={metric.color}
                  bg={metric.bg}
                  border={metric.border}
                  icon={metric.icon}
                  isLocked={metric.isLocked}
                  onUpgrade={() =>
                    openUpgradeModal(
                      metric.label.toLowerCase().replace(/\s+/g, "_"),
                      metric.label,
                      `Unlock ${metric.label} metric to get deeper insights into your trading performance.`
                    )
                  }
                />
              ))}
            </Motion.div>

            {/* Weekly Performance Trend - LOCKED untuk Free */}
            {weeklyTrendData.length > 0 && (
              <ChartCard
                title="Weekly Performance Trend"
                icon={<TrendingUp className="w-5 h-5 text-violet-600" />}
                isLocked={!hasProAccess}
                onUpgrade={() =>
                  openUpgradeModal(
                    "weekly_trend",
                    "Weekly Performance Trend",
                    "Unlock weekly performance trend analysis to track your performance over time with detailed charts and insights."
                  )
                }
              >
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="week"
                        stroke="#475569"
                        tick={{ fontSize: 11, fontWeight: 600 }}
                        tickFormatter={(value) => value.split("-W")[1]}
                      />
                      <YAxis
                        stroke="#475569"
                        tick={{ fontSize: 11, fontWeight: 600 }}
                        tickFormatter={(value) =>
                          formatCompactCurrency(value, currency)
                        }
                      />
                      <Tooltip
                        formatter={renderTooltipContent}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "2px solid #8b5cf6",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          backgroundColor: "#fafafa",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        dot={{ fill: "#7c3aed", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: "#7c3aed" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            )}

            {/* Monthly Performance Table - LOCKED untuk Free */}
            {monthlyData.length > 0 && (
              <div className={`relative ${!hasProAccess ? 'min-h-[400px]' : ''}`}>
                {!hasProAccess && (
                  <LockedOverlay
                    onUpgrade={() =>
                      openUpgradeModal(
                        "monthly_performance",
                        "Monthly Performance",
                        "Unlock monthly performance tracking to analyze your progress over time with detailed monthly breakdowns."
                      )
                    }
                    title="Monthly Performance"
                  />
                )}
                <Motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 overflow-hidden shadow-sm h-full ${
                    !hasProAccess ? "opacity-70" : ""
                  }`}
                  style={!hasProAccess ? { minHeight: '400px' } : {}}
                >
                  <div className="p-6 border-b-2 border-slate-200 bg-linear-to-r from-slate-50 to-violet-50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-violet-600" />
                      Monthly Performance
                      {!hasProAccess && (
                        <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full font-bold">
                          PRO
                        </span>
                      )}
                      <span className="text-xs text-gray-500 ml-2">
                        ({monthlyData.length} months)
                      </span>
                    </h3>
                  </div>
                  <div className="overflow-x-auto h-full">
                    <table className="w-full min-w-[800px]">
                      <thead>
                        <tr className="border-b-2 border-slate-200 bg-linear-to-r from-slate-50 to-violet-50 whitespace-nowrap">
                          <th className="text-left p-4 text-sm font-bold text-slate-800">
                            Month
                          </th>
                          <th className="text-left p-4 text-sm font-bold text-slate-800">
                            Trades
                          </th>
                          <th className="text-left p-4 text-sm font-bold text-slate-800">
                            Wins
                          </th>
                          <th className="text-left p-4 text-sm font-bold text-slate-800">
                            Losses
                          </th>
                          <th className="text-left p-4 text-sm font-bold text-slate-800">
                            Win Rate
                          </th>
                          <th className="text-left p-4 text-sm font-bold text-slate-800">
                            Total Profit
                          </th>
                          <th className="text-left p-4 text-sm font-bold text-slate-800">
                            Avg Profit
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyData.map((month, index) => (
                          <tr
                            key={`${month.month}-${index}`}
                            className="border-b border-slate-100 hover:bg-slate-50 transition-all duration-200"
                          >
                            {/* Month */}
                            <td className="p-4">
                              <span className="text-sm font-bold text-violet-700">
                                {formatMonthDisplay(month.month)}
                              </span>
                            </td>

                            {/* Trades */}
                            <td className="p-4">
                              <span className="text-sm text-slate-700 font-medium">
                                {month.trades}
                              </span>
                            </td>

                            {/* Wins */}
                            <td className="p-4">
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-emerald-500" />
                                <span className="text-sm font-bold text-emerald-600">
                                  {hasProAccess ? month.wins : "••"}
                                </span>
                              </div>
                            </td>

                            {/* Losses */}
                            <td className="p-4">
                              <div className="flex items-center gap-1">
                                <TrendingDown className="w-3 h-3 text-rose-500" />
                                <span className="text-sm font-bold text-rose-600">
                                  {hasProAccess ? month.losses : "••"}
                                </span>
                              </div>
                            </td>

                            {/* Win Rate */}
                            <td className="p-4">
                              <span className="text-sm font-bold text-violet-600">
                                {hasProAccess ? `${month.winRate}%` : "••%"}
                              </span>
                            </td>

                            {/* Total Profit */}
                            <td className="p-4">
                              <span
                                className={`text-sm font-bold ${
                                  month.profit >= 0
                                    ? "text-emerald-600"
                                    : "text-rose-600"
                                }`}
                              >
                                {hasProAccess
                                  ? formatBalance(month.profit, currency)
                                  : "••••"}
                              </span>
                            </td>

                            {/* Avg Profit */}
                            <td className="p-4">
                              <span
                                className={`text-sm font-bold ${
                                  month.avgProfit >= 0
                                    ? "text-emerald-600"
                                    : "text-rose-600"
                                }`}
                              >
                                {hasProAccess
                                  ? formatAvgProfit(month.avgProfit)
                                  : "••••"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Motion.div>
              </div>
            )}

            {/* Instrument Performance Comparison - LOCKED untuk Free */}
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <PerformanceTable
                title="Best Performing Instruments"
                data={bestInstruments}
                icon={<Star className="w-5 h-5 text-violet-600" />}
                isLocked={!hasProAccess}
                onUpgrade={() =>
                  openUpgradeModal(
                    "instrument_performance",
                    "Instrument Performance Analysis",
                    "Unlock detailed instrument performance analysis to identify your most profitable trading pairs and optimize your strategy."
                  )
                }
                // TAMBAHKAN PROPS currency DAN formatAvgProfit
                currency={currency}
                formatAvgProfit={formatAvgProfit}
              />

              <PerformanceTable
                title="Worst Performing Instruments"
                data={worstInstruments}
                icon={<AlertTriangle className="w-5 h-5 text-violet-600" />}
                isLocked={!hasProAccess}
                onUpgrade={() =>
                  openUpgradeModal(
                    "instrument_performance",
                    "Instrument Performance Analysis",
                    "Unlock detailed instrument performance analysis to identify your most profitable trading pairs and optimize your strategy."
                  )
                }
                // TAMBAHKAN PROPS currency DAN formatAvgProfit
                currency={currency}
                formatAvgProfit={formatAvgProfit}
              />
            </Motion.div>

            {/* Advanced Analytics Panels - LOCKED untuk Free */}
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Trading Consistency - LOCKED */}
              <div className={`relative ${!hasProAccess ? 'min-h-[320px]' : ''}`}>
                {!hasProAccess && (
                  <LockedOverlay
                    onUpgrade={() =>
                      openUpgradeModal(
                        "trading_consistency",
                        "Trading Consistency Analysis",
                        "Unlock trading consistency metrics to track your streaks, drawdowns, and recovery factors for better risk management."
                      )
                    }
                    title="Trading Consistency"
                  />
                )}
                <div
                  className={`bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-sm h-full ${
                    !hasProAccess ? "opacity-70" : ""
                  }`}
                  style={!hasProAccess ? { minHeight: '320px' } : {}}
                >
                  <h3 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-2">
                    <Award className="w-5 h-5 text-violet-600" />
                    Trading Consistency
                    {!hasProAccess && (
                      <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full font-bold">
                        PRO
                      </span>
                    )}
                  </h3>
                  <div className="space-y-4">
                    <Motion.div
                      whileHover={{ x: hasProAccess ? 5 : 0 }}
                      className="flex justify-between items-center p-3 bg-linear-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200"
                    >
                      <span className="text-slate-700 font-medium">
                        Max Consecutive Wins
                      </span>
                      <span className="font-bold text-emerald-600 text-lg flex items-center gap-1">
                        {hasProAccess ? (
                          <>
                            <Zap className="w-4 h-4" />
                            {consistencyMetrics.maxConsecutiveWins}
                          </>
                        ) : (
                          <span className="blur-sm">••</span>
                        )}
                      </span>
                    </Motion.div>
                    <Motion.div
                      whileHover={{ x: hasProAccess ? 5 : 0 }}
                      className="flex justify-between items-center p-3 bg-linear-to-r from-rose-50 to-red-50 rounded-xl border border-rose-200"
                    >
                      <span className="text-slate-700 font-medium">
                        Max Consecutive Losses
                      </span>
                      <span className="font-bold text-rose-600 text-lg flex items-center gap-1">
                        {hasProAccess ? (
                          <>
                            <TrendingDown className="w-4 h-4" />
                            {consistencyMetrics.maxConsecutiveLosses}
                          </>
                        ) : (
                          <span className="blur-sm">••</span>
                        )}
                      </span>
                    </Motion.div>
                    <Motion.div
                      whileHover={{ x: hasProAccess ? 5 : 0 }}
                      className="flex justify-between items-center p-3 bg-linear-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200"
                    >
                      <span className="text-slate-700 font-medium">
                        Max Drawdown
                      </span>
                      <span className="font-bold text-amber-600 text-lg flex items-center gap-1">
                        {hasProAccess ? (
                          <>
                            <ArrowUpDown className="w-4 h-4" />
                            {formatBalance(
                              consistencyMetrics.maxDrawdown,
                              currency
                            )}
                          </>
                        ) : (
                          <span className="blur-sm">••••</span>
                        )}
                      </span>
                    </Motion.div>
                    <Motion.div
                      whileHover={{ x: hasProAccess ? 5 : 0 }}
                      className="flex justify-between items-center p-3 bg-linear-to-r from-violet-50 to-violet-50 rounded-xl border border-violet-200"
                    >
                      <span className="text-slate-700 font-medium">
                        Recovery Factor
                      </span>
                      <span className="font-bold text-violet-600 text-lg flex items-center gap-1">
                        {hasProAccess ? (
                          <>
                            <Zap className="w-4 h-4" />
                            {consistencyMetrics.recoveryFactor}
                          </>
                        ) : (
                          <span className="blur-sm">••</span>
                        )}
                      </span>
                    </Motion.div>
                  </div>
                </div>
              </div>

              {/* Risk Management - LOCKED */}
              <div className={`relative ${!hasProAccess ? 'min-h-[320px]' : ''}`}>
                {!hasProAccess && (
                  <LockedOverlay
                    onUpgrade={() =>
                      openUpgradeModal(
                        "risk_management",
                        "Risk Management Analytics",
                        "Unlock advanced risk management metrics to analyze your largest wins/losses and optimize your risk/reward ratios."
                      )
                    }
                    title="Risk Management"
                  />
                )}
                <div
                  className={`bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-sm h-full ${
                    !hasProAccess ? "opacity-70" : ""
                  }`}
                  style={!hasProAccess ? { minHeight: '320px' } : {}}
                >
                  <h3 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-violet-600" />
                    Risk Management
                    {!hasProAccess && (
                      <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full font-bold">
                        PRO
                      </span>
                    )}
                  </h3>
                  <div className="space-y-4">
                    <Motion.div
                      whileHover={{ x: hasProAccess ? 5 : 0 }}
                      className="flex justify-between items-center p-3 bg-linear-to-r from-violet-50 to-violet-50 rounded-xl border border-violet-200"
                    >
                      <span className="text-slate-700 font-medium">
                        Largest Win
                      </span>
                      <span className="font-bold text-violet-600 text-lg flex items-center gap-1">
                        {hasProAccess ? (
                          <>
                            <Trophy className="w-4 h-4" />
                            {formatBalance(safeStats.largestWin || 0, currency)}
                          </>
                        ) : (
                          <span className="blur-sm">••••</span>
                        )}
                      </span>
                    </Motion.div>
                    <Motion.div
                      whileHover={{ x: hasProAccess ? 5 : 0 }}
                      className="flex justify-between items-center p-3 bg-linear-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200"
                    >
                      <span className="text-slate-700 font-medium">
                        Largest Loss
                      </span>
                      <span className="font-bold text-amber-600 text-lg flex items-center gap-1">
                        {hasProAccess ? (
                          <>
                            <BarChart3 className="w-4 h-4" />
                            {formatBalance(
                              safeStats.largestLoss || 0,
                              currency
                            )}
                          </>
                        ) : (
                          <span className="blur-sm">••••</span>
                        )}
                      </span>
                    </Motion.div>
                    <Motion.div
                      whileHover={{ x: hasProAccess ? 5 : 0 }}
                      className="flex justify-between items-center p-3 bg-linear-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200"
                    >
                      <span className="text-slate-700 font-medium">
                        Win/Loss Ratio
                      </span>
                      <span className="font-bold text-amber-600 text-lg flex items-center gap-1">
                        {hasProAccess ? (
                          <>
                            <ArrowUpDown className="w-4 h-4" />
                            {(
                              safeStats.wins / Math.max(safeStats.losses, 1)
                            ).toFixed(2)}
                          </>
                        ) : (
                          <span className="blur-sm">••</span>
                        )}
                      </span>
                    </Motion.div>
                    <Motion.div
                      whileHover={{ x: hasProAccess ? 5 : 0 }}
                      className="flex justify-between items-center p-3 bg-linear-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200"
                    >
                      <span className="text-slate-700 font-medium">
                        Risk/Reward Ratio
                      </span>
                      <span className="font-bold text-emerald-600 text-lg flex items-center gap-1">
                        {hasProAccess ? (
                          <>
                            <TargetIcon className="w-4 h-4" />
                            1:
                            {(
                              safeStats.avgProfit /
                              Math.max(Math.abs(safeStats.largestLoss || 1), 1)
                            ).toFixed(1)}
                          </>
                        ) : (
                          <span className="blur-sm">••</span>
                        )}
                      </span>
                    </Motion.div>
                  </div>
                </div>
              </div>
            </Motion.div>

            {/* Performance Summary Banner dengan Upgrade CTA */}
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`rounded-3xl p-5 shadow-sm border-2 ${
                hasProAccess
                  ? "bg-linear-to-r from-emerald-600 via-green-500 to-emerald-600 border-emerald-300"
                  : "bg-linear-to-r from-violet-600 via-purple-600 to-violet-600 border-violet-300"
              }`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between text-white gap-5">
                <div className="flex items-start gap-4">
                  <div className="bg-white/20 p-2.5 rounded-full">
                    {hasProAccess ? (
                      <Crown className="w-6 h-6 sm:w-7 sm:h-7" />
                    ) : (
                      <Rocket className="w-6 h-6 sm:w-7 sm:h-7" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-1.5">
                      {hasProAccess
                        ? "Unlock Your Full Trading Potential!"
                        : "Ready to Level Up Your Trading?"}
                    </h3>
                    <p className="text-white/90 font-light text-sm sm:text-base">
                      {hasProAccess
                        ? "You're already on Pro! Continue tracking and improving for consistent profits."
                        : "Upgrade to Pro for advanced analytics, detailed insights, and premium features."}
                    </p>
                  </div>
                </div>

                <Motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={
                    hasProAccess
                      ? () => navigate("/analytics")
                      : () =>
                          openUpgradeModal(
                            "performance_analytics",
                            "Advanced Performance Analytics",
                            "Unlock the full suite of performance analytics including trend analysis, consistency metrics, risk management tools, and detailed instrument performance."
                          )
                  }
                  className={`w-full md:w-auto px-5 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 ${
                    hasProAccess
                      ? "bg-white text-emerald-600 hover:bg-emerald-50"
                      : "bg-white text-violet-600 hover:bg-violet-50"
                  }`}
                >
                  {hasProAccess ? (
                    <>
                      <ChartBar className="w-4 h-4" />
                      <span>View Advanced Analytics</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Upgrade to Pro</span>
                    </>
                  )}
                </Motion.button>
              </div>
            </Motion.div>
          </>
        )}
      </div>
    </>
  );
};

export default Performance;