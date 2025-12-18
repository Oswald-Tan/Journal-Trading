import React, { useState, useEffect } from "react";
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
  Zap,
  CalendarDays,
  Loader
} from 'lucide-react';
import { formatCompactCurrency } from '../utils/currencyFormatter';

const TargetProgressBanner = ({
  target,
  targetProgress,
  currency,
  initialBalance = 0,
  size = 'large'
}) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [displayData, setDisplayData] = useState(null);

  // PERBAIKAN: Gunakan useEffect untuk sinkronisasi data
  useEffect(() => {
    if (!target?.enabled) {
      setDisplayData(null);
      setIsInitializing(false);
      return;
    }

    // Jika target enabled tapi targetProgress null, tunggu sebentar
    if (target?.enabled && !targetProgress) {
      // Set timeout untuk memberi waktu loading
      const timer = setTimeout(() => {
        setIsInitializing(false);
      }, 500);
      return () => clearTimeout(timer);
    }

    // Jika targetProgress ada, langsung set data
    if (targetProgress && targetProgress.progress !== undefined) {
      setIsInitializing(false);
      setDisplayData({
        progress: targetProgress.progress,
        daysLeft: targetProgress.daysLeft || 0,
        neededDaily: targetProgress.neededDaily || 0,
        achieved: targetProgress.achieved || 0,
        daysPassed: targetProgress.daysPassed || 0,
        onTrack: targetProgress.onTrack || false,
        useDailyTarget: targetProgress.useDailyTarget || false,
        isCompleted: targetProgress.isCompleted || false,
        isExpired: targetProgress.isExpired || false,
        initialBalance: targetProgress.initialBalance || initialBalance,
        currentBalance: targetProgress.currentBalance || initialBalance,
        totalNeeded: targetProgress.totalNeeded || 0,
        dailyAchieved: targetProgress.dailyAchieved || 0,
        dailyTarget: targetProgress.dailyTarget || 0,
      });
    }
  }, [target, targetProgress, initialBalance]);

  // PERBAIKAN: Cek dengan lebih ketat
  if (!target?.enabled || isInitializing) {
    return null;
  }

  if (!displayData) {
    // Tampilkan loading jika data belum siap
    return (
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 sm:p-6 rounded-3xl shadow-sm border bg-linear-to-r from-slate-500 to-slate-600 text-white`}
      >
        <div className="flex items-center justify-center gap-3">
          <Loader className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Loading target progress...</span>
        </div>
      </Motion.div>
    );
  }

  // Tentukan ukuran berdasarkan prop size
  const titleSize = size === 'large' ? 'text-xl sm:text-2xl lg:text-3xl' : 'text-lg sm:text-xl';
  const valueSize = size === 'large' ? 'text-lg sm:text-xl lg:text-2xl' : 'text-base sm:text-lg';
  const daysRemainingSize = size === 'large' ? 'text-2xl sm:text-3xl lg:text-4xl' : 'text-xl sm:text-2xl';

  // PERBAIKAN: Pastikan menggunakan displayData, bukan targetProgress langsung
  const getBannerConfig = () => {
    if (displayData.useDailyTarget) {
      return {
        icon: CalendarDays,
        gradient: "from-purple-500 to-indigo-600",
        border: "border-purple-300",
        iconColor: "text-white",
        title: "Daily Target"
      };
    }
    
    if (displayData.isCompleted) {
      return {
        icon: Trophy,
        gradient: "from-emerald-500 to-green-600",
        border: "border-emerald-300",
        iconColor: "text-white",
        title: "Target Achieved!"
      };
    }
    
    if (displayData.isExpired) {
      return {
        icon: Clock,
        gradient: "from-rose-500 to-red-600",
        border: "border-rose-300",
        iconColor: "text-white",
        title: "Time Expired"
      };
    }
    
    return {
      icon: TrendingUp,
      gradient: "from-orange-500 to-red-500",
      border: "border-orange-300",
      iconColor: "text-white",
      title: "Active Target"
    };
  };

  const bannerConfig = getBannerConfig();
  const BannerIcon = bannerConfig.icon;

  // Fungsi untuk format target text
  const getTargetText = () => {
    if (displayData.useDailyTarget) {
      return `Daily Target: ${target.dailyTargetPercentage || 0}% (${formatCompactCurrency(target.dailyTargetAmount || 0, currency)})`;
    } else {
      return `Target: ${formatCompactCurrency(target.targetBalance || 0, currency)}`;
    }
  };

  // PERBAIKAN: Helper function untuk format progress
  const formatProgress = (progress) => {
    if (progress === undefined || progress === null) return "0.0";
    return progress.toFixed(1);
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
              {bannerConfig.title}
            </h2>
            <p className="opacity-90 text-sm sm:text-base lg:text-lg font-medium truncate">
              {getTargetText()}
            </p>
          </div>
        </div>
        
        {/* Days Remaining - hanya untuk target dengan tanggal */}
        {!displayData.useDailyTarget && !displayData.isCompleted && !displayData.isExpired && (
          <Motion.div
            whileHover={{ scale: 1.05 }}
            className="w-full md:w-auto mt-4 md:mt-0 text-center md:text-right bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4 py-3 sm:px-6 sm:py-4 border border-white/30"
          >
            <div className="flex items-center justify-center md:justify-end gap-2 text-xs sm:text-sm opacity-90 font-semibold">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              Days Remaining
            </div>
            <div className={`${daysRemainingSize} font-bold`}>
              {displayData.daysLeft || 0}
            </div>
          </Motion.div>
        )}
      </div>

      {/* Progress Bar - Hanya untuk target dengan tanggal */}
      {!displayData.useDailyTarget && !displayData.isCompleted && !displayData.isExpired && (
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm mb-2 font-bold gap-1 sm:gap-0">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              {formatCompactCurrency(displayData.initialBalance || 0, currency)}
            </span>
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3 sm:w-4 sm:h-4" />
              {formatCompactCurrency(target.targetBalance || 0, currency)}
            </span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-3 sm:h-4 lg:h-5 border border-white/40">
            <Motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(0, displayData.progress || 0))}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${
                displayData.isCompleted
                  ? "bg-white shadow-lg"
                  : displayData.isExpired
                  ? "bg-yellow-300 shadow-lg"
                  : "bg-white shadow-lg"
              }`}
            ></Motion.div>
          </div>
          <div className="text-center text-sm font-bold mt-2">
            {formatProgress(displayData.progress)}% Complete
          </div>
        </div>
      )}

      {/* Progress Stats */}
      <div
        className={`grid gap-3 sm:gap-4 ${
          displayData.useDailyTarget
            ? "grid-cols-1 md:grid-cols-3"
            : displayData.isCompleted || displayData.isExpired
            ? "grid-cols-2 sm:grid-cols-3"
            : "grid-cols-2 sm:grid-cols-2 md:grid-cols-4"
        }`}
      >
        {displayData.useDailyTarget ? (
          // STATS UNTUK TARGET HARIAN
          <>
            <Motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/30"
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm opacity-90 font-semibold">
                <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                Daily Target
              </div>
              <div className={`${valueSize} font-bold mt-1`}>
                {target.dailyTargetPercentage || 0}%
              </div>
              <div className="text-xs sm:text-sm opacity-90 truncate">
                ({formatCompactCurrency(target.dailyTargetAmount || 0, currency)})
              </div>
            </Motion.div>
            
            <Motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/30"
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm opacity-90 font-semibold">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                Daily Average
              </div>
              <div className={`${valueSize} font-bold mt-1`}>
                {formatCompactCurrency(displayData.dailyAchieved || 0, currency)}
              </div>
              <div className="text-xs sm:text-sm opacity-90">
                {displayData.daysPassed || 0} days
              </div>
            </Motion.div>
            
            <Motion.div
              whileHover={{ scale: 1.05 }}
              className={`backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border ${
                displayData.onTrack
                  ? "bg-emerald-500/30 border-emerald-300"
                  : "bg-amber-500/30 border-amber-300"
              }`}
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm opacity-90 font-semibold">
                {displayData.onTrack ? (
                  <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                ) : (
                  <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
                Status
              </div>
              <div className={`${valueSize} font-bold mt-1`}>
                {displayData.onTrack ? "On Track" : "Needs Improvement"}
              </div>
              <div className="text-xs sm:text-sm opacity-90">
                {displayData.progress > 100
                  ? "100"
                  : formatProgress(displayData.progress)}
                %
              </div>
            </Motion.div>
          </>
        ) : displayData.isCompleted ? (
          // STATS UNTUK TARGET YANG SELESAI
          <>
            <Motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/30"
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm opacity-90 font-semibold">
                <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                Achieved
              </div>
              <div className={`${valueSize} font-bold mt-1`}>
                {formatCompactCurrency(displayData.achieved || 0, currency)}
              </div>
            </Motion.div>
            
            <Motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/30"
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm opacity-90 font-semibold">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                Progress
              </div>
              <div className={`${valueSize} font-bold mt-1`}>
                100%
              </div>
            </Motion.div>
            
            <Motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/30"
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm opacity-90 font-semibold">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                Completed In
              </div>
              <div className={`${valueSize} font-bold mt-1`}>
                {displayData.daysPassed || 0} days
              </div>
            </Motion.div>
          </>
        ) : displayData.isExpired ? (
          // STATS UNTUK TARGET YANG EXPIRED
          <>
            <Motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/30"
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm opacity-90 font-semibold">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                Time Expired
              </div>
              <div className={`${valueSize} font-bold mt-1`}>
                {displayData.daysPassed || 0} days
              </div>
            </Motion.div>
            
            <Motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/30"
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm opacity-90 font-semibold">
                <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                Achieved
              </div>
              <div className={`${valueSize} font-bold mt-1`}>
                {formatCompactCurrency(displayData.achieved || 0, currency)}
              </div>
            </Motion.div>
            
            <Motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/30"
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm opacity-90 font-semibold">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                Progress
              </div>
              <div className={`${valueSize} font-bold mt-1`}>
                {formatProgress(displayData.progress)}%
              </div>
            </Motion.div>
          </>
        ) : (
          // STATS UNTUK TARGET DENGAN TANGGAL YANG MASIH BERJALAN
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
                {formatProgress(displayData.progress)}%
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
                {formatCompactCurrency(displayData.achieved || 0, currency)}
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
                {formatCompactCurrency(displayData.totalNeeded || 0, currency)}
              </div>
            </Motion.div>
            
            <Motion.div
              whileHover={{ scale: 1.05 }}
              className={`backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border ${
                displayData.onTrack
                  ? "bg-emerald-500/30 border-emerald-300"
                  : "bg-amber-500/30 border-amber-300"
              }`}
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm opacity-90 font-semibold">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                Daily Required
              </div>
              <div className={`${valueSize} font-bold mt-1`}>
                {formatCompactCurrency(Math.round(displayData.neededDaily || 0), currency)}
              </div>
            </Motion.div>
          </>
        )}
      </div>
    </Motion.div>
  );
};

export default TargetProgressBanner;