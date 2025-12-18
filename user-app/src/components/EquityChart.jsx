// components/EquityChart.js
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatCurrency, formatCompactCurrency } from "../utils/currencyFormatter";

// PERBAIKAN: Pindahkan CustomTooltip ke luar komponen EquityChart
const CustomTooltip = ({ active, payload, label, currency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 min-w-[200px]">
        <p className="font-bold text-slate-800 mb-2">
          {label === "Start" ? "Start Period" : new Date(label).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
        {payload.map((entry, index) => {
          let name = entry.name;
          if (name === "balance") name = "Balance";
          else if (name === "targetLine") name = "Target";
          else if (name === "expectedAccumulation") name = "Expected Daily";
          else if (name === "profit") name = "Profit";

          return (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              <span className="font-semibold">{name}:</span> {formatCurrency(entry.value, currency)}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

const EquityChart = ({ data, target, currency }) => {
  const isDailyTarget = target?.enabled && target?.useDailyTarget;
  const isDateBasedTarget = target?.enabled && !target?.useDailyTarget;

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            stroke="#475569"
            tick={{ fontSize: 12, fontWeight: 600 }}
            tickFormatter={(value) => {
              if (value === "Start") return "Start";
              const date = new Date(value);
              return `${date.getDate()}/${date.getMonth() + 1}`;
            }}
          />
          <YAxis
            stroke="#475569"
            width={70}
            tick={{ fontSize: 11, fontWeight: 600 }}
            tickFormatter={(value) => formatCompactCurrency(value, currency)}
          />
          {/* PERBAIKAN: Kirim currency sebagai prop ke CustomTooltip */}
          <Tooltip content={<CustomTooltip currency={currency} />} />
          
          {/* Balance Line */}
          <Line
            type="monotone"
            dataKey="balance"
            name="balance"
            stroke="#8b5cf6"
            strokeWidth={4}
            dot={{
              r: 5,
              stroke: "#7c3aed",
              strokeWidth: 2,
              fill: "#fff",
            }}
            activeDot={{ r: 7, stroke: "#7c3aed", strokeWidth: 2 }}
          />
          
          {/* Date-Based Target Line */}
          {isDateBasedTarget && (
            <Line
              type="monotone"
              dataKey="targetLine"
              name="targetLine"
              stroke="#ec4899"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={false}
            />
          )}
          
          {/* Daily Target Expected Line */}
          {isDailyTarget && (
            <Line
              type="monotone"
              dataKey="expectedAccumulation"
              name="expectedAccumulation"
              stroke="#10b981"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      {/* <div className="flex flex-wrap gap-4 justify-center mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-violet-500 rounded-full"></div>
          <span className="text-xs text-slate-700 font-medium">Balance</span>
        </div>
        {isDateBasedTarget && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-rose-500 border-dashed border rounded-full"></div>
            <span className="text-xs text-slate-700 font-medium">
              Target: {formatCompactCurrency(target.targetBalance || 0, currency)}
            </span>
          </div>
        )}
        {isDailyTarget && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-emerald-500 border-dashed border rounded-full"></div>
            <span className="text-xs text-slate-700 font-medium">
              Daily Target: {target.dailyTargetPercentage || 0}% ({formatCompactCurrency(target.dailyTargetAmount || 0, currency)}/day)
            </span>
          </div>
        )}
      </div> */}
    </div>
  );
};

export default EquityChart;