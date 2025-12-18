import React from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Target,
  Lock,
  Zap,
  X,
  Download,
  BarChart3,
  TrendingUp,
  Award,
  Settings,
  Clock,
  Trophy,
  Wallet,
  Calendar,
} from "lucide-react";

// Feature configurations for different use cases
const featureConfigs = {
  targets: {
    title: "Trading Targets",
    description:
      "Set and track custom trading targets to stay motivated and achieve your financial goals.",
    icon: <Target className="w-6 h-6 text-violet-600" />,
    iconBg: "from-violet-100 to-purple-100",
    benefits: [
      "Set custom profit targets",
      "Track progress with visual charts",
      "Receive milestone achievements",
      "Daily progress tracking",
    ],
  },
  exportReport: {
    title: "Export Reports",
    description:
      "Export detailed trading reports in PDF format for professional analysis and record keeping.",
    icon: <Download className="w-6 h-6 text-violet-600" />,
    iconBg: "from-blue-100 to-cyan-100",
    benefits: [
      "Export PDF reports",
      "Professional formatting",
      "Detailed analytics summary",
      "Multiple data formats",
    ],
  },
  advancedAnalytics: {
    title: "Advanced Analytics",
    description:
      "Access in-depth trading analytics and performance metrics to optimize your strategy.",
    icon: <BarChart3 className="w-6 h-6 text-violet-600" />,
    iconBg: "from-emerald-100 to-green-100",
    benefits: [
      "Advanced performance metrics",
      "Detailed instrument analysis",
      "Time-based analytics",
      "Strategy performance tracking",
    ],
  },

  unlimited_calendar_events: {
    title: "Unlimited Calendar Events",
    description: "Free plan is limited to 10 calendar events. Upgrade to Pro for unlimited events and advanced calendar features.",
    icon: <Calendar className="w-6 h-6 text-violet-600" />,
    iconBg: "from-violet-100 to-purple-100",
    benefits: [
      "Unlimited calendar events",
      "Advanced event types",
      "Recurring events",
      "Custom reminders",
      "Export calendar data",
      "Priority support"
    ]
  },

  win_loss_analytics: {
    title: "Win/Loss Analytics",
    description:
      "Detailed analysis of your win/loss distribution with interactive charts and insights.",
    icon: <Trophy className="w-6 h-6 text-violet-600" />,
    iconBg: "from-emerald-100 to-green-100",
    benefits: [
      "Win/loss distribution charts",
      "Break-even trade tracking",
      "Success rate analysis",
      "Visual performance metrics",
    ],
  },
  instrument_analytics: {
    title: "Instrument Performance Analytics",
    description:
      "Detailed performance analysis for each trading instrument to optimize your strategy.",
    icon: <Target className="w-6 h-6 text-violet-600" />,
    iconBg: "from-blue-100 to-cyan-100",
    benefits: [
      "Instrument-specific performance tracking",
      "Profitability ranking by pair",
      "Win rate per instrument",
      "Volume and frequency analysis",
    ],
  },
  monthly_trend_analytics: {
    title: "Monthly Trend Analytics",
    description:
      "Track your monthly performance trends to identify seasonal patterns and growth.",
    icon: <TrendingUp className="w-6 h-6 text-violet-600" />,
    iconBg: "from-violet-100 to-purple-100",
    benefits: [
      "Monthly performance trends",
      "Seasonal pattern recognition",
      "Growth tracking over time",
      "Month-over-month comparisons",
    ],
  },
  strategy_analytics: {
    title: "Strategy Performance Analytics",
    description:
      "Analyze the effectiveness of different trading strategies to optimize your approach.",
    icon: <Settings className="w-6 h-6 text-violet-600" />,
    iconBg: "from-amber-100 to-yellow-100",
    benefits: [
      "Strategy performance tracking",
      "Win rate by strategy",
      "Profitability comparison",
      "Strategy optimization insights",
    ],
  },
  time_analytics: {
    title: "Time-based Analytics",
    description:
      "Analyze your trading performance by time of day to find your most profitable hours.",
    icon: <Clock className="w-6 h-6 text-violet-600" />,
    iconBg: "from-indigo-100 to-purple-100",
    benefits: [
      "Time of day performance analysis",
      "Most profitable trading hours",
      "Session-based performance",
      "Time optimization insights",
    ],
  },
  trade_type_analytics: {
    title: "Trade Type Analytics",
    description:
      "Compare performance between Buy and Sell trades to optimize your trading direction.",
    icon: <BarChart3 className="w-6 h-6 text-violet-600" />,
    iconBg: "from-rose-100 to-pink-100",
    benefits: [
      "Buy vs Sell performance comparison",
      "Directional trade analysis",
      "Win rate by trade type",
      "Profitability per trade direction",
    ],
  },
  distribution_analytics: {
    title: "Profit Distribution Analytics",
    description:
      "Analyze your profit/loss distribution to understand your risk profile and performance.",
    icon: <Wallet className="w-6 h-6 text-violet-600" />,
    iconBg: "from-purple-100 to-indigo-100",
    benefits: [
      "Profit/loss distribution analysis",
      "Risk profile assessment",
      "Performance clustering",
      "Outlier identification",
    ],
  },

  // TAMBAHAN UNTUK PERFORMANCE PAGE
  profit_factor: {
    title: "Profit Factor Analysis",
    description:
      "Track your profit factor to measure the effectiveness of your trading strategy and risk management.",
    icon: <TrendingUp className="w-6 h-6 text-violet-600" />,
    iconBg: "from-purple-100 to-pink-100",
    benefits: [
      "Real-time profit factor calculation",
      "Historical profit factor tracking",
      "Strategy effectiveness analysis",
      "Risk-adjusted return metrics",
    ],
  },
  avg_profit_trade: {
    title: "Average Profit per Trade",
    description:
      "Monitor your average profit per trade to optimize position sizing and improve consistency.",
    icon: <BarChart3 className="w-6 h-6 text-violet-600" />,
    iconBg: "from-emerald-100 to-teal-100",
    benefits: [
      "Average profit/loss calculation",
      "Trade-by-trade performance analysis",
      "Position sizing optimization",
      "Consistency tracking",
    ],
  },
  total_pips: {
    title: "Total Pips Analysis",
    description:
      "Track your total pips to measure trading activity and technical execution quality.",
    icon: <Target className="w-6 h-6 text-violet-600" />,
    iconBg: "from-amber-100 to-yellow-100",
    benefits: [
      "Total pips tracking",
      "Pips per trade analysis",
      "Technical execution metrics",
      "Trading activity monitoring",
    ],
  },
  weekly_trend: {
    title: "Weekly Performance Trend",
    description:
      "Analyze your weekly trading performance with detailed trend charts and insights.",
    icon: <TrendingUp className="w-6 h-6 text-violet-600" />,
    iconBg: "from-blue-100 to-indigo-100",
    benefits: [
      "Weekly profit/loss trends",
      "Week-over-week comparison",
      "Performance pattern recognition",
      "Time-based analysis",
    ],
  },
  monthly_performance: {
    title: "Monthly Performance Tracking",
    description:
      "Comprehensive monthly performance analysis with detailed breakdowns and insights.",
    icon: <BarChart3 className="w-6 h-6 text-violet-600" />,
    iconBg: "from-violet-100 to-purple-100",
    benefits: [
      "Monthly performance summaries",
      "Month-over-month comparison",
      "Seasonal pattern analysis",
      "Detailed monthly breakdowns",
    ],
  },
  instrument_performance: {
    title: "Instrument Performance Analysis",
    description:
      "Deep dive into individual instrument performance to identify strengths and weaknesses.",
    icon: <Target className="w-6 h-6 text-violet-600" />,
    iconBg: "from-emerald-100 to-green-100",
    benefits: [
      "Instrument-specific analytics",
      "Best/worst performers tracking",
      "Win rate by instrument",
      "Profitability analysis per pair",
    ],
  },
  trading_consistency: {
    title: "Trading Consistency Metrics",
    description:
      "Track your trading consistency including streaks, drawdowns, and recovery factors.",
    icon: <Award className="w-6 h-6 text-violet-600" />,
    iconBg: "from-amber-100 to-orange-100",
    benefits: [
      "Consecutive win/loss tracking",
      "Maximum drawdown analysis",
      "Recovery factor calculation",
      "Consistency scoring",
    ],
  },
  risk_management: {
    title: "Advanced Risk Management",
    description:
      "Comprehensive risk management tools to protect your capital and optimize risk/reward.",
    icon: <Target className="w-6 h-6 text-violet-600" />,
    iconBg: "from-red-100 to-rose-100",
    benefits: [
      "Largest win/loss analysis",
      "Risk/reward ratio tracking",
      "Win/loss ratio monitoring",
      "Position sizing recommendations",
    ],
  },
  performance_analytics: {
    title: "Advanced Performance Analytics",
    description:
      "Complete suite of advanced performance analytics for professional traders.",
    icon: <TrendingUp className="w-6 h-6 text-violet-600" />,
    iconBg: "from-violet-100 to-purple-100",
    benefits: [
      "All advanced metrics unlocked",
      "Complete performance dashboard",
      "Professional analytics tools",
      "Export and reporting features",
    ],
  },
  default: {
    title: "Premium Feature",
    description:
      "Upgrade to access premium features that will enhance your trading experience.",
    icon: <Lock className="w-6 h-6 text-violet-600" />,
    iconBg: "from-violet-100 to-purple-100",
    benefits: [
      "Advanced features",
      "Priority support",
      "Regular updates",
      "Exclusive tools",
    ],
  },
};

const UpgradeRequiredModal = ({
  setShowUpgradeModal,
  featureKey = "default",
  featureName = null,
  customDescription = null,
}) => {
  const navigate = useNavigate();
  const { subscription } = useSelector((state) => state.subscription);

  // Get feature configuration
  const featureConfig = featureConfigs[featureKey] || featureConfigs.default;

  // Use custom values if provided
  const title = featureName || featureConfig.title;
  const description = customDescription || featureConfig.description;

  const handleUpgrade = () => {
    setShowUpgradeModal(false);
    navigate("/upgrade");
  };

  const handleClose = () => {
    setShowUpgradeModal(false);
  };

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleClose}
    >
      <Motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border-2 border-violet-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl bg-linear-to-br ${featureConfig.iconBg} flex items-center justify-center shadow-sm`}
              >
                {featureConfig.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Available in Premium Plans
                </p>
              </div>
            </div>
            <Motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              className="text-slate-500 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
            >
              <X className="w-6 h-6" />
            </Motion.button>
          </div>

          {/* Current Plan Badge */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
              <div className="w-2 h-2 rounded-full bg-slate-400"></div>
              <span className="text-sm font-semibold text-slate-700">
                Current Plan:{" "}
                <span className="text-violet-700 capitalize">
                  {subscription?.plan || "free"}
                </span>
              </span>
            </div>
          </div>

          {/* Feature Description */}
          <div className="mb-6 p-4 bg-slate-50 rounded-xl">
            <p className="text-slate-700">{description}</p>
          </div>

          {/* Benefits List */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-3">
              What you'll get:
            </h3>
            <div className="space-y-3">
              {featureConfig.benefits.map((benefit, index) => (
                <Motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-slate-700">{benefit}</span>
                </Motion.div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 pt-4 border-t border-slate-200">
            <Motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUpgrade}
              className="w-full px-6 py-3 bg-linear-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-bold flex items-center justify-center gap-2 shadow-sm"
            >
              <Zap className="w-5 h-5" />
              View All Plans & Upgrade
            </Motion.button>

            <Motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClose}
              className="w-full px-6 py-3 border-2 border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors font-medium"
            >
              Continue with Free Plan
            </Motion.button>
          </div>

          {/* Upgrade Benefit */}
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500">
              Thousands of traders have upgraded their trading journey
            </p>
          </div>
        </div>
      </Motion.div>
    </Motion.div>
  );
};

export default UpgradeRequiredModal;