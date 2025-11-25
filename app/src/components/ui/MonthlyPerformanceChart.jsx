import React from "react";

export default function MonthlyPerformanceChart() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const performance = [8.2, 12.5, 15.2, 9.8, 6.4, -3.4];

  return (
    <div className="h-full flex items-end justify-between gap-2">
      {months.map((month, index) => (
        <div key={month} className="flex flex-col items-center flex-1">
          <div className="text-xs text-slate-500 mb-1">{month}</div>
          <div
            className={`w-full rounded-t transition-all duration-300 ${
              performance[index] >= 0 ? "bg-green-500" : "bg-red-500"
            }`}
            style={{ height: `${Math.abs(performance[index]) * 2}%` }}
          ></div>
          <div
            className={`text-xs mt-1 font-medium ${
              performance[index] >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {performance[index] > 0 ? "+" : ""}
            {performance[index]}%
          </div>
        </div>
      ))}
    </div>
  );
}