import React, { useState, useMemo, useEffect } from "react";
import { motion as Motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { formatCurrency, formatCompactCurrency } from "../utils/currencyFormatter";

const TradingCalendar = ({ entries = [], currency = "USD" }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Navigasi bulan
  const navigateMonth = (direction) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + direction);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  // Data untuk bulan yang dipilih
  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Filter entri untuk bulan ini
    const monthEntries = entries.filter(entry => {
      if (!entry.date) return false;
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === year && entryDate.getMonth() === month;
    });

    // Kelompokkan per tanggal
    const dateMap = {};
    monthEntries.forEach(entry => {
      const entryDate = new Date(entry.date);
      const dateKey = entryDate.toISOString().split('T')[0];
      
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = {
          date: entryDate,
          trades: 0,
          wins: 0,
          losses: 0,
          breakEven: 0,
          totalProfit: 0,
          entries: [],
        };
      }
      
      dateMap[dateKey].trades++;
      dateMap[dateKey].totalProfit += entry.profit || 0;
      dateMap[dateKey].entries.push(entry);
      
      if (entry.result?.toLowerCase().includes('win')) {
        dateMap[dateKey].wins++;
      } else if (entry.result?.toLowerCase().includes('lose')) {
        dateMap[dateKey].losses++;
      } else if (entry.result?.toLowerCase().includes('break')) {
        dateMap[dateKey].breakEven++;
      }
    });

    return dateMap;
  }, [entries, currentDate]);

  // Hitung statistik bulanan
  const monthStats = useMemo(() => {
    const dailyData = Object.values(monthData);
    let totalTrades = 0;
    let totalWins = 0;
    let totalProfit = 0;
    let profitableDays = 0;
    let totalDays = dailyData.length;

    dailyData.forEach(day => {
      totalTrades += day.trades;
      totalWins += day.wins;
      totalProfit += day.totalProfit;
      if (day.totalProfit > 0) profitableDays++;
    });

    const winRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0;
    const avgDailyProfit = totalDays > 0 ? totalProfit / totalDays : 0;
    const profitableDayRate = totalDays > 0 ? (profitableDays / totalDays) * 100 : 0;

    return {
      totalTrades,
      totalWins,
      totalProfit,
      winRate: Math.round(winRate * 100) / 100,
      avgDailyProfit: Math.round(avgDailyProfit * 100) / 100,
      profitableDayRate: Math.round(profitableDayRate * 100) / 100,
      totalDays,
      profitableDays,
    };
  }, [monthData]);

  // Generate kalender
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Hari pertama bulan ini
    const firstDay = new Date(year, month, 1);
    // Hari terakhir bulan ini
    const lastDay = new Date(year, month + 1, 0);
    // Hari dalam minggu untuk hari pertama (0 = Minggu, 1 = Senin, ...)
    const firstDayOfWeek = firstDay.getDay();
    
    // Jumlah hari dalam bulan
    const daysInMonth = lastDay.getDate();
    
    // Generate array hari
    const days = [];
    
    // Tambahkan hari kosong di awal (dari bulan sebelumnya)
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Tambahkan hari dalam bulan
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = date.toISOString().split('T')[0];
      const dayData = monthData[dateKey];
      
      days.push({
        date,
        day,
        data: dayData,
        isToday: date.toDateString() === new Date().toDateString(),
      });
    }
    
    return days;
  }, [currentDate, monthData]);

  // Format nama bulan
  const monthName = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  // Nama hari pendek untuk mobile
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayNamesMobile = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Warna berdasarkan profit
  const getProfitColor = (profit) => {
    if (profit > 0) return 'bg-emerald-100 border-emerald-300 text-emerald-800';
    if (profit < 0) return 'bg-rose-100 border-rose-300 text-rose-800';
    return 'bg-slate-100 border-slate-300 text-slate-800';
  };

  // Render icon berdasarkan hasil trading
  const getResultIcon = (dayData) => {
    if (!dayData || dayData.trades === 0) return null;
    
    const winRate = dayData.wins / dayData.trades;
    
    if (winRate === 1) return <CheckCircle className="w-3 h-3 text-emerald-600" />;
    if (winRate >= 0.5) return <TrendingUp className="w-3 h-3 text-emerald-500" />;
    if (dayData.totalProfit > 0) return <TrendingUp className="w-3 h-3 text-emerald-400" />;
    if (dayData.totalProfit < 0) return <TrendingDown className="w-3 h-3 text-rose-500" />;
    return <AlertCircle className="w-3 h-3 text-amber-500" />;
  };

  // Render detail trades per hari
  const renderTradeDetails = (dayData) => {
    if (!dayData || dayData.trades === 0) return (
      <div className="text-xs text-slate-400 italic mt-2">No trades</div>
    );

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-violet-500"></div>
          <span className="text-xs font-medium text-slate-700">
            {dayData.trades} trade{dayData.trades > 1 ? 's' : ''}
          </span>
        </div>
        
        <div className={`text-xs px-2 py-1 rounded border ${getProfitColor(dayData.totalProfit)}`}>
          {formatCompactCurrency(dayData.totalProfit, currency)}
        </div>
        
        {(dayData.wins > 0 || dayData.losses > 0) && (
          <div className="flex gap-1 text-xs">
            <span className="text-emerald-600 font-medium">{dayData.wins}W</span>
            <span className="text-slate-400">•</span>
            <span className="text-rose-600 font-medium">{dayData.losses}L</span>
            {dayData.breakEven > 0 && (
              <>
                <span className="text-slate-400">•</span>
                <span className="text-amber-600 font-medium">{dayData.breakEven}B</span>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Navigasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-violet-600" />
          <h3 className="text-lg font-bold text-slate-800">Trading Calendar - {monthName}</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigateMonth(-1)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </Motion.button>
          
          <Motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToToday}
            className="px-3 py-1.5 text-sm bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors font-medium"
          >
            Today
          </Motion.button>
          
          <Motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigateMonth(1)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </Motion.button>
        </div>
      </div>

      {/* Statistik Bulanan */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Trades</p>
              <p className="text-2xl font-bold text-slate-800">{monthStats.totalTrades}</p>
            </div>
            <div className="p-2 bg-violet-50 rounded-lg">
              <CalendarIcon className="w-5 h-5 text-violet-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {monthStats.totalDays} trading days
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Wins</p>
              <p className="text-2xl font-bold text-slate-800">{monthStats.totalWins}</p>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {monthStats.winRate}% win rate
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Profits</p>
              <p className="text-2xl font-bold text-slate-800">
                {formatCompactCurrency(monthStats.totalProfit, currency)}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${monthStats.totalProfit >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
              {monthStats.totalProfit >= 0 ? (
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-rose-600" />
              )}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Avg: {formatCompactCurrency(monthStats.avgDailyProfit, currency)}/day
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Profitable Days</p>
              <p className="text-2xl font-bold text-slate-800">{monthStats.profitableDays}</p>
            </div>
            <div className="p-2 bg-violet-50 rounded-lg">
              <div className="w-5 h-5 flex items-center justify-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {monthStats.profitableDayRate}% of trading days
          </p>
        </div>
      </div>

      {/* Kalender - Dengan Scroll Horizontal di Mobile */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Header Hari */}
        <div className={`grid grid-cols-7 border-b border-slate-200 ${isMobile ? 'min-w-[700px]' : ''}`}>
          {(isMobile ? dayNamesMobile : dayNames).map((day, index) => (
            <div 
              key={index} 
              className="py-3 text-center text-sm font-semibold text-slate-600 bg-slate-50 min-w-[calc(100%/7)]"
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Grid Hari dengan Overflow Horizontal */}
        <div className="overflow-x-auto">
          <div className={`grid grid-cols-7 ${isMobile ? 'min-w-[700px]' : ''}`}>
            {calendarDays.map((day, index) => {
              if (!day) {
                return (
                  <div 
                    key={`empty-${index}`} 
                    className={`border-b border-r border-slate-100 bg-slate-50/50 ${isMobile ? 'min-w-[calc(100%/7)]' : ''}`}
                    style={{ minHeight: isMobile ? '100px' : '120px' }}
                  ></div>
                );
              }
              
              const { date, day: dayNumber, data, isToday } = day;
              const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
              
              return (
                <Motion.div
                  key={date.toISOString()}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedDate(isSelected ? null : date)}
                  className={`
                    border-b border-r border-slate-100 
                    transition-all cursor-pointer relative
                    ${isToday ? 'bg-violet-50' : 'bg-white'}
                    ${isSelected ? 'ring-2 ring-violet-500 ring-inset' : ''}
                    ${data ? 'hover:bg-slate-50' : ''}
                    ${isMobile ? 'min-w-[calc(100%/7)]' : ''}
                  `}
                  style={{ minHeight: isMobile ? '100px' : '120px' }}
                >
                  {/* Nomor Hari */}
                  <div className="flex items-center justify-between mb-1 p-2">
                    <span className={`
                      text-sm font-semibold
                      ${isToday ? 'text-violet-700' : 'text-slate-700'}
                    `}>
                      {dayNumber}
                    </span>
                    {data && getResultIcon(data)}
                  </div>
                  
                  {/* Data Trading */}
                  <div className="px-2">
                    {renderTradeDetails(data)}
                  </div>
                  
                  {/* Indikator Hari Ini */}
                  {isToday && (
                    <div className="absolute bottom-1 right-1 w-2 h-2 bg-violet-500 rounded-full"></div>
                  )}
                </Motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail Hari yang Dipilih */}
      {selectedDate && monthData[selectedDate.toISOString().split('T')[0]] && (
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-xl border border-slate-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-800">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h4>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-sm text-slate-600">Total Trades</p>
              <p className="text-xl font-bold text-slate-800">
                {monthData[selectedDate.toISOString().split('T')[0]].trades}
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-sm text-slate-600">Win Rate</p>
              <p className="text-xl font-bold text-emerald-600">
                {monthData[selectedDate.toISOString().split('T')[0]].trades > 0 
                  ? Math.round((monthData[selectedDate.toISOString().split('T')[0]].wins / monthData[selectedDate.toISOString().split('T')[0]].trades) * 100)
                  : 0}%
              </p>
            </div>
            <div className={`p-3 rounded-lg ${monthData[selectedDate.toISOString().split('T')[0]].totalProfit >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
              <p className="text-sm text-slate-600">Daily P/L</p>
              <p className={`text-xl font-bold ${monthData[selectedDate.toISOString().split('T')[0]].totalProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrency(monthData[selectedDate.toISOString().split('T')[0]].totalProfit, currency)}
              </p>
            </div>
          </div>
          
          {/* Daftar Trades Hari Ini */}
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-700 mb-2">Trades on this day:</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {monthData[selectedDate.toISOString().split('T')[0]].entries.map((trade, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${trade.profit >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                    <div>
                      <p className="font-medium text-slate-800">{trade.instrument}</p>
                      <p className="text-xs text-slate-500">{trade.type} • Lot: {trade.lot}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${trade.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatCurrency(trade.profit, currency)}
                    </p>
                    <p className={`text-xs font-medium ${
                      trade.result?.toLowerCase().includes('win') ? 'text-emerald-600' : 
                      trade.result?.toLowerCase().includes('lose') ? 'text-rose-600' : 
                      'text-amber-600'
                    }`}>
                      {trade.result}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Motion.div>
      )}
      
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-xs sm:text-sm">Profitable Day</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500"></div>
          <span className="text-xs sm:text-sm">Loss Day</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-violet-500"></div>
          <span className="text-xs sm:text-sm">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-3 h-3 text-emerald-600" />
          <span className="text-xs sm:text-sm">100% Win Rate</span>
        </div>
      </div>
    </div>
  );
};

export default TradingCalendar;