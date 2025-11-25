import React from "react";

// 🔥 Candle Component (closer to reference)
function Candle({
  bodyHeight = 40,
  wickTop = 20,
  wickBottom = 20,
  color = "green",
  small = false,
  hollow = false,
}) {
  const bodyWidth = small ? 10 : 16;
  const bodyColor = color === "green" ? "#0fa958" : "#e74c3c";

  return (
    <div className="relative flex flex-col items-center mx-2">
      {/* Top Wick */}
      <div
        style={{ height: wickTop, width: 1 }}
        className="bg-black"
      />

      {/* Body */}
      <div
        style={{ height: bodyHeight, width: bodyWidth }}
        className={
          hollow
            ? "border border-black bg-transparent"
            : ""
        }
      >
        {!hollow && (
          <div
            style={{ backgroundColor: bodyColor, height: "100%", width: "100%" }}
          />
        )}
      </div>

      {/* Bottom Wick */}
      <div
        style={{ height: wickBottom, width: 1 }}
        className="bg-black"
      />
    </div>
  );
}

// Card wrapper per pattern
function PatternCard({ title, children }) {
  return (
    <div className="bg-white border rounded-xl p-4 flex flex-col items-center shadow-sm">
      <div className="flex items-center justify-center h-28">{children}</div>
      <p className="mt-2 text-sm font-semibold text-gray-800">{title}</p>
    </div>
  );
}

export default function CandlestickPatterns() {
  return (
    <div className="min-h-screen bg-white p-10">
      <h1 className="text-center text-xl font-bold mb-10">
        Candlestick Patterns in General
      </h1>

      <div className="grid grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* 1. Spinning Tops */}
        <PatternCard title="Spinning Tops">
          <div className="flex">
            <Candle bodyHeight={18} wickTop={20} wickBottom={20} small color="green" />
            <Candle bodyHeight={18} wickTop={20} wickBottom={20} small color="red" />
          </div>
        </PatternCard>

        {/* 2. Shooting Star */}
        <PatternCard title="Shooting Star">
          <Candle bodyHeight={22} wickTop={50} wickBottom={6} color="red" />
        </PatternCard>

        {/* 3. Hammer */}
        <PatternCard title="Hammer">
          <Candle bodyHeight={22} wickTop={6} wickBottom={50} color="green" />
        </PatternCard>

        {/* 4. Doji */}
        <PatternCard title="Doji">
          <Candle bodyHeight={2} wickTop={26} wickBottom={26} hollow />
        </PatternCard>

        {/* 5. Bullish Engulfing */}
        <PatternCard title="Bullish Engulfing">
          <div className="flex items-end">
            <Candle bodyHeight={30} wickTop={6} wickBottom={6} color="red" />
            <Candle bodyHeight={60} wickTop={6} wickBottom={6} color="green" />
          </div>
        </PatternCard>

        {/* 6. Bearish Engulfing */}
        <PatternCard title="Bearish Engulfing">
          <div className="flex items-end">
            <Candle bodyHeight={42} wickTop={6} wickBottom={6} color="green" />
            <Candle bodyHeight={68} wickTop={6} wickBottom={6} color="red" />
          </div>
        </PatternCard>

        {/* 7. Evening Star */}
        <PatternCard title="Evening Star">
          <div className="flex items-end">
            <Candle bodyHeight={48} color="green" />
            <Candle bodyHeight={4} wickTop={20} wickBottom={20} hollow />
            <Candle bodyHeight={48} color="red" />
          </div>
        </PatternCard>

        {/* 8. Morning Star */}
        <PatternCard title="Morning Star">
          <div className="flex items-end">
            <Candle bodyHeight={48} color="red" />
            <Candle bodyHeight={4} wickTop={20} wickBottom={20} hollow />
            <Candle bodyHeight={48} color="green" />
          </div>
        </PatternCard>

        {/* 9. 3 Soldiers */}
        <PatternCard title="3 Soldiers">
          <div className="flex items-end">
            <Candle bodyHeight={36} color="green" />
            <Candle bodyHeight={50} color="green" />
            <Candle bodyHeight={64} color="green" />
          </div>
        </PatternCard>

        {/* 10. 3 Crows */}
        <PatternCard title="3 Crows">
          <div className="flex items-end">
            <Candle bodyHeight={36} color="red" />
            <Candle bodyHeight={50} color="red" />
            <Candle bodyHeight={64} color="red" />
          </div>
        </PatternCard>
      </div>
    </div>
  );
}
