import React from "react";

export default function StatCard({ icon, label, value, change, isPositive }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-50 text-violet-600">
            {icon}
          </div>
          <div>
            <div className="text-xs text-slate-500">{label}</div>
            <div className="font-bold text-lg">{value}</div>
          </div>
        </div>
        <div
          className={`text-xs font-semibold ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {change}
        </div>
      </div>
    </div>
  );
}