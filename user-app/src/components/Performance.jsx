import React, { useEffect, useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Cell,
} from "recharts";
import { getTrades } from "../features/tradeSlice";
import {
  formatCurrency,
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
  Wallet,
} from "lucide-react";

const Performance = () => {
  const dispatch = useDispatch();

  // State untuk tracking data loading
  const [dataFetched, setDataFetched] = useState(false);

  // Ambil data dari Redux store
  const { trades = [], stats = {} } = useSelector((state) => state.trades);
  const { initialBalance, currency } = useSelector((state) => state.balance);

  // Fetch data dengan kondisi yang lebih ketat
  useEffect(() => {
    const fetchData = async () => {
      // Hanya fetch jika:
      // 1. Belum pernah fetch sebelumnya
      // 2. Trades masih kosong
      if (!dataFetched && trades.length === 0) {
        try {
          await dispatch(getTrades());
        } catch (error) {
          console.error("❌ Performance: Failed to fetch trades:", error);
        } finally {
          setDataFetched(true);
        }
      } else if (trades.length > 0) {
        // Jika sudah ada data, set fetched true
        setDataFetched(true);
      }
    };

    fetchData();
  }, [dispatch, trades.length, dataFetched]);

  // Safe stats dengan default values
  const safeStats = useMemo(
    () => ({
      netProfit: stats?.netProfit || 0,
      winRate: stats?.winRate || 0,
      profitFactor: stats?.profitFactor || 0,
      avgProfit: stats?.avgProfit || 0,
      roi: stats?.roi || 0,
      totalPips: stats?.totalPips || 0,
      totalTrades: stats?.totalTrades || trades.length || 0,
      wins: stats?.wins || 0,
      losses: stats?.losses || 0,
      largestWin: stats?.largestWin || 0,
      largestLoss: stats?.largestLoss || 0,
      ...stats,
    }),
    [stats, trades]
  );

  // Monthly performance data
  const monthlyData = useMemo(() => {
    if (trades.length === 0) return [];

    const monthlyStats = {};
    trades.forEach((entry) => {
      if (!entry.date) return;

      const month = entry.date.substring(0, 7); // YYYY-MM format
      if (!monthlyStats[month]) {
        monthlyStats[month] = {
          profit: 0,
          trades: 0,
          wins: 0,
          losses: 0,
          winRate: 0,
          avgProfit: 0,
        };
      }
      monthlyStats[month].profit += entry.profit || 0;
      monthlyStats[month].trades += 1;
      if (entry.result?.toLowerCase().includes("win")) {
        monthlyStats[month].wins += 1;
      } else if (entry.result?.toLowerCase().includes("lose")) {
        monthlyStats[month].losses += 1;
      }
    });

    // Calculate derived stats
    Object.keys(monthlyStats).forEach((month) => {
      const data = monthlyStats[month];
      data.winRate =
        data.trades > 0 ? Math.round((data.wins / data.trades) * 100) : 0;
      data.avgProfit =
        data.trades > 0 ? Math.round(data.profit / data.trades) : 0;
    });

    return Object.entries(monthlyStats)
      .map(([month, data]) => ({
        month,
        ...data,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
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
        avgProfit: Math.round(data.profit / data.trades) || 0,
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5); // Top 5
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
        avgProfit: Math.round(data.profit / data.trades) || 0,
      }))
      .sort((a, b) => a.profit - b.profit)
      .slice(0, 5); // Bottom 5
  }, [trades]);

  // Weekly performance trend
  const weeklyTrendData = useMemo(() => {
    if (trades.length === 0) return [];

    const weeklyStats = {};
    trades.forEach((entry) => {
      if (!entry.date) return;

      const date = new Date(entry.date);
      const week = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
      if (!weeklyStats[week]) {
        weeklyStats[week] = { profit: 0, trades: 0 };
      }
      weeklyStats[week].profit += entry.profit || 0;
      weeklyStats[week].trades += 1;
    });

    return Object.entries(weeklyStats)
      .map(([week, data]) => ({
        week,
        profit: data.profit,
        trades: data.trades,
      }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-8); // Last 8 weeks
  }, [trades]);

  // Performance metrics
  const performanceMetrics = [
    {
      label: "Total Profit",
      value: formatCompactCurrency(safeStats.netProfit, currency),
      color: safeStats.netProfit >= 0 ? "text-emerald-700" : "text-rose-700",
      bg:
        safeStats.netProfit >= 0
          ? "bg-linear-to-br from-emerald-100 to-green-100"
          : "bg-linear-to-br from-rose-100 to-red-100",
      border:
        safeStats.netProfit >= 0 ? "border-emerald-200" : "border-rose-200",
      icon: <DollarSign className="w-6 h-6" />,
    },
    {
      label: "Win Rate",
      value: `${safeStats.winRate}%`,
      color: "text-violet-700",
      bg: "bg-linear-to-br from-violet-100 to-violet-100",
      border: "border-violet-200",
      icon: <Target className="w-6 h-6" />,
    },
    {
      label: "Profit Factor",
      value: safeStats.profitFactor?.toFixed(2) || "0.00",
      color: "text-purple-700",
      bg: "bg-linear-to-br from-purple-100 to-rose-100",
      border: "border-purple-200",
      icon: <Zap className="w-6 h-6" />,
    },
    {
      label: "Average Profit per Trade",
      value: formatCompactCurrency(safeStats.avgProfit, currency),
      color: safeStats.avgProfit >= 0 ? "text-emerald-700" : "text-rose-700",
      bg:
        safeStats.avgProfit >= 0
          ? "bg-linear-to-br from-emerald-100 to-green-100"
          : "bg-linear-to-br from-rose-100 to-red-100",
      border:
        safeStats.avgProfit >= 0 ? "border-emerald-200" : "border-rose-200",
      icon: <BarChart3 className="w-6 h-6" />,
    },
    {
      label: "Return on Investment",
      value: `${safeStats.roi}%`,
      color: Number(safeStats.roi) >= 0 ? "text-emerald-700" : "text-rose-700",
      bg:
        Number(safeStats.roi) >= 0
          ? "bg-linear-to-br from-emerald-100 to-green-100"
          : "bg-linear-to-br from-rose-100 to-red-100",
      border:
        Number(safeStats.roi) >= 0 ? "border-emerald-200" : "border-rose-200",
      icon: <TrendingUp className="w-6 h-6" />,
    },
    {
      label: "Total Pips",
      value: safeStats.totalPips?.toLocaleString() || "0",
      color: "text-amber-700",
      bg: "bg-linear-to-br from-amber-100 to-yellow-100",
      border: "border-amber-200",
      icon: <PieChart className="w-6 h-6" />,
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
      runningBalance += entry.profit || 0;

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
    if (
      name === "profit" ||
      name === "avgProfit" ||
      name === "Total Profit" ||
      name === "Avg Profit"
    ) {
      return [formatCurrency(value, currency), name];
    } else if (
      name === "winRate" ||
      name === "Win Rate %" ||
      name === "Win Rate"
    ) {
      return [`${value}%`, name];
    }
    return [value, name];
  };

  const StatCard = ({ label, value, color, bg, border, icon }) => (
    <Motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      className={`p-5 rounded-2xl border-2 ${border} ${bg} shadow-sm hover:shadow-sm transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-700 font-medium">{label}</div>
        <div className={`${color}`}>{icon}</div>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </Motion.div>
  );

  const PerformanceTable = ({ title, data, icon }) => (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 overflow-hidden shadow-sm"
    >
      <div className="p-6 border-b-2 border-slate-200 bg-linear-to-r from-slate-50 to-violet-50">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          {icon}
          {title}
        </h3>
      </div>
      <div className="overflow-x-auto">
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
                key={item.instrument}
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
                  {item.winRate}%
                </td>
                <td
                  className={`p-4 text-sm font-bold ${
                    item.profit >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {formatCompactCurrency(item.profit, currency)}
                </td>
                <td
                  className={`p-4 text-sm font-bold ${
                    item.avgProfit >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {formatCompactCurrency(item.avgProfit, currency)}
                </td>
              </Motion.tr>
            ))}
          </tbody>
        </table>

        {data.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-400" />
            <p className="font-medium">No data available</p>
            <p className="text-sm mt-1 font-light">
              Start adding trades to see performance data
            </p>
          </div>
        )}
      </div>
    </Motion.div>
  );

  return (
    <div className="space-y-6 min-h-screen">
      {/* Header */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-violet-600" />
            Performance Metrics
          </h1>
          <p className="text-slate-600 mt-1 font-light">
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
              {formatCompactCurrency(safeStats.netProfit, currency)}
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
              onClick={() => (window.location.href = "/trades")}
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
            {performanceMetrics.map((metric) => (
              <StatCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                color={metric.color}
                bg={metric.bg}
                border={metric.border}
                icon={metric.icon}
              />
            ))}
          </Motion.div>

          {/* Weekly Performance Trend */}
          {weeklyTrendData.length > 0 && (
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-sm"
            >
              <h3 className="text-lg font-bold mb-4 text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-600" />
                Weekly Performance Trend
              </h3>
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
            </Motion.div>
          )}

          {/* Monthly Performance */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 overflow-hidden shadow-sm"
          >
            <div className="p-6 border-b-2 border-slate-200 bg-linear-to-r from-slate-50 to-violet-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-violet-600" />
                Monthly Performance
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
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
                    <Motion.tr
                      key={month.month}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-100 hover:bg-linear-to-r hover:from-slate-50 hover:to-violet-50 transition-all whitespace-nowrap"
                    >
                      <td className="p-4 text-sm font-bold text-violet-700">
                        {month.month}
                      </td>
                      <td className="p-4 text-sm text-slate-700 font-medium">
                        {month.trades}
                      </td>
                      <td className="p-4 text-sm font-bold text-emerald-600 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> {month.wins}
                      </td>
                      <td className="p-4 text-sm font-bold text-rose-600 flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" /> {month.losses}
                      </td>
                      <td className="p-4 text-sm font-bold text-violet-600">
                        {month.winRate}%
                      </td>
                      <td
                        className={`p-4 text-sm font-bold ${
                          month.profit >= 0
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {formatCompactCurrency(month.profit, currency)}
                      </td>
                      <td
                        className={`p-4 text-sm font-bold ${
                          month.avgProfit >= 0
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {formatCompactCurrency(month.avgProfit, currency)}
                      </td>
                    </Motion.tr>
                  ))}
                </tbody>
              </table>

              {monthlyData.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                  <p className="font-medium">No monthly data available</p>
                  <p className="text-sm mt-1 font-light">
                    Start adding trades to see monthly performance
                  </p>
                </div>
              )}
            </div>
          </Motion.div>

          {/* Instrument Performance Comparison */}
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
            />

            <PerformanceTable
              title="Worst Performing Instruments"
              data={worstInstruments}
              icon={<AlertTriangle className="w-5 h-5 text-violet-600" />}
            />
          </Motion.div>

          {/* Additional Insights */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Trading Consistency */}
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-violet-600" />
                Trading Consistency
              </h3>
              <div className="space-y-4">
                <Motion.div
                  whileHover={{ x: 5 }}
                  className="flex justify-between items-center p-3 bg-linear-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200"
                >
                  <span className="text-slate-700 font-medium">
                    Max Consecutive Wins
                  </span>
                  <span className="font-bold text-emerald-600 text-lg flex items-center gap-1">
                    <Zap className="w-4 h-4" />{" "}
                    {consistencyMetrics.maxConsecutiveWins}
                  </span>
                </Motion.div>
                <Motion.div
                  whileHover={{ x: 5 }}
                  className="flex justify-between items-center p-3 bg-linear-to-r from-rose-50 to-red-50 rounded-xl border border-rose-200"
                >
                  <span className="text-slate-700 font-medium">
                    Max Consecutive Losses
                  </span>
                  <span className="font-bold text-rose-600 text-lg flex items-center gap-1">
                    <TrendingDown className="w-4 h-4" />{" "}
                    {consistencyMetrics.maxConsecutiveLosses}
                  </span>
                </Motion.div>
                <Motion.div
                  whileHover={{ x: 5 }}
                  className="flex justify-between items-center p-3 bg-linear-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200"
                >
                  <span className="text-slate-700 font-medium">
                    Max Drawdown
                  </span>
                  <span className="font-bold text-amber-600 text-lg flex items-center gap-1">
                    <ArrowUpDown className="w-4 h-4" />{" "}
                    {formatCompactCurrency(
                      consistencyMetrics.maxDrawdown,
                      currency
                    )}
                  </span>
                </Motion.div>
                <Motion.div
                  whileHover={{ x: 5 }}
                  className="flex justify-between items-center p-3 bg-linear-to-r from-violet-50 to-violet-50 rounded-xl border border-violet-200"
                >
                  <span className="text-slate-700 font-medium">
                    Recovery Factor
                  </span>
                  <span className="font-bold text-violet-600 text-lg flex items-center gap-1">
                    <Zap className="w-4 h-4" />{" "}
                    {consistencyMetrics.recoveryFactor}
                  </span>
                </Motion.div>
              </div>
            </div>

            {/* Risk Management */}
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-2">
                <Shield className="w-5 h-5 text-violet-600" />
                Risk Management
              </h3>
              <div className="space-y-4">
                <Motion.div
                  whileHover={{ x: 5 }}
                  className="flex justify-between items-center p-3 bg-linear-to-r from-violet-50 to-violet-50 rounded-xl border border-violet-200"
                >
                  <span className="text-slate-700 font-medium">
                    Largest Win
                  </span>
                  <span className="font-bold text-violet-600 text-lg flex items-center gap-1">
                    <Trophy className="w-4 h-4" />{" "}
                    {formatCompactCurrency(safeStats.largestWin, currency)}
                  </span>
                </Motion.div>
                <Motion.div
                  whileHover={{ x: 5 }}
                  className="flex justify-between items-center p-3 bg-linear-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200"
                >
                  <span className="text-slate-700 font-medium">
                    Largest Loss
                  </span>
                  <span className="font-bold text-amber-600 text-lg flex items-center gap-1">
                    <BarChart3 className="w-4 h-4" />{" "}
                    {formatCompactCurrency(safeStats.largestLoss, currency)}
                  </span>
                </Motion.div>
                <Motion.div
                  whileHover={{ x: 5 }}
                  className="flex justify-between items-center p-3 bg-linear-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200"
                >
                  <span className="text-slate-700 font-medium">
                    Win/Loss Ratio
                  </span>
                  <span className="font-bold text-amber-600 text-lg flex items-center gap-1">
                    <ArrowUpDown className="w-4 h-4" />{" "}
                    {(safeStats.wins / Math.max(safeStats.losses, 1)).toFixed(
                      2
                    )}
                  </span>
                </Motion.div>
                <Motion.div
                  whileHover={{ x: 5 }}
                  className="flex justify-between items-center p-3 bg-linear-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200"
                >
                  <span className="text-slate-700 font-medium">
                    Risk/Reward Ratio
                  </span>
                  <span className="font-bold text-emerald-600 text-lg flex items-center gap-1">
                    <Target className="w-4 h-4" /> 1:
                    {(
                      safeStats.avgProfit /
                      Math.max(Math.abs(safeStats.largestLoss), 1)
                    ).toFixed(1)}
                  </span>
                </Motion.div>
              </div>
            </div>
          </Motion.div>

          {/* Performance Summary Banner */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-linear-to-r from-violet-600 via-purple-600 to-violet-600 rounded-3xl p-5 shadow-sm border-2 border-violet-300"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between text-white gap-5">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-2.5 rounded-full">
                  <Crown className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-1.5">
                    Track Your Progress Daily!
                  </h3>
                  <p className="text-violet-100/90 font-light text-sm sm:text-base">
                    Consistency is the key to long-term trading success. Keep
                    analyzing and improving!
                  </p>
                </div>
              </div>

              <Motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-full md:w-auto bg-white text-violet-600 hover:bg-violet-50 px-5 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Report</span>
                <svg
                  className="w-4 h-4 ml-1 md:hidden"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Motion.button>
            </div>
          </Motion.div>
        </>
      )}
    </div>
  );
};

export default Performance;
