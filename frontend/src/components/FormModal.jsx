import React from "react";
import { motion } from "framer-motion";
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
    return currentBalance + profit;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={() => closeForm("cancel")}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-linear-to-br from-white to-orange-50 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-orange-200"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={saveForm} className="p-8">
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-orange-200">
            <h2 className="text-2xl font-bold text-orange-900 flex items-center gap-2">
              <span className="text-3xl">{editing ? "✏️" : "✨"}</span>
              {editing ? "Edit Entri" : "Entri Baru"}
            </h2>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => closeForm("cancel")}
              type="button"
              className="text-orange-500 hover:text-orange-700 p-2 rounded-xl hover:bg-orange-100 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "📅 Tanggal", type: "date", key: "date" },
              { label: "📊 Instrumen", type: "text", key: "instrument" },
              {
                label: "📈 Tipe",
                type: "select",
                key: "type",
                options: ["Buy", "Sell"],
              },
              {
                label: "💼 Lot Size",
                type: "number",
                key: "lot",
                step: "0.01",
                min: "0.01",
              },
              {
                label: "🎯 Entry Price",
                type: "number",
                key: "entry",
                step: "0.00001",
              },
              {
                label: "🚪 Exit Price",
                type: "number",
                key: "exit",
                step: "0.00001",
              },
              {
                label: "🛑 Stop Loss",
                type: "number",
                key: "stop",
                step: "0.00001",
              },
              {
                label: "✅ Take Profit",
                type: "number",
                key: "take",
                step: "0.00001",
              },
              { label: "📏 Pips", type: "number", key: "pips", step: "1" },
              {
                label: `💰 Profit/Loss`,
                type: "number",
                key: "profit",
                step: "1",
                customHandler: handleProfitChange,
              },
              {
                label: "🏆 Result",
                type: "select",
                key: "result",
                options: ["Win", "Lose", "Break Even", "Pending"],
                customHandler: handleResultChange,
              },
              { label: "🎲 Strategy", type: "text", key: "strategy" },
              { label: "🌍 Kondisi Market", type: "text", key: "market" },
              { label: "😊 Emosi Sebelum", type: "text", key: "emotionBefore" },
              { label: "😌 Emosi Sesudah", type: "text", key: "emotionAfter" },
            ].map((field) => (
              <motion.div
                key={field.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <label className="block text-sm font-bold text-orange-900 mb-2">
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <select
                    value={form[field.key] || ""}
                    onChange={(e) =>
                      field.customHandler
                        ? field.customHandler(e.target.value)
                        : handleInputChange(field.key, e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-1 focus:outline-none focus:ring-orange-500 focus:border-orange-500 transition-all bg-white shadow-sm font-medium text-gray-700"
                  >
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
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
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-1 focus:outline-none focus:ring-orange-500 focus:border-orange-500 transition-all bg-white shadow-sm font-medium text-gray-700"
                  />
                )}
              </motion.div>
            ))}
            <div className="lg:col-span-3">
              <label className="block text-sm font-bold text-orange-900 mb-2">
                📝 Catatan
              </label>
              <textarea
                value={form.notes || ""}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-1 focus:outline-none focus:ring-orange-500 focus:border-orange-500 transition-all bg-white shadow-sm font-medium text-gray-700"
                placeholder="Tulis catatan trading Anda di sini..."
              />
            </div>
          </div>

          {/* Informasi Balance */}
          <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
            <h3 className="font-bold text-orange-900 mb-2">
              💰 Informasi Balance
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-orange-700">Balance Saat Ini:</span>
                <div className="font-bold text-orange-900">
                  {formatCurrency(currentBalance, currency)}
                </div>
              </div>
              <div>
                <span className="text-orange-700">Balance Setelah Trade:</span>
                <div
                  className={`font-bold ${
                    calculateBalanceAfter() >= currentBalance
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {formatCurrency(calculateBalanceAfter(), currency)}
                </div>
              </div>
            </div>
            {form.result && (
              <div className="mt-2 text-xs text-orange-600">
                {form.result === "Lose"
                  ? "⚠️ Profit akan otomatis negatif untuk result Lose"
                  : form.result === "Win"
                  ? "✅ Profit akan otomatis positif untuk result Win"
                  : "ℹ️ Profit akan disesuaikan berdasarkan result"}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t-2 border-orange-200">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => closeForm("cancel")}
              disabled={isLoading}
              className="px-6 py-3 border-2 border-orange-300 bg-white rounded-xl text-orange-700 hover:bg-orange-50 transition-all font-semibold shadow-md disabled:opacity-50"
            >
              ❌ Batal
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl transition-all duration-200 font-bold shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Menyimpan...
                </>
              ) : (
                "💾 Simpan Entri"
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default FormModal;