import React from "react";

const CandlestickStructureVisual = () => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <h4 className="text-lg font-bold text-slate-800 mb-6 text-center">
        Struktur Candlestick
      </h4>

      <div className="flex flex-col items-center space-y-8">
        {/* Bullish Candle */}
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-8">
            {/* Visual Candle */}
            <div className="relative flex flex-col items-center">
              {/* Upper Wick */}
              <div className="w-1 h-8 bg-slate-800 mb-1" />
              
              {/* Body */}
              <div className="w-16 h-20 bg-[#15750C] rounded-sm flex flex-col items-center justify-center relative">
                <span className="text-white text-sm font-bold absolute top-0">Close</span>
                <span className="text-white text-sm font-bold absolute bottom-0">Open</span>
                
                {/* Open line indicator */}
                <div 
                  className="absolute left-0 right-0 border-t-2 border-dashed border-white"
                  style={{ top: '50%' }}
                />
              </div>
              
              {/* Lower Wick */}
              <div className="w-1 h-8 bg-slate-800 mt-1" />
            </div>

            {/* Annotations */}
            <div className="space-y-4 text-sm text-slate-700">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-[#15750C] rounded-sm"></div>
                <span><strong>Body Hijau:</strong> Close &gt; Open (Bullish)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-1 h-8 bg-slate-800"></div>
                <span><strong>Upper Wick:</strong> High - Close</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-1 h-8 bg-slate-800"></div>
                <span><strong>Lower Wick:</strong> Open - Low</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-16 h-0.5 bg-white border-t border-dashed border-slate-400"></div>
                <span><strong>Open Price</strong></span>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center text-slate-600 text-sm">
            <strong>Bullish Candle:</strong> Harga naik dari Open ke Close
          </div>
        </div>

        {/* Bearish Candle */}
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-8">
            {/* Visual Candle */}
            <div className="relative flex flex-col items-center">
              {/* Upper Wick */}
              <div className="w-1 h-8 bg-slate-800 mb-1" />
              
              {/* Body */}
              <div className="w-16 h-20 bg-[#AE1513] rounded-sm flex items-center justify-center relative">
                <span className="text-white text-sm font-bold absolute top-0">Open</span>
                <span className="text-white text-sm font-bold absolute bottom-0">Close</span>
                
                {/* Close line indicator */}
                <div 
                  className="absolute left-0 right-0 border-t-2 border-dashed border-white"
                  style={{ bottom: '50%' }}
                />
              </div>
              
              {/* Lower Wick */}
              <div className="w-1 h-8 bg-slate-800 mt-1" />
            </div>

            {/* Annotations */}
            <div className="space-y-4 text-sm text-slate-700">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-[#AE1513] rounded-sm"></div>
                <span><strong>Body Merah:</strong> Close &lt; Open (Bearish)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-1 h-8 bg-slate-800"></div>
                <span><strong>Upper Wick:</strong> High - Open</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-1 h-8 bg-slate-800"></div>
                <span><strong>Lower Wick:</strong> Close - Low</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-16 h-0.5 bg-white border-t border-dashed border-slate-400"></div>
                <span><strong>Close Price</strong></span>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center text-slate-600 text-sm">
            <strong>Bearish Candle:</strong> Harga turun dari Open ke Close
          </div>
        </div>

        {/* Price Levels Diagram */}
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 w-full max-w-md">
          <h5 className="font-bold text-slate-800 mb-4 text-center">Level Harga dalam Candlestick</h5>
          <div className="space-y-3 text-sm text-slate-700">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Highest Point:</span>
              <span>High Price</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-emerald-600">Bullish:</span>
              <span>Close &gt; Open</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-rose-600">Bearish:</span>
              <span>Close &lt; Open</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Lowest Point:</span>
              <span>Low Price</span>
            </div>
            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-amber-800 text-xs">
                <strong>Tip:</strong> Wick yang panjang menunjukkan penolakan harga (rejection), 
                sedangkan body yang besar menunjukkan momentum kuat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandlestickStructureVisual;