import React, { useEffect, useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { getTrades } from "../features/tradeSlice";
import {
  formatCurrency,
  formatCompactCurrency,
} from "../utils/currencyFormatter";
import {
  BarChart3,
  Trophy,
  Target,
  Calendar,
  TrendingUp,
  Settings,
  Clock,
  Wallet,
  TrendingDown,
  PieChart as PieChartIcon,
  Download,
  Rocket,
  Award,
  Zap,
} from "lucide-react";
import { API_URL } from "../config";
import Swal from "sweetalert2";

const Analytics = () => {
  const dispatch = useDispatch();
  const { currency } = useSelector((state) => state.balance);
  const [isExporting, setIsExporting] = useState(false);

  // Ambil data dari Redux store
  const { trades = [], stats = {} } = useSelector((state) => state.trades);
  const { initialBalance, currentBalance } = useSelector(
    (state) => state.balance
  );

  // State untuk tracking data loading
  const [dataFetched, setDataFetched] = useState(false);

  // Fetch data dengan kondisi yang lebih ketat
  useEffect(() => {
    const fetchData = async () => {
      // Hanya fetch jika:
      // 1. Belum pernah fetch sebelumnya
      // 2. Trades masih kosong
      if (!dataFetched && trades.length === 0) {
        console.log("🔄 Analytics: Fetching trades data...");
        try {
          await dispatch(getTrades());
        } catch (error) {
          console.error("❌ Analytics: Failed to fetch trades:", error);
        } finally {
          setDataFetched(true);
        }
      } else if (trades.length > 0) {
        // Jika sudah ada data, set fetched true
        setDataFetched(true);
      }
    };

    fetchData();
  }, [dispatch, trades.length, dataFetched]);

  // Safe stats dengan default values
  const safeStats = useMemo(
    () => ({
      totalTrades: stats?.totalTrades || trades.length || 0,
      wins: stats?.wins || 0,
      losses: stats?.losses || 0,
      breakEven: stats?.breakEven || 0,
      winRate: stats?.winRate || 0,
      avgPips: stats?.avgPips || 0,
      profitFactor: stats?.profitFactor || 0,
      largestWin: stats?.largestWin || 0,
      largestLoss: stats?.largestLoss || 0,
      netProfit: stats?.netProfit || 0,
      ...stats,
    }),
    [stats, trades]
  );

  // Instrument Performance Data
  const instrumentData = useMemo(() => {
    if (trades.length === 0) return [];

    const instrumentStats = {};
    trades.forEach((entry) => {
      if (!entry.instrument) return;

      if (!instrumentStats[entry.instrument]) {
        instrumentStats[entry.instrument] = { profit: 0, trades: 0, wins: 0 };
      }
      instrumentStats[entry.instrument].profit += entry.profit || 0;
      instrumentStats[entry.instrument].trades += 1;
      if (entry.result?.toLowerCase().includes("win")) {
        instrumentStats[entry.instrument].wins += 1;
      }
    });

    return Object.entries(instrumentStats)
      .map(([instrument, data]) => ({
        instrument,
        profit: data.profit,
        trades: data.trades,
        winRate: Math.round((data.wins / data.trades) * 100) || 0,
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 8);
  }, [trades]);

  // Win/Loss Distribution Data for Pie Chart
  const winLossData = useMemo(() => {
    if (trades.length === 0) {
      return [];
    }

    const resultStats = {
      Win: 0,
      Lose: 0,
      "Break Even": 0,
    };

    trades.forEach((entry) => {
      if (entry.result) {
        const result = entry.result.toLowerCase();
        if (result.includes("win")) resultStats["Win"]++;
        else if (result.includes("lose")) resultStats["Lose"]++;
        else if (result.includes("break")) resultStats["Break Even"]++;
      }
    });

    return [
      { name: "Wins", value: resultStats["Win"], color: "#10b981" },
      { name: "Losses", value: resultStats["Lose"], color: "#ef4444" },
      {
        name: "Break Even",
        value: resultStats["Break Even"],
        color: "#f59e0b",
      },
    ].filter((item) => item.value > 0);
  }, [trades]);

  // Daily Performance Data
  const dailyPerformanceData = useMemo(() => {
    if (trades.length === 0) return [];

    const dailyStats = {};
    trades.forEach((entry) => {
      if (!entry.date) return;

      if (!dailyStats[entry.date]) {
        dailyStats[entry.date] = { profit: 0, trades: 0 };
      }
      dailyStats[entry.date].profit += entry.profit || 0;
      dailyStats[entry.date].trades += 1;
    });

    return Object.entries(dailyStats)
      .map(([date, data]) => ({
        date,
        profit: data.profit,
        trades: data.trades,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30);
  }, [trades]);

  // Strategy Performance
  const strategyData = useMemo(() => {
    if (trades.length === 0) return [];

    const strategyStats = {};
    trades.forEach((entry) => {
      const strategy = entry.strategy || "No Strategy";
      if (!strategyStats[strategy]) {
        strategyStats[strategy] = { profit: 0, trades: 0, wins: 0 };
      }
      strategyStats[strategy].profit += entry.profit || 0;
      strategyStats[strategy].trades += 1;
      if (entry.result?.toLowerCase().includes("win")) {
        strategyStats[strategy].wins += 1;
      }
    });

    return Object.entries(strategyStats)
      .map(([strategy, data]) => ({
        strategy:
          strategy.length > 20 ? strategy.substring(0, 20) + "..." : strategy,
        profit: data.profit,
        trades: data.trades,
        winRate: Math.round((data.wins / data.trades) * 100) || 0,
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 6);
  }, [trades]);

  // SOLUSI 2: Lebih jelas dengan format 24 jam
  const timeOfDayData = useMemo(() => {
    if (trades.length === 0) return [];

    const timeSlots = [
      { name: "Night (00:00-05:59)", min: 0, max: 5 },
      { name: "Morning (06:00-11:59)", min: 6, max: 11 },
      { name: "Afternoon (12:00-17:59)", min: 12, max: 17 },
      { name: "Evening (18:00-23:59)", min: 18, max: 23 },
    ];

    const timeStats = {};
    timeSlots.forEach((slot) => {
      timeStats[slot.name] = { profit: 0, trades: 0, wins: 0 };
    });

    trades.forEach((entry) => {
      if (!entry.date) return;

      const hour = new Date(entry.date).getHours();

      // Cari slot yang sesuai
      const slot = timeSlots.find((s) => hour >= s.min && hour <= s.max);
      if (!slot) return; // Jika tidak ditemukan (seharusnya tidak terjadi)

      timeStats[slot.name].profit += entry.profit || 0;
      timeStats[slot.name].trades += 1;
      if (entry.result?.toLowerCase().includes("win")) {
        timeStats[slot.name].wins += 1;
      }
    });

    return Object.entries(timeStats)
      .map(([time, data]) => ({
        time,
        profit: data.profit,
        trades: data.trades,
        wins: data.wins,
        winRate:
          data.trades > 0 ? Math.round((data.wins / data.trades) * 100) : 0,
        avgProfit: data.trades > 0 ? Math.round(data.profit / data.trades) : 0,
      }))
      .filter((item) => item.trades > 0);
  }, [trades]);

  // Trade Type Performance (Buy vs Sell)
  const tradeTypeData = useMemo(() => {
    if (trades.length === 0) return [];

    const typeStats = {
      Buy: { profit: 0, trades: 0, wins: 0 },
      Sell: { profit: 0, trades: 0, wins: 0 },
    };

    trades.forEach((entry) => {
      if (typeStats[entry.type]) {
        typeStats[entry.type].profit += entry.profit || 0;
        typeStats[entry.type].trades += 1;
        if (entry.result?.toLowerCase().includes("win")) {
          typeStats[entry.type].wins += 1;
        }
      }
    });

    return Object.entries(typeStats).map(([type, data]) => ({
      type,
      profit: data.profit,
      trades: data.trades,
      winRate: Math.round((data.wins / data.trades) * 100) || 0,
      avgProfit: Math.round(data.profit / data.trades) || 0,
    }));
  }, [trades]);

  // Profit/Loss Distribution
  const profitDistributionData = useMemo(() => {
    if (trades.length === 0) return [];

    const profitRanges = {
      "Large Loss (< -500k)": 0,
      "Medium Loss (-500k to -100k)": 0,
      "Small Loss (-100k to 0)": 0,
      "Small Profit (0 to 100k)": 0,
      "Medium Profit (100k to 500k)": 0,
      "Large Profit (> 500k)": 0,
    };

    trades.forEach((entry) => {
      const profit = entry.profit || 0;
      if (profit < -500000) profitRanges["Large Loss (< -500k)"]++;
      else if (profit < -100000) profitRanges["Medium Loss (-500k to -100k)"]++;
      else if (profit < 0) profitRanges["Small Loss (-100k to 0)"]++;
      else if (profit < 100000) profitRanges["Small Profit (0 to 100k)"]++;
      else if (profit < 500000) profitRanges["Medium Profit (100k to 500k)"]++;
      else profitRanges["Large Profit (> 500k)"]++;
    });

    return Object.entries(profitRanges)
      .map(([range, count]) => ({ range, count }))
      .filter((item) => item.count > 0);
  }, [trades]);

  // Monthly Performance Trend
  const monthlyTrendData = useMemo(() => {
    if (trades.length === 0) return [];

    const monthlyStats = {};
    trades.forEach((entry) => {
      if (!entry.date) return;

      const month = entry.date.substring(0, 7);
      if (!monthlyStats[month]) {
        monthlyStats[month] = { profit: 0, trades: 0 };
      }
      monthlyStats[month].profit += entry.profit || 0;
      monthlyStats[month].trades += 1;
    });

    return Object.entries(monthlyStats)
      .map(([month, data]) => ({
        month,
        profit: data.profit,
        trades: data.trades,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);
  }, [trades]);

  // Add this function inside Analytics component
  const handleExportPDF = async () => {
    try {
      // Set loading state
      setIsExporting(true);
     

      // Make API call with axios
      const response = await axios.get(`${API_URL}/trades/export/pdf`, {
        responseType: "blob",
      });

      // Create blob from response
      const blob = new Blob([response.data], { type: "application/pdf" });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Trading-Report-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      // Show success message
      Swal.fire({
        icon: "success",
        title: "PDF exported successfully",
        text: "Your PDF file has been downloaded.",
        showConfirmButton: false,
        timer: 1500,
      })
    } catch (error) {
      console.error("Export PDF error:", error);

      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        console.error(
          "Server error:",
          error.response.status,
          error.response.data
        );
        Swal.fire({
          icon: "error",
          title: "Failed to export PDF",
          text: `Export failed: ${
            error.response.data.message ||
            `Server error ${error.response.status}`
          }`,
        });
      } else if (error.request) {
        // Request made but no response
        console.error("No response:", error.request);
        Swal.fire({
          icon: "error",
          title: "Failed to export PDF",
          text: "Export failed: No response from server. Please check your connection.",
        })
      } else {
        // Other errors
        console.error("Error:", error.message);
        Swal.fire({
          icon: "error",
          title: "Failed to export PDF",
          text: `Export failed: ${error.message}`,
        })
      }
    } finally {
      // Reset loading state
      setIsExporting(false);
    }
  };

  const ChartCard = ({ title, children, className = "", icon }) => (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
    >
      <h3 className="text-lg font-bold mb-4 text-slate-800 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {children}
    </Motion.div>
  );

  // Custom Tooltip Formatter untuk chart
  const renderTooltipContent = (value, name) => {
    if (
      name === "profit" ||
      name === "avgProfit" ||
      name === "Total Profit" ||
      name === "Avg Profit"
    ) {
      return [formatCurrency(value, currency), name];
    } else if (
      name === "winRate" ||
      name === "Win Rate %" ||
      name === "Win Rate"
    ) {
      return [`${value}%`, name];
    }
    return [value, name];
  };

  return (
    <div className="space-y-6 min-h-screen">
      {/* Header */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-violet-600" />
            Trading Analytics
          </h1>
          <p className="text-slate-600 mt-1 font-light">
            Deep insights into your trading performance
          </p>
        </div>

        <div className="flex flex-row gap-3 w-full sm:w-auto">
          {/* Mobile: Full width, Desktop: Auto width */}
          <Motion.div
            whileHover={{ scale: 1.05 }}
            className="w-full sm:w-auto bg-linear-to-br from-slate-100 to-violet-100 border-2 border-slate-200 rounded-2xl px-6 py-3 shadow-sm flex-1 sm:flex-none"
          >
            <div className="text-sm text-slate-700 font-medium">
              Total Trades
            </div>
            <div className="font-bold text-2xl text-slate-800">
              {safeStats.totalTrades}
            </div>
          </Motion.div>

          <Motion.div
            whileHover={{ scale: 1.05 }}
            className="w-full sm:w-auto bg-linear-to-br from-emerald-100 to-green-100 border-2 border-emerald-200 rounded-2xl px-6 py-3 shadow-sm flex-1 sm:flex-none"
          >
            <div className="text-sm text-emerald-700 font-medium">Win Rate</div>
            <div className="font-bold text-2xl text-emerald-900">
              {safeStats.winRate}%
            </div>
          </Motion.div>
        </div>
      </Motion.div>

      {/* Show message if no data */}
      {trades.length === 0 && (
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm p-12 text-center border border-slate-100"
        >
          <div className="max-w-md mx-auto">
            <Motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="mb-4"
            >
              <BarChart3 className="w-16 h-16 mx-auto text-slate-400" />
            </Motion.div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              No Trading Data Yet
            </h3>
            <p className="text-slate-600 mb-6 font-light">
              Start adding trades to see detailed analytics and insights about
              your trading performance.
            </p>
            <Motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (window.location.href = "/trades")}
              className="bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all shadow-sm font-medium flex items-center gap-2 mx-auto"
            >
              <Zap className="w-5 h-5" />
              Add Your First Trade
            </Motion.button>
          </div>
        </Motion.div>
      )}

      {/* Charts - Only show if there's data */}
      {trades.length > 0 && (
        <>
          {/* Top Charts Row - Win/Loss Distribution dan Instrument Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Win/Loss Distribution */}
            <ChartCard
              title="Win/Loss Distribution"
              icon={<Trophy className="w-5 h-5 text-violet-600" />}
            >
              <div className="h-80">
                {winLossData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={winLossData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelStyle={{
                          fontWeight: "bold",
                          fontSize: "14px",
                          fill: "#475569",
                        }}
                      >
                        {winLossData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [value, `${name}`]}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "2px solid #8b5cf6",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          backgroundColor: "#fafafa",
                          fontSize: "14px",
                          fontWeight: "600",
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          fontWeight: 600,
                          fontSize: "12px",
                        }}
                        iconType="circle"
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <PieChartIcon className="w-12 h-12 mb-2 text-slate-400" />
                    <p className="font-medium">No win/loss data available</p>
                    <p className="text-sm mt-1 font-light">
                      Add trades with results to see distribution
                    </p>
                  </div>
                )}
              </div>
            </ChartCard>

            {/* Instrument Performance */}
            {instrumentData.length > 0 && (
              <ChartCard
                title="Instrument Performance"
                icon={<Target className="w-5 h-5 text-violet-600" />}
              >
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={instrumentData}
                      layout="vertical"
                      margin={{ left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        type="number"
                        stroke="#475569"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) =>
                          formatCompactCurrency(value, currency)
                        }
                      />
                      <YAxis
                        type="category"
                        dataKey="instrument"
                        stroke="#475569"
                        width={80}
                        tick={{ fontSize: 12, fontWeight: 600 }}
                      />
                      <Tooltip
                        formatter={renderTooltipContent}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "2px solid #8b5cf6",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          backgroundColor: "#fafafa",
                        }}
                      />
                      <Bar dataKey="profit" radius={[0, 8, 8, 0]}>
                        {instrumentData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.profit >= 0 ? "#8b5cf6" : "#ef4444"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            )}
          </div>

          {/* Middle Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Performance */}
            {dailyPerformanceData.length > 0 && (
              <ChartCard
                title="Daily Performance (Last 30 Days)"
                icon={<Calendar className="w-5 h-5 text-violet-600" />}
              >
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyPerformanceData} margin={{ left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="date"
                        stroke="#475569"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getDate()}/${date.getMonth() + 1}`;
                        }}
                      />
                      <YAxis
                        stroke="#475569"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) =>
                          formatCompactCurrency(value, currency)
                        }
                      />
                      <Tooltip
                        formatter={renderTooltipContent}
                        labelFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString("id-ID");
                        }}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "2px solid #8b5cf6",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          backgroundColor: "#fafafa",
                        }}
                      />
                      <Bar dataKey="profit" radius={[8, 8, 0, 0]}>
                        {dailyPerformanceData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.profit >= 0 ? "#8b5cf6" : "#ef4444"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            )}

            {/* Monthly Trend */}
            {monthlyTrendData.length > 0 && (
              <ChartCard
                title="Monthly Trend"
                icon={<TrendingUp className="w-5 h-5 text-violet-600" />}
              >
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="month"
                        stroke="#475569"
                        tick={{ fontSize: 11, fontWeight: 600 }}
                        tickFormatter={(value) => {
                          const [year, month] = value.split("-");
                          return `${month}/${year.slice(2)}`;
                        }}
                      />
                      <YAxis
                        stroke="#475569"
                        tick={{ fontSize: 11, fontWeight: 600 }}
                        tickFormatter={(value) =>
                          formatCompactCurrency(value, currency)
                        }
                      />
                      <Tooltip
                        formatter={renderTooltipContent}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "2px solid #8b5cf6",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          backgroundColor: "#fafafa",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        dot={{ fill: "#7c3aed", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: "#7c3aed" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            )}
          </div>

          {/* Bottom Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strategy Performance */}
            {strategyData.length > 0 && (
              <ChartCard
                title="Strategy Performance"
                icon={<Settings className="w-5 h-5 text-violet-600" />}
              >
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={strategyData}
                      layout="vertical"
                      margin={{ left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        type="number"
                        stroke="#475569"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) =>
                          formatCompactCurrency(value, currency)
                        }
                      />
                      <YAxis
                        type="category"
                        dataKey="strategy"
                        stroke="#475569"
                        width={120}
                        tick={{ fontSize: 12, fontWeight: 600 }}
                      />
                      <Tooltip
                        formatter={renderTooltipContent}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "2px solid #8b5cf6",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          backgroundColor: "#fafafa",
                        }}
                      />
                      <Bar dataKey="profit" radius={[0, 8, 8, 0]}>
                        {strategyData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.profit >= 0 ? "#8b5cf6" : "#ef4444"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            )}

            {/* Time of Day Performance */}
            {timeOfDayData.length > 0 && (
              <ChartCard
                title="Time of Day Performance"
                icon={<Clock className="w-5 h-5 text-violet-600" />}
              >
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeOfDayData} margin={{ left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="time"
                        stroke="#475569"
                        tick={{ fontSize: 10, fontWeight: 600 }}
                        angle={-15}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        stroke="#475569"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) =>
                          formatCompactCurrency(value, currency)
                        }
                      />
                      <Tooltip
                        formatter={renderTooltipContent}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "2px solid #8b5cf6",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          backgroundColor: "#fafafa",
                        }}
                      />
                      <Bar dataKey="profit" radius={[8, 8, 0, 0]}>
                        {timeOfDayData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.profit >= 0 ? "#10b981" : "#ef4444"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            )}
          </div>

          {/* Additional Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trade Type Performance */}
            {tradeTypeData.length > 0 && (
              <ChartCard
                title="Trade Type Performance"
                icon={<BarChart3 className="w-5 h-5 text-violet-600" />}
              >
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tradeTypeData} margin={{ left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="type"
                        stroke="#475569"
                        tick={{ fontSize: 12, fontWeight: 600 }}
                      />
                      <YAxis
                        stroke="#475569"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) =>
                          formatCompactCurrency(value, currency)
                        }
                      />
                      <Tooltip
                        formatter={renderTooltipContent}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "2px solid #8b5cf6",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          backgroundColor: "#fafafa",
                        }}
                      />
                      <Bar dataKey="profit" radius={[8, 8, 0, 0]}>
                        {tradeTypeData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.profit >= 0 ? "#8b5cf6" : "#ef4444"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            )}

            {/* Profit Distribution */}
            {profitDistributionData.length > 0 && (
              <ChartCard
                title="Profit/Loss Distribution"
                icon={<Wallet className="w-5 h-5 text-violet-600" />}
              >
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={profitDistributionData}
                      margin={{ left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="range"
                        stroke="#475569"
                        tick={{ fontSize: 11, fontWeight: 600 }}
                        angle={-15}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value) => [value, "Trades"]}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "2px solid #8b5cf6",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          backgroundColor: "#fafafa",
                        }}
                      />
                      <Bar
                        dataKey="count"
                        radius={[8, 8, 0, 0]}
                        fill="#8b5cf6"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            )}
          </div>

          {/* Trading Statistics */}
          <ChartCard
            title="Trading Statistics"
            icon={<Award className="w-5 h-5 text-violet-600" />}
          >
            <div className="space-y-4 h-80 flex flex-col justify-center">
              <div className="grid grid-cols-2 gap-4">
                <Motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-5 bg-linear-to-br from-slate-100 to-violet-100 rounded-2xl shadow-sm border border-slate-200"
                >
                  <div className="text-3xl font-bold text-slate-700">
                    {safeStats.totalTrades}
                  </div>
                  <div className="text-sm text-slate-800 font-medium mt-1">
                    Total Trades
                  </div>
                </Motion.div>
                <Motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-5 bg-linear-to-br from-emerald-100 to-green-100 rounded-2xl shadow-sm border border-emerald-200"
                >
                  <div className="text-3xl font-bold text-emerald-700">
                    {safeStats.winRate}%
                  </div>
                  <div className="text-sm text-emerald-800 font-medium mt-1">
                    Win Rate
                  </div>
                </Motion.div>
                <Motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-5 bg-linear-to-br from-violet-100 to-violet-100 rounded-2xl shadow-sm border border-violet-200"
                >
                  <div className="text-3xl font-bold text-violet-700">
                    {safeStats.avgPips}
                  </div>
                  <div className="text-sm text-violet-800 font-medium mt-1">
                    Avg Pips/Trade
                  </div>
                </Motion.div>
                <Motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-5 bg-linear-to-br from-amber-100 to-yellow-100 rounded-2xl shadow-sm border border-amber-200"
                >
                  <div className="text-3xl font-bold text-amber-700">
                    {safeStats.profitFactor?.toFixed(2) || 0}
                  </div>
                  <div className="text-sm text-amber-800 font-medium mt-1">
                    Profit Factor
                  </div>
                </Motion.div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <Motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-5 bg-linear-to-br from-emerald-100 to-green-100 rounded-2xl shadow-sm border-2 border-emerald-300"
                >
                  <div className="text-xl font-bold text-emerald-700">
                    {formatCompactCurrency(safeStats.largestWin, currency)}
                  </div>
                  <div className="text-sm text-emerald-800 font-medium mt-1 flex items-center justify-center gap-1">
                    <TrendingUp className="w-4 h-4" /> Largest Win
                  </div>
                </Motion.div>
                <Motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-5 bg-linear-to-br from-rose-100 to-red-100 rounded-2xl shadow-sm border-2 border-rose-300"
                >
                  <div className="text-xl font-bold text-rose-700">
                    {formatCompactCurrency(safeStats.largestLoss, currency)}
                  </div>
                  <div className="text-sm text-rose-800 font-medium mt-1 flex items-center justify-center gap-1">
                    <TrendingDown className="w-4 h-4" /> Largest Loss
                  </div>
                </Motion.div>
              </div>
            </div>
          </ChartCard>

          {/* Additional Info Banner dengan Export PDF - HANYA tampil jika ada data trades */}
          {trades.length > 0 && (
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-linear-to-r from-violet-600 via-pink-500 to-violet-600 rounded-3xl p-5 shadow-sm border-2 border-violet-300"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between text-white gap-5">
                <div className="flex items-start gap-4">
                  <div className="bg-white/20 p-2.5 rounded-full">
                    <Rocket className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-1.5">
                      Keep Improving Your Trading!
                    </h3>
                    <p className="text-violet-100/90 font-light text-sm sm:text-base">
                      Analyze your patterns, learn from your trades, and grow
                      consistently.
                    </p>
                  </div>
                </div>

                <Motion.button
                  whileHover={!isExporting ? { scale: 1.05, y: -2 } : {}}
                  whileTap={!isExporting ? { scale: 0.95 } : {}}
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className={`w-full md:w-auto px-5 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 ${
                    isExporting
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-white text-violet-600 hover:bg-violet-50"
                  }`}
                >
                  {isExporting ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4 mr-2 text-violet-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Export Report</span>
                    </>
                  )}
                </Motion.button>
              </div>
            </Motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default Analytics;