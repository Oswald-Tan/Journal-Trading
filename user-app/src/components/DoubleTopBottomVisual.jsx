import React from "react";
import DoubleTop from "../assets/double_top.png";
import DoubleBottom from "../assets/double_bottom.png";

// Import gambar dari assets
const doubleTopImage = DoubleTop;
const doubleBottomImage = DoubleBottom;

const DoubleTopBottomVisual = () => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
      <h4 className="text-2xl font-bold text-slate-800 mb-2 text-center bg-linear-to-r from-slate-800 to-slate-600 bg-clip-text">
        Pola Double Top & Double Bottom
      </h4>
      <p className="text-slate-500 text-center mb-8">Pattern Reversal Klasik dalam Trading</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Double Top */}
        <div className="group">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-full border border-rose-200">
              <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
              <h5 className="font-bold text-rose-700 text-lg">Double Top</h5>
            </div>
            <p className="text-sm text-slate-500 mt-2">Bearish Reversal Pattern</p>
          </div>

          <div className="relative bg-white rounded-2xl p-6 border border-rose-100 shadow-sm group-hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-center h-64">
              <img 
                src={doubleTopImage} 
                alt="Double Top Pattern"
                className="max-w-full max-h-56 object-contain drop-shadow-sm"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              {/* Fallback jika gambar tidak load */}
              <div className="hidden text-center text-slate-400">
                <div className="text-lg mb-2">🏔️ 🏔️</div>
                <p>Double Top Image</p>
                <p className="text-sm">(Gambar tidak dapat dimuat)</p>
              </div>
            </div>

            {/* Pattern Info */}
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-xs">
                <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                <span className="text-xs font-semibold text-slate-700">2 Puncak + Reversal Turun</span>
              </div>
            </div>
          </div>
        </div>

        {/* Double Bottom */}
        <div className="group">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <h5 className="font-bold text-emerald-700 text-lg">Double Bottom</h5>
            </div>
            <p className="text-sm text-slate-500 mt-2">Bullish Reversal Pattern</p>
          </div>

          <div className="relative bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm group-hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-center h-64">
              <img 
                src={doubleBottomImage} 
                alt="Double Bottom Pattern"
                className="max-w-full max-h-56 object-contain drop-shadow-sm"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              {/* Fallback jika gambar tidak load */}
              <div className="hidden text-center text-slate-400">
                <div className="text-lg mb-2">⚫ ⚫</div>
                <p>Double Bottom Image</p>
                <p className="text-sm">(Gambar tidak dapat dimuat)</p>
              </div>
            </div>

            {/* Pattern Info */}
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-xs">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-xs font-semibold text-slate-700">2 Lembah + Reversal Naik</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Footer */}
      <div className="mt-8 bg-linear-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
        <div className="text-center">
          <div className="inline-flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
              <span className="text-sm font-semibold text-slate-700">Double Top</span>
            </div>
            <div className="w-px h-6 bg-slate-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-sm font-semibold text-slate-700">Double Bottom</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white/80 rounded-xl border border-slate-200/80">
            <p className="text-xs text-slate-600 font-medium">
              <span className="text-rose-500 font-bold">Double Top:</span> Harga ditolak dua kali di level resistance yang sama kemudian reversal turun
              <br />
              <span className="text-emerald-500 font-bold">Double Bottom:</span> Harga ditolak dua kali di level support yang sama kemudian reversal naik
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoubleTopBottomVisual;