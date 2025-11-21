import React from "react";
import { motion } from "framer-motion";
import { formatCompactCurrency } from '../utils/currencyFormatter';

const TargetProgressBanner = ({
  target,
  targetProgress,
  currency,
  initialBalance = 0, // TAMBAHKAN initialBalance sebagai prop
  size = 'large'
}) => {
  if (!target?.enabled || !targetProgress) return null;

  // Gunakan initialBalance dari prop atau dari targetProgress
  const displayInitialBalance = targetProgress.initialBalance || initialBalance;

  // Tentukan ukuran berdasarkan prop size
  const titleSize = size === 'large' ? 'text-3xl' : 'text-2xl';
  const valueSize = size === 'large' ? 'text-2xl' : 'text-xl';
  const daysRemainingSize = size === 'large' ? 'text-4xl' : 'text-3xl';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`p-6 rounded-3xl shadow-2xl border-2 ${
        targetProgress.useDailyTarget
          ? "bg-linear-to-r from-purple-500 to-indigo-600 text-white border-purple-300"
          : targetProgress.isCompleted
          ? "bg-linear-to-r from-emerald-500 to-green-600 text-white border-emerald-300"
          : targetProgress.isExpired
          ? "bg-linear-to-r from-rose-500 to-red-600 text-white border-rose-300"
          : "bg-linear-to-r from-orange-500 via-amber-500 to-yellow-500 text-white border-orange-300"
      }`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className={`${titleSize} font-bold mb-2 flex items-center gap-2`}>
            {targetProgress.useDailyTarget ? (
              <>
                <span className="text-4xl">📊</span> Target Harian
              </>
            ) : targetProgress.isCompleted ? (
              <>
                <span className="text-4xl">🎉</span> Target Achieved!
              </>
            ) : targetProgress.isExpired ? (
              <>
                <span className="text-4xl">⏰</span> Time Expired
              </>
            ) : (
              <>
                <span className="text-4xl">🚀</span> Active Target
              </>
            )}
          </h2>
          <p className="opacity-90 text-lg">
            {target.description ||
              (targetProgress.useDailyTarget
                ? `Target: ${target.dailyTargetPercentage}% per hari`
                : `Target: ${formatCompactCurrency(target.targetBalance, currency)}`)}
          </p>
        </div>
        {!targetProgress.useDailyTarget && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="mt-4 md:mt-0 text-right bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/30"
          >
            <div className="text-sm opacity-90 font-semibold">
              Days Remaining
            </div>
            <div className={`${daysRemainingSize} font-bold`}>
              {targetProgress.daysLeft}
            </div>
          </motion.div>
        )}
      </div>

      {/* Progress Bar - Hanya untuk target dengan tanggal */}
      {!targetProgress.useDailyTarget && (
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2 font-bold">
            <span>{formatCompactCurrency(displayInitialBalance, currency)}</span>
            <span>{formatCompactCurrency(target.targetBalance, currency)}</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-5 border-2 border-white/40">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${targetProgress.progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${
                targetProgress.isCompleted
                  ? "bg-white shadow-lg"
                  : targetProgress.isExpired
                  ? "bg-yellow-300 shadow-lg"
                  : "bg-white shadow-lg"
              }`}
            ></motion.div>
          </div>
        </div>
      )}

      {/* Progress Stats */}
      <div
        className={`grid gap-4 ${
          targetProgress.useDailyTarget
            ? "grid-cols-1 md:grid-cols-3"
            : "grid-cols-2 md:grid-cols-4"
        }`}
      >
        {targetProgress.useDailyTarget ? (
          // STATS UNTUK TARGET HARIAN
          <>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30"
            >
              <div className="text-sm opacity-90 font-semibold">
                Target Harian
              </div>
              <div className={`${valueSize} font-bold`}>
                {target.dailyTargetPercentage}%
              </div>
              <div className="text-sm opacity-90">
                ({formatCompactCurrency(target.dailyTargetAmount, currency)})
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30"
            >
              <div className="text-sm opacity-90 font-semibold">
                Rata-rata Harian
              </div>
              <div className={`${valueSize} font-bold`}>
                {formatCompactCurrency(targetProgress.dailyAchieved, currency)}
              </div>
              <div className="text-sm opacity-90">
                {targetProgress.daysPassed} hari
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`backdrop-blur-sm rounded-2xl p-4 border ${
                targetProgress.onTrack
                  ? "bg-emerald-500/30 border-emerald-300"
                  : "bg-amber-500/30 border-amber-300"
              }`}
            >
              <div className="text-sm opacity-90 font-semibold">Status</div>
              <div className={`${valueSize} font-bold`}>
                {targetProgress.onTrack ? "On Track" : "Perlu Improvement"}
              </div>
              <div className="text-sm opacity-90">
                {targetProgress.progress > 100
                  ? "100%"
                  : targetProgress.progress.toFixed(1)}
                %
              </div>
            </motion.div>
          </>
        ) : (
          // STATS UNTUK TARGET DENGAN TANGGAL
          <>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30"
            >
              <div className="text-sm opacity-90 font-semibold">
                Progress
              </div>
              <div className={`${valueSize} font-bold`}>
                {targetProgress.progress.toFixed(1)}%
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30"
            >
              <div className="text-sm opacity-90 font-semibold">
                Achieved
              </div>
              <div className={`${valueSize} font-bold`}>
                {formatCompactCurrency(targetProgress.achieved, currency)}
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30"
            >
              <div className="text-sm opacity-90 font-semibold">Needed</div>
              <div className={`${valueSize} font-bold`}>
                {formatCompactCurrency(targetProgress.totalNeeded, currency)}
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`backdrop-blur-sm rounded-2xl p-4 border ${
                targetProgress.onTrack
                  ? "bg-emerald-500/30 border-emerald-300"
                  : "bg-yellow-500/30 border-yellow-300"
              }`}
            >
              <div className="text-sm opacity-90 font-semibold">
                Daily Target
              </div>
              <div className={`${valueSize} font-bold`}>
                {formatCompactCurrency(Math.round(targetProgress.neededDaily), currency)}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default TargetProgressBanner;