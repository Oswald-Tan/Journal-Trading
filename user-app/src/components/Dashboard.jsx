import React, { useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
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

  // PERBAIKAN: Hapus variabel yang tidak digunakan
  const actualInitialBalance = initialBalance || 0;

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

    // PERBAIKAN: Gunakan underscore untuk variabel yang tidak digunakan
    const {
      initialBalance: _statsInitial,
      currentBalance: _statsCurrent,
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
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-violet-600" />
            Trading Dashboard
          </h1>
          <p className="text-slate-600 mt-1 font-light">
            Your complete trading overview
          </p>
        </div>
      </Motion.div>

      {/* PERBAIKAN: Target Progress Banner yang konsisten dengan halaman Targets */}
      <TargetProgressBanner
        target={safeTarget}
        targetProgress={targetProgress}
        currency={currency}
        initialBalance={actualInitialBalance}
        size="medium"
      />

      {/* Quick Stats Grid */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <StatCard
          label="Total Trades"
          value={safeStats.totalTrades}
          color="text-slate-800"
          bg="bg-white"
          icon={<TrendingUp className="w-5 h-5 text-violet-500" />}
        />
        <StatCard
          label="Win Rate"
          value={`${safeStats.winRate}%`}
          color="text-slate-800"
          bg="bg-white"
          icon={<Target className="w-5 h-5 text-violet-500" />}
        />
        <StatCard
          label="Net Profit"
          value={formatCompactCurrency(safeStats.netProfit, currency)}
          color={
            safeStats.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"
          }
          bg="bg-white"
          icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          label="Balance"
          value={formatCompactCurrency(safeStats.currentBalance, currency)}
          color="text-slate-800"
          bg="bg-white"
          icon={<Wallet className="w-5 h-5 text-violet-500" />}
        />
      </Motion.div>

      {/* Charts Row */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Equity Curve */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-4 text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-600" />
            Equity Curve {safeTarget.enabled && "& Target"}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ left: 0, right: 0, top: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  stroke="#475569"
                  tick={{ fontSize: 12, fontWeight: 600 }}
                  tickFormatter={(value) => {
                    if (value === "Start") return "Start";
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis
                  stroke="#475569"
                  width={70}
                  tick={{ fontSize: 11, fontWeight: 600 }}
                  tickFormatter={(value) =>
                    formatCompactCurrency(value, currency)
                  }
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
                    border: "2px solid #8b5cf6",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    backgroundColor: "#fafafa",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#8b5cf6"
                  strokeWidth={4}
                  dot={{
                    r: 5,
                    stroke: "#7c3aed",
                    strokeWidth: 2,
                    fill: "#fff",
                  }}
                  activeDot={{ r: 7, stroke: "#7c3aed", strokeWidth: 2 }}
                />
                {safeTarget.enabled && (
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#ec4899"
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
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-4 text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-violet-600" />
            Monthly Performance
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performanceData}
                margin={{ left: 0, right: 0, top: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  stroke="#475569"
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
                  stroke="#475569"
                  width={70}
                  tick={{ fontSize: 11, fontWeight: 600 }}
                  tickFormatter={(value) =>
                    formatCompactCurrency(value, currency)
                  }
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
                    border: "2px solid #8b5cf6",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    backgroundColor: "#fafafa",
                  }}
                />
                <Bar dataKey="profit" radius={[8, 8, 0, 0]}>
                  {performanceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.profit >= 0 ? "#8b5cf6" : "#ef4444"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
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
            Recent Trades
          </h3>
          <div className="space-y-3">
            {recentTrades.map((trade, index) => (
              <Motion.div
                key={trade.id}
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
            ))}
            {recentTrades.length === 0 && (
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
              onClick={() => navigate("/targets")}
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

      {showBalanceModal && (
        <BalanceModal setShowBalanceModal={handleCloseBalanceModal} />
      )}
    </div>
  );
};

export default Dashboard;
