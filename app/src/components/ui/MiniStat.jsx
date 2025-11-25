import React from "react";

export default function MiniStat({ label, value, isPositive }) {
  return (
    <div className="text-center">
      <div className="text-xs text-slate-500">{label}</div>
      <div
        className={`text-sm font-semibold ${
          isPositive ? "text-green-600" : "text-slate-800"
        }`}
      >
        {value}
      </div>
    </div>
  );
}