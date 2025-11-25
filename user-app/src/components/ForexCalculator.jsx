import React, { useState, useMemo } from 'react';
import { motion as Motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { formatCompactCurrency } from '../utils/currencyFormatter';
import {
  Calculator,
  Trash2,
  BarChart3,
  TrendingUp,
  Lightbulb,
  DollarSign,
  Target,
  PieChart,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

const ForexCalculator = () => {
  const { currency } = useSelector((state) => state.balance);
  const [calculatorForm, setCalculatorForm] = useState({
    balance: '',
    type: 'Buy',
    openPrice: '',
    slPrice: '',
    tpPrice: '',
    risk: '3' // default 3%
  });

  // Fungsi untuk normalisasi input (mengganti koma dengan titik)
  const normalizeInput = (value) => {
    if (typeof value === 'string') {
      return value.replace(/,/g, '.');
    }
    return value;
  };

  // Calculate position size and results
  const calculationResults = useMemo(() => {
    const balance = parseFloat(normalizeInput(calculatorForm.balance)) || 0;
    const open = parseFloat(normalizeInput(calculatorForm.openPrice)) || 0;
    const sl = parseFloat(normalizeInput(calculatorForm.slPrice)) || 0;
    const tp = parseFloat(normalizeInput(calculatorForm.tpPrice)) || 0;
    const riskPercent = parseFloat(normalizeInput(calculatorForm.risk)) || 0;

    if (!balance || !open || !sl || !riskPercent) {
      return null;
    }

    // XAUUSD specific calculations
    const riskAmount = balance * (riskPercent / 100);
    
    // Calculate pips for XAUUSD (1 pip = 0.01 for XAUUSD)
    const slPips = Math.abs(open - sl) * 100; // Convert to pips
    const tpPips = Math.abs(open - tp) * 100; // Convert to pips
    
    // Calculate lot size based on risk
    const pipValueXAU = 1; // $1 per pip per lot for XAUUSD
    const lotSize = slPips > 0 ? riskAmount / (slPips * pipValueXAU) : 0;
    
    // Calculate net SL and TP values
    const nettSL = lotSize * slPips * pipValueXAU;
    const nettTP = lotSize * tpPips * pipValueXAU;

    return {
      slPips: slPips || 0,
      tpPips: tpPips || 0,
      lotSize: lotSize || 0,
      nettSL: nettSL || 0,
      nettTP: nettTP || 0,
      riskAmount,
      riskRewardRatio: riskAmount > 0 ? nettTP / riskAmount : 0
    };
  }, [calculatorForm]);

  const handleInputChange = (field, value) => {
    // Validasi input: hanya angka, titik, dan koma
    const validatedValue = value.replace(/[^\d.,]/g, '');
    
    setCalculatorForm(prev => ({
      ...prev,
      [field]: validatedValue
    }));
  };

  const clearForm = () => {
    setCalculatorForm({
      balance: '',
      type: 'Buy',
      openPrice: '',
      slPrice: '',
      tpPrice: '',
      risk: '1'
    });
  };

  // Auto-format input ketika kehilangan fokus (blur)
  const handleBlur = (field, value) => {
    if (value) {
      const normalized = normalizeInput(value);
      // Format ke 2 desimal
      const formatted = parseFloat(normalized).toFixed(2);
      setCalculatorForm(prev => ({
        ...prev,
        [field]: formatted
      }));
    }
  };

  return (
    <div className="space-y-6 min-h-screen">
      {/* Header */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Calculator className="w-8 h-8 text-violet-600" />
            XAUUSD Calculator
          </h1>
          <p className="text-slate-600 mt-1 font-light">
            Calculate position size and risk management for Gold
          </p>
        </div>
        
        <Motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={clearForm}
          className="bg-slate-500 hover:bg-slate-600 text-white px-6 py-3 rounded-xl transition-all font-medium flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </Motion.button>
      </Motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculator Form */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-100"
        >
          <h3 className="text-lg font-bold mb-4 text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-600" />
            Input Parameters
          </h3>
          
          <div className="space-y-4">
            {/* Balance */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Account Balance ({currency})
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={calculatorForm.balance}
                onChange={(e) => handleInputChange('balance', e.target.value)}
                onBlur={(e) => handleBlur('balance', e.target.value)}
                placeholder="contoh: 10000 atau 10.000 atau 10,000"
                className="w-full p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 transition-all bg-white font-light"
              />
            </div>

            {/* Trade Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Trade Type
              </label>
              <select
                value={calculatorForm.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 transition-all bg-white font-light"
              >
                <option value="Buy">Buy</option>
                <option value="Sell">Sell</option>
              </select>
            </div>

            {/* Prices */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Open Price
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={calculatorForm.openPrice}
                  onChange={(e) => handleInputChange('openPrice', e.target.value)}
                  onBlur={(e) => handleBlur('openPrice', e.target.value)}
                  placeholder="1873.15"
                  className="w-full p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 transition-all bg-white font-light"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    SL Price
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={calculatorForm.slPrice}
                    onChange={(e) => handleInputChange('slPrice', e.target.value)}
                    onBlur={(e) => handleBlur('slPrice', e.target.value)}
                    placeholder="Stop Loss"
                    className="w-full p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 transition-all bg-white font-light"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    TP Price
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={calculatorForm.tpPrice}
                    onChange={(e) => handleInputChange('tpPrice', e.target.value)}
                    onBlur={(e) => handleBlur('tpPrice', e.target.value)}
                    placeholder="Take Profit"
                    className="w-full p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 transition-all bg-white font-light"
                  />
                </div>
              </div>
            </div>

            {/* Risk */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Risk (% of Balance)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={calculatorForm.risk}
                onChange={(e) => handleInputChange('risk', e.target.value)}
                onBlur={(e) => handleBlur('risk', e.target.value)}
                placeholder="contoh: 1 atau 1,5 atau 2.5"
                className="w-full p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 transition-all bg-white font-light"
              />
            </div>
          </div>
        </Motion.div>

        {/* Results */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-100"
        >
          <h3 className="text-lg font-bold mb-4 text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-violet-600" />
            Calculation Results
          </h3>
          
          {calculationResults ? (
            <div className="space-y-4">
              {/* Main Results Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* SL Pips */}
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
                  <div className="text-sm text-rose-700 font-medium">SL Pips</div>
                  <div className="text-2xl font-bold text-rose-900">
                    {calculationResults.slPips.toFixed(1)}
                  </div>
                  <div className="text-xs text-rose-600 mt-1 font-light">Stop Loss Distance</div>
                </div>

                {/* TP Pips */}
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                  <div className="text-sm text-emerald-700 font-medium">TP Pips</div>
                  <div className="text-2xl font-bold text-emerald-900">
                    {calculationResults.tpPips.toFixed(1)}
                  </div>
                  <div className="text-xs text-emerald-600 mt-1 font-light">Take Profit Distance</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Lot Size */}
                <div className="bg-violet-50 p-4 rounded-xl border border-violet-200">
                  <div className="text-sm text-violet-700 font-medium">Lot Size</div>
                  <div className="text-2xl font-bold text-violet-900">
                    {calculationResults.lotSize.toFixed(3)}
                  </div>
                  <div className="text-xs text-violet-600 mt-1 font-light">Recommended Position</div>
                </div>

                {/* Risk Reward Ratio */}
                <div className="bg-violet-50 p-4 rounded-xl border border-violet-200">
                  <div className="text-sm text-violet-700 font-medium">R:R Ratio</div>
                  <div className="text-2xl font-bold text-violet-900">
                    1:{calculationResults.riskRewardRatio.toFixed(2)}
                  </div>
                  <div className="text-xs text-violet-600 mt-1 font-light">Risk to Reward</div>
                </div>
              </div>

              {/* Net Values */}
              <div className="grid grid-cols-2 gap-4">
                {/* Nett SL */}
                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                  <div className="text-sm text-red-700 font-medium">Nett SL</div>
                  <div className="text-2xl font-bold text-red-900">
                    {formatCompactCurrency(calculationResults.nettSL, currency)}
                  </div>
                  <div className="text-xs text-red-600 mt-1 font-light">Potential Loss</div>
                </div>

                {/* Nett TP */}
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <div className="text-sm text-green-700 font-medium">Nett TP</div>
                  <div className="text-2xl font-bold text-green-900">
                    {formatCompactCurrency(calculationResults.nettTP, currency)}
                  </div>
                  <div className="text-xs text-green-600 mt-1 font-light">Potential Profit</div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="text-sm text-blue-700 font-medium">Risk Amount</div>
                <div className="text-xl font-bold text-blue-900">
                  {formatCompactCurrency(calculationResults.riskAmount, currency)}
                </div>
                <div className="text-xs text-blue-600 mt-1 font-light">
                  {calculatorForm.risk}% of {formatCompactCurrency(parseFloat(normalizeInput(calculatorForm.balance)) || 0, currency)} balance
                </div>
              </div>

              {/* Trade Summary */}
              <div className="bg-linear-to-r from-violet-50 to-pink-50 p-4 rounded-xl border border-violet-200">
                <h4 className="font-bold text-violet-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Trade Summary
                </h4>
                <div className="text-sm text-violet-800 space-y-1 font-light">
                  <div>• <span className="font-medium">{calculatorForm.type}</span> position on XAUUSD</div>
                  <div>• Risk: <span className="font-medium">{calculatorForm.risk}%</span> of account</div>
                  <div>• Lot size: <span className="font-medium">{calculationResults.lotSize.toFixed(3)}</span> lots</div>
                  <div>• Risk/Reward: <span className="font-medium">1:{calculationResults.riskRewardRatio.toFixed(2)}</span></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-600">
              <Calculator className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <p className="font-medium">Enter values to calculate</p>
              <p className="text-sm mt-1 font-light">Fill in the form to see position sizing results</p>
            </div>
          )}
        </Motion.div>
      </div>

      {/* Information Panel */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-linear-to-r from-violet-50 to-pink-50 border border-violet-200 rounded-3xl p-6"
      >
        <h3 className="text-lg font-bold text-violet-900 mb-3 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-violet-600" />
          About XAUUSD Calculator
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-violet-800">
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Input Format
            </h4>
            <ul className="space-y-1 font-light">
              <li>• Use <strong>dot (.)</strong> or <strong>comma (,)</strong> as decimal separator</li>
              <li>• Examples: <strong>1873.15</strong> or <strong>1873,15</strong></li>
              <li>• For balance: <strong>10000</strong> or <strong>10.000</strong> or <strong>10,000</strong></li>
              <li>• For risk: <strong>1</strong> or <strong>1.5</strong> or <strong>2,5</strong></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Calculation Formula
            </h4>
            <ul className="space-y-1 font-light">
              <li>• 1 pip = 0.01 price movement</li>
              <li>• SL Pips = |Open - SL| × 100</li>
              <li>• TP Pips = |Open - TP| × 100</li>
              <li>• Lot Size = Risk Amount ÷ (SL Pips × 1)</li>
            </ul>
          </div>
        </div>
      </Motion.div>

      {/* Risk Warning */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-900 mb-2">Risk Disclaimer</h4>
            <p className="text-amber-800 text-sm font-light">
              This calculator provides estimates for educational purposes only. Trading forex and CFDs carries a high level of risk and may not be suitable for all investors. 
              Past performance is not indicative of future results. Always practice proper risk management and consider seeking advice from a qualified financial advisor.
            </p>
          </div>
        </div>
      </Motion.div>
    </div>
  );
};

export default ForexCalculator;