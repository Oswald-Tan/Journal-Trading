import React, { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import { getLeaderboard } from "../../features/gamificationSlice";
import {
  Crown,
  Trophy,
  Star,
  Zap,
  Target,
  Users,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Layout = () => {
  const dispatch = useDispatch();
  const { leaderboard, isLoading } = useSelector((state) => state.gamification);
  const context = useOutletContext();

  const [leaderboardType, setLeaderboardType] = useState("level");
  const [timeRange, setTimeRange] = useState("all");
  const [scrollPosition, setScrollPosition] = useState(0);
  const [setIsScrolled] = useState(false);

  useEffect(() => {
    dispatch(getLeaderboard({ type: leaderboardType, limit: 100 }));
  }, [dispatch, leaderboardType, timeRange]);

  const leaderboardTypes = [
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
    {
      id: "trades",
      label: "Total Trades",
      icon: <Target className="w-4 h-4" />,
      description: "Number of trades logged",
    },
    {
      id: "profit",
      label: "Profit Streak",
      icon: <TrendingUp className="w-4 h-4" />,
      description: "Consecutive profitable days",
    },
  ];

  const timeRanges = [
    { id: "all", label: "All Time" },
    { id: "monthly", label: "This Month" },
    { id: "weekly", label: "This Week" },
  ];

  const scrollContainer = (direction) => {
    const container = document.getElementById('leaderboard-types-container');
    const scrollAmount = 200;
    
    if (container) {
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount;
      
      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setScrollPosition(newPosition);
      setIsScrolled(newPosition > 0);
    }
  };

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

  const getValueByType = (user, type) => {
    switch (type) {
      case "level":
        return `Level ${user.level}`;
      case "experience":
        return `${user.totalExperience?.toLocaleString()} XP`;
      case "streak":
        return `${user.dailyStreak} days`;
      case "trades":
        return `${user.totalTrades} trades`;
      case "profit":
        return `${user.profitStreak} days`;
      default:
        return user.level;
    }
  };

  const getProgressByType = (user, type) => {
    switch (type) {
      case "level":
        return (user.experience / (100 * Math.pow(user.level, 1.5))) * 100;
      case "experience":
        return Math.min(100, (user.totalExperience / 10000) * 100);
      case "streak":
        return Math.min(100, (user.dailyStreak / 30) * 100);
      case "trades":
        return Math.min(100, (user.totalTrades / 100) * 100);
      case "profit":
        return Math.min(100, (user.profitStreak / 10) * 100);
      default:
        return 50;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="space-y-6">
        {/* Header */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                <Trophy className="w-8 h-8 text-violet-600" />
                Leaderboard
              </h1>
              <p className="text-slate-600 mt-1 font-light">
                Compete with traders worldwide and climb the ranks
              </p>
            </div>
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
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="mb-4 lg:mb-0">
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  Global Rankings
                </h3>
                <p className="text-slate-600 text-sm">
                  {
                    leaderboardTypes.find((t) => t.id === leaderboardType)
                      ?.description
                  }
                </p>
              </div>

              <div className="flex flex-col gap-4 w-full lg:w-auto">
                {/* Time Range Selector */}
                <div className="relative">
                  <div className="flex bg-slate-100 p-1 rounded-xl w-full lg:w-auto overflow-x-auto scrollbar-hide">
                    {timeRanges.map((range) => (
                      <button
                        key={range.id}
                        onClick={() => setTimeRange(range.id)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
                          timeRange === range.id
                            ? "bg-white text-violet-700 shadow-sm"
                            : "text-slate-600 hover:text-slate-800"
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Leaderboard Type Selector */}
                <div className="relative">

                  <div 
                    id="leaderboard-types-container"
                    className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto scrollbar-hide scroll-smooth px-1"
                  >
                    {leaderboardTypes.map((type) => (
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
              <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">
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
                        ? "md:-mt-8 md:order-first"
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
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-base sm:text-lg font-bold text-slate-800">
                            {getRankIcon(index + 1)}
                          </span>
                        </div>
                      </div>

                      {/* User Avatar */}
                      <div className="mt-6 mb-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto border-4 border-white/30">
                          <Users className="w-8 h-8 sm:w-10 sm:h-10" />
                        </div>
                      </div>

                      {/* User Info */}
                      <h4 className="font-bold text-lg sm:text-xl mb-2 truncate px-2">
                        {leader.User?.name || `Trader ${leader.userId}`}
                      </h4>

                      <div className="text-white/90 text-sm mb-4">
                        {getValueByType(leader, leaderboardType)}
                      </div>

                      {/* Additional Stats */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="font-bold">Level</div>
                          <div>{leader.level}</div>
                        </div>
                        <div>
                          <div className="font-bold">XP</div>
                          <div>{leader.totalExperience?.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="font-bold">Streak</div>
                          <div>{leader.dailyStreak}d</div>
                        </div>
                        <div>
                          <div className="font-bold">Trades</div>
                          <div>{leader.totalTrades}</div>
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
              <h3 className="text-xl font-bold text-slate-800">
                Global Leaderboard
              </h3>
              <p className="text-slate-600 text-sm mt-1">
                {leaderboard?.totalUsers || 0} active traders
              </p>
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
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-200 rounded-full flex items-center justify-center shrink-0">
                            <Users className="w-4 h-4 sm:w-6 sm:h-6 text-slate-600" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-800 truncate text-sm sm:text-base">
                              {leader.User?.name || `Trader ${leader.userId}`}
                            </h4>
                            <div className="flex items-center gap-1 sm:gap-3 text-xs sm:text-sm text-slate-600 mt-1 overflow-x-auto scrollbar-hide">
                              <span className="flex items-center gap-1 shrink-0">
                                <Crown className="w-3 h-3" />
                                Level {leader.level}
                              </span>
                              <span className="flex items-center gap-1 shrink-0">
                                <Zap className="w-3 h-3" />
                                {leader.dailyStreak}d streak
                              </span>
                              <span className="flex items-center gap-1 shrink-0">
                                <Target className="w-3 h-3" />
                                {leader.totalTrades} trades
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Main Stat */}
                      <div className="text-right ml-2">
                        <div className="text-base sm:text-lg font-bold text-slate-800 mb-1 whitespace-nowrap">
                          {getValueByType(leader, leaderboardType)}
                        </div>

                        {/* Progress Bar */}
                        <div className="w-24 sm:w-32 bg-slate-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-linear-to-r from-violet-500 to-purple-500"
                            style={{
                              width: `${getProgressByType(
                                leader,
                                leaderboardType
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </Motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                  <h4 className="text-lg font-bold text-slate-700 mb-2">
                    No Leaderboard Data
                  </h4>
                  <p className="text-slate-600">
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
                <div className="flex items-center justify-between text-white">
                  <div>
                    <h4 className="font-bold text-base sm:text-lg mb-1">Your Position</h4>
                    <p className="text-violet-100 text-sm sm:text-base">
                      You're ranking #{leaderboard.userRank} globally
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl sm:text-3xl font-bold mb-1">
                      #{leaderboard.userRank}
                    </div>
                    <div className="text-violet-100 text-xs sm:text-sm">
                      out of {leaderboard.totalUsers} traders
                    </div>
                  </div>
                </div>

                {/* Progress to next rank */}
                {leaderboard.userRank > 10 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-violet-100 text-xs sm:text-sm mb-1">
                      <span>Progress to Top 10</span>
                      <span>
                        {Math.round(
                          ((leaderboard.totalUsers - leaderboard.userRank) /
                            leaderboard.totalUsers) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-violet-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-linear-to-r from-white to-violet-200"
                        style={{
                          width: `${
                            ((leaderboard.totalUsers - leaderboard.userRank) /
                              leaderboard.totalUsers) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                )}
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