import React, { useEffect, useMemo } from "react";
import { motion as Motion } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import { getTargetProgress } from "../features/targetSlice";
import {
  formatCurrency,
  formatCompactCurrency,
} from "../utils/currencyFormatter";
import TargetProgressBanner from "../components/TargetProgressBanner";
import Swal from "sweetalert2"; // IMPORT SWAL

const Targets = ({ onShowTargetModal = () => {} }) => {
  const dispatch = useDispatch();
  const { target, targetProgress, isLoading } = useSelector(
    (state) => state.target
  );
  const { initialBalance, currentBalance, currency } = useSelector(
    (state) => state.balance
  );
  const stats = useSelector((state) => state.trades.stats) || {};

  // PERBAIKAN: Fungsi handleSetTarget dengan pengecekan balance
  const handleSetTarget = () => {
    console.log("handleSetTarget called - current balance:", currentBalance);
    
    // PERBAIKAN: Validasi balance tidak boleh 0
    if (
      currentBalance === 0 ||
      currentBalance === null ||
      currentBalance === undefined
    ) {
      console.log("Balance is 0, showing warning modal");
      Swal.fire({
        title: "Balance Masih 0",
        text: "Silakan set balance terlebih dahulu sebelum membuat target trading.",
        icon: "warning",
        confirmButtonColor: "#f97316",
        background: "#fff",
        color: "#1f2937",
        customClass: {
          popup: "rounded-3xl shadow-2xl",
          title: "text-xl font-bold text-orange-900",
          confirmButton: "rounded-xl font-semibold px-6 py-3",
        },
      });
      return;
    }

    // Jika balance valid, panggil modal target
    onShowTargetModal();
  };

  // PERBAIKAN: Optimalkan useEffect untuk mencegah infinite loop
  useEffect(() => {
    console.log("Targets useEffect triggered", {
      enabled: target.enabled,
      isLoading,
      hasTargetProgress: !!targetProgress,
    });

    // Hanya fetch jika target enabled dan belum loading
    if (target.enabled && !isLoading && !targetProgress) {
      console.log("Dispatching getTargetProgress");
      dispatch(getTargetProgress());
    }
  }, [dispatch, target.enabled, isLoading, targetProgress]);

  const targetData = useMemo(() => {
    if (!target) return [];

    if (target.useDailyTarget) {
      return [
        { period: "Start", balance: initialBalance, target: initialBalance },
        {
          period: "Current",
          balance: currentBalance,
          target: initialBalance + (target.dailyTargetAmount || 0),
        },
        {
          period: "Daily Target",
          balance: initialBalance + (target.dailyTargetAmount || 0),
          target: initialBalance + (target.dailyTargetAmount || 0),
        },
      ];
    } else {
      return [
        {
          period: "Start",
          balance: initialBalance,
          target: target.targetBalance,
        },
        {
          period: "Current",
          balance: currentBalance,
          target: target.targetBalance,
        },
        {
          period: "Target",
          balance: target.targetBalance,
          target: target.targetBalance,
        },
      ];
    }
  }, [initialBalance, currentBalance, target]);

  const milestones = useMemo(
    () => [
      {
        label: "10% Profit",
        target: initialBalance * 1.1,
        achieved: currentBalance >= initialBalance * 1.1,
      },
      {
        label: "25% Profit",
        target: initialBalance * 1.25,
        achieved: currentBalance >= initialBalance * 1.25,
      },
      {
        label: "50% Profit",
        target: initialBalance * 1.5,
        achieved: currentBalance >= initialBalance * 1.5,
      },
      {
        label: "100% Profit (2x)",
        target: initialBalance * 2,
        achieved: currentBalance >= initialBalance * 2,
      },
      {
        label: "200% Profit (3x)",
        target: initialBalance * 3,
        achieved: currentBalance >= initialBalance * 3,
      },
    ],
    [initialBalance, currentBalance]
  );

  // Custom Tooltip Formatter untuk chart
  const renderTooltipContent = (value, name) => {
    if (name === "balance" || name === "target") {
      return [
        formatCurrency(value, currency),
        name === "balance" ? "Balance" : "Target",
      ];
    }
    return [value, name];
  };

  const MilestoneCard = ({ milestone }) => (
    <Motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`p-4 rounded-2xl border-2 shadow-lg ${
        milestone.achieved
          ? "border-emerald-300 bg-linear-to-br from-emerald-100 to-green-100"
          : "border-orange-200 bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <span
          className={`font-bold ${
            milestone.achieved ? "text-emerald-800" : "text-orange-900"
          }`}
        >
          {milestone.label}
        </span>
        {milestone.achieved && (
          <Motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md"
          >
            ✓ DONE
          </Motion.span>
        )}
      </div>
      <div className="text-sm text-orange-700 font-semibold mb-2">
        Target: {formatCompactCurrency(milestone.target, currency)}
      </div>
      <div className="mt-2 w-full bg-orange-200 rounded-full h-3 border border-orange-300">
        <Motion.div
          initial={{ width: 0 }}
          animate={{
            width: `${Math.min(
              100,
              (currentBalance / milestone.target) * 100
            )}%`,
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${
            milestone.achieved
              ? "bg-emerald-500 shadow-lg"
              : "bg-orange-500 shadow-md"
          }`}
        ></Motion.div>
      </div>
      <div
        className={`text-xs font-bold mt-2 ${
          milestone.achieved ? "text-emerald-600" : "text-orange-600"
        }`}
      >
        {Math.round((currentBalance / milestone.target) * 100)}% Complete
      </div>
    </Motion.div>
  );

  // PERBAIKAN: Improved loading state dengan timeout fallback
  if (isLoading && !targetProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col space-y-4">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
        <p className="text-orange-700 font-semibold">
          Loading target progress...
        </p>
      </div>
    );
  }

  if (!target.enabled) {
    return (
      <div className="space-y-6 min-h-screen">
        {/* Header */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-orange-900 flex items-center gap-2">
              Trading Targets
            </h1>
            <p className="text-orange-700 mt-1">
              Set and track your trading goals
            </p>
          </div>
        </Motion.div>

        {/* Empty State */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl border border-orange-100 shadow-xl p-12 text-center"
        >
          <div className="max-w-md mx-auto">
            <Motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="text-6xl mb-4"
            >
              🎯
            </Motion.div>
            <h3 className="text-xl font-bold text-orange-900 mb-2">
              No Target Set
            </h3>
            <p className="text-orange-700 mb-6">
              Set a trading target to track your progress and stay motivated
              towards your financial goals.
            </p>
            {/* PERBAIKAN: Ganti onShowTargetModal dengan handleSetTarget */}
            <Motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSetTarget} // DIUBAH DARI onShowTargetModal
              className="bg-linear-to-r from-orange-500 to-amber-500 text-white px-8 py-4 rounded-xl transition-all duration-200 font-bold shadow-lg hover:shadow-xl"
            >
              Set Your First Target
            </Motion.button>
          </div>
        </Motion.div>

        {/* Quick Stats */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-linear-to-br from-orange-100 to-amber-100 border-2 border-orange-200 rounded-2xl px-6 py-4 shadow-lg text-center"
          >
            <div className="text-sm text-orange-700 font-semibold">
              Current Balance
            </div>
            <div className="font-bold text-2xl text-orange-900">
              {formatCompactCurrency(currentBalance, currency)}
            </div>
          </Motion.div>
          <Motion.div
            whileHover={{ scale: 1.05 }}
            className={`bg-linear-to-br ${
              stats.netProfit >= 0
                ? "from-emerald-100 to-green-100 border-emerald-200"
                : "from-rose-100 to-red-100 border-rose-200"
            } border-2 rounded-2xl px-6 py-4 shadow-lg text-center`}
          >
            <div
              className={`text-sm ${
                stats.netProfit >= 0 ? "text-emerald-700" : "text-rose-700"
              } font-semibold`}
            >
              Net Profit
            </div>
            <div
              className={`font-bold text-2xl ${
                stats.netProfit >= 0 ? "text-emerald-900" : "text-rose-900"
              }`}
            >
              {formatCompactCurrency(stats.netProfit || 0, currency)}
            </div>
          </Motion.div>
          <Motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-linear-to-br from-purple-100 to-violet-100 border-2 border-purple-200 rounded-2xl px-6 py-4 shadow-lg text-center"
          >
            <div className="text-sm text-purple-700 font-semibold">
              Win Rate
            </div>
            <div className="font-bold text-2xl text-purple-900">
              {stats.winRate || 0}%
            </div>
          </Motion.div>
          <Motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-linear-to-br from-amber-100 to-yellow-100 border-2 border-amber-200 rounded-2xl px-6 py-4 shadow-lg text-center"
          >
            <div className="text-sm text-amber-700 font-semibold">
              Total Trades
            </div>
            <div className="font-bold text-2xl text-amber-900">
              {stats.totalTrades || 0}
            </div>
          </Motion.div>
        </Motion.div>
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
          <h1 className="text-3xl font-bold text-orange-900 flex items-center gap-2">
            <span className="text-4xl">🎯</span>
            Trading Targets
          </h1>
          <p className="text-orange-700 mt-1">
            Track your progress towards your trading goals
          </p>
        </div>

        {/* PERBAIKAN: Ganti onShowTargetModal dengan handleSetTarget */}
        <Motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSetTarget} // DIUBAH DARI onShowTargetModal
          className="bg-linear-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl transition-all duration-200 font-bold shadow-lg hover:shadow-xl"
        >
          Edit Target
        </Motion.button>
      </Motion.div>

      {/* Main Target Progress - MENGGUNAKAN KOMPONEN BARU */}
      <TargetProgressBanner
        target={target}
        targetProgress={targetProgress}
        currency={currency}
        initialBalance={initialBalance}
        size="large"
      />

      {/* Progress Chart and Stats */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Progress Chart */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-orange-100 shadow-xl">
          <h3 className="text-lg font-bold mb-4 text-orange-900 flex items-center gap-2">
            <span className="text-2xl">📈</span>
            Target Progress
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={targetData}
                margin={{ left: 30, right: 20, top: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                <XAxis
                  dataKey="period"
                  stroke="#9a3412"
                  tick={{ fontSize: 12, fontWeight: 600 }}
                />
                <YAxis
                  stroke="#9a3412"
                  width={70}
                  tick={{ fontSize: 11, fontWeight: 600 }}
                  tickFormatter={(value) =>
                    formatCompactCurrency(value, currency)
                  }
                />
                <Tooltip
                  formatter={renderTooltipContent}
                  labelFormatter={(label) => `Period: ${label}`}
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
                    r: 8,
                    stroke: "#ea580c",
                    strokeWidth: 2,
                    fill: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#ef4444"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="space-y-4">
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-orange-100 shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-orange-900 flex items-center gap-2">
              <span className="text-2xl">💼</span>
              Performance
            </h3>
            <div className="space-y-3">
              <Motion.div
                whileHover={{ x: 5 }}
                className="flex justify-between items-center p-3 bg-orange-50 rounded-xl"
              >
                <span className="text-orange-700 font-semibold">
                  Current Status
                </span>
                <span
                  className={`font-bold px-3 py-1 rounded-full ${
                    targetProgress?.onTrack
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {targetProgress?.onTrack ? "✓ On Track" : "⚠ Behind"}
                </span>
              </Motion.div>
              <Motion.div
                whileHover={{ x: 5 }}
                className="flex justify-between items-center p-3 bg-orange-50 rounded-xl"
              >
                <span className="text-orange-700 font-semibold">
                  Required Daily
                </span>
                <span className="font-bold text-orange-900">
                  {formatCompactCurrency(
                    Math.round(targetProgress?.neededDaily || 0),
                    currency
                  )}
                </span>
              </Motion.div>
              <Motion.div
                whileHover={{ x: 5 }}
                className="flex justify-between items-center p-3 bg-orange-50 rounded-xl"
              >
                <span className="text-orange-700 font-semibold">
                  Daily Average
                </span>
                <span className="font-bold text-purple-700">
                  {formatCompactCurrency(
                    Math.round(
                      (targetProgress?.achieved || 0) /
                        Math.max(1, targetProgress?.daysPassed || 1)
                    ),
                    currency
                  )}
                </span>
              </Motion.div>
              <Motion.div
                whileHover={{ x: 5 }}
                className="flex justify-between items-center p-3 bg-orange-50 rounded-xl"
              >
                <span className="text-orange-700 font-semibold">
                  Target Date
                </span>
                <span className="font-bold text-orange-900">
                  {target.targetDate}
                </span>
              </Motion.div>
            </div>
          </div>
        </div>
      </Motion.div>

      {/* Milestones */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/80 backdrop-blur-md rounded-3xl border border-orange-100 shadow-xl overflow-hidden"
      >
        <div className="p-6 border-b border-orange-200 bg-orange-50">
          <h3 className="text-lg font-bold text-orange-900 flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            Progress Milestones
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {milestones.map((milestone, index) => (
              <MilestoneCard key={index} milestone={milestone} />
            ))}
          </div>
        </div>
      </Motion.div>

      {/* Additional Stats */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-linear-to-br from-orange-100 to-amber-100 border-2 border-orange-200 rounded-2xl px-6 py-4 shadow-lg"
        >
          <div className="text-sm text-orange-700 font-semibold">
            Initial Balance
          </div>
          <div className="font-bold text-2xl text-orange-900">
            {formatCompactCurrency(initialBalance, currency)}
          </div>
          <div className="text-xs text-orange-600 mt-1">Starting capital</div>
        </Motion.div>
        <Motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-linear-to-br from-purple-100 to-violet-100 border-2 border-purple-200 rounded-2xl px-6 py-4 shadow-lg"
        >
          <div className="text-sm text-purple-700 font-semibold">
            Current Balance
          </div>
          <div className="font-bold text-2xl text-purple-900">
            {formatCompactCurrency(currentBalance, currency)}
          </div>
          <div className="text-xs text-purple-600 mt-1">Present value</div>
        </Motion.div>
        <Motion.div
          whileHover={{ scale: 1.05 }}
          className={`bg-linear-to-br ${
            stats.netProfit >= 0
              ? "from-emerald-100 to-green-100 border-emerald-200"
              : "from-rose-100 to-red-100 border-rose-200"
          } border-2 rounded-2xl px-6 py-4 shadow-lg`}
        >
          <div
            className={`text-sm ${
              stats.netProfit >= 0 ? "text-emerald-700" : "text-rose-700"
            } font-semibold`}
          >
            Profit/Loss
          </div>
          <div
            className={`font-bold text-2xl ${
              stats.netProfit >= 0 ? "text-emerald-900" : "text-rose-900"
            }`}
          >
            {formatCompactCurrency(stats.netProfit || 0, currency)}
          </div>
          <div
            className={`text-xs ${
              stats.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"
            } mt-1`}
          >
            Net gain/loss
          </div>
        </Motion.div>
        <Motion.div
          whileHover={{ scale: 1.05 }}
          className={`bg-linear-to-br ${
            Number(stats.roi) >= 0
              ? "from-emerald-100 to-green-100 border-emerald-200"
              : "from-rose-100 to-red-100 border-rose-200"
          } border-2 rounded-2xl px-6 py-4 shadow-lg`}
        >
          <div
            className={`text-sm ${
              Number(stats.roi) >= 0 ? "text-emerald-700" : "text-rose-700"
            } font-semibold`}
          >
            ROI
          </div>
          <div
            className={`font-bold text-2xl ${
              Number(stats.roi) >= 0 ? "text-emerald-900" : "text-rose-900"
            }`}
          >
            {stats.roi || 0}%
          </div>
          <div
            className={`text-xs ${
              Number(stats.roi) >= 0 ? "text-emerald-600" : "text-rose-600"
            } mt-1`}
          >
            Return on investment
          </div>
        </Motion.div>
      </Motion.div>
    </div>
  );
};

export default Targets;