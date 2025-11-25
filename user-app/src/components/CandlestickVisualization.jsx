import React from "react";

// 🔥 Candle Component
function Candle({
  bodyHeight = 40,
  wickTop = 20,
  wickBottom = 20,
  color = "green",
  small = false,
  hollow = false,
}) {
  const bodyWidth = small ? 10 : 16;
  const bodyColor = color === "green" ? "#15750C" : "#AE1513";

  return (
    <div className="relative flex flex-col items-center mx-1">
      {/* Top Wick */}
      <div style={{ height: wickTop, width: 1 }} className="bg-slate-800" />

      {/* Body */}
      <div
        style={{ height: bodyHeight, width: bodyWidth }}
        className={
          hollow
            ? "border border-slate-800 bg-transparent rounded-xs"
            : "rounded-xs"
        }
      >
        {!hollow && (
          <div
            style={{
              backgroundColor: bodyColor,
              height: "100%",
              width: "100%",
            }}
            className="rounded-xs"
          />
        )}
      </div>

      {/* Bottom Wick */}
      <div style={{ height: wickBottom, width: 1 }} className="bg-slate-800" />
    </div>
  );
}

// Card wrapper per pattern
function PatternCard({ title, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-center h-24">{children}</div>
      <p className="mt-3 text-sm font-semibold text-slate-800 text-center">
        {title}
      </p>
    </div>
  );
}

export default function CandlestickVisualization() {
  return (
    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
      <h3 className="text-lg font-bold text-slate-800 mb-6 text-center">
        Visual Pola Candlestick
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* 1. Spinning Tops */}
        <PatternCard title="Spinning Tops">
          <div className="flex">
            <Candle
              bodyHeight={14}
              wickTop={15}
              wickBottom={15}
              small
              color="green"
            />
            <Candle
              bodyHeight={14}
              wickTop={15}
              wickBottom={15}
              small
              color="red"
            />
          </div>
        </PatternCard>

        {/* 2. Shooting Star */}
        <PatternCard title="Shooting Star">
          <Candle bodyHeight={14} wickTop={30} wickBottom={0} color="red" />
        </PatternCard>

        {/* 3. Hammer */}
        <PatternCard title="Hammer">
          <Candle bodyHeight={14} wickTop={0} wickBottom={30} color="green" />
        </PatternCard>

        {/* 4. Doji */}
        <PatternCard title="Doji">
          <Candle bodyHeight={2} wickTop={20} wickBottom={20} hollow />
        </PatternCard>

        {/* 5. Bullish Engulfing */}
        <PatternCard title="Bullish Engulfing">
          <div className="flex items-end">
            <div className="flex flex-col items-center">
              <Candle bodyHeight={20} wickTop={4} wickBottom={4} color="red" />
            </div>
            <div className="flex flex-col items-center mb-4">
              <Candle
                bodyHeight={36}
                wickTop={4}
                wickBottom={4}
                color="green"
              />
            </div>
          </div>
        </PatternCard>

        {/* 6. Bearish Engulfing */}
        <PatternCard title="Bearish Engulfing">
          <div className="flex items-start">
            <div className="flex flex-col items-center">
              <Candle
                bodyHeight={20}
                wickTop={4}
                wickBottom={4}
                color="green"
              />
            </div>
            <div className="flex flex-col items-center mt-4">
              <Candle bodyHeight={36} wickTop={4} wickBottom={4} color="red" />
            </div>
          </div>
        </PatternCard>

        {/* 7. Evening Star */}
        <PatternCard title="Evening Star">
          <div className="flex items-start">
            <Candle bodyHeight={32} color="green" />
            <Candle bodyHeight={2} wickTop={12} color="red" wickBottom={12} />
            <Candle bodyHeight={20} color="red" />
          </div>
        </PatternCard>

        {/* 8. Morning Star */}
        <PatternCard title="Morning Star">
          <div className="flex items-end">
            <Candle bodyHeight={32} color="red" />
            <Candle bodyHeight={2} wickTop={12} color="red" wickBottom={12} />
            <Candle bodyHeight={20} color="green" />
          </div>
        </PatternCard>

        {/* 9. 3 Soldiers */}
        <PatternCard title="3 Soldiers">
          <div className="flex items-end">
            <div className="">
              <Candle
                bodyHeight={30}
                wickTop={5}
                wickBottom={5}
                color="green"
              />
            </div>
            <div className="mb-4">
              <Candle
                bodyHeight={30}
                wickTop={5}
                wickBottom={5}
                color="green"
              />
            </div>
            <div className="mb-8">
              <Candle
                bodyHeight={30}
                wickTop={5}
                wickBottom={5}
                color="green"
              />
            </div>
          </div>
        </PatternCard>

        {/* 10. 3 Crows */}
        <PatternCard title="3 Crows">
          <div className="flex items-start">
            <div className="">
              <Candle
                bodyHeight={30}
                wickTop={5}
                wickBottom={5}
                color="red"
              />
            </div>
            <div className="mt-4">
              <Candle
                bodyHeight={30}
                wickTop={5}
                wickBottom={5}
                color="red"
              />
            </div>
            <div className="mt-8">
              <Candle
                bodyHeight={30}
                wickTop={5}
                wickBottom={5}
                color="red"
              />
            </div>
          </div>
        </PatternCard>
      </div>
    </div>
  );
}
