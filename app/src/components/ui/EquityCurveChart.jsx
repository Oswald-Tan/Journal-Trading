import React from "react";

export default function EquityCurveChart() {
  const data = [
    10000, 12500, 11800, 14200, 15600, 18900, 21000, 24500, 27800, 31200, 29800,
    36832,
  ];

  return (
    <div className="relative h-full">
      {/* Grid lines */}
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border-r border-slate-100"></div>
        ))}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-b border-slate-100"></div>
        ))}
      </div>

      {/* Chart line */}
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            d={`M0,${100 - data[0] / 400} ${data
              .map((point, i) => `L${(i / 11) * 100},${100 - point / 400}`)
              .join(" ")}`}
            fill="none"
            stroke="url(#linear)"
            strokeWidth="2"
            className="drop-shadow-sm"
          />
          <defs>
            <linearGradient id="linear" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}