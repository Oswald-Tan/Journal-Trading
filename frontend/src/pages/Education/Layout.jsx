import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const Education = () => {
  const [activeCategory, setActiveCategory] = useState('dasar-trading');
  const [expandedSections, setExpandedSections] = useState({});

  const categories = {
    'dasar-trading': {
      title: 'Dasar Trading',
      icon: '📚',
      color: 'from-blue-500 to-cyan-500',
      sections: [
        {
          id: 'pengertian-trading',
          title: 'Pengertian Trading',
          content: `Trading adalah aktivitas membeli dan menjual instrumen finansial dengan tujuan mendapatkan keuntungan dari pergerakan harga.

• Trading vs Investing: Trading fokus pada profit jangka pendek, investing untuk jangka panjang
• Market: Forex, Saham, Crypto, Commodities
• Timeframe: Scalping, Day Trading, Swing Trading`
        },
        {
          id: 'broker-akun',
          title: 'Broker & Akun Trading',
          content: `Broker adalah perantara antara trader dengan market.

**Jenis Broker:**
• ECN (Electronic Communication Network)
• Market Maker
• STP (Straight Through Processing)

**Jenis Akun:**
• Standard Account
• Mini Account
• Demo Account (untuk latihan)`
        },
        {
          id: 'lot-pip-spread',
          title: 'Lot, Pip, Spread',
          content: `**Lot:** Satuan transaksi
• Standard Lot: 100,000 unit
• Mini Lot: 10,000 unit
• Micro Lot: 1,000 unit

**Pip:** Perubahan harga terkecil
• Untuk EUR/USD: 0.0001 = 1 pip
• Untuk USD/JPY: 0.01 = 1 pip

**Spread:** Selisih harga jual dan beli
• Spread tetap vs floating
• Memengaruhi biaya trading`
        }
      ]
    },
    'order-posisi': {
      title: 'Order & Posisi',
      icon: '📊',
      color: 'from-green-500 to-emerald-500',
      sections: [
        {
          id: 'buy-sell',
          title: 'Buy / Sell, Entry / Exit',
          content: `**Buy (Long):** Prediksi harga naik
• Buy: Membeli di harga tertentu
• Take Profit: Target profit
• Stop Loss: Batas kerugian

**Sell (Short):** Prediksi harga turun
• Sell: Menjual di harga tertentu
• Take Profit: Target profit  
• Stop Loss: Batas kerugian`
        },
        {
          id: 'sl-tp',
          title: 'Stop Loss & Take Profit',
          content: `**Stop Loss (SL):** Order untuk membatasi kerugian
• SL wajib untuk manajemen risiko
• Posisi SL berdasarkan analisis teknikal
• Jangan pindah SL karena emosi

**Take Profit (TP):** Order untuk mengambil profit
• TP berdasarkan risk-reward ratio
• Bisa partial TP atau full TP`
        },
        {
          id: 'margin-leverage',
          title: 'Margin & Leverage',
          content: `**Margin:** Dana jaminan untuk open posisi
• Free Margin: Dana tersedia
• Used Margin: Dana terpakai
• Margin Level: (Equity / Used Margin) × 100%

**Leverage:** Pengungkit modal
• Leverage 1:100 = modal $1,000 bisa trading $100,000
• Higher leverage = higher risk`
        }
      ]
    },
    'analisis-teknikal': {
      title: 'Analisis Teknikal',
      icon: '📈',
      color: 'from-purple-500 to-violet-500',
      sections: [
        {
          id: 'trend',
          title: 'Trend (Uptrend, Downtrend, Sideways)',
          content: `**Uptrend:** Serangkaian higher high dan higher low
• Biasakan trading searah trend
• "The trend is your friend"

**Downtrend:** Serangkaian lower high dan lower low
• Selling pressure dominan
• Cari peluang sell

**Sideways/Ranging:** Harga bergerak dalam range
• Trading di support dan resistance
• Breakout trading`
        },
        {
          id: 'support-resistance',
          title: 'Support & Resistance',
          content: `**Support:** Area dimana harga cenderung berhenti turun
• Level dimana buyer masuk
• Bisa menjadi resistance ketika breakout

**Resistance:** Area dimana harga cenderung berhenti naik  
• Level dimana seller masuk
• Bisa menjadi support ketika breakout`
        },
        {
          id: 'supply-demand',
          title: 'Supply & Demand (SND)',
          content: `**Demand Zone:** Area dimana buyer sangat aktif
• Harga cenderung naik dari zona ini
• Biasanya terbentuk setelah downtrend

**Supply Zone:** Area dimana seller sangat aktif
• Harga cenderung turun dari zona ini
• Biasanya terbentuk setelah uptrend`
        }
      ]
    },
    'candlestick': {
      title: 'Candlestick & Pola',
      icon: '🕯️',
      color: 'from-amber-500 to-orange-500',
      sections: [
        {
          id: 'struktur-candlestick',
          title: 'Struktur Candlestick',
          content: `**Body:** Selisih harga open dan close
• Body hijau/hollow: Close > Open (Bullish)
• Body merah/filled: Close < Open (Bearish)

**Wick/Shadow:** Ekor di atas/bawah body
• Upper wick: High - (Open atau Close)
• Lower wick: (Open atau Close) - Low`
        },
        {
          id: 'pola-dasar',
          title: 'Pola Candlestick Dasar',
          content: `**Single Pattern:**
• Doji: Open = Close, indecision
• Hammer: Bullish reversal
• Shooting Star: Bearish reversal

**Double Pattern:**
• Bullish Engulfing: Reversal naik
• Bearish Engulfing: Reversal turun

**Triple Pattern:**
• Morning Star: Bullish reversal
• Evening Star: Bearish reversal`
        },
        {
          id: 'double-top-bottom',
          title: 'Double Top/Bottom',
          content: `**Double Top:** Pattern reversal bearish
• Dua puncak di level sama
• Konfirmasi breakdown neckline

**Double Bottom:** Pattern reversal bullish  
• Dua lembah di level sama
• Konfirmasi breakout neckline`
        }
      ]
    },
    'indikator': {
      title: 'Indikator & Tools',
      icon: '⚙️',
      color: 'from-red-500 to-rose-500',
      sections: [
        {
          id: 'moving-average',
          title: 'Moving Average (MA)',
          content: `**Fungsi:** Mengidentifikasi trend dan support/resistance dinamis

**Jenis:**
• SMA (Simple Moving Average)
• EMA (Exponential Moving Average) - lebih responsif
• WMA (Weighted Moving Average)

**Penggunaan:**
• MA crossover (Golden Cross/Death Cross)
• Dynamic support/resistance`
        },
        {
          id: 'rsi',
          title: 'RSI (Relative Strength Index)',
          content: `**Fungsi:** Mengidentifikasi kondisi overbought/oversold

**Range:** 0-100
• Overbought: RSI > 70 (potensi jual)
• Oversold: RSI < 30 (potensi beli)

**Divergence:**
• Bullish divergence: Harga lower low, RSI higher low
• Bearish divergence: Harga higher high, RSI lower high`
        },
        {
          id: 'macd',
          title: 'MACD',
          content: `**Komponen:**
• MACD Line: Perbedaan EMA 12 dan 26
• Signal Line: EMA 9 dari MACD Line
• Histogram: Selisih MACD dan Signal Line

**Trading Signal:**
• Crossover MACD dan Signal Line
• Centerline crossover
• Divergence`
        },
        {
          id: 'bollinger-fibonacci',
          title: 'Bollinger Bands & Fibonacci',
          content: `**Bollinger Bands:**
• Middle: SMA 20
• Upper/Lower: ±2 standar deviasi
• Squeeze: Volatilitas rendah
• Breakout: Volatilitas tinggi

**Fibonacci Retracement:**
• Level: 23.6%, 38.2%, 50%, 61.8%, 78.6%
• Untuk identifikasi support/resistance setelah trend`
        }
      ]
    },
    'manajemen-risiko': {
      title: 'Risiko & Manajemen',
      icon: '🛡️',
      color: 'from-emerald-500 to-teal-500',
      sections: [
        {
          id: 'risk-reward',
          title: 'Risk/Reward Ratio',
          content: `**Rumus:** Potential Reward / Potential Risk

**Contoh:**
• Risk: 50 pips, Reward: 100 pips → R:R = 1:2
• Minimal disarankan: 1:1.5
• Ideal: 1:2 atau lebih tinggi

**Kalkulasi:**
• Win Rate 50% + R:R 1:2 = Profitabel
• Win Rate 60% + R:R 1:1 = Profitabel`
        },
        {
          id: 'drawdown',
          title: 'Drawdown',
          content: `**Pengertian:** Penurunan equity dari peak ke trough

**Jenis:**
• Maximum Drawdown: Drawdown terbesar
• Relative Drawdown: % dari equity

**Manajemen:**
• Batasi max drawdown per trade (1-2%)
• Batasi total drawdown (5-10%)`
        },
        {
          id: 'position-sizing',
          title: 'Position Sizing',
          content: `**Fixed Lot:** Ukuran lot tetap
• Sederhana tapi tidak optimal

**Fixed Fractional:** % equity per trade
• Contoh: 1% equity per trade
• Balance growth optimal

**Kelly Criterion:** Formula matematis
• C = W - (1 - W)/R
• W: Win rate, R: Risk/reward ratio`
        },
        {
          id: 'overtrading-hedging',
          title: 'Overtrading & Hedging',
          content: `**Overtrading:** Trading berlebihan
• Penyebab: Emosi, revenge trading
• Solusi: Disiplin, trading plan

**Hedging:** Melindungi posisi
• Contoh: Buy dan Sell instrument sama
• Lock profit/limit loss
• Biaya tambahan (swap, spread)`
        }
      ]
    },
    'istilah-lain': {
      title: 'Istilah Lain-lain',
      icon: '📖',
      color: 'from-gray-500 to-slate-500',
      sections: [
        {
          id: 'volatilitas',
          title: 'Volatilitas, Liquidity, Slippage',
          content: `**Volatilitas:** Tingkat fluktuasi harga
• High volatility: Peluang dan risiko tinggi
• Low volatility: Pergerakan terbatas

**Liquidity:** Kemudahan eksekusi order
• High liquidity: Spread ketat, eksekusi cepat
• Low liquidity: Spread lebar, slippage

**Slippage:** Perbedaan harga order dan eksekusi
• Sering terjadi saat news/volatility tinggi`
        },
        {
          id: 'jenis-trading',
          title: 'Swing / Day / Scalping',
          content: `**Scalping:** 
• Timeframe: 1m-15m
• Hold: Beberapa menit-jam
• Target: 5-15 pips

**Day Trading:**
• Timeframe: 15m-1H  
• Hold: Beberapa jam, close daily
• Target: 20-50 pips

**Swing Trading:**
• Timeframe: 4H-D1
• Hold: Beberapa hari-minggu
• Target: 100+ pips`
        }
      ]
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const EducationCard = ({ section, categoryId }) => (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200 shadow-lg overflow-hidden mb-4"
    >
      <button
        onClick={() => toggleSection(`${categoryId}-${section.id}`)}
        className="w-full text-left p-6 hover:bg-gray-50 transition-all duration-200 flex justify-between items-center"
      >
        <h3 className="text-lg font-bold text-gray-800">{section.title}</h3>
        <Motion.span
          animate={{ rotate: expandedSections[`${categoryId}-${section.id}`] ? 180 : 0 }}
          className="text-xl"
        >
          ▼
        </Motion.span>
      </button>
      
      <AnimatePresence>
        {expandedSections[`${categoryId}-${section.id}`] && (
          <Motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 border-t border-gray-200 bg-linear-to-br from-gray-50 to-white">
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
                {section.content}
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </Motion.div>
  );

  return (
    <div className="space-y-6 min-h-screen max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          📚 Pusat Edukasi Trading
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Pelajari dasar-dasar trading dari nol hingga mahir. Materi disusun secara bertahap untuk memudahkan pemahaman.
        </p>
      </Motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Kategori */}
        <Motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200 shadow-lg p-6 sticky top-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Kategori Belajar</h2>
            <div className="space-y-2">
              {Object.entries(categories).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center space-x-3 ${
                    activeCategory === key 
                      ? `bg-linear-to-r ${category.color} text-white shadow-lg`
                      : 'text-gray-700 hover:bg-gray-100 border border-transparent hover:border-gray-200'
                  }`}
                >
                  <span className="text-2xl">{category.icon}</span>
                  <span className="font-semibold">{category.title}</span>
                </button>
              ))}
            </div>
          </div>
        </Motion.div>

        {/* Konten Utama */}
        <Motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-3"
        >
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200 shadow-lg p-6 mb-6">
            <div className={`bg-linear-to-r ${categories[activeCategory].color} rounded-2xl p-6 text-white`}>
              <div className="flex items-center space-x-4">
                <span className="text-4xl">{categories[activeCategory].icon}</span>
                <div>
                  <h2 className="text-2xl font-bold">{categories[activeCategory].title}</h2>
                  <p className="opacity-90">Pelajari konsep dasar dan strategi {categories[activeCategory].title.toLowerCase()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {categories[activeCategory].sections.map((section) => (
              <EducationCard 
                key={section.id} 
                section={section} 
                categoryId={activeCategory}
              />
            ))}
          </div>
        </Motion.div>
      </div>
    </div>
  );
};


export default Education;