import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
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
  Line
} from 'recharts';
import { getTrades } from '../features/tradeSlice';
import { formatCurrency, formatCompactCurrency } from '../utils/currencyFormatter';

const Analytics = () => {
  const dispatch = useDispatch();
  const { currency } = useSelector((state) => state.balance);

  // Ambil data dari Redux store
  const { trades = [], stats = {} } = useSelector((state) => state.trades);
  const { initialBalance, currentBalance } = useSelector((state) => state.balance);

  // State untuk tracking data loading
  const [dataFetched, setDataFetched] = useState(false);

  // Fetch data dengan kondisi yang lebih ketat
  useEffect(() => {
    const fetchData = async () => {
      // Hanya fetch jika:
      // 1. Belum pernah fetch sebelumnya
      // 2. Trades masih kosong
      if (!dataFetched && trades.length === 0) {
        console.log('🔄 Analytics: Fetching trades data...');
        try {
          await dispatch(getTrades());
        } catch (error) {
          console.error('❌ Analytics: Failed to fetch trades:', error);
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
  const safeStats = useMemo(() => ({
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
    ...stats
  }), [stats, trades]);

  // Instrument Performance Data
  const instrumentData = useMemo(() => {
    if (trades.length === 0) return [];
    
    const instrumentStats = {};
    trades.forEach(entry => {
      if (!entry.instrument) return;
     
      if (!instrumentStats[entry.instrument]) {
        instrumentStats[entry.instrument] = { profit: 0, trades: 0, wins: 0 };
      }
      instrumentStats[entry.instrument].profit += entry.profit || 0;
      instrumentStats[entry.instrument].trades += 1;
      if (entry.result?.toLowerCase().includes('win')) {
        instrumentStats[entry.instrument].wins += 1;
      }
    });

    return Object.entries(instrumentStats).map(([instrument, data]) => ({
      instrument,
      profit: data.profit,
      trades: data.trades,
      winRate: Math.round((data.wins / data.trades) * 100) || 0
    })).sort((a, b) => b.profit - a.profit).slice(0, 8);
  }, [trades]);

  // Win/Loss Distribution Data for Pie Chart
  const winLossData = useMemo(() => {
    if (trades.length === 0) {
      return [];
    }

    const resultStats = {
      'Win': 0,
      'Lose': 0,
      'Break Even': 0
    };

    trades.forEach(entry => {
      if (entry.result) {
        const result = entry.result.toLowerCase();
        if (result.includes('win')) resultStats['Win']++;
        else if (result.includes('lose')) resultStats['Lose']++;
        else if (result.includes('break')) resultStats['Break Even']++;
      }
    });

    return [
      { name: 'Wins', value: resultStats['Win'], color: '#10b981' },
      { name: 'Losses', value: resultStats['Lose'], color: '#ef4444' },
      { name: 'Break Even', value: resultStats['Break Even'], color: '#f59e0b' }
    ].filter(item => item.value > 0);
  }, [trades]);

  // Daily Performance Data
  const dailyPerformanceData = useMemo(() => {
    if (trades.length === 0) return [];
    
    const dailyStats = {};
    trades.forEach(entry => {
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
        trades: data.trades
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30);
  }, [trades]);

  // Strategy Performance
  const strategyData = useMemo(() => {
    if (trades.length === 0) return [];
    
    const strategyStats = {};
    trades.forEach(entry => {
      const strategy = entry.strategy || 'No Strategy';
      if (!strategyStats[strategy]) {
        strategyStats[strategy] = { profit: 0, trades: 0, wins: 0 };
      }
      strategyStats[strategy].profit += entry.profit || 0;
      strategyStats[strategy].trades += 1;
      if (entry.result?.toLowerCase().includes('win')) {
        strategyStats[strategy].wins += 1;
      }
    });

    return Object.entries(strategyStats).map(([strategy, data]) => ({
      strategy: strategy.length > 20 ? strategy.substring(0, 20) + '...' : strategy,
      profit: data.profit,
      trades: data.trades,
      winRate: Math.round((data.wins / data.trades) * 100) || 0
    })).sort((a, b) => b.profit - a.profit).slice(0, 6);
  }, [trades]);

  // Time of Day Analysis
  const timeOfDayData = useMemo(() => {
    if (trades.length === 0) return [];
    
    const timeStats = {
      'Morning (6-12)': { profit: 0, trades: 0, wins: 0 },
      'Afternoon (12-18)': { profit: 0, trades: 0, wins: 0 },
      'Evening (18-24)': { profit: 0, trades: 0, wins: 0 },
      'Night (0-6)': { profit: 0, trades: 0, wins: 0 }
    };

    trades.forEach(entry => {
      if (!entry.date) return;
     
      const hour = new Date(entry.date).getHours();
      let timeSlot;
     
      if (hour >= 6 && hour < 12) timeSlot = 'Morning (6-12)';
      else if (hour >= 12 && hour < 18) timeSlot = 'Afternoon (12-18)';
      else if (hour >= 18 && hour < 24) timeSlot = 'Evening (18-24)';
      else timeSlot = 'Night (0-6)';

      timeStats[timeSlot].profit += entry.profit || 0;
      timeStats[timeSlot].trades += 1;
      if (entry.result?.toLowerCase().includes('win')) {
        timeStats[timeSlot].wins += 1;
      }
    });

    return Object.entries(timeStats).map(([time, data]) => ({
      time,
      profit: data.profit,
      trades: data.trades,
      wins: data.wins,
      winRate: data.trades > 0 ? Math.round((data.wins / data.trades) * 100) : 0,
      avgProfit: data.trades > 0 ? Math.round(data.profit / data.trades) : 0
    })).filter(item => item.trades > 0);
  }, [trades]);

  // Trade Type Performance (Buy vs Sell)
  const tradeTypeData = useMemo(() => {
    if (trades.length === 0) return [];
    
    const typeStats = {
      'Buy': { profit: 0, trades: 0, wins: 0 },
      'Sell': { profit: 0, trades: 0, wins: 0 }
    };

    trades.forEach(entry => {
      if (typeStats[entry.type]) {
        typeStats[entry.type].profit += entry.profit || 0;
        typeStats[entry.type].trades += 1;
        if (entry.result?.toLowerCase().includes('win')) {
          typeStats[entry.type].wins += 1;
        }
      }
    });

    return Object.entries(typeStats).map(([type, data]) => ({
      type,
      profit: data.profit,
      trades: data.trades,
      winRate: Math.round((data.wins / data.trades) * 100) || 0,
      avgProfit: Math.round(data.profit / data.trades) || 0
    }));
  }, [trades]);

  // Profit/Loss Distribution
  const profitDistributionData = useMemo(() => {
    if (trades.length === 0) return [];
    
    const profitRanges = {
      'Large Loss (< -500k)': 0,
      'Medium Loss (-500k to -100k)': 0,
      'Small Loss (-100k to 0)': 0,
      'Small Profit (0 to 100k)': 0,
      'Medium Profit (100k to 500k)': 0,
      'Large Profit (> 500k)': 0
    };

    trades.forEach(entry => {
      const profit = entry.profit || 0;
      if (profit < -500000) profitRanges['Large Loss (< -500k)']++;
      else if (profit < -100000) profitRanges['Medium Loss (-500k to -100k)']++;
      else if (profit < 0) profitRanges['Small Loss (-100k to 0)']++;
      else if (profit < 100000) profitRanges['Small Profit (0 to 100k)']++;
      else if (profit < 500000) profitRanges['Medium Profit (100k to 500k)']++;
      else profitRanges['Large Profit (> 500k)']++;
    });

    return Object.entries(profitRanges)
      .map(([range, count]) => ({ range, count }))
      .filter(item => item.count > 0);
  }, [trades]);

  // Monthly Performance Trend
  const monthlyTrendData = useMemo(() => {
    if (trades.length === 0) return [];
    
    const monthlyStats = {};
    trades.forEach(entry => {
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
        trades: data.trades
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);
  }, [trades]);

  const ChartCard = ({ title, children, className = "", icon = "📊" }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-orange-100 shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}
    >
      <h3 className="text-lg font-bold mb-4 text-orange-900 flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        {title}
      </h3>
      {children}
    </motion.div>
  );

  // Custom Tooltip Formatter untuk chart
  const renderTooltipContent = (value, name, props) => {
    if (name === 'profit' || name === 'avgProfit' || name === 'Total Profit' || name === 'Avg Profit') {
      return [formatCurrency(value, currency), name];
    } else if (name === 'winRate' || name === 'Win Rate %' || name === 'Win Rate') {
      return [`${value}%`, name];
    }
    return [value, name];
  };

  return (
    <div className="space-y-6 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-orange-900 flex items-center gap-2">
            Trading Analytics
          </h1>
          <p className="text-orange-700 mt-1">Deep insights into your trading performance</p>
        </div>
       
        <div className="flex gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-linear-to-br from-orange-100 to-amber-100 border-2 border-orange-200 rounded-2xl px-6 py-3 shadow-lg"
          >
            <div className="text-sm text-orange-700 font-semibold">Total Trades</div>
            <div className="font-bold text-2xl text-orange-900">{safeStats.totalTrades}</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-linear-to-br from-emerald-100 to-green-100 border-2 border-emerald-200 rounded-2xl px-6 py-3 shadow-lg"
          >
            <div className="text-sm text-emerald-700 font-semibold">Win Rate</div>
            <div className="font-bold text-2xl text-emerald-900">{safeStats.winRate}%</div>
          </motion.div>
        </div>
      </motion.div>

      {/* Show message if no data */}
      {trades.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl border border-orange-100 shadow-xl p-12 text-center"
        >
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="text-6xl mb-4"
            >
              📊
            </motion.div>
            <h3 className="text-xl font-bold text-orange-900 mb-2">No Trading Data Yet</h3>
            <p className="text-orange-700 mb-6">
              Start adding trades to see detailed analytics and insights about your trading performance.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/trades'}
              className="bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-xl transition-all shadow-lg font-semibold"
            >
              ➕ Add Your First Trade
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Charts - Only show if there's data */}
      {trades.length > 0 && (
        <>
          {/* Top Charts Row - Win/Loss Distribution dan Instrument Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Win/Loss Distribution */}
            <ChartCard title="Win/Loss Distribution" icon="🏆">
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
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelStyle={{
                          fontWeight: 'bold',
                          fontSize: '14px',
                          fill: '#9a3412'
                        }}
                      >
                        {winLossData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [value, `${name}`]}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '2px solid #fb923c',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          backgroundColor: '#fffbeb',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          fontWeight: 600,
                          fontSize: '12px'
                        }}
                        iconType="circle"
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <div className="text-4xl mb-2">📊</div>
                    <p className="font-medium">No win/loss data available</p>
                    <p className="text-sm mt-1">Add trades with results to see distribution</p>
                  </div>
                )}
              </div>
            </ChartCard>

            {/* Instrument Performance */}
            {instrumentData.length > 0 && (
              <ChartCard title="Instrument Performance" icon="🎯">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={instrumentData} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                      <XAxis 
                        type="number" 
                        stroke="#9a3412" 
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) => formatCompactCurrency(value, currency)}
                      />
                      <YAxis
                        type="category"
                        dataKey="instrument"
                        stroke="#9a3412"
                        width={80}
                        tick={{ fontSize: 12, fontWeight: 600 }}
                      />
                      <Tooltip
                        formatter={renderTooltipContent}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '2px solid #fb923c',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          backgroundColor: '#fffbeb'
                        }}
                      />
                      <Bar dataKey="profit" radius={[0, 8, 8, 0]}>
                        {instrumentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#f97316' : '#ef4444'} />
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
              <ChartCard title="Daily Performance (Last 30 Days)" icon="📅">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyPerformanceData} margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                      <XAxis
                        dataKey="date"
                        stroke="#9a3412"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getDate()}/${date.getMonth() + 1}`;
                        }}
                      />
                      <YAxis 
                        stroke="#9a3412" 
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) => formatCompactCurrency(value, currency)}
                      />
                      <Tooltip
                        formatter={renderTooltipContent}
                        labelFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString('id-ID');
                        }}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '2px solid #fb923c',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          backgroundColor: '#fffbeb'
                        }}
                      />
                      <Bar
                        dataKey="profit"
                        radius={[8, 8, 0, 0]}
                      >
                        {dailyPerformanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#f97316' : '#ef4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            )}

            {/* Monthly Trend */}
            {monthlyTrendData.length > 0 && (
              <ChartCard title="Monthly Trend" icon="📈">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                      <XAxis
                        dataKey="month"
                        stroke="#9a3412"
                        tick={{ fontSize: 11, fontWeight: 600 }}
                        tickFormatter={(value) => {
                          const [year, month] = value.split('-');
                          return `${month}/${year.slice(2)}`;
                        }}
                      />
                      <YAxis
                        stroke="#9a3412"
                        tick={{ fontSize: 11, fontWeight: 600 }}
                        tickFormatter={(value) => formatCompactCurrency(value, currency)}
                      />
                      <Tooltip
                        formatter={renderTooltipContent}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '2px solid #fb923c',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          backgroundColor: '#fffbeb'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="#f97316"
                        strokeWidth={3}
                        dot={{ fill: '#ea580c', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#ea580c' }}
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
              <ChartCard title="Strategy Performance" icon="🎲">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={strategyData} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                      <XAxis 
                        type="number" 
                        stroke="#9a3412" 
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) => formatCompactCurrency(value, currency)}
                      />
                      <YAxis
                        type="category"
                        dataKey="strategy"
                        stroke="#9a3412"
                        width={120}
                        tick={{ fontSize: 12, fontWeight: 600 }}
                      />
                      <Tooltip
                        formatter={renderTooltipContent}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '2px solid #fb923c',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          backgroundColor: '#fffbeb'
                        }}
                      />
                      <Bar dataKey="profit" radius={[0, 8, 8, 0]}>
                        {strategyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#f97316' : '#ef4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            )}

            {/* Time of Day Performance */}
            {timeOfDayData.length > 0 && (
              <ChartCard title="Time of Day Performance" icon="⏰">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeOfDayData} margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                      <XAxis
                        dataKey="time"
                        stroke="#9a3412"
                        tick={{ fontSize: 10, fontWeight: 600 }}
                        angle={-15}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        stroke="#9a3412" 
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) => formatCompactCurrency(value, currency)}
                      />
                      <Tooltip
                        formatter={renderTooltipContent}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '2px solid #fb923c',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          backgroundColor: '#fffbeb'
                        }}
                      />
                      <Bar
                        dataKey="profit"
                        radius={[8, 8, 0, 0]}
                      >
                        {timeOfDayData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#10b981' : '#ef4444'} />
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
              <ChartCard title="Trade Type Performance" icon="📊">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tradeTypeData} margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                      <XAxis
                        dataKey="type"
                        stroke="#9a3412"
                        tick={{ fontSize: 12, fontWeight: 600 }}
                      />
                      <YAxis 
                        stroke="#9a3412" 
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) => formatCompactCurrency(value, currency)}
                      />
                      <Tooltip
                        formatter={renderTooltipContent}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '2px solid #fb923c',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          backgroundColor: '#fffbeb'
                        }}
                      />
                      <Bar
                        dataKey="profit"
                        radius={[8, 8, 0, 0]}
                      >
                        {tradeTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#f97316' : '#ef4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            )}

            {/* Profit Distribution */}
            {profitDistributionData.length > 0 && (
              <ChartCard title="Profit/Loss Distribution" icon="💰">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={profitDistributionData} margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                      <XAxis
                        dataKey="range"
                        stroke="#9a3412"
                        tick={{ fontSize: 11, fontWeight: 600 }}
                        angle={-15}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis stroke="#9a3412" tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value) => [value, 'Trades']}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '2px solid #fb923c',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          backgroundColor: '#fffbeb'
                        }}
                      />
                      <Bar
                        dataKey="count"
                        radius={[8, 8, 0, 0]}
                        fill="#f97316"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            )}
          </div>

          {/* Trading Statistics */}
          <ChartCard title="Trading Statistics" icon="💼">
            <div className="space-y-4 h-80 flex flex-col justify-center">
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-5 bg-linear-to-br from-orange-100 to-amber-100 rounded-2xl shadow-md border border-orange-200"
                >
                  <div className="text-3xl font-bold text-orange-700">{safeStats.totalTrades}</div>
                  <div className="text-sm text-orange-800 font-semibold mt-1">Total Trades</div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-5 bg-linear-to-br from-emerald-100 to-green-100 rounded-2xl shadow-md border border-emerald-200"
                >
                  <div className="text-3xl font-bold text-emerald-700">{safeStats.winRate}%</div>
                  <div className="text-sm text-emerald-800 font-semibold mt-1">Win Rate</div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-5 bg-linear-to-br from-purple-100 to-violet-100 rounded-2xl shadow-md border border-purple-200"
                >
                  <div className="text-3xl font-bold text-purple-700">{safeStats.avgPips}</div>
                  <div className="text-sm text-purple-800 font-semibold mt-1">Avg Pips/Trade</div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-5 bg-linear-to-br from-amber-100 to-yellow-100 rounded-2xl shadow-md border border-amber-200"
                >
                  <div className="text-3xl font-bold text-amber-700">{safeStats.profitFactor?.toFixed(2) || 0}</div>
                  <div className="text-sm text-amber-800 font-semibold mt-1">Profit Factor</div>
                </motion.div>
              </div>
             
              <div className="grid grid-cols-2 gap-4 mt-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-5 bg-linear-to-br from-emerald-100 to-green-100 rounded-2xl shadow-md border-2 border-emerald-300"
                >
                  <div className="text-xl font-bold text-emerald-700">
                    {formatCompactCurrency(safeStats.largestWin, currency)}
                  </div>
                  <div className="text-sm text-emerald-800 font-semibold mt-1 flex items-center justify-center gap-1">
                    <span>🎉</span> Largest Win
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-5 bg-linear-to-br from-rose-100 to-red-100 rounded-2xl shadow-md border-2 border-rose-300"
                >
                  <div className="text-xl font-bold text-rose-700">
                    {formatCompactCurrency(safeStats.largestLoss, currency)}
                  </div>
                  <div className="text-sm text-rose-800 font-semibold mt-1 flex items-center justify-center gap-1">
                    <span>💔</span> Largest Loss
                  </div>
                </motion.div>
              </div>
            </div>
          </ChartCard>
        </>
      )}

      {/* Additional Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-linear-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-3xl p-6 shadow-2xl border-2 border-orange-300"
      >
        <div className="flex items-center justify-between text-white">
          <div>
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <span className="text-3xl">🚀</span>
              Keep Improving Your Trading!
            </h3>
            <p className="text-orange-100">
              Analyze your patterns, learn from your trades, and grow consistently.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-orange-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
          >
            📊 Export Report
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;