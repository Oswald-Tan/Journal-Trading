import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import StatCard from "./StatCard";
import { formatCurrency, formatCompactCurrency } from '../utils/currencyFormatter';
import TargetProgressBanner from '../components/TargetProgressBanner';
import BalanceModal from "./modals/BalanceModal";

const Dashboard = ({
  entries = [],
  stats = {},
  target = {},
  targetProgress,
  initialBalance = 0,
  currentBalance = 0,
}) => {
  const navigate = useNavigate();
  const { currency } = useSelector((state) => state.balance);

  const [showBalanceModal, setShowBalanceModal] = useState(false);

  const balanceState = useSelector((state) => state.balance);
  const actualInitialBalance = initialBalance || balanceState.initialBalance || 0;
  const actualCurrentBalance = currentBalance || balanceState.currentBalance || 0;

  // TAMBAH: Handler untuk modal
  const handleShowBalanceModal = () => {
    setShowBalanceModal(true);
  };

  const handleCloseBalanceModal = () => {
    setShowBalanceModal(false);
  };

  // PERBAIKAN: Gabungkan stats dengan balance dari props terpisah - FIX DUPLICATE KEY
  const safeStats = useMemo(() => {
    // Prioritaskan props terpisah, lalu stats, lalu default
    const computedInitialBalance = initialBalance || stats?.initialBalance || 0;
    const computedCurrentBalance = currentBalance || stats?.currentBalance || 0;

    // Buat object tanpa duplikasi - HAPUS balance dari stats spread
    const {
      initialBalance: statsInitial,
      currentBalance: statsCurrent,
      ...restStats
    } = stats || {};

    const mergedStats = {
      // Default values
      netProfit: 0,
      totalTrades: 0,
      winRate: 0,
      avgProfit: 0,
      roi: 0,
      totalPips: 0,
      avgPips: 0,
      largestWin: 0,
      largestLoss: 0,
      profitFactor: 0,

      // Spread stats TANPA balance fields
      ...restStats,

      // Set balance values dari computed values
      initialBalance: computedInitialBalance,
      currentBalance: computedCurrentBalance,
    };

    return mergedStats;
  }, [stats, initialBalance, currentBalance]);

  const safeTarget = useMemo(
    () => ({
      enabled: target?.enabled || false,
      targetBalance: target?.targetBalance || 0,
      targetDate: target?.targetDate || "",
      description: target?.description || "",
      useDailyTarget: target?.useDailyTarget || false,
      dailyTargetPercentage: target?.dailyTargetPercentage || 0,
      dailyTargetAmount: target?.dailyTargetAmount || 0,
      ...target,
    }),
    [target]
  );

  const chartData = useMemo(() => {
    const data = [
      { date: "Start", balance: safeStats.initialBalance, profit: 0 },
    ];
    entries.forEach((e) => {
      data.push({
        date: e.date,
        balance: e.balanceAfter,
        profit: e.profit,
      });
    });

    if (safeTarget.enabled) {
      data.forEach((point) => {
        point.target = safeTarget.targetBalance;
      });
    }

    return data;
  }, [entries, safeStats.initialBalance, safeTarget]);

  const performanceData = useMemo(() => {
    const monthlyData = {};
    entries.forEach((entry) => {
      const month = entry.date.substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { profit: 0, trades: 0, wins: 0 };
      }
      monthlyData[month].profit += entry.profit;
      monthlyData[month].trades += 1;
      if (entry.result?.toLowerCase().includes("win")) {
        monthlyData[month].wins += 1;
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      profit: data.profit,
      trades: data.trades,
      winRate: Math.round((data.wins / data.trades) * 100) || 0,
    }));
  }, [entries]);

  const recentTrades = useMemo(() => {
    return entries.slice(-5).reverse();
  }, [entries]);

  return (
    <div className="space-y-6 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-orange-900 flex items-center gap-2">
            Trading Dashboard
          </h1>
          <p className="text-orange-700 mt-1">Your complete trading overview</p>
        </div>
      </motion.div>

      {/* PERBAIKAN: Target Progress Banner yang konsisten dengan halaman Targets */}
      <TargetProgressBanner
        target={safeTarget}
        targetProgress={targetProgress}
        currency={currency}
        initialBalance={actualInitialBalance}
        size="medium"
      />

      {/* Quick Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <StatCard
          label="Total Trades"
          value={safeStats.totalTrades}
          color="text-orange-900"
          bg="bg-linear-to-br from-orange-100 to-amber-100 border-orange-200"
          icon="📈"
        />
        <StatCard
          label="Win Rate"
          value={`${safeStats.winRate}%`}
          color="text-purple-900"
          bg="bg-linear-to-br from-purple-100 to-violet-100 border-purple-200"
          icon="🎯"
        />
        <StatCard
          label="Net Profit"
          value={formatCompactCurrency(safeStats.netProfit, currency)}
          color={
            safeStats.netProfit >= 0 ? "text-emerald-900" : "text-rose-900"
          }
          bg={
            safeStats.netProfit >= 0
              ? "bg-linear-to-br from-emerald-100 to-green-100 border-emerald-200"
              : "bg-linear-to-br from-rose-100 to-red-100 border-rose-200"
          }
          icon={safeStats.netProfit >= 0 ? "💰" : "📉"}
        />
        <StatCard
          label="Balance"
          value={formatCompactCurrency(safeStats.currentBalance, currency)}
          color="text-amber-900"
          bg="bg-linear-to-br from-amber-100 to-yellow-100 border-amber-200"
          icon="💵"
        />
      </motion.div>

      {/* Charts Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Equity Curve */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-orange-100">
          <h3 className="text-lg font-bold mb-4 text-orange-900 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Equity Curve {safeTarget.enabled && "& Target"}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ left: 30, right: 20, top: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                <XAxis
                  dataKey="date"
                  stroke="#9a3412"
                  tick={{ fontSize: 12, fontWeight: 600 }}
                  tickFormatter={(value) => {
                    if (value === "Start") return "Start";
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis
                  stroke="#9a3412"
                  width={70}
                  tick={{ fontSize: 11, fontWeight: 600 }}
                  tickFormatter={(value) => formatCompactCurrency(value, currency)}
                />
                <Tooltip
                  formatter={(value, name) => {
                    return [
                      formatCurrency(value, currency),
                      name === "balance"
                        ? "Balance"
                        : name === "target"
                        ? "Target"
                        : "Profit",
                    ];
                  }}
                  labelFormatter={(label) => {
                    if (label === "Start") return "Start Period";
                    const date = new Date(label);
                    return date.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });
                  }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "2px solid #fb923c",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    backgroundColor: "#fffbeb",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#f97316"
                  strokeWidth={4}
                  dot={{
                    r: 5,
                    stroke: "#ea580c",
                    strokeWidth: 2,
                    fill: "#fff",
                  }}
                  activeDot={{ r: 7, stroke: "#ea580c", strokeWidth: 2 }}
                />
                {safeTarget.enabled && (
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#ef4444"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Performance */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-orange-100">
          <h3 className="text-lg font-bold mb-4 text-orange-900 flex items-center gap-2">
            <span className="text-2xl">📅</span>
            Monthly Performance
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performanceData}
                margin={{ left: 30, right: 20, top: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                <XAxis
                  dataKey="month"
                  stroke="#9a3412"
                  tick={{ fontSize: 11, fontWeight: 600 }}
                  tickFormatter={(value) => {
                    const [year, month] = value.split("-");
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
                    return `${monthNames[parseInt(month) - 1]} ${year.slice(
                      2
                    )}`;
                  }}
                />
                <YAxis
                  stroke="#9a3412"
                  width={70}
                  tick={{ fontSize: 11, fontWeight: 600 }}
                  tickFormatter={(value) => formatCompactCurrency(value, currency)}
                />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "profit") {
                      return [formatCurrency(value, currency), "Profit"];
                    }
                    return [value, name === "trades" ? "Trades" : "Win Rate %"];
                  }}
                  labelFormatter={(label) => {
                    const [year, month] = label.split("-");
                    const monthNames = [
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ];
                    return `${monthNames[parseInt(month) - 1]} ${year}`;
                  }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "2px solid #fb923c",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    backgroundColor: "#fffbeb",
                  }}
                />
                <Bar dataKey="profit" radius={[8, 8, 0, 0]}>
                  {performanceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.profit >= 0 ? "#f97316" : "#ef4444"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Bottom Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Recent Trades */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-orange-100">
          <h3 className="text-lg font-bold mb-4 text-orange-900 flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            Recent Trades
          </h3>
          <div className="space-y-3">
            {recentTrades.map((trade, index) => (
              <motion.div
                key={trade.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 5, scale: 1.02 }}
                className="flex items-center justify-between p-3 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all duration-200 border border-orange-200"
              >
                <div className="flex items-center space-x-3">
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className={`w-3 h-3 rounded-full ${
                      trade.result?.toLowerCase().includes("win")
                        ? "bg-emerald-500"
                        : "bg-rose-500"
                    }`}
                  ></motion.div>
                  <div>
                    <div className="font-bold text-sm text-orange-900">
                      {trade.instrument}
                    </div>
                    <div className="text-xs text-orange-600">{trade.date}</div>
                  </div>
                </div>
                <div
                  className={`font-bold text-sm ${
                    trade.profit >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {formatCompactCurrency(trade.profit, currency)}
                </div>
              </motion.div>
            ))}
            {recentTrades.length === 0 && (
              <div className="text-center py-8 text-orange-600">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-4xl mb-2"
                >
                  📊
                </motion.div>
                <p className="font-semibold">No recent trades</p>
                <p className="text-sm mt-1">
                  Start adding trades to see them here
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Account Summary */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-orange-100">
          <h3 className="text-lg font-bold mb-4 text-orange-900 flex items-center gap-2">
            <span className="text-2xl">💼</span>
            Account Summary
          </h3>
          <div className="space-y-3">
            <motion.div
              whileHover={{ x: 5 }}
              className="flex justify-between items-center py-3 px-3 bg-orange-50 rounded-xl border-b border-orange-200"
            >
              <span className="text-orange-700 font-semibold">
                Initial Deposit
              </span>
              <span className="font-bold text-orange-900">
                {formatCompactCurrency(actualInitialBalance, currency)}
              </span>
            </motion.div>
            <motion.div
              whileHover={{ x: 5 }}
              className="flex justify-between items-center py-3 px-3 bg-orange-50 rounded-xl border-b border-orange-200"
            >
              <span className="text-orange-700 font-semibold">
                Current Balance
              </span>
              <span className="font-bold text-orange-900">
                {formatCompactCurrency(safeStats.currentBalance, currency)}
              </span>
            </motion.div>
            <motion.div
              whileHover={{ x: 5 }}
              className="flex justify-between items-center py-3 px-3 bg-orange-50 rounded-xl border-b border-orange-200"
            >
              <span className="text-orange-700 font-semibold">
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
            </motion.div>
            <motion.div
              whileHover={{ x: 5 }}
              className="flex justify-between items-center py-3 px-3 bg-orange-50 rounded-xl"
            >
              <span className="text-orange-700 font-semibold">ROI</span>
              <span
                className={`font-bold ${
                  Number(safeStats.roi) >= 0
                    ? "text-emerald-600"
                    : "text-rose-600"
                }`}
              >
                {safeStats.roi}%
              </span>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShowBalanceModal}
              className="w-full mt-4 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3 rounded-xl transition-all duration-200 font-bold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              💳 Update Deposit
            </motion.button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-orange-100">
          <h3 className="text-lg font-bold mb-4 text-orange-900 flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            Quick Actions
          </h3>
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/targets")}
              className="cursor-pointer w-full text-left p-5 bg-linear-to-br from-orange-500 to-amber-500 rounded-2xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl border-2 border-orange-400/50"
            >
              <span className="text-3xl mr-4">🎯</span>
              <div>
                <div className="font-bold text-white text-base">
                  {safeTarget.enabled ? "Manage Target" : "Set Trading Target"}
                </div>
                <div className="text-sm text-orange-100 mt-1">
                  {safeTarget.enabled
                    ? "Update your trading goals"
                    : "Set your financial targets"}
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/trades")}
              className="cursor-pointer w-full text-left p-5 bg-linear-to-br from-blue-500 to-cyan-500 rounded-2xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl border-2 border-blue-300/50"
            >
              <span className="text-3xl mr-4">📝</span>
              <div>
                <div className="font-bold text-white text-base">
                  Add New Trade
                </div>
                <div className="text-sm text-blue-100 mt-1">
                  Record your latest trade
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/analytics")}
              className="cursor-pointer w-full text-left p-5 bg-linear-to-br from-purple-500 to-violet-500 rounded-2xl hover:from-purple-600 hover:to-violet-600 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl border-2 border-purple-300/50"
            >
              <span className="text-3xl mr-4">📊</span>
              <div>
                <div className="font-bold text-white text-base">
                  View Full Analytics
                </div>
                <div className="text-sm text-purple-100 mt-1">
                  Deep dive into your performance
                </div>
              </div>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Motivational Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-linear-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-3xl p-6 shadow-2xl border-2 border-orange-300"
      >
        <div className="flex items-center justify-between text-white">
          <div>
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <span className="text-3xl">🚀</span>
              Keep Trading Smart!
            </h3>
            <p className="text-orange-100">
              Consistency and discipline are keys to long-term success.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/analytics")}
            className="cursor-pointer bg-white text-orange-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
          >
            📈 View Analytics
          </motion.button>
        </div>
      </motion.div>

      {showBalanceModal && (
        <BalanceModal setShowBalanceModal={handleCloseBalanceModal} />
      )}
    </div>
  );
};

export default Dashboard;