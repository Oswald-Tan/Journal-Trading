import { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import {
  getGamificationProfile,
  getAllBadges,
  getLeaderboard,
} from "../../features/gamificationSlice";
import GamificationProfile from "../../components/GamificationProfile";
import BadgeCollection from "../../components/BadgeCollection";
import UnlockNotification from "../../components/UnlockNotification";
import {
  Crown,
  Award,
  Trophy,
  Star,
  Zap,
  Target,
  TrendingUp,
  Users,
  BarChart3,
} from "lucide-react";

const Layout = () => {
  const dispatch = useDispatch();
  const { profile, badges, leaderboard, isLoading, isError, message } =
    useSelector((state) => state.gamification);

  const [activeTab, setActiveTab] = useState("overview");
  const [leaderboardType, setLeaderboardType] = useState("level");

  // Get data from layout context jika diperlukan
  const context = useOutletContext();

  useEffect(() => {
    // Load initial data
    dispatch(getGamificationProfile());
    dispatch(getAllBadges());
  }, [dispatch]);

  useEffect(() => {
    // Load leaderboard when tab changes
    if (activeTab === "leaderboard") {
      dispatch(getLeaderboard({ type: leaderboardType, limit: 50 }));
    }
  }, [activeTab, leaderboardType, dispatch]);

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: "badges",
      label: "Badges",
      icon: <Award className="w-4 h-4" />,
    },
    {
      id: "leaderboard",
      label: "Leaderboard",
      icon: <Trophy className="w-4 h-4" />,
    },
  ];

  const leaderboardTypes = [
    { id: "level", label: "Level", icon: <Crown className="w-4 h-4" /> },
    { id: "experience", label: "XP", icon: <Star className="w-4 h-4" /> },
    { id: "streak", label: "Streak", icon: <Zap className="w-4 h-4" /> },
    { id: "trades", label: "Trades", icon: <Target className="w-4 h-4" /> },
  ];

  const getRankColor = (rank) => {
    if (rank === 1) return "from-yellow-400 to-yellow-600";
    if (rank === 2) return "from-gray-400 to-gray-600";
    if (rank === 3) return "from-orange-400 to-orange-600";
    return "from-slate-500 to-slate-700";
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  if (isLoading && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-violet-700 font-semibold">
            Loading gamification data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <UnlockNotification />

      {/* Header */}
      <div className="space-y-6">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                <Crown className="w-8 h-8 text-violet-600" />
                Gamification
              </h1>
              <p className="text-slate-600 mt-1 font-light">
                Track your progress, earn badges, and compete with other traders
              </p>
            </div>
          </div>
        </Motion.div>

        {/* Navigation Tabs */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 sm:mb-8"
        >
          <div className="relative">
            {/* Scrollable container */}
            <div className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 pb-3 -mx-4 sm:mx-0 px-4 sm:px-0">
              <div className="flex space-x-2 bg-slate-100 p-1.5 rounded-2xl min-w-max sm:min-w-0 sm:w-fit mx-auto sm:mx-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0 ${
                      activeTab === tab.id
                        ? "bg-white text-violet-700 shadow-sm"
                        : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Motion.div>

        {/* Error Message */}
        {isError && (
          <Motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6"
          >
            <div className="flex items-center gap-2 text-red-700">
              <span className="text-sm font-medium">{message}</span>
            </div>
          </Motion.div>
        )}

        {/* Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Stats Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <GamificationProfile />
                </div>

                {/* Quick Stats */}
                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-violet-600" />
                    Quick Stats
                  </h3>

                  <div className="space-y-4">
                    {profile?.level && (
                      <>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-slate-600">Total XP</span>
                          <span className="font-bold text-slate-800">
                            {profile.level.totalExperience?.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-slate-600">Total Trades</span>
                          <span className="font-bold text-slate-800">
                            {profile.level.totalTrades?.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-slate-600">
                            Best Win Streak
                          </span>
                          <span className="font-bold text-slate-800">
                            {profile.level.maxConsecutiveWins}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2">
                          <span className="text-slate-600">Badges Earned</span>
                          <span className="font-bold text-slate-800">
                            {badges.filter((b) => b.achieved).length} /{" "}
                            {badges.length}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Achievements */}
              <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-violet-600" />
                  Recent Achievements
                </h3>

                {profile?.recentAchievements &&
                profile.recentAchievements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {profile.recentAchievements
                      .slice(0, 6)
                      .map((achievement, index) => (
                        <Motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-linear-to-r from-violet-50 to-purple-50 rounded-2xl p-4 border border-violet-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className="bg-violet-100 p-2 rounded-xl">
                              <Star className="w-5 h-5 text-violet-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm">
                                {achievement.title}
                              </h4>
                              <p className="text-slate-600 text-xs mt-1">
                                {achievement.description}
                              </p>
                              <div className="text-xs text-slate-500 mt-2">
                                {new Date(
                                  achievement.achievedAt
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </Motion.div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>
                      No achievements yet. Start trading to earn achievements!
                    </p>
                  </div>
                )}
              </div>
            </Motion.div>
          )}

          {/* Badges Tab */}
          {activeTab === "badges" && (
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <BadgeCollection />
            </Motion.div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === "leaderboard" && (
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Leaderboard Type Selector */}
              <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-violet-600" />
                    Global Leaderboard
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {leaderboardTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setLeaderboardType(type.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          leaderboardType === type.id
                            ? "bg-violet-600 text-white shadow-sm"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {type.icon}
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Leaderboard Content */}
              <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200 overflow-hidden">
                {leaderboard ? (
                  <>
                    {/* Top 3 Leaders */}
                    {leaderboard.leaders.slice(0, 3).length > 0 && (
                      <div className="p-6 border-b border-slate-200">
                        <h4 className="text-lg font-bold text-slate-800 mb-4">
                          Top Performers
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {leaderboard.leaders
                            .slice(0, 3)
                            .map((leader, index) => (
                              <Motion.div
                                key={leader.userId}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={`bg-linear-to-br ${getRankColor(
                                  index + 1
                                )} rounded-2xl p-6 text-white text-center relative`}
                              >
                                {/* Rank Badge */}
                                <div className="absolute -top-3 -left-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                                  <span className="text-lg font-bold text-slate-800">
                                    {getRankIcon(index + 1)}
                                  </span>
                                </div>

                                {/* User Info */}
                                <div className="mb-3">
                                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Users className="w-8 h-8" />
                                  </div>
                                  <h5 className="font-bold text-lg truncate">
                                    {leader.User?.name ||
                                      `Trader ${leader.userId}`}
                                  </h5>
                                </div>

                                {/* Stats */}
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span>Level</span>
                                    <span className="font-bold">
                                      {leader.level}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>XP</span>
                                    <span className="font-bold">
                                      {leader.totalExperience?.toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Streak</span>
                                    <span className="font-bold">
                                      {leader.dailyStreak}d
                                    </span>
                                  </div>
                                </div>
                              </Motion.div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Full Leaderboard List */}
                    <div className="p-6">
                      <h4 className="text-lg font-bold text-slate-800 mb-4">
                        Global Ranking
                      </h4>
                      <div className="space-y-3">
                        {leaderboard.leaders.slice(3).map((leader, index) => (
                          <Motion.div
                            key={leader.userId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (index + 3) * 0.05 }}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                              leader.userId === context?.user?.id
                                ? "bg-violet-50 border-violet-200 shadow-sm"
                                : "bg-slate-50 border-slate-200 hover:bg-white"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold text-slate-700">
                                  {index + 4}
                                </span>
                              </div>

                              <div>
                                <h5 className="font-bold text-slate-800">
                                  {leader.User?.name ||
                                    `Trader ${leader.userId}`}
                                </h5>
                                <div className="flex items-center gap-4 text-xs text-slate-600">
                                  <span>Level {leader.level}</span>
                                  <span>
                                    {leader.totalExperience?.toLocaleString()}{" "}
                                    XP
                                  </span>
                                  <span>Streak: {leader.dailyStreak}d</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-sm font-bold text-slate-800">
                                {leaderboardType === "level" &&
                                  `Level ${leader.level}`}
                                {leaderboardType === "experience" &&
                                  `${leader.totalExperience?.toLocaleString()} XP`}
                                {leaderboardType === "streak" &&
                                  `${leader.dailyStreak} days`}
                                {leaderboardType === "trades" &&
                                  `${leader.totalTrades} trades`}
                              </div>
                            </div>
                          </Motion.div>
                        ))}
                      </div>

                      {/* User Rank */}
                      {leaderboard.userRank && (
                        <Motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="mt-6 p-4 bg-linear-to-r from-violet-600 to-purple-600 rounded-2xl text-white"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-bold text-lg">Your Rank</h5>
                              <p className="text-violet-100">
                                You are #{leaderboard.userRank} out of{" "}
                                {leaderboard.totalUsers} traders
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold">
                                #{leaderboard.userRank}
                              </div>
                              <div className="text-violet-100 text-sm">
                                Global Rank
                              </div>
                            </div>
                          </div>
                        </Motion.div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                    <p className="text-slate-600">Loading leaderboard...</p>
                  </div>
                )}
              </div>
            </Motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Layout;
