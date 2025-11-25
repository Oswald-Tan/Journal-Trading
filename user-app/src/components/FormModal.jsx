import React from "react";
import { motion as Motion } from 'framer-motion';
import { 
  Calendar, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Package,
  LogIn,
  LogOut,
  Shield,
  Target,
  Minus,
  DollarSign,
  Trophy,
  BookOpen,
  Globe,
  Smile,
  FileText,
  X,
  Save,
  Loader,
  Wallet
} from 'lucide-react';
import { formatCurrency } from "../utils/currencyFormatter";

const FormModal = ({
  form,
  setForm,
  editing,
  saveForm,
  closeForm,
  isLoading,
  currentBalance = 0,
  currency = "IDR",
  originalData = null,
}) => {
  const handleNumberChange = (key, value) => {
    if (value === "") {
      setForm({ ...form, [key]: "" });
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return;
    }

    let formattedValue = numValue;

    if (["entry", "exit", "stop", "take"].includes(key)) {
      formattedValue = parseFloat(numValue.toFixed(5));
    } else if (key === "lot") {
      formattedValue = parseFloat(numValue.toFixed(2));
    } else if (key === "pips") {
      formattedValue = Math.round(numValue);
    } else if (key === "riskReward") {
      formattedValue = parseFloat(numValue.toFixed(2));
    } else if (key === "profit") {
      formattedValue = numValue;
    }

    setForm({ ...form, [key]: formattedValue.toString() });
  };

  const handleResultChange = (result) => {
    const currentProfit = parseFloat(form.profit) || 0;

    if (result.toLowerCase().includes("lose") && currentProfit > 0) {
      setForm({
        ...form,
        result: result,
        profit: (-currentProfit).toString(),
      });
    } else if (result.toLowerCase().includes("win") && currentProfit < 0) {
      setForm({
        ...form,
        result: result,
        profit: Math.abs(currentProfit).toString(),
      });
    } else if (result.toLowerCase().includes("break even")) {
      setForm({
        ...form,
        result: result,
        profit: "0",
      });
    } else {
      setForm({ ...form, result: result });
    }
  };

  const handleInputChange = (key, value) => {
    if (
      [
        "lot",
        "entry",
        "exit",
        "stop",
        "take",
        "pips",
        "profit",
        "riskReward",
      ].includes(key)
    ) {
      handleNumberChange(key, value);
    } else if (key === "result") {
      handleResultChange(value);
    } else {
      setForm({ ...form, [key]: value });
    }
  };

  const handleProfitChange = (value) => {
    if (value === "") {
      setForm({ ...form, profit: "" });
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return;
    }

    let newResult = form.result;
    if (!form.result || form.result === "Pending") {
      if (numValue > 0) {
        newResult = "Win";
      } else if (numValue < 0) {
        newResult = "Lose";
      } else {
        newResult = "Break Even";
      }
    }

    setForm({
      ...form,
      profit: numValue.toString(),
      result: newResult,
    });
  };

  const calculateBalanceAfter = () => {
    const profit = parseFloat(form.profit) || 0;

    // PERBAIKAN: Untuk editing, gunakan balance sebelum trade ini
    if (editing && originalData) {
      const originalProfit = parseFloat(originalData.profit) || 0;
      // Kembalikan ke balance sebelum trade, lalu tambahkan profit baru
      return (currentBalance - originalProfit) + profit;
    }

    // Untuk entry baru, tetap pakai currentBalance + profit
    return currentBalance + profit;
  };

  const getFieldIcon = (key) => {
    const icons = {
      date: Calendar,
      instrument: BarChart3,
      type: TrendingUp,
      lot: Package,
      entry: LogIn,
      exit: LogOut,
      stop: Shield,
      take: Target,
      pips: Minus,
      profit: DollarSign,
      result: Trophy,
      strategy: BookOpen,
      market: Globe,
      eMotionBefore: Smile,
      eMotionAfter: Smile,
      notes: FileText,
    };
    return icons[key] || FileText;
  };

  const getFieldLabel = (key) => {
    const labels = {
      date: "Tanggal Trading",
      instrument: "Instrumen",
      type: "Tipe Trading",
      lot: "Lot Size",
      entry: "Entry Price",
      exit: "Exit Price",
      stop: "Stop Loss",
      take: "Take Profit",
      pips: "Pips",
      profit: "Profit/Loss",
      result: "Result",
      strategy: "Strategy",
      market: "Kondisi Market",
      eMotionBefore: "Emosi Sebelum",
      eMotionAfter: "Emosi Sesudah",
      notes: "Catatan Trading",
    };
    return labels[key] || key;
  };

  const fields = [
    { key: "date", type: "date" },
    { key: "instrument", type: "text" },
    { 
      key: "type", 
      type: "select", 
      options: ["Buy", "Sell"],
      icons: {
        "Buy": TrendingUp,
        "Sell": TrendingDown
      }
    },
    { key: "lot", type: "number", step: "0.01", min: "0.01" },
    { key: "entry", type: "number", step: "0.00001" },
    { key: "exit", type: "number", step: "0.00001" },
    { key: "stop", type: "number", step: "0.00001" },
    { key: "take", type: "number", step: "0.00001" },
    { key: "pips", type: "number", step: "1" },
    { 
      key: "profit", 
      type: "number", 
      step: "1",
      customHandler: handleProfitChange 
    },
    { 
      key: "result", 
      type: "select", 
      options: ["Win", "Lose", "Break Even", "Pending"],
      customHandler: handleResultChange 
    },
    { key: "strategy", type: "text" },
    { key: "market", type: "text" },
    { key: "eMotionBefore", type: "text" },
    { key: "eMotionAfter", type: "text" },
  ];

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={() => closeForm("cancel")}
    >
      <Motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border-2 border-violet-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-violet-600" />
              {editing ? "Edit Trading Entry" : "New Trading Entry"}
            </h2>
            <Motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => closeForm("cancel")}
              type="button"
              className="text-slate-500 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </Motion.button>
          </div>

          <form onSubmit={saveForm}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {fields.map((field) => {
                const FieldIcon = getFieldIcon(field.key);
                const isSelectWithIcons = field.type === "select" && field.icons;
                
                return (
                  <Motion.div
                    key={field.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                  >
                    <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                      <FieldIcon className="w-4 h-4 text-violet-600" />
                      {getFieldLabel(field.key)}
                    </label>
                    
                    {field.type === "select" ? (
                      <div className="relative">
                        <select
                          value={form[field.key] || ""}
                          onChange={(e) =>
                            field.customHandler
                              ? field.customHandler(e.target.value)
                              : handleInputChange(field.key, e.target.value)
                          }
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 transition-all font-semibold text-slate-800 appearance-none"
                        >
                          <option value="">Select {getFieldLabel(field.key)}</option>
                          {field.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        {isSelectWithIcons && form[field.key] && field.icons[form[field.key]] && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {React.createElement(field.icons[form[field.key]], {
                              className: "w-4 h-4 text-violet-600",
                              size: 16
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        type={field.type}
                        value={form[field.key] || ""}
                        onChange={(e) =>
                          field.customHandler
                            ? field.customHandler(e.target.value)
                            : handleInputChange(field.key, e.target.value)
                        }
                        step={field.step}
                        min={field.min}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 transition-all font-semibold text-slate-800"
                        placeholder={`Enter ${getFieldLabel(field.key).toLowerCase()}`}
                      />
                    )}
                  </Motion.div>
                );
              })}
              
              {/* Notes Field - Full Width */}
              <div className="lg:col-span-3">
                <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-violet-600" />
                  Catatan Trading
                </label>
                <textarea
                  value={form.notes || ""}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 transition-all font-semibold text-slate-800"
                  placeholder="Tulis catatan trading Anda di sini..."
                />
              </div>
            </div>

            {/* Balance Information */}
            <div className="mb-6 p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border-2 border-violet-200">
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-violet-600" />
                Informasi Balance
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-700 font-medium">Balance Saat Ini:</span>
                    <span className="font-bold text-violet-700">
                      {formatCurrency(currentBalance, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700 font-medium">Profit/Loss:</span>
                    <span className={`font-bold ${
                      (parseFloat(form.profit) || 0) >= 0 
                        ? "text-emerald-600" 
                        : "text-rose-600"
                    }`}>
                      {formatCurrency(parseFloat(form.profit) || 0, currency)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-700 font-medium">Balance Setelah Trade:</span>
                    <span className={`font-bold ${
                      calculateBalanceAfter() >= currentBalance
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}>
                      {formatCurrency(calculateBalanceAfter(), currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700 font-medium">Result:</span>
                    <span className={`font-bold ${
                      form.result === "Win" 
                        ? "text-emerald-600" 
                        : form.result === "Lose" 
                        ? "text-rose-600" 
                        : "text-slate-600"
                    }`}>
                      {form.result || "Pending"}
                    </span>
                  </div>
                </div>
              </div>
              {form.result && (
                <div className="mt-3 text-xs text-violet-600 font-medium bg-white/50 p-2 rounded-lg">
                  {form.result === "Lose"
                    ? "⚠️ Profit akan otomatis negatif untuk result Lose"
                    : form.result === "Win"
                    ? "✅ Profit akan otomatis positif untuk result Win"
                    : "ℹ️ Profit akan disesuaikan berdasarkan result"}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
              <Motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => closeForm("cancel")}
                disabled={isLoading}
                className="px-6 py-3 border-2 border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Cancel
              </Motion.button>
              <Motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-linear-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editing ? "Update Entry" : "Save Entry"}
                  </>
                )}
              </Motion.button>
            </div>
          </form>
        </div>
      </Motion.div>
    </Motion.div>
  );
};

export default FormModal;