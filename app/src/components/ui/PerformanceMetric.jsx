import React from "react";

export default function PerformanceMetric({ title, value, change, isPositive, icon }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-violet-50 text-violet-600">
            {icon}
          </div>
          <div className="text-sm font-medium text-slate-700">{title}</div>
        </div>
        <div
          className={`text-xs font-semibold ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {change}
        </div>
      </div>
      <div className="mt-2 text-xl font-bold text-slate-900">{value}</div>
    </div>
  );
}