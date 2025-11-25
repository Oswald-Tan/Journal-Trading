import {
  BookOpen,
  BarChart3,
  TrendingUp,
  CandlestickChart,
  Gauge,
  Shield,
  BookText,
  Check,
  Target,
  Wallet,
  PieChart,
  ArrowUpDown,
  Calendar,
  LineChart,
  Mountain,
  Zap,
  Activity,
  Waves,
  Calculator,
  AlertTriangle,
  Clock,
} from "lucide-react";

export const educationCategories = {
  "dasar-trading": {
    title: "Dasar Trading",
    icon: BookOpen,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-linear-to-br from-blue-50 to-cyan-50",
    borderColor: "border-blue-200",
    sections: [
      {
        id: "pengertian-trading",
        title: "Pengertian Trading",
        icon: Target,
        content: `Trading adalah aktivitas membeli dan menjual instrumen finansial dengan tujuan mendapatkan keuntungan dari pergerakan harga.

**Perbedaan Trading vs Investing:**
• Trading fokus pada profit jangka pendek
• Investing untuk jangka panjang

**Jenis Market:**
• Forex (Foreign Exchange)
• Saham (Stocks) 
• Crypto (Cryptocurrency)
• Commodities (Emas, Minyak, dll)

**Timeframe Trading:**
• Scalping (beberapa menit-jam)
• Day Trading (sehari)
• Swing Trading (beberapa hari-minggu)`,
      },
      {
        id: "broker-akun",
        title: "Broker & Akun Trading",
        icon: Wallet,
        content: `Broker adalah perantara antara trader dengan market.

**Jenis Broker:**
• ECN (Electronic Communication Network)
• Market Maker
• STP (Straight Through Processing)

**Jenis Akun Trading:**
• Standard Account
• Mini Account
• Demo Account (untuk latihan)

**Pemilihan Broker:**
• Regulasi dan legalitas
• Spread dan komisi
• Platform trading
• Customer service`,
      },
      {
        id: "lot-pip-spread",
        title: "Lot, Pip, Spread",
        icon: PieChart,
        content: `**Lot:** Satuan transaksi dalam trading
• Standard Lot: 100,000 unit
• Mini Lot: 10,000 unit
• Micro Lot: 1,000 unit
• Nano Lot: 100 unit

**Pip:** Perubahan harga terkecil
• Untuk EUR/USD: 0.0001 = 1 pip
• Untuk USD/JPY: 0.01 = 1 pip
• Untuk emas: 0.01 = 1 pip

**Spread:** Selisih harga jual dan beli
• Spread tetap vs floating
• Memengaruhi biaya trading
• Spread ketat lebih menguntungkan`,
      },
    ],
  },
  "order-posisi": {
    title: "Order & Posisi",
    icon: BarChart3,
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-linear-to-br from-violet-50 to-purple-50",
    borderColor: "border-violet-200",
    sections: [
      {
        id: "buy-sell",
        title: "Buy / Sell, Entry / Exit",
        icon: ArrowUpDown,
        content: `**Buy (Long):** Prediksi harga naik
• Buy: Membeli di harga tertentu
• Take Profit: Target profit
• Stop Loss: Batas kerugian

**Sell (Short):** Prediksi harga turun  
• Sell: Menjual di harga tertentu
• Take Profit: Target profit
• Stop Loss: Batas kerugian

**Market Order:** Eksekusi langsung
**Pending Order:** Eksekusi di masa depan`,
      },
      {
        id: "sl-tp",
        title: "Stop Loss & Take Profit",
        icon: Target,
        content: `**Stop Loss (SL):** Order untuk membatasi kerugian
• SL wajib untuk manajemen risiko
• Posisi SL berdasarkan analisis teknikal
• Jangan pindah SL karena emosi

**Take Profit (TP):** Order untuk mengambil profit
• TP berdasarkan risk-reward ratio
• Bisa partial TP atau full TP
• Trailing stop untuk lock profit`,
      },
      {
        id: "margin-leverage",
        title: "Margin & Leverage",
        icon: Calculator,
        content: `**Margin:** Dana jaminan untuk open posisi
• Free Margin: Dana tersedia
• Used Margin: Dana terpakai
• Margin Level: (Equity / Used Margin) × 100%

**Leverage:** Pengungkit modal
• Leverage 1:100 = modal $1,000 bisa trading $100,000
• Higher leverage = higher risk
• Pilih leverage sesuai experience`,
      },
    ],
  },
  "analisis-teknikal": {
    title: "Analisis Teknikal",
    icon: TrendingUp,
    color: "from-emerald-500 to-green-500",
    bgColor: "bg-linear-to-br from-emerald-50 to-green-50",
    borderColor: "border-emerald-200",
    sections: [
      {
        id: "trend",
        title: "Trend Analysis",
        icon: LineChart,
        content: `**Uptrend:** Serangkaian higher high dan higher low
• Biasakan trading searah trend
• "The trend is your friend"
• Cari peluang buy di pullback

**Downtrend:** Serangkaian lower high dan lower low
• Selling pressure dominan
• Cari peluang sell di rally
• Avoid buying in downtrend

**Sideways/Ranging:** Harga bergerak dalam range
• Trading di support dan resistance
• Breakout trading strategy
• Range-bound markets`,
      },
      {
        id: "support-resistance",
        title: "Support & Resistance",
        icon: Mountain,
        content: `**Support:** Area dimana harga cenderung berhenti turun
• Level dimana buyer masuk
• Bisa menjadi resistance ketika breakout
• Support kuat di level psikologis

**Resistance:** Area dimana harga cenderung berhenti naik  
• Level dimana seller masuk
• Bisa menjadi support ketika breakout
• Multiple touch points strengthen level`,
      },
      {
        id: "supply-demand",
        title: "Supply & Demand Zones",
        icon: Waves,
        content: `**Demand Zone:** Area dimana buyer sangat aktif
• Harga cenderung naik dari zona ini
• Biasanya terbentuk setelah downtrend
• Entry buy di test demand zone

**Supply Zone:** Area dimana seller sangat aktif
• Harga cenderung turun dari zona ini
• Biasanya terbentuk setelah uptrend
• Entry sell di test supply zone`,
      },
    ],
  },
  candlestick: {
    title: "Candlestick & Pola",
    icon: CandlestickChart,
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-linear-to-br from-amber-50 to-orange-50",
    borderColor: "border-amber-200",
    sections: [
      {
        id: "struktur-candlestick",
        title: "Candlestick Structure",
        icon: BarChart3,
        content: `**Body:** Selisih harga open dan close
• Body hijau/hollow: Close > Open (Bullish)
• Body merah/filled: Close < Open (Bearish)
• Body besar menunjukkan momentum kuat

**Wick/Shadow:** Ekor di atas/bawah body
• Upper wick: High - (Open atau Close)
• Lower wick: (Open atau Close) - Low
• Wick panjang menunjukkan rejection`,
      },
      {
        id: "pola-dasar",
        title: "Pola Candlestick Dasar",
        icon: Activity,
        content: `**Single Pattern:**
• Doji: Open = Close, indecision
• Hammer: Bullish reversal
• Shooting Star: Bearish reversal

**Double Pattern:**
• Bullish Engulfing: Reversal naik
• Bearish Engulfing: Reversal turun

**Triple Pattern:**
• Morning Star: Bullish reversal
• Evening Star: Bearish reversal

**Pola Lanjutan:**
• Three White Soldiers: Trend bullish kuat
• Three Black Crows: Trend bearish kuat
• Spinning Tops: Ketidakpastian pasar`,
      },
      {
        id: "double-top-bottom",
        title: "Double Top/Bottom",
        icon: Mountain,
        content: `**Double Top:** Pattern reversal bearish
• Dua puncak di level sama
• Konfirmasi breakdown neckline
• Target: tinggi dari neckline ke puncak

**Double Bottom:** Pattern reversal bullish  
• Dua lembah di level sama
• Konfirmasi breakout neckline
• Target: tinggi dari neckline ke lembah`,
      },
    ],
  },
  indikator: {
    title: "Indikator & Tools",
    icon: Gauge,
    color: "from-rose-500 to-pink-500",
    bgColor: "bg-linear-to-br from-rose-50 to-pink-50",
    borderColor: "border-rose-200",
    sections: [
      {
        id: "moving-average",
        title: "Moving Average (MA)",
        icon: LineChart,
        content: `**Fungsi:** Mengidentifikasi trend dan support/resistance dinamis

**Jenis Moving Average:**
• SMA (Simple Moving Average)
• EMA (Exponential Moving Average) - lebih responsif
• WMA (Weighted Moving Average)

**Penggunaan:**
• MA crossover (Golden Cross/Death Cross)
• Dynamic support/resistance
• Trend direction confirmation`,
      },
      {
        id: "rsi",
        title: "RSI (Relative Strength Index)",
        icon: Activity,
        content: `**Fungsi:** Mengidentifikasi kondisi overbought/oversold

**Range RSI:** 0-100
• Overbought: RSI > 70 (potensi jual)
• Oversold: RSI < 30 (potensi beli)
• 50 level sebagai bias market

**Divergence Trading:**
• Bullish divergence: Harga lower low, RSI higher low
• Bearish divergence: Harga higher high, RSI lower high`,
      },
      {
        id: "macd",
        title: "MACD Indicator",
        icon: BarChart3,
        content: `**Komponen MACD:**
• MACD Line: Perbedaan EMA 12 dan 26
• Signal Line: EMA 9 dari MACD Line
• Histogram: Selisih MACD dan Signal Line

**Trading Signal MACD:**
• Crossover MACD dan Signal Line
• Centerline crossover (0 line)
• Bullish/Bearish divergence`,
      },
      {
        id: "bollinger-fibonacci",
        title: "Bollinger Bands & Fibonacci",
        icon: Zap,
        content: `**Bollinger Bands:**
• Middle: SMA 20
• Upper/Lower: ±2 standar deviasi
• Squeeze: Volatilitas rendah
• Breakout: Volatilitas tinggi

**Fibonacci Retracement:**
• Level: 23.6%, 38.2%, 50%, 61.8%, 78.6%
• Untuk identifikasi support/resistance setelah trend
• Fibonacci extensions untuk target`,
      },
    ],
  },
  "manajemen-risiko": {
    title: "Risiko & Manajemen",
    icon: Shield,
    color: "from-slate-600 to-slate-700",
    bgColor: "bg-linear-to-br from-slate-50 to-slate-100",
    borderColor: "border-slate-200",
    sections: [
      {
        id: "risk-reward",
        title: "Risk/Reward Ratio",
        icon: Calculator,
        content: `**Rumus:** Potential Reward / Potential Risk

**Contoh Risk/Reward:**
• Risk: 50 pips, Reward: 100 pips → R:R = 1:2
• Minimal disarankan: 1:1.5
• Ideal: 1:2 atau lebih tinggi

**Kalkulasi Profitabilitas:**
• Win Rate 50% + R:R 1:2 = Profitabel
• Win Rate 60% + R:R 1:1 = Profitabel`,
      },
      {
        id: "drawdown",
        title: "Drawdown Management",
        icon: AlertTriangle,
        content: `**Pengertian Drawdown:** Penurunan equity dari peak ke trough

**Jenis Drawdown:**
• Maximum Drawdown: Drawdown terbesar
• Relative Drawdown: % dari equity

**Manajemen Drawdown:**
• Batasi max drawdown per trade (1-2%)
• Batasi total drawdown (5-10%)
• Risk management strict`,
      },
      {
        id: "position-sizing",
        title: "Position Sizing",
        icon: PieChart,
        content: `**Fixed Lot Size:** Ukuran lot tetap
• Sederhana tapi tidak optimal
• Tidak menyesuaikan dengan equity

**Fixed Fractional Sizing:** % equity per trade
• Contoh: 1% equity per trade
• Balance growth optimal
• Risk konsisten

**Kelly Criterion:** Formula matematis
• C = W - (1 - W)/R
• W: Win rate, R: Risk/reward ratio`,
      },
      {
        id: "overtrading-hedging",
        title: "Overtrading & Hedging",
        icon: Clock,
        content: `**Overtrading:** Trading berlebihan
• Penyebab: Emosi, revenge trading
• Solusi: Disiplin, trading plan

**Hedging Strategy:** Melindungi posisi
• Contoh: Buy dan Sell instrument sama
• Lock profit/limit loss
• Biaya tambahan (swap, spread)`,
      },
    ],
  },
  "istilah-lain": {
    title: "Istilah Lain-lain",
    icon: BookText,
    color: "from-purple-500 to-indigo-500",
    bgColor: "bg-linear-to-br from-purple-50 to-indigo-50",
    borderColor: "border-purple-200",
    sections: [
      {
        id: "volatilitas",
        title: "Volatility & Liquidity",
        icon: Activity,
        content: `**Volatilitas:** Tingkat fluktuasi harga
• High volatility: Peluang dan risiko tinggi
• Low volatility: Pergerakan terbatas
• Volatility breakout trading

**Liquidity:** Kemudahan eksekusi order
• High liquidity: Spread ketat, eksekusi cepat
• Low liquidity: Spread lebar, slippage
• Market depth importance`,
      },
      {
        id: "jenis-trading",
        title: "Trading Styles",
        icon: Clock,
        content: `**Scalping Trading:** 
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
• Target: 100+ pips`,
      },
    ],
  },
};
