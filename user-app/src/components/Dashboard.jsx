import React, { useMemo, useState, useEffect } from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Target,
  Wallet,
  DollarSign,
  BarChart3,
  Calendar,
  Flame,
  Briefcase,
  Zap,
  Rocket,
  PieChart,
  Plus,
} from "lucide-react";
import StatCard from "./StatCard";
import {
  formatCurrency,
  formatCompactCurrency,
} from "../utils/currencyFormatter";
import TargetProgressBanner from "../components/TargetProgressBanner";
import BalanceModal from "./modals/BalanceModal";
import { getTrades } from "../features/tradeSlice";
import EquityChart from "../components/EquityChart";

const Dashboard = (props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Ambil data subscription
  const { subscription } = useSelector((state) => state.subscription);

  const canViewTargets = () => {
    return subscription && subscription.plan !== "free";
  };

  // Ambil data langsung dari Redux store
  const { trades: reduxTrades = [], stats: reduxStats = {} } = useSelector(
    (state) => state.trades
  );

  const { target, targetProgress } = useSelector((state) => state.target);
  const { initialBalance, currentBalance, currency } = useSelector(
    (state) => state.balance
  );

  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Debug log untuk memantau data
  useEffect(() => {
    console.log("🔍 Dashboard Data Check:");
    console.log("- Redux trades count:", reduxTrades.length);
    console.log("- Redux stats:", reduxStats);
    console.log("- Initial balance:", initialBalance);
    console.log("- Current balance:", currentBalance);
    console.log("- Currency:", currency);

    if (reduxTrades.length > 0) {
      console.log("- First trade sample:", reduxTrades[0]);
      console.log(
        "- Trade date format:",
        typeof reduxTrades[0]?.date,
        reduxTrades[0]?.date
      );
    }
  }, [reduxTrades, reduxStats, initialBalance, currentBalance, currency]);

  // Fetch trades saat Dashboard dimuat jika belum ada
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setIsLoading(true);
        if (reduxTrades.length === 0) {
          console.log("🔄 Dashboard: Fetching trades...");
          await dispatch(getTrades()).unwrap();
          console.log("✅ Dashboard: Trades fetched successfully");
        }
      } catch (error) {
        console.error("❌ Dashboard: Failed to fetch trades:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrades();
  }, [dispatch, reduxTrades.length]);

  // Handler untuk modal
  const handleShowBalanceModal = () => {
    setShowBalanceModal(true);
  };

  const handleCloseBalanceModal = () => {
    setShowBalanceModal(false);
  };

  // Gabungkan stats dari Redux dan props (prioritas ke Redux)
  const safeStats = useMemo(() => {
    const merged = {
      totalTrades: 0,
      winRate: 0,
      netProfit: 0,
      avgProfit: 0,
      roi: 0,
      totalPips: 0,
      avgPips: 0,
      largestWin: 0,
      largestLoss: 0,
      profitFactor: 0,

      // Gunakan props stats sebagai fallback
      ...props.stats,

      // Prioritaskan stats dari Redux
      ...reduxStats,

      // Gunakan balance dari Redux store
      initialBalance: initialBalance || 0,
      currentBalance: currentBalance || 0,
    };

    console.log("📊 Safe Stats:", merged);
    return merged;
  }, [props.stats, reduxStats, initialBalance, currentBalance]);

  // Target dari Redux store (prioritas), props sebagai fallback
  const safeTarget = useMemo(() => {
    // Prioritaskan target dari Redux, lalu dari props
    const targetData = target || props.target || {};

    return {
      enabled: false,
      targetBalance: 0,
      targetDate: "",
      description: "",
      useDailyTarget: false,
      dailyTargetPercentage: 0,
      dailyTargetAmount: 0,
      ...targetData,
    };
  }, [target, props.target]);

  // Target progress dari Redux store (prioritas), props sebagai fallback
  const safeTargetProgress = useMemo(() => {
    return targetProgress || props.targetProgress || null;
  }, [targetProgress, props.targetProgress]);

  // Gunakan reduxTrades untuk chart data (prioritas), props entries sebagai fallback
  const actualEntries = useMemo(() => {
    // Prioritaskan trades dari Redux, lalu dari props
    if (reduxTrades && reduxTrades.length > 0) {
      console.log(
        "📋 Using reduxTrades for actualEntries:",
        reduxTrades.length,
        "entries"
      );
      return reduxTrades;
    }
    console.log(
      "📋 Using props entries for actualEntries:",
      props.entries?.length || 0,
      "entries"
    );
    return props.entries || [];
  }, [reduxTrades, props.entries]);

  // Data untuk Equity Chart dengan logika berbeda berdasarkan jenis target
  const chartData = useMemo(() => {
    const data = [
      {
        date: "Start",
        balance: safeStats.initialBalance,
        profit: 0,
        ...(safeTarget.enabled &&
          !safeTarget.useDailyTarget && {
            targetLine: safeTarget.targetBalance,
          }),
        ...(safeTarget.enabled &&
          safeTarget.useDailyTarget && {
            expectedAccumulation: safeStats.initialBalance,
          }),
      },
    ];

    // Jika tidak ada entries, return data awal saja
    if (actualEntries.length === 0) {
      return data;
    }

    // Cari tanggal mulai untuk perhitungan daily target
    const startDate = new Date(actualEntries[0]?.date || new Date());

    actualEntries.forEach((e) => {
      const point = {
        date: e.date,
        balance: e.balanceAfter,
        profit: e.profit,
      };

      // Untuk date-based target, tambahkan targetLine konstan
      if (safeTarget.enabled && !safeTarget.useDailyTarget) {
        point.targetLine = safeTarget.targetBalance;
      }

      // Untuk daily target, hitung expected accumulation
      if (safeTarget.enabled && safeTarget.useDailyTarget) {
        // Hitung hari dari start
        const currentDate = new Date(e.date);
        const daysDiff = Math.ceil(
          (currentDate - startDate) / (1000 * 60 * 60 * 24)
        );

        // Expected accumulation = initialBalance + (dailyTargetAmount × days)
        point.expectedAccumulation =
          safeStats.initialBalance +
          (safeTarget.dailyTargetAmount || 0) * Math.max(0, daysDiff + 1);
      }

      data.push(point);
    });

    return data;
  }, [actualEntries, safeStats.initialBalance, safeTarget]);

  // PERBAIKAN: Data untuk Monthly Performance - dengan error handling yang lebih baik
  const performanceData = useMemo(() => {
    console.log(
      "📈 Calculating monthly performance from:",
      actualEntries.length,
      "entries"
    );

    if (actualEntries.length === 0) {
      console.log("⚠️ No entries for monthly performance");
      return [];
    }

    const monthlyData = {};

    actualEntries.forEach((entry, index) => {
      // Debug setiap entry
      if (index < 3) {
        console.log(`Entry ${index}:`, {
          date: entry.date,
          profit: entry.profit,
          result: entry.result,
          instrument: entry.instrument,
        });
      }

      // Validasi: Pastikan entry memiliki tanggal
      if (!entry.date) {
        console.warn(`Entry ${index} has no date! Skipping.`, entry);
        return;
      }

      // Pastikan tanggal dalam format yang benar
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
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          profit: 0,
          trades: 0,
          wins: 0,
          losses: 0,
        };
      }

      // Tambahkan data
      monthlyData[monthKey].profit += parseFloat(entry.profit) || 0;
      monthlyData[monthKey].trades += 1;

      if (entry.result?.toLowerCase().includes("win")) {
        monthlyData[monthKey].wins += 1;
      } else if (entry.result?.toLowerCase().includes("lose")) {
        monthlyData[monthKey].losses += 1;
      }
    });

    // Konversi ke array dan hitung winRate
    const result = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        profit: data.profit,
        trades: data.trades,
        wins: data.wins,
        losses: data.losses,
        winRate:
          data.trades > 0 ? Math.round((data.wins / data.trades) * 100) : 0,
      }))
      .sort((a, b) => a.month.localeCompare(b.month)); // Urutkan berdasarkan bulan

    console.log("📊 Monthly Performance Result:", result);
    return result;
  }, [actualEntries]);

  // Recent Trades - Maksimal 5 terbaru (urut berdasarkan tanggal terbaru ke terlama)
  const recentTrades = useMemo(() => {
    if (!actualEntries || actualEntries.length === 0) {
      return [];
    }

    // Sort berdasarkan tanggal descending (terbaru ke terlama)
    const sortedTrades = [...actualEntries].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA; // Descending order
    });

    // Ambil maksimal 4 yang terbaru
    return sortedTrades.slice(0, 4);
  }, [actualEntries]);

  // Fungsi untuk menentukan judul chart berdasarkan jenis target
  const getChartTitle = () => {
    if (!safeTarget.enabled) {
      return "Equity Curve";
    }

    if (safeTarget.useDailyTarget) {
      return `Equity Curve & Daily Target (${safeTarget.dailyTargetPercentage}%)`;
    }

    return `Equity Curve & Target (${formatCompactCurrency(
      safeTarget.targetBalance,
      currency
    )})`;
  };

  // Format bulan untuk tampilan chart
  const formatMonth = (monthString) => {
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
    return `${monthNames[parseInt(month) - 1]} '${year.slice(2)}`;
  };

  // Custom Tooltip untuk Monthly Performance
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-bold text-gray-800">{formatMonth(label)}</p>
          <p className="text-sm">
            <span className="font-medium">Profit: </span>
            <span
              className={
                payload[0].value >= 0
                  ? "text-green-600 font-bold"
                  : "text-red-600 font-bold"
              }
            >
              {formatCurrency(payload[0].value, currency)}
            </span>
          </p>
          <p className="text-sm">
            <span className="font-medium">Trades: </span>
            <span className="text-gray-700">{payload[0].payload.trades}</span>
          </p>
          <p className="text-sm">
            <span className="font-medium">Win Rate: </span>
            <span className="text-blue-600 font-bold">
              {payload[0].payload.winRate}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading dashboard data...</p>
          <p className="text-gray-500 text-sm mt-1">
            Fetching trades and statistics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen">
      {/* Header */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-violet-600" />
            Trading Dashboard
          </h1>

          <p className="text-sm sm:text-sm md:text-base text-slate-600 mt-1 font-light">
            Your complete trading overview
          </p>
        </div>
      </Motion.div>

      {/* Target Progress Banner */}
      {safeTarget.enabled &&
      canViewTargets() &&
      safeTargetProgress &&
      safeTargetProgress.progress !== undefined ? (
        <TargetProgressBanner
          target={safeTarget}
          targetProgress={safeTargetProgress}
          currency={currency}
          initialBalance={safeStats.initialBalance}
          size="medium"
        />
      ) : safeTarget.enabled && canViewTargets() ? (
        <div className="p-4 sm:p-6 rounded-3xl shadow-sm border bg-slate-100">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-violet-600"></div>
            <span className="text-sm text-slate-700">
              Loading target progress...
            </span>
          </div>
        </div>
      ) : null}

      {/* Quick Stats Grid */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {/* Total Trades */}
        <StatCard
          label="Total Trades"
          value={safeStats.totalTrades || actualEntries.length || 0}
          color="text-violet-800"
          bg="bg-linear-to-br from-violet-50 to-violet-100"
          border="border border-violet-200/70"
          icon={<TrendingUp className="w-5 h-5 text-violet-600" />}
        />

        {/* Win Rate */}
        <StatCard
          label="Win Rate"
          value={`${safeStats.winRate || 0}%`}
          color="text-violet-800"
          bg="bg-linear-to-br from-violet-50 to-purple-100"
          border="border border-violet-200/70"
          icon={<Target className="w-5 h-5 text-violet-600" />}
        />

        {/* Net Profit */}
        <StatCard
          label="Net Profit"
          value={formatCompactCurrency(safeStats.netProfit || 0, currency)}
          color={
            safeStats.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"
          }
          bg={
            safeStats.netProfit >= 0
              ? "bg-linear-to-br from-violet-50 to-emerald-100"
              : "bg-linear-to-br from-violet-50 to-rose-100"
          }
          border={
            safeStats.netProfit >= 0
              ? "border border-emerald-200/70"
              : "border border-rose-200/70"
          }
          icon={
            <DollarSign
              className={`w-5 h-5 ${
                safeStats.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            />
          }
        />

        {/* Balance */}
        <StatCard
          label="Balance"
          value={formatCompactCurrency(safeStats.currentBalance || 0, currency)}
          color="text-violet-800"
          bg="bg-linear-to-br from-violet-50 to-violet-100"
          border="border border-violet-200/70"
          icon={<Wallet className="w-5 h-5 text-violet-600" />}
        />
      </Motion.div>

      {/* Charts Row */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Equity Curve dengan komponen terpisah */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-4 text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-600" />
            {getChartTitle()}
          </h3>
          <EquityChart
            data={chartData}
            target={safeTarget}
            currency={currency}
          />
        </div>

        {/* Monthly Performance - DIPERBAIKI */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-4 text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-violet-600" />
            Monthly Performance
            <span className="text-xs text-gray-500 ml-2">
              ({performanceData.length} months)
            </span>
          </h3>
          <div className="h-64">
            {performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={performanceData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="#475569"
                    tick={{ fontSize: 11, fontWeight: 600 }}
                    tickFormatter={formatMonth}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#475569"
                    width={70}
                    tick={{ fontSize: 11, fontWeight: 600 }}
                    tickFormatter={(value) =>
                      formatCompactCurrency(value, currency)
                    }
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="profit" radius={[8, 8, 0, 0]} barSize={40}>
                    {performanceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.profit >= 0 ? "#8b5cf6" : "#ef4444"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <Calendar className="w-12 h-12 mb-3 text-slate-400" />
                <p className="font-medium">No monthly performance data</p>
                <p className="text-sm mt-1 font-light text-center">
                  {actualEntries.length === 0
                    ? "Add trades to see monthly performance"
                    : "Trades found but no valid date information"}
                </p>
                {actualEntries.length > 0 && (
                  <div className="mt-2 text-xs text-slate-600 bg-slate-100 p-2 rounded">
                    <div>Loaded {actualEntries.length} trades</div>
                    <div>Sample date: {actualEntries[0]?.date || "N/A"}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Legend */}
          {performanceData.length > 0 && (
            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-violet-500"></div>
                <span className="text-gray-700">Profitable Month</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-red-500"></div>
                <span className="text-gray-700">Loss Month</span>
              </div>
            </div>
          )}
        </div>
      </Motion.div>

      {/* Bottom Section */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Recent Trades */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-4 text-slate-800 flex items-center gap-2">
            <Flame className="w-5 h-5 text-violet-600" />
            Recent Trades (Last 4)
          </h3>
          <div className="space-y-3">
            {recentTrades.length > 0 ? (
              recentTrades.map((trade, index) => (
                <Motion.div
                  key={trade.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5, scale: 1.02 }}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all duration-200 border border-slate-200"
                >
                  <div className="flex items-center space-x-3">
                    <Motion.div
                      whileHover={{ scale: 1.2 }}
                      className={`w-3 h-3 rounded-full ${
                        trade.result?.toLowerCase().includes("win")
                          ? "bg-emerald-500"
                          : "bg-rose-500"
                      }`}
                    ></Motion.div>
                    <div>
                      <div className="font-bold text-sm text-slate-800">
                        {trade.instrument}
                      </div>
                      <div className="text-xs text-slate-600">{trade.date}</div>
                    </div>
                  </div>
                  <div
                    className={`font-bold text-sm ${
                      trade.profit >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {formatCompactCurrency(trade.profit, currency)}
                  </div>
                </Motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-600">
                <Motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-4xl mb-2"
                >
                  <BarChart3 className="w-10 h-10 mx-auto text-slate-400" />
                </Motion.div>
                <p className="font-semibold">No recent trades</p>
                <p className="text-sm mt-1 font-light">
                  Start adding trades to see them here
                </p>
              </div>
            )}

            {recentTrades.length > 0 && (
              <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-4 border-t border-slate-200"
              >
                <div className="text-xs text-slate-500 text-center">
                  Showing {recentTrades.length} of {actualEntries.length} total
                  trades
                </div>
              </Motion.div>
            )}
          </div>
        </div>

        {/* Account Summary */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-4 text-slate-800 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-violet-600" />
            Account Summary
          </h3>
          <div className="space-y-3">
            <Motion.div
              whileHover={{ x: 5 }}
              className="flex justify-between items-center py-3 px-3 bg-slate-50 rounded-xl border-b border-slate-200"
            >
              <span className="text-slate-700 font-semibold">
                Initial Deposit
              </span>
              <span className="font-bold text-slate-800">
                {formatCompactCurrency(safeStats.initialBalance, currency)}
              </span>
            </Motion.div>
            <Motion.div
              whileHover={{ x: 5 }}
              className="flex justify-between items-center py-3 px-3 bg-slate-50 rounded-xl border-b border-slate-200"
            >
              <span className="text-slate-700 font-semibold">
                Current Balance
              </span>
              <span className="font-bold text-slate-800">
                {formatCompactCurrency(safeStats.currentBalance, currency)}
              </span>
            </Motion.div>
            <Motion.div
              whileHover={{ x: 5 }}
              className="flex justify-between items-center py-3 px-3 bg-slate-50 rounded-xl border-b border-slate-200"
            >
              <span className="text-slate-700 font-semibold">
                Net Profit/Loss
              </span>
              <span
                className={`font-bold ${
                  safeStats.netProfit >= 0
                    ? "text-emerald-600"
                    : "text-rose-600"
                }`}
              >
                {formatCompactCurrency(safeStats.netProfit, currency)}
              </span>
            </Motion.div>
            <Motion.div
              whileHover={{ x: 5 }}
              className="flex justify-between items-center py-3 px-3 bg-slate-50 rounded-xl"
            >
              <span className="text-slate-700 font-semibold">ROI</span>
              <span
                className={`font-bold ${
                  Number(safeStats.roi) >= 0
                    ? "text-emerald-600"
                    : "text-rose-600"
                }`}
              >
                {safeStats.roi}%
              </span>
            </Motion.div>
            <Motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShowBalanceModal}
              className="w-full mt-4 bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-3 rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              Update Deposit
            </Motion.button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-4 text-slate-800 flex items-center gap-2">
            <Zap className="w-5 h-5 text-violet-600" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (!canViewTargets()) {
                  // Tampilkan modal upgrade jika user free
                  // Anda bisa menambahkan modal upgrade di sini
                  console.log("Need to upgrade to set target");
                  // Atau redirect ke upgrade page
                  navigate("/upgrade");
                } else {
                  navigate("/targets");
                }
              }}
              className="cursor-pointer w-full text-left p-5 bg-linear-to-br from-red-600 to-rose-600 rounded-2xl hover:from-red-700 hover:to-rose-700 transition-all duration-300 flex items-center shadow-sm hover:shadow-md border-2 border-red-400/50"
            >
              <Target className="w-8 h-8 text-white mr-4" />
              <div>
                <div className="font-bold text-white text-base">
                  {safeTarget.enabled ? "Manage Target" : "Set Trading Target"}
                </div>
                <div className="text-sm text-violet-100 mt-1 font-light">
                  {safeTarget.enabled
                    ? "Update your trading goals"
                    : "Set your financial targets"}
                </div>
              </div>
            </Motion.button>

            <Motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/trades")}
              className="cursor-pointer w-full text-left p-5 bg-linear-to-br from-orange-600 to-amber-600 rounded-2xl hover:from-orange-700 hover:to-amber-700 transition-all duration-300 flex items-center shadow-sm hover:shadow-md border-2 border-orange-300/50"
            >
              <Plus className="w-8 h-8 text-white mr-4" />
              <div>
                <div className="font-bold text-white text-base">
                  Add New Trade
                </div>
                <div className="text-sm text-blue-100 mt-1 font-light">
                  Record your latest trade
                </div>
              </div>
            </Motion.button>

            <Motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/analytics")}
              className="cursor-pointer w-full text-left p-5 bg-linear-to-br from-lime-600 to-green-600 rounded-2xl hover:from-lime-700 hover:to-lime-700 transition-all duration-300 flex items-center shadow-sm hover:shadow-md border-2 border-lime-300/50"
            >
              <PieChart className="w-8 h-8 text-white mr-4" />
              <div>
                <div className="font-bold text-white text-base">
                  View Full Analytics
                </div>
                <div className="text-sm text-violet-100 mt-1 font-light">
                  Deep dive into your performance
                </div>
              </div>
            </Motion.button>
          </div>
        </div>
      </Motion.div>

      {/* Motivational Banner */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-linear-to-r from-violet-600 via-pink-500 to-purple-600 rounded-3xl p-5 shadow-2xl border-2 border-violet-300"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between text-white gap-5">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-2.5 rounded-full">
              <Rocket className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-1.5">
                Keep Trading Smart!
              </h3>
              <p className="text-violet-100/90 font-light text-sm sm:text-base">
                Consistency and discipline are keys to long-term success.
              </p>
            </div>
          </div>
          <Motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/analytics")}
            className="w-full md:w-auto bg-white text-violet-600 hover:bg-violet-50 px-5 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>View Analytics</span>
          </Motion.button>
        </div>
      </Motion.div>

      {/* Balance Modal */}
      {showBalanceModal && (
        <BalanceModal setShowBalanceModal={handleCloseBalanceModal} />
      )}
    </div>
  );
};

export default Dashboard;
