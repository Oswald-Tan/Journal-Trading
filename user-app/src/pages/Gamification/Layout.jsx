import { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // Tambahkan useNavigate
import {
  getGamificationProfile,
  getAllBadges,
} from "../../features/gamificationSlice";
import GamificationProfile from "../../components/GamificationProfile";
import BadgeCollection from "../../components/BadgeCollection";
import {
  Crown,
  Award,
  Trophy,
  Star,
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  ArrowRight,
} from "lucide-react";

const Layout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Untuk redirect ke halaman leaderboard
  const { profile, badges, isLoading, isError, message } = useSelector(
    (state) => state.gamification
  );

  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Load initial data - hanya profile dan badges
    dispatch(getGamificationProfile());
    dispatch(getAllBadges());
  }, [dispatch]);

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
  ];

  // Handler untuk navigate ke leaderboard
  const handleNavigateToLeaderboard = () => {
    navigate("/leaderboard");
  };

  // Helper function untuk mendapatkan data level dengan aman
  const getLevelData = () => {
    if (!profile || !profile.level) {
      return {
        level: 1,
        experience: 0,
        totalExperience: 0,
        dailyStreak: 0,
        totalTrades: 0,
        consecutiveWins: 0,
        maxConsecutiveWins: 0,
        profitStreak: 0,
      };
    }

    // Jika profile.level adalah object langsung
    if (profile.level && typeof profile.level === "object") {
      return {
        level: profile.level.level || 1,
        experience: profile.level.experience || 0,
        totalExperience: profile.level.totalExperience || 0,
        dailyStreak: profile.level.dailyStreak || 0,
        totalTrades: profile.level.totalTrades || 0,
        consecutiveWins: profile.level.consecutiveWins || 0,
        maxConsecutiveWins: profile.level.maxConsecutiveWins || 0,
        profitStreak: profile.level.profitStreak || 0,
      };
    }

    // Fallback default
    return {
      level: 1,
      experience: 0,
      totalExperience: 0,
      dailyStreak: 0,
      totalTrades: 0,
      consecutiveWins: 0,
      maxConsecutiveWins: 0,
      profitStreak: 0,
    };
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

  const levelData = getLevelData();

  return (
    <div className="min-h-screen">
      <div className="space-y-6">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold text-slate-800 flex items-center gap-2">
                <Crown className="w-8 h-8 text-violet-600" />
                Gamification
              </h1>
              <p className="text-sm sm:text-sm md:text-base text-slate-600 mt-1 font-light">
                Track your progress and earn badges
              </p>
            </div>
          </div>
        </Motion.div>

        {/* Navigation Tabs - Versi Responsif Single Structure */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 sm:mb-8"
        >
          <div className="w-full">
            {/* Container utama */}
            <div className="w-full sm:w-auto sm:flex sm:justify-center">
              {/* Background slate - responsif */}
              <div className="bg-slate-100 rounded-2xl p-1.5 w-full sm:w-auto">
                {/* Flex container untuk button */}
                <div className="flex space-x-2 w-full">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                flex items-center justify-center gap-2 px-4 py-3 
                rounded-xl text-sm font-medium transition-all 
                duration-200 whitespace-nowrap
                ${
                  activeTab === tab.id
                    ? "bg-white text-violet-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                }
                /* Mobile: button full width */
                w-full sm:w-auto
                /* Desktop: padding lebih lebar */
                sm:px-6
              `}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
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
                    {profile ? (
                      <>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-slate-600">Total XP</span>
                          <span className="font-bold text-slate-800">
                            {levelData.totalExperience?.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-slate-600">Total Trades</span>
                          <span className="font-bold text-slate-800">
                            {levelData.totalTrades?.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-slate-600">
                            Best Win Streak
                          </span>
                          <span className="font-bold text-slate-800">
                            {levelData.maxConsecutiveWins}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-slate-600">Daily Streak</span>
                          <span className="font-bold text-slate-800">
                            {levelData.dailyStreak} days
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2">
                          <span className="text-slate-600">Badges Earned</span>
                          <span className="font-bold text-slate-800">
                            {badges?.filter((b) => b.achieved).length || 0} /{" "}
                            {badges?.length || 0}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4 text-slate-500">
                        No profile data available
                      </div>
                    )}
                  </div>

                  {/* Leaderboard Quick Link */}
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <button
                      onClick={handleNavigateToLeaderboard}
                      className="w-full flex items-center justify-between p-3 bg-violet-50 hover:bg-violet-100 rounded-xl transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-violet-100 rounded-lg">
                          <Trophy className="w-5 h-5 text-violet-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-violet-700">
                            View Leaderboard
                          </div>
                          <div className="text-xs text-violet-600">
                            Compare your progress with others
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-violet-500 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Achievements */}
              <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Award className="w-5 h-5 text-violet-600" />
                    Recent Achievements
                  </h3>
                  <span className="text-xs text-slate-500">
                    {profile?.recentAchievements?.length || 0} total
                  </span>
                </div>

                {profile?.recentAchievements &&
                profile.recentAchievements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {profile.recentAchievements
                      .slice(0, 6)
                      .map((achievement, index) => (
                        <Motion.div
                          key={achievement.id || index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-linear-to-r from-violet-50 to-purple-50 rounded-2xl p-4 border border-violet-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className="bg-violet-100 p-2 rounded-xl">
                              <Star className="w-5 h-5 text-violet-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-800 text-sm truncate">
                                {achievement.title || "Achievement"}
                              </h4>
                              <p className="text-slate-600 text-xs mt-1 line-clamp-2">
                                {achievement.description ||
                                  "No description available"}
                              </p>
                              <div className="text-xs text-slate-500 mt-2">
                                {achievement.achievedAt
                                  ? new Date(
                                      achievement.achievedAt
                                    ).toLocaleDateString()
                                  : "Date not available"}
                              </div>
                            </div>
                          </div>
                        </Motion.div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="mb-4">
                      No achievements yet. Start trading to earn achievements!
                    </p>
                    <button
                      onClick={() => navigate("/trades")}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Target className="w-4 h-4" />
                      Start Trading
                    </button>
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
        </div>
      </div>
    </div>
  );
};

export default Layout;
