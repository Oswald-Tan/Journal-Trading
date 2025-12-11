import React, { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import { getLeaderboard, getLeaderboardHistory } from "../../features/gamificationSlice";
import {
  Crown,
  Trophy,
  Star,
  Zap,
  Target,
  Users,
  TrendingUp,
  Calendar,
  History,
  Award,
  ChevronRight,
  DollarSign,
} from "lucide-react";

const Layout = () => {
  const dispatch = useDispatch();
  const { leaderboard, leaderboardHistory, isLoading } = useSelector(
    (state) => state.gamification
  );
  const balance = useSelector((state) => state.balance);
  const context = useOutletContext();

  const [leaderboardType, setLeaderboardType] = useState("level");
  const [timeRange, setTimeRange] = useState("all");
  const [showHistory, setShowHistory] = useState(false);

  // Get user currency from balance state
  const userCurrency = balance?.currency || "USD";

  useEffect(() => {
    if (showHistory) {
      if (!leaderboardHistory) {
        dispatch(getLeaderboardHistory());
      }
    } else {
      dispatch(getLeaderboard({ type: leaderboardType, period: timeRange, limit: 100 }));
    }
  }, [dispatch, leaderboardType, timeRange, showHistory, leaderboardHistory]);

  const leaderboardTypes = [
    {
      id: "score",
      label: "Monthly Score",
      icon: <Trophy className="w-4 h-4" />,
      description: "Monthly performance score",
    },
    {
      id: "profit",
      label: "Monthly Profit",
      icon: <TrendingUp className="w-4 h-4" />,
      description: `Total profit this month (${userCurrency})`,
    },
    {
      id: "trades",
      label: "Monthly Trades",
      icon: <Target className="w-4 h-4" />,
      description: "Number of trades this month",
    },
    {
      id: "winrate",
      label: "Win Rate",
      icon: <Star className="w-4 h-4" />,
      description: "Monthly win rate percentage",
    },
  ];

  const timeRanges = [
    { id: "current", label: "Current Month", icon: <Calendar className="w-4 h-4" /> },
    { id: "all", label: "All Time", icon: <History className="w-4 h-4" /> },
  ];

  const getRankColor = (rank) => {
    if (rank === 1) return "from-yellow-400 to-yellow-600";
    if (rank === 2) return "from-gray-400 to-gray-600";
    if (rank === 3) return "from-orange-400 to-orange-600";
    if (rank <= 10) return "from-violet-500 to-purple-600";
    if (rank <= 50) return "from-blue-500 to-cyan-600";
    return "from-slate-500 to-slate-700";
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  const getCurrencySymbol = (currency) => {
    const currencyUpper = currency?.toUpperCase();
    switch (currencyUpper) {
      case "USD":
        return "$";
      case "IDR":
        return "Rp";
      case "CENT":
        return "¢";
      default:
        return "$";
    }
  };

  const formatCurrency = (amount, currency = userCurrency) => {
    const symbol = getCurrencySymbol(currency);
    const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount || 0;
    const currencyUpper = currency?.toUpperCase();
    
    switch (currencyUpper) {
      case "IDR":
        return `${symbol} ${amountNum.toLocaleString('id-ID', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        })}`;
      case "CENT":
        return `${symbol}${amountNum.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        })}`;
      case "USD":
      default:
        return `${symbol}${amountNum.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`;
    }
  };

  const getValueByType = (user, type) => {
    switch (type) {
      case "score":
        return `${(user.score || 0).toLocaleString()} points`;
      case "profit":
        return formatCurrency(user.totalProfit || 0);
      case "trades":
        return `${user.totalTrades || 0} trades`;
      case "winrate":
        { const winRate = typeof user.winRate === 'number' ? user.winRate : parseFloat(user.winRate) || 0;
        return `${winRate.toFixed(1)}%`; }
      case "level":
        return `Level ${user.level || 1}`;
      case "experience":
        return `${(user.totalExperience || 0).toLocaleString()} XP`;
      case "streak":
        return `${user.dailyStreak || 0} days`;
      default:
        return `${user.score || 0} points`;
    }
  };

  // Fungsi untuk menghitung required XP (sama dengan di backend)
  const calculateRequiredXP = (level) => {
    return Math.floor(100 * Math.pow(level, 1.5));
  };

  const formatPeriod = (period) => {
    if (!period) return "";
    try {
      if (period === "current") {
        const now = new Date();
        return now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      }
      const [year, month] = period.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    } catch (error) {
      console.error("Error formatting period:", error);
      return period;
    }
  };

  const getProgressByType = (user, type) => {
    switch (type) {
      case "level":
        { const requiredXP = calculateRequiredXP(user.level || 1);
        return user.experience ? (user.experience / requiredXP) * 100 : 0; }
      case "experience":
        return Math.min(100, ((user.totalExperience || 0) / 10000) * 100);
      case "streak":
        return Math.min(100, ((user.dailyStreak || 0) / 30) * 100);
      case "trades":
        return Math.min(100, ((user.totalTrades || 0) / 100) * 100);
      case "profit":
        return Math.min(100, ((user.profitStreak || 0) / 10) * 100);
      case "score":
        return Math.min(100, ((user.score || 0) / 1000) * 100);
      default:
        return 50;
    }
  };

  // Helper untuk mendapatkan hari dalam bulan saat ini
  const getDaysInMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  };

  // Helper untuk mendapatkan progress hari dalam bulan
  const getMonthProgress = () => {
    const currentDay = new Date().getDate();
    const daysInMonth = getDaysInMonth();
    return (currentDay / daysInMonth) * 100;
  };

  // Helper untuk mendapatkan safe winRate value
  const getSafeWinRate = (history) => {
    if (!history || history.winRate === undefined || history.winRate === null) return 0;
    const winRateNum = typeof history.winRate === 'number' 
      ? history.winRate 
      : parseFloat(history.winRate);
    return isNaN(winRateNum) ? 0 : winRateNum;
  };

  // Render History View
  if (showHistory) {
    return (
      <div className="min-h-screen">
        <div className="space-y-6">
          {/* Header - FIXED: Responsive layout */}
          <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                  <History className="w-6 h-6 sm:w-8 sm:h-8 text-violet-600" />
                  Leaderboard History
                </h1>
                <p className="text-slate-600 mt-1 font-light">
                  Your past monthly rankings and performance
                </p>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Back to Leaderboard
              </button>
            </div>
          </Motion.div>

          {/* History List */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {isLoading ? (
              // Loading Skeleton for history
              [...Array(3)].map((_, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-slate-200 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-200"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-32"></div>
                        <div className="h-3 bg-slate-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-6 bg-slate-200 rounded w-12 ml-auto"></div>
                      <div className="h-3 bg-slate-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : leaderboardHistory?.data && leaderboardHistory.data.length > 0 ? (
              leaderboardHistory.data.map((history, index) => (
                <Motion.div
                  key={history.period || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-slate-200 hover:border-violet-300 transition-all cursor-pointer hover:shadow-lg"
                  onClick={() => {
                    dispatch(getLeaderboard({ type: 'score', period: history.period, limit: 100 }));
                    setShowHistory(false);
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${
                        history.rank <= 3 ? 'bg-yellow-100 text-yellow-600' :
                        history.rank <= 10 ? 'bg-violet-100 text-violet-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        <span className="text-lg sm:text-xl font-bold">#{history.rank}</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                          {formatPeriod(history.period)}
                        </h3>
                        <p className="text-slate-600 text-xs sm:text-sm">
                          Score: {history.score || 0} points • {history.totalTrades || 0} trades
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                          Currency: {userCurrency}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-xl sm:text-2xl font-bold text-violet-600">
                        #{history.rank}
                      </div>
                      <div className="text-slate-500 text-xs sm:text-sm">Rank</div>
                    </div>
                  </div>
                  
                  {/* Stats Grid - Responsive */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="text-slate-500 text-xs sm:text-sm">Profit</div>
                      <div className="font-bold text-slate-800 text-sm sm:text-base">
                        {formatCurrency(history.totalProfit || 0)}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="text-slate-500 text-xs sm:text-sm">Win Rate</div>
                      <div className="font-bold text-slate-800 text-sm sm:text-base">
                        {getSafeWinRate(history).toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="text-slate-500 text-xs sm:text-sm">Trades</div>
                      <div className="font-bold text-slate-800 text-sm sm:text-base">
                        {history.totalTrades || 0}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="text-slate-500 text-xs sm:text-sm">Score</div>
                      <div className="font-bold text-slate-800 text-sm sm:text-base">
                        {history.score || 0}
                      </div>
                    </div>
                  </div>
                </Motion.div>
              ))
            ) : (
              <div className="text-center py-8 sm:py-12">
                <History className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-slate-400 mb-4" />
                <h4 className="text-base sm:text-lg font-bold text-slate-700 mb-2">
                  No History Available
                </h4>
                <p className="text-slate-600 text-sm sm:text-base">
                  Start trading to build your leaderboard history!
                </p>
              </div>
            )}
          </Motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="space-y-6">
        {/* Header - FIXED: Responsive layout */}
        <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-violet-600" />
                {timeRange === "all" ? "Global Leaderboard" : "Monthly Leaderboard"}
              </h1>
              <p className="text-slate-600 mt-1 font-light">
                {timeRange === "all"
                  ? "All-time rankings based on lifetime achievements"
                  : `Current month rankings - ${formatPeriod(leaderboard?.period)}`}
              </p>
            </div>
            
            <button
              onClick={() => setShowHistory(true)}
              className="w-full sm:w-auto px-4 py-2 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-xl font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <History className="w-4 h-4" />
              View History
            </button>
          </div>
        </Motion.div>

        {/* Controls */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-slate-200">
            {/* Title Section - Atas */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                {timeRange === "all" ? "Global Rankings" : "Monthly Rankings"}
              </h3>
              <p className="text-slate-600 text-sm">
                {
                  (timeRange === "all" 
                    ? [
                        ...leaderboardTypes,
                        { id: "level", description: "Based on user level" },
                        { id: "experience", description: "Total XP earned" },
                        { id: "streak", description: "Current trading streak" }
                      ].find((t) => t.id === leaderboardType)?.description
                    : leaderboardTypes.find((t) => t.id === leaderboardType)?.description
                  )
                }
              </p>
            </div>

            {/* Tabs Section - Bawah */}
            <div className="flex flex-col gap-4">
              {/* Time Range Selector - Responsive Layout */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative w-full sm:w-auto">
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    {timeRanges.map((range) => (
                      <button
                        key={range.id}
                        onClick={() => setTimeRange(range.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 sm:flex-none ${
                          timeRange === range.id
                            ? "bg-white text-violet-700 shadow-sm"
                            : "text-slate-600 hover:text-slate-800"
                        }`}
                      >
                        {range.icon}
                        <span className="whitespace-nowrap">{range.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Leaderboard Type Selector */}
                <div className="relative w-full sm:w-auto">
                  <div 
                    id="leaderboard-types-container"
                    className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto scrollbar-hide scroll-smooth"
                  >
                    {timeRange === "all"
                      ? [
                          ...leaderboardTypes,
                          {
                            id: "level",
                            label: "Level",
                            icon: <Crown className="w-4 h-4" />,
                            description: "Based on user level",
                          },
                          {
                            id: "experience",
                            label: "Experience",
                            icon: <Star className="w-4 h-4" />,
                            description: "Total XP earned",
                          },
                          {
                            id: "streak",
                            label: "Daily Streak",
                            icon: <Zap className="w-4 h-4" />,
                            description: "Current trading streak",
                          },
                        ].map((type) => (
                          <button
                            key={type.id}
                            onClick={() => setLeaderboardType(type.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
                              leaderboardType === type.id
                                ? "bg-white text-violet-700 shadow-sm"
                                : "text-slate-600 hover:text-slate-800"
                            }`}
                          >
                            {type.icon}
                            <span className="whitespace-nowrap">{type.label}</span>
                          </button>
                        ))
                      : leaderboardTypes.map((type) => (
                          <button
                            key={type.id}
                            onClick={() => setLeaderboardType(type.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
                              leaderboardType === type.id
                                ? "bg-white text-violet-700 shadow-sm"
                                : "text-slate-600 hover:text-slate-800"
                            }`}
                          >
                            {type.icon}
                            <span className="whitespace-nowrap">{type.label}</span>
                          </button>
                        ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Monthly Info Banner */}
            {timeRange === "current" && (
              <div className="mt-4 p-3 sm:p-4 bg-violet-50 border border-violet-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-violet-800">
                      <strong>Monthly leaderboard resets on the 1st of each month.</strong>{" "}
                      Your all-time level and badges remain permanent. Monthly rankings are based on:
                      profit (40%), win rate (30%), trades (20%), and consistency (10%).
                    </p>
                    <p className="text-xs sm:text-sm text-violet-600 mt-1">
                      <strong>Note:</strong> All profit amounts are displayed in your selected currency ({userCurrency}).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Motion.div>

        {/* Leaderboard Content */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Top 3 Podium */}
          {leaderboard?.leaders?.slice(0, 3).length > 0 && (
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-slate-200">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 sm:mb-6 text-center">
                Top Performers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {leaderboard.leaders.slice(0, 3).map((leader, index) => (
                  <Motion.div
                    key={leader.userId}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className={`relative ${
                      index === 1
                        ? "md:-mt-6 md:order-first"
                        : index === 0
                        ? "md:order-2"
                        : "md:order-3"
                    }`}
                  >
                    <div
                      className={`bg-linear-to-br ${getRankColor(
                        index + 1
                      )} rounded-2xl p-4 sm:p-6 text-white text-center relative shadow-lg`}
                    >
                      {/* Rank Crown */}
                      <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-sm sm:text-base md:text-lg font-bold text-slate-800">
                            {getRankIcon(index + 1)}
                          </span>
                        </div>
                      </div>

                      {/* User Avatar */}
                      <div className="mt-8 sm:mt-10 mb-3 sm:mb-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto border-4 border-white/30">
                          <Users className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                        </div>
                      </div>

                      {/* User Info */}
                      <h4 className="font-bold text-base sm:text-lg md:text-xl mb-2 truncate px-2">
                        {leader.User?.name || `Trader ${leader.userId}`}
                      </h4>

                      <div className="text-white/90 text-xs sm:text-sm mb-3 sm:mb-4">
                        {getValueByType(leader, leaderboardType)}
                      </div>

                      {/* Additional Stats */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="font-bold">Level</div>
                          <div>{leader.level || 1}</div>
                        </div>
                        <div>
                          <div className="font-bold">XP</div>
                          <div>{(leader.totalExperience || 0).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="font-bold">Streak</div>
                          <div>{leader.dailyStreak || 0}d</div>
                        </div>
                        <div>
                          <div className="font-bold">Trades</div>
                          <div>{leader.totalTrades || 0}</div>
                        </div>
                      </div>
                    </div>
                  </Motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Full Leaderboard List */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-3xl font-bold text-slate-800">
                    {timeRange === "all" ? "Global Leaderboard" : "Monthly Leaderboard"}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm mt-1">
                    {leaderboard?.totalUsers || 0} active traders
                    {timeRange === "current" && leaderboard?.period && 
                      ` • ${formatPeriod(leaderboard.period)}`}
                  </p>
                </div>
                <div className="text-xs sm:text-sm text-slate-500">
                  Currency: {userCurrency}
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {isLoading ? (
                // Loading Skeleton
                [...Array(10)].map((_, index) => (
                  <div key={index} className="p-4 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                      </div>
                      <div className="w-20 h-6 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                ))
              ) : leaderboard?.leaders?.length > 0 ? (
                leaderboard.leaders.slice(3).map((leader, index) => (
                  <Motion.div
                    key={leader.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index + 3) * 0.03 }}
                    className={`p-4 transition-all hover:bg-slate-50 ${
                      leader.userId === context?.user?.id
                        ? "bg-violet-50 border-l-4 border-violet-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4">
                        {/* Rank */}
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                          <span className="font-bold text-slate-700 text-sm sm:text-base">
                            {index + 4}
                          </span>
                        </div>

                        {/* User Info */}
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-slate-200 rounded-full flex items-center justify-center shrink-0">
                            <Users className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-slate-600" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-800 text-sm sm:text-base truncate">
                              {leader.User?.name || `Trader ${leader.userId}`}
                            </h4>
                            <div className="flex items-center gap-1 sm:gap-3 text-xs sm:text-sm text-slate-600 mt-1 overflow-x-auto scrollbar-hide">
                              {timeRange === "all" ? (
                                <>
                                  <span className="flex items-center gap-1 shrink-0">
                                    <Crown className="w-3 h-3" />
                                    Level {leader.level || 1}
                                  </span>
                                  <span className="flex items-center gap-1 shrink-0">
                                    <Zap className="w-3 h-3" />
                                    {leader.dailyStreak || 0}d streak
                                  </span>
                                  <span className="flex items-center gap-1 shrink-0">
                                    <Target className="w-3 h-3" />
                                    {leader.totalTrades || 0} trades
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="flex items-center gap-1 shrink-0">
                                    <Trophy className="w-3 h-3" />
                                    Score: {leader.score || 0}
                                  </span>
                                  <span className="flex items-center gap-1 shrink-0">
                                    <TrendingUp className="w-3 h-3" />
                                    Profit: {formatCurrency(leader.totalProfit || 0)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Main Stat */}
                      <div className="text-right ml-2 min-w-0">
                        <div className="text-sm sm:text-base md:text-lg font-bold text-slate-800 mb-1 whitespace-nowrap truncate">
                          {getValueByType(leader, leaderboardType)}
                        </div>

                        {/* Progress Bar */}
                        <div className="w-20 sm:w-24 md:w-32 bg-slate-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-linear-to-r from-violet-500 to-purple-500"
                            style={{
                              width: `${getProgressByType(leader, leaderboardType)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </Motion.div>
                ))
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <Trophy className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-slate-400 mb-4" />
                  <h4 className="text-base sm:text-lg font-bold text-slate-700 mb-2">
                    No Leaderboard Data
                  </h4>
                  <p className="text-slate-600 text-sm sm:text-base">
                    Start trading to appear on the leaderboard!
                  </p>
                </div>
              )}
            </div>

            {/* User Rank Card */}
            {leaderboard?.userRank && (
              <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-4 sm:p-6 bg-linear-to-r from-violet-600 to-purple-600 border-t border-violet-500"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-white gap-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-base sm:text-lg mb-1">Your Position</h4>
                    <p className="text-violet-100 text-sm sm:text-base">
                      {timeRange === "all"
                        ? "You're ranking globally"
                        : `You're ranking this month (${formatPeriod(leaderboard.period)})`}
                    </p>
                    <p className="text-violet-200 text-xs mt-1">
                      Currency: {userCurrency}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-2xl sm:text-3xl font-bold mb-1">
                      #{leaderboard.userRank}
                    </div>
                    <div className="text-violet-100 text-xs sm:text-sm">
                      out of {leaderboard.totalUsers || 0} traders
                    </div>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="mt-4">
                  <div className="flex justify-between text-violet-100 text-xs sm:text-sm mb-1">
                    <span>
                      {timeRange === "all"
                        ? "Progress to next level"
                        : "Days remaining this month"}
                    </span>
                    <span>
                      {timeRange === "all"
                        ? leaderboard.userLevel && leaderboard.userExperience
                          ? `${Math.round(
                              (leaderboard.userExperience /
                                calculateRequiredXP(leaderboard.userLevel + 1)) *
                                100
                            )}%`
                          : "0%"
                        : `${new Date().getDate()}/${getDaysInMonth()} days`}
                    </span>
                  </div>
                  <div className="w-full bg-violet-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-linear-to-r from-white to-violet-200"
                      style={{
                        width: `${
                          timeRange === "all"
                            ? leaderboard.userLevel && leaderboard.userExperience
                              ? Math.min(
                                  100,
                                  (leaderboard.userExperience /
                                    calculateRequiredXP(leaderboard.userLevel + 1)) *
                                    100
                                )
                              : 0
                            : getMonthProgress()
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </Motion.div>
            )}
          </div>
        </Motion.div>
      </div>

      {/* Add custom CSS for scrollbar hiding */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Layout;