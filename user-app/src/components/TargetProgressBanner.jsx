import React from "react";
import { motion as Motion } from "framer-motion";
import { 
  Target,
  Trophy,
  Clock,
  TrendingUp,
  BarChart3,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { formatCompactCurrency } from '../utils/currencyFormatter';

const TargetProgressBanner = ({
  target,
  targetProgress,
  currency,
  initialBalance = 0,
  size = 'large'
}) => {
  if (!target?.enabled || !targetProgress) return null;

  // Gunakan initialBalance dari prop atau dari targetProgress
  const displayInitialBalance = targetProgress.initialBalance || initialBalance;

  // Tentukan ukuran berdasarkan prop size
  const titleSize = size === 'large' ? 'text-xl sm:text-2xl lg:text-3xl' : 'text-lg sm:text-xl';
  const valueSize = size === 'large' ? 'text-lg sm:text-xl lg:text-2xl' : 'text-base sm:text-lg';
  const daysRemainingSize = size === 'large' ? 'text-2xl sm:text-3xl lg:text-4xl' : 'text-xl sm:text-2xl';

  // Tentukan ikon dan warna berdasarkan status
  const getBannerConfig = () => {
    if (targetProgress.useDailyTarget) {
      return {
        icon: BarChart3,
        gradient: "from-purple-500 to-indigo-600",
        border: "border-purple-300",
        iconColor: "text-white"
      };
    }
    
    if (targetProgress.isCompleted) {
      return {
        icon: Trophy,
        gradient: "from-emerald-500 to-green-600",
        border: "border-emerald-300",
        iconColor: "text-white"
      };
    }
    
    if (targetProgress.isExpired) {
      return {
        icon: Clock,
        gradient: "from-rose-500 to-red-600",
        border: "border-rose-300",
        iconColor: "text-white"
      };
    }
    
    return {
      icon: TrendingUp,
      gradient: "from-red-500 to-orange-500",
      border: "border-orange-300",
      iconColor: "text-white"
    };
  };

  const bannerConfig = getBannerConfig();
  const BannerIcon = bannerConfig.icon;

  // Fungsi untuk format target text
  const getTargetText = () => {
    if (targetProgress.useDailyTarget) {
      // Untuk target harian: tampilkan persentase
      return `Target: ${target.dailyTargetPercentage}% per hari (${formatCompactCurrency(target.dailyTargetAmount || 0, currency)})`;
    } else {
      // Untuk target dengan tanggal: tampilkan target balance
      return `Target: ${formatCompactCurrency(target.targetBalance || 0, currency)}`;
    }
  };

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`p-4 sm:p-6 rounded-3xl shadow-sm border bg-linear-to-r ${bannerConfig.gradient} text-white ${bannerConfig.border}`}
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div className="flex items-start gap-3 w-full md:w-auto">
          <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shrink-0`}>
            <BannerIcon className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 ${bannerConfig.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className={`${titleSize} font-bold mb-1 sm:mb-2 flex items-center gap-2 truncate`}>
              {targetProgress.useDailyTarget 
                ? "Target Harian"
                : targetProgress.isCompleted 
                ? "Target Achieved!"
                : targetProgress.isExpired 
                ? "Time Expired"
                : "Active Target"
              }
            </h2>
            <p className="opacity-90 text-sm sm:text-base lg:text-lg font-medium truncate">
              {getTargetText()}
            </p>
          </div>
        </div>
        
        {/* Days Remaining - hanya untuk target dengan tanggal */}
        {!targetProgress.useDailyTarget && (
          <Motion.div
            whileHover={{ scale: 1.05 }}
            className="w-full md:w-auto mt-4 md:mt-0 text-center md:text-right bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4 py-3 sm:px-6 sm:py-4 border border-white/30"
          >
            <div className="flex items-center justify-center md:justify-end gap-2 text-xs sm:text-sm opacity-90 font-semibold">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              Days Remaining
            </div>
            <div className={`${daysRemainingSize} font-bold`}>
              {targetProgress.daysLeft}
            </div>
          </Motion.div>
        )}
      </div>

      {/* Progress Bar - Hanya untuk target dengan tanggal */}
      {!targetProgress.useDailyTarget && (
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm mb-2 font-bold gap-1 sm:gap-0">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              {formatCompactCurrency(displayInitialBalance, currency)}
            </span>
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3 sm:w-4 sm:h-4" />
              {formatCompactCurrency(target.targetBalance, currency)}
            </span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-3 sm:h-4 lg:h-5 border border-white/40">
            <Motion.div
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
            ></Motion.div>
          </div>
        </div>
      )}

      {/* Progress Stats */}
      <div
        className={`grid gap-3 sm:gap-4 ${
          targetProgress.useDailyTarget
            ? "grid-cols-1 md:grid-cols-3"
            : "grid-cols-2 sm:grid-cols-2 md:grid-cols-4"
        }`}
      >
        {targetProgress.useDailyTarget ? (
          // STATS UNTUK TARGET HARIAN
          <>
            <Motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/30"
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm opacity-90 font-semibold">
                <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                Target Harian
              </div>
              <div className={`${valueSize} font-bold mt-1`}>
                {target.dailyTargetPercentage}%
              </div>
              <div className="text-xs sm:text-sm opacity-90 truncate">
                ({formatCompactCurrency(target.dailyTargetAmount, currency)})
              </div>
            </Motion.div>
            
            <Motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/30"
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm opacity-90 font-semibold">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                Rata-rata Harian
              </div>
              <div className={`${valueSize} font-bold mt-1`}>
                {formatCompactCurrency(targetProgress.dailyAchieved, currency)}
              </div>
              <div className="text-xs sm:text-sm opacity-90">
                {targetProgress.daysPassed} hari
              </div>
            </Motion.div>
            
            <Motion.div
              whileHover={{ scale: 1.05 }}
              className={`backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border ${
                targetProgress.onTrack
                  ? "bg-emerald-500/30 border-emerald-300"
                  : "bg-amber-500/30 border-amber-300"
              }`}
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm opacity-90 font-semibold">
                {targetProgress.onTrack ? (
                  <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                ) : (
                  <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
                Status
              </div>
              <div className={`${valueSize} font-bold mt-1`}>
                {targetProgress.onTrack ? "On Track" : "Perlu Improvement"}
              </div>
              <div className="text-xs sm:text-sm opacity-90">
                {targetProgress.progress > 100
                  ? "100%"
                  : targetProgress.progress.toFixed(1)}
                %
              </div>
            </Motion.div>
          </>
        ) : (
          // STATS UNTUK TARGET DENGAN TANGGAL
          <>
            <Motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/30"
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm opacity-90 font-semibold">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                Progress
              </div>
              <div className={`${valueSize} font-bold mt-1`}>
                {targetProgress.progress.toFixed(1)}%
              </div>
            </Motion.div>
            
            <Motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/30"
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm opacity-90 font-semibold">
                <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                Achieved
              </div>
              <div className={`${valueSize} font-bold mt-1`}>
                {formatCompactCurrency(targetProgress.achieved, currency)}
              </div>
            </Motion.div>
            
            <Motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/30"
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm opacity-90 font-semibold">
                <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                Needed
              </div>
              <div className={`${valueSize} font-bold mt-1`}>
                {formatCompactCurrency(targetProgress.totalNeeded, currency)}
              </div>
            </Motion.div>
            
            <Motion.div
              whileHover={{ scale: 1.05 }}
              className={`backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border ${
                targetProgress.onTrack
                  ? "bg-emerald-500/30 border-emerald-300"
                  : "bg-amber-500/30 border-amber-300"
              }`}
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm opacity-90 font-semibold">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                Daily Target
              </div>
              <div className={`${valueSize} font-bold mt-1`}>
                {formatCompactCurrency(Math.round(targetProgress.neededDaily), currency)}
              </div>
            </Motion.div>
          </>
        )}
      </div>
    </Motion.div>
  );
};

export default TargetProgressBanner;