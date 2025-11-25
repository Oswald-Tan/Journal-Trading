import React from "react";
import {
  PieChart,
  BarChart,
  TrendingUp,
  CreditCard,
  Settings,
  Menu,
  Target,
  TrendingDown,
  DollarSign,
  Activity,
  Calculator,
  BookOpen
} from "lucide-react";
import StatCard from "../components/ui/StatCard";
import EquityCurveChart from "../components/ui/EquityCurveChart";
import MonthlyPerformanceChart from "../components/ui/MonthlyPerformanceChart";
import MiniStat from "../components/ui/MiniStat";
import PerformanceMetric from "../components/ui/PerformanceMetric";

export default function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="bg-white/40 px-4 pt-4 rounded-4xl rounded-b-none flex justify-center max-w-7xl w-full mx-auto">
      <div className="bg-white rounded-t-3xl p-4 sm:p-4 flex flex-col lg:flex-row w-full">
        {/* Mobile Menu Button */}
        <div className="lg:hidden mb-4 flex justify-between items-center">
          <div className="font-semibold text-slate-700 text-lg">Pips Diary</div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Sidebar - Hidden on mobile unless menu is open */}
        <div
          className={`
            ${isMobileMenuOpen ? 'block' : 'hidden'} 
            lg:block 
            w-full lg:w-56 
            bg-slate-50 rounded-xl p-3 sm:p-4 
            flex flex-col gap-2 border border-slate-100 
            mb-4 lg:mb-0
          `}
        >
          <div className="font-semibold text-slate-700 mb-2 px-2 hidden lg:block">
            Pips Diary
          </div>

          {/* Menu Dashboard - Active */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-violet-600 text-white cursor-pointer">
            <PieChart size={18} />
            <div className="font-medium text-sm">Dashboard</div>
          </div>

          {/* Menu lainnya */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-white cursor-pointer transition-colors">
            <TrendingUp size={18} />
            <div className="font-medium text-sm">Trade</div>
          </div>

          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-white cursor-pointer transition-colors">
            <Calculator size={18} />
            <div className="font-medium text-sm">Calculator</div>
          </div>

          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-white cursor-pointer transition-colors">
            <BarChart size={18} />
            <div className="font-medium text-sm">Analytics</div>
          </div>

          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-white cursor-pointer transition-colors">
            <Activity size={18} />
            <div className="font-medium text-sm">Performance</div>
          </div>

          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-white cursor-pointer transition-colors">
            <Target size={18} />
            <div className="font-medium text-sm">Target</div>
          </div>

          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-white cursor-pointer transition-colors">
            <BookOpen size={18} />
            <div className="font-medium text-sm">Education</div>
          </div>

          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-white cursor-pointer transition-colors">
            <Settings size={18} />
            <div className="font-medium text-sm">Settings</div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 lg:ml-4 xl:ml-6 w-full">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <p className="text-lg sm:text-xl font-semibold text-slate-800">
              Trading Dashboard
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Your complete trading overview
            </p>
          </div>

          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              icon={<TrendingUp size={18} />}
              label="Total Trade"
              value="247"
              change="+12.3%"
              isPositive={true}
            />
            <StatCard
              icon={<BarChart size={18} />}
              label="Win Rate"
              value="68.2%"
              change="+5.1%"
              isPositive={true}
            />
            <StatCard
              icon={<PieChart size={18} />}
              label="Net Profit"
              value="$12.5K"
              change="+8.7%"
              isPositive={true}
            />
            <StatCard
              icon={<CreditCard size={18} />}
              label="Balance"
              value="$36.8K"
              change="-2.1%"
              isPositive={false}
            />
          </div>

          {/* Equity Curve and Monthly Performance */}
          <div className="mt-4 sm:mt-6 grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Equity Curve */}
            <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="font-semibold text-slate-800 text-sm sm:text-base">
                  Equity Curve
                </h3>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Current</span>
                </div>
              </div>
              <div className="h-40 sm:h-48">
                <EquityCurveChart />
              </div>
              <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-2">
                <MiniStat label="Start Balance" value="$10,000" />
                <MiniStat label="Current Balance" value="$36,832" />
                <MiniStat label="Growth" value="+268.3%" isPositive={true} />
              </div>
            </div>

            {/* Monthly Performance */}
            <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="font-semibold text-slate-800 text-sm sm:text-base">
                  Monthly Performance
                </h3>
                <div className="text-xs sm:text-sm text-slate-500">Last 6 months</div>
              </div>
              <div className="h-40 sm:h-48">
                <MonthlyPerformanceChart />
              </div>
              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-xs sm:text-sm text-slate-600">
                  Best:{" "}
                  <span className="font-semibold text-green-600">
                    March (+15.2%)
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-slate-600">
                  Worst:{" "}
                  <span className="font-semibold text-red-600">
                    June (-3.4%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <PerformanceMetric
              title="Average Win"
              value="$452.30"
              change="+8.2%"
              isPositive={true}
              icon={<Target size={16} />}
            />
            <PerformanceMetric
              title="Average Loss"
              value="$187.50"
              change="-2.1%"
              isPositive={true}
              icon={<TrendingDown size={16} />}
            />
            <PerformanceMetric
              title="Profit Factor"
              value="2.45"
              change="+0.3"
              isPositive={true}
              icon={<DollarSign size={16} />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}