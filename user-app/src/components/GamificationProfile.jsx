import React, { useEffect } from "react";
import { motion as Motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { getGamificationProfile } from "../features/gamificationSlice";
import {
  Crown,
  TrendingUp,
  Calendar,
  Target,
  Award,
  Zap,
  Star,
  Flame,
} from "lucide-react";

const GamificationProfile = () => {
  const dispatch = useDispatch();
  const { profile, isLoading } = useSelector((state) => state.gamification);

  useEffect(() => {
    dispatch(getGamificationProfile());
  }, [dispatch]);

  if (isLoading || !profile) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-slate-200 rounded-xl"></div>
            <div className="h-20 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const { level, experience, dailyStreak, profitStreak, totalTrades, consecutiveWins, maxConsecutiveWins } = profile.level;
  const nextLevelXP = profile.nextLevelXP;
  const levelProgress = profile.levelProgress;

  const getLevelColor = (level) => {
    if (level < 10) return "from-blue-500 to-cyan-500";
    if (level < 20) return "from-purple-500 to-pink-500";
    if (level < 30) return "from-orange-500 to-red-500";
    return "from-yellow-500 to-orange-500";
  };

  const getStreakIcon = (streak) => {
    if (streak >= 30) return <Crown className="w-5 h-5" />;
    if (streak >= 7) return <Flame className="w-5 h-5" />;
    if (streak >= 3) return <Zap className="w-5 h-5" />;
    return <Calendar className="w-5 h-5" />;
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200">
      {/* Level Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Level {level}
          </h3>
          <span className="text-sm text-slate-600 font-medium">
            {experience} / {nextLevelXP} XP
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <Motion.div
            initial={{ width: 0 }}
            animate={{ width: `${levelProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-3 rounded-full bg-linear-to-r ${getLevelColor(level)}`}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          className="bg-slate-50 rounded-2xl p-4 border border-slate-200"
        >
          <div className="flex items-center gap-3 mb-2">
            {getStreakIcon(dailyStreak)}
            <span className="text-sm font-bold text-slate-700">Daily Streak</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{dailyStreak}</div>
          <div className="text-xs text-slate-500">days</div>
        </Motion.div>

        <Motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          className="bg-slate-50 rounded-2xl p-4 border border-slate-200"
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-sm font-bold text-slate-700">Profit Streak</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{profitStreak}</div>
          <div className="text-xs text-slate-500">days</div>
        </Motion.div>

        <Motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          className="bg-slate-50 rounded-2xl p-4 border border-slate-200"
        >
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-bold text-slate-700">Total Trades</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalTrades}</div>
          <div className="text-xs text-slate-500">trades</div>
        </Motion.div>

        <Motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          className="bg-slate-50 rounded-2xl p-4 border border-slate-200"
        >
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-bold text-slate-700">Best Win Streak</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{maxConsecutiveWins}</div>
          <div className="text-xs text-slate-500">wins</div>
        </Motion.div>
      </div>

      {/* Current Streak */}
      {consecutiveWins > 0 && (
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-r from-green-500 to-emerald-600 rounded-2xl p-4 text-white"
        >
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4" />
            <span className="font-bold">Current Win Streak!</span>
          </div>
          <p className="text-sm opacity-90">{consecutiveWins} consecutive winning trades!</p>
        </Motion.div>
      )}
    </div>
  );
};

export default GamificationProfile;