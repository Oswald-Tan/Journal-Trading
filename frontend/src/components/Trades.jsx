import React, { useState, useMemo, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  getTrades,
  createTrade,
  updateTrade,
  deleteTrade,
  resetTrade,
} from "../features/tradeSlice";
import Swal from "sweetalert2";
import {
  formatCurrency,
  formatCompactCurrency,
} from "../utils/currencyFormatter";
import { useNavigate } from "react-router-dom";
import FormModal from "./FormModal";

// Helper functions untuk formatting angka
const formatNumber = (value, decimalPlaces = 5) => {
  if (value === null || value === undefined || value === "") return "-";

  const num = parseFloat(value);
  if (isNaN(num)) return "-";

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimalPlaces,
    useGrouping: true,
  }).format(num);
};

const formatPrice = (value) => {
  return formatNumber(value, 5);
};

const formatLot = (value) => {
  return formatNumber(value, 2);
};

const formatPips = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  const num = parseInt(value);
  if (isNaN(num)) return "-";

  return new Intl.NumberFormat("en-US").format(num);
};

// Main Trades Component
const Trades = ({
  stats = {},
  currentPlan = {},
  subscription = {},
  currentBalance = 0,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const {
    trades = [],
    isLoading,
    isSuccess,
    isError,
    message,
  } = useSelector((state) => state.trades);

  const { currentBalance: reduxBalance, currency } = useSelector(
    (state) => state.balance
  );

  const actualCurrentBalance = currentBalance || reduxBalance || 0;

  // PERBAIKAN: Gabungkan subscription dari props dan Redux store
  const actualSubscription = useMemo(() => {
    return subscription || { plan: 'free' };
  }, [subscription]);

  // PERBAIKAN: Safe currentPlan dengan default values berdasarkan subscription
  const safeCurrentPlan = useMemo(
    () => {
      // Jika ada subscription data, gunakan untuk menentukan plan
      if (actualSubscription.plan === 'pro' || actualSubscription.plan === 'lifetime') {
        return {
          name: actualSubscription.plan.charAt(0).toUpperCase() + actualSubscription.plan.slice(1),
          maxEntries: 1000, // Unlimited essentially
          ...currentPlan,
        };
      }
      
      // Default ke Free plan
      return {
        name: currentPlan?.name || "Free",
        maxEntries: currentPlan?.maxEntries || 30,
        ...currentPlan,
      };
    },
    [currentPlan, actualSubscription]
  );

  // PERBAIKAN: Safe stats dengan default values
  const safeStats = useMemo(
    () => ({
      winRate: stats?.winRate || 0,
      avgProfit: stats?.avgProfit || 0,
      ...stats,
    }),
    [stats]
  );

  const [filter, setFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(getEmptyForm());
  const [localMessage, setLocalMessage] = useState("");
  const [originalData, setOriginalData] = useState(null);
  const [lastAction, setLastAction] = useState(null);

  // Load trades dan subscription on component mount
  useEffect(() => {
    dispatch(getTrades());
  }, [dispatch]);

  // Handle messages
  useEffect(() => {
    const shouldNotShowMessage = ["close", "cancel", "error"].includes(
      lastAction
    );

    if (isSuccess && message && !shouldNotShowMessage) {
      setLocalMessage(message);
      const timer = setTimeout(() => {
        setLocalMessage("");
        dispatch(resetTrade());
        setLastAction(null);
      }, 3000);
      return () => clearTimeout(timer);
    }

    if (isError && message && !shouldNotShowMessage) {
      setLocalMessage(message);
      const timer = setTimeout(() => {
        setLocalMessage("");
        dispatch(resetTrade());
        setLastAction(null);
      }, 5000);
      return () => clearTimeout(timer);
    }

    if (!message && lastAction && !["close", "cancel"].includes(lastAction)) {
      setLastAction(null);
    }
  }, [isSuccess, isError, message, dispatch, lastAction]);

  function getEmptyForm() {
    return {
      date: new Date().toISOString().slice(0, 10),
      instrument: "XAUUSD",
      type: "Buy",
      lot: 0.01,
      entry: "",
      stop: "",
      take: "",
      exit: "",
      pips: 0,
      result: "Pending",
      profit: 0,
      riskReward: 0,
      strategy: "",
      market: "",
      emotionBefore: "",
      emotionAfter: "",
      screenshot: "",
      notes: "",
    };
  }

  const formatNumberForInput = (value) => {
    if (value === null || value === undefined || value === "") return "";
    return parseFloat(value).toString();
  };

  // PERBAIKAN: Fungsi openAdd dengan redirect ke halaman upgrade
  const openAdd = () => {
    console.log("openAdd called - current plan:", safeCurrentPlan.name);
    console.log("subscription plan:", actualSubscription.plan);
    console.log(
      "trades length:",
      trades.length,
      "max entries:",
      safeCurrentPlan.maxEntries
    );
    console.log("current balance:", actualCurrentBalance);

    // PERBAIKAN: Validasi balance tidak boleh 0
    if (
      actualCurrentBalance === 0 ||
      actualCurrentBalance === null ||
      actualCurrentBalance === undefined
    ) {
      console.log("Balance is 0, showing warning modal");
      Swal.fire({
        title: "Balance Masih 0",
        text: "Silakan set balance terlebih dahulu sebelum membuat entri trading.",
        icon: "warning",
        confirmButtonColor: "#f97316",
        background: "#fff",
        color: "#1f2937",
        customClass: {
          popup: "rounded-3xl shadow-2xl",
          title: "text-xl font-bold text-orange-900",
          confirmButton: "rounded-xl font-semibold px-6 py-3",
        },
      });
      return;
    }

    // PERBAIKAN: Redirect ke halaman upgrade jika melebihi batas dan plan free
    if (
      trades.length >= safeCurrentPlan.maxEntries &&
      actualSubscription.plan === 'free'
    ) {
      console.log("Redirecting to upgrade page from openAdd");
      navigate("/upgrade");
      return;
    }

    setForm(getEmptyForm());
    setEditing(null);
    setOriginalData(null);
    setLastAction("open");
    setShowForm(true);
  };

  const openEdit = (item) => {
    setOriginalData({ ...item });

    setForm({
      ...item,
      lot: formatNumberForInput(item.lot),
      entry: formatNumberForInput(item.entry),
      exit: formatNumberForInput(item.exit),
      stop: formatNumberForInput(item.stop),
      take: formatNumberForInput(item.take),
      pips: formatNumberForInput(item.pips),
      profit: formatNumberForInput(item.profit),
      riskReward: formatNumberForInput(item.riskReward),
    });
    setEditing(item.id);
    setLastAction("open");
    setShowForm(true);
  };

  const closeForm = (actionType = "close") => {
    setLastAction(actionType);
    setLocalMessage("");
    setShowForm(false);
    setEditing(null);
    setOriginalData(null);

    setTimeout(() => {
      dispatch(resetTrade());
    }, 100);
  };

  // PERBAIKAN: Fungsi saveForm dengan redirect ke halaman upgrade
  const saveForm = async (e) => {
    e.preventDefault();

    // PERBAIKAN: Redirect ke halaman upgrade jika melebihi batas dan plan free
    if (
      !editing &&
      trades.length >= safeCurrentPlan.maxEntries &&
      actualSubscription.plan === 'free'
    ) {
      console.log("Redirecting to upgrade page from saveForm");
      navigate("/upgrade");
      return;
    }

    const formData = { ...form };

    // Konversi ke number
    formData.lot = formData.lot ? Number(formData.lot) : 0;
    formData.entry = formData.entry ? Number(formData.entry) : 0;
    formData.stop = formData.stop ? Number(formData.stop) : null;
    formData.take = formData.take ? Number(formData.take) : null;
    formData.exit = formData.exit ? Number(formData.exit) : null;
    formData.pips = formData.pips ? Number(formData.pips) : 0;
    formData.profit = formData.profit ? Number(formData.profit) : 0;
    formData.riskReward = formData.riskReward ? Number(formData.riskReward) : 0;

    // PERBAIKAN: Untuk EDIT - CEK APAKAH ADA PERUBAHAN DATA dengan cara yang lebih akurat
    if (editing && originalData) {
      const hasChanges = checkForChanges(formData, originalData);

      if (!hasChanges) {
        setLocalMessage("Tidak ada perubahan yang dilakukan.");
        setTimeout(() => {
          setLocalMessage("");
          closeForm("no-changes");
        }, 3000);
        return;
      }
    }

    // Set result berdasarkan profit jika masih Pending
    if (!formData.result || formData.result === "Pending") {
      formData.result =
        formData.profit > 0
          ? "Win"
          : formData.profit < 0
          ? "Lose"
          : "Break Even";
    }

    try {
      setLastAction("save");
      if (editing) {
        // PERBAIKAN: Pastikan kita mengirim data yang benar ke updateTrade
        console.log("Updating trade with data:", formData);
        await dispatch(
          updateTrade({
            tradeId: editing,
            tradeData: formData,
          })
        ).unwrap();
      } else {
        await dispatch(createTrade(formData)).unwrap();
      }

      closeForm("success");
    } catch (error) {
      console.error("Failed to save trade:", error);
      setLastAction("error");
      setLocalMessage(
        "Gagal menyimpan entri: " + (error.message || "Unknown error")
      );
    }
  };

  // PERBAIKAN: Fungsi untuk mengecek perubahan data dengan lebih akurat
  const checkForChanges = (newData, originalData) => {
    const fieldsToCompare = [
      "date",
      "instrument",
      "type",
      "lot",
      "entry",
      "stop",
      "take",
      "exit",
      "pips",
      "profit",
      "result",
      "riskReward",
      "strategy",
      "market",
      "emotionBefore",
      "emotionAfter",
      "notes",
    ];

    for (let field of fieldsToCompare) {
      const newValue = newData[field];
      const oldValue = originalData[field];

      // Handle number comparisons
      if (
        [
          "lot",
          "entry",
          "stop",
          "take",
          "exit",
          "profit",
          "riskReward",
        ].includes(field)
      ) {
        if (Number(newValue) !== Number(oldValue)) {
          console.log(`Field ${field} changed:`, oldValue, "->", newValue);
          return true;
        }
      }
      // Handle pips (integer)
      else if (field === "pips") {
        if (parseInt(newValue) !== parseInt(oldValue)) {
          console.log(`Field ${field} changed:`, oldValue, "->", newValue);
          return true;
        }
      }
      // Handle other fields
      else {
        if (String(newValue || "") !== String(oldValue || "")) {
          console.log(`Field ${field} changed:`, oldValue, "->", newValue);
          return true;
        }
      }
    }
    return false;
  };

  const removeItem = async (id) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Entri trading ini akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      background: "#fff",
      color: "#1f2937",
      customClass: {
        popup: "rounded-3xl shadow-2xl",
        title: "text-xl font-bold text-orange-900",
        confirmButton: "rounded-xl font-semibold px-6 py-3",
        cancelButton: "rounded-xl font-semibold px-6 py-3",
      },
    });

    if (result.isConfirmed) {
      try {
        setLastAction("delete");
        await dispatch(deleteTrade(id)).unwrap();

        Swal.fire({
          title: "Terhapus!",
          text: "Entri trading berhasil dihapus.",
          icon: "success",
          confirmButtonColor: "#f97316",
          background: "#fff",
          color: "#1f2937",
          customClass: {
            popup: "rounded-3xl shadow-2xl",
            title: "text-xl font-bold text-orange-900",
            confirmButton: "rounded-xl font-semibold px-6 py-3",
          },
        });
      } catch (error) {
        console.error("Failed to delete trade:", error);
        setLastAction("error");

        Swal.fire({
          title: "Error!",
          text: "Gagal menghapus entri trading.",
          icon: "error",
          confirmButtonColor: "#ef4444",
          background: "#fff",
          color: "#1f2937",
          customClass: {
            popup: "rounded-3xl shadow-2xl",
            title: "text-xl font-bold text-rose-900",
            confirmButton: "rounded-xl font-semibold px-6 py-3",
          },
        });
      }
    }
  };

  const exportCSV = () => {
    if (trades.length === 0) return;

    const headers = Object.keys(trades[0] || {});
    const csvContent = [
      headers.join(","),
      ...trades.map((row) =>
        headers.map((header) => JSON.stringify(row[header] || "")).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "trading_journal.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const filtered = useMemo(() => {
    if (!filter) return trades;
    const q = filter.toLowerCase();
    return trades.filter((e) =>
      Object.values(e).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [trades, filter]);

  const entriesLeft = safeCurrentPlan.maxEntries - trades.length;

  // PERBAIKAN: Handle upgrade button click dengan redirect ke halaman upgrade
  const handleUpgradeClick = () => {
    console.log("Navigating to upgrade page");
    navigate("/upgrade");
  };

  return (
    <div className="space-y-6 min-h-screen">
      {/* Header Section */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-orange-900 flex items-center gap-2">
            Trading Entries
            {/* Tampilkan badge plan */}
            {actualSubscription.plan !== 'free' && (
              <span className="bg-linear-to-r from-green-500 to-emerald-600 text-white text-sm px-3 py-1 rounded-full font-semibold">
                {actualSubscription.plan.toUpperCase()} PLAN
              </span>
            )}
          </h1>
          <p className="text-orange-700 mt-1">
            Manage your trading journal entries
            {actualSubscription.plan !== 'free' && (
              <span className="text-green-600 font-semibold ml-2">
                • Unlimited entries
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="🔍 Cari entri..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-4 pr-4 py-3 border-2 border-orange-200 rounded-2xl focus:outline-none transition-all bg-white/80 backdrop-blur-sm shadow-md"
            />
          </div>
          <Motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={openAdd}
            disabled={isLoading}
            className="bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-2xl transition-all duration-200 font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span className="text-xl">+</span>
                <span>New Entry</span>
              </>
            )}
          </Motion.button>
        </div>
      </Motion.div>

      {/* Message Display */}
      {localMessage && (
        <Motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl text-sm font-semibold ${
            isSuccess && !isError
              ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
              : isError
              ? "bg-rose-100 text-rose-700 border border-rose-300"
              : "bg-blue-100 text-blue-700 border border-blue-300"
          }`}
        >
          {localMessage}
        </Motion.div>
      )}

      {/* PERBAIKAN: Plan Info Banner - HANYA TAMPIL JIKA PLAN FREE */}
      {actualSubscription.plan === 'free' && (
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-r from-amber-100 to-orange-100 border-2 border-amber-300 rounded-3xl p-5 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-amber-900 text-lg flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                Free Plan
              </h3>
              <p className="text-amber-800 text-sm mt-1">
                {entriesLeft} entries remaining of {safeCurrentPlan.maxEntries}
              </p>
            </div>
            <Motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUpgradeClick}
              className="bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl transition-all duration-200 text-sm font-bold shadow-lg"
            >
              🚀 Upgrade Now
            </Motion.button>
          </div>
        </Motion.div>
      )}

      {/* Stats Cards */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-3xl border border-orange-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-700 font-semibold uppercase tracking-wider">
              Total Entries
            </div>
            <div className="text-2xl">📊</div>
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {trades.length}
            {actualSubscription.plan === 'free' && (
              <span className="text-sm text-orange-600 ml-1">
                / {safeCurrentPlan.maxEntries}
              </span>
            )}
          </div>
        </div>
        <div className="bg-linear-to-br from-orange-100 to-amber-100 backdrop-blur-sm p-5 rounded-3xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-700 font-semibold uppercase tracking-wider">
              Win Rate
            </div>
            <div className="text-2xl">🎯</div>
          </div>
          <div className="text-2xl font-bold text-orange-700">
            {safeStats.winRate}%
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-3xl border border-orange-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-700 font-semibold uppercase tracking-wider">
              Avg Profit
            </div>
            <div className="text-2xl">
              {safeStats.avgProfit >= 0 ? "💰" : "📉"}
            </div>
          </div>
          <div
            className={`text-2xl font-bold ${
              safeStats.avgProfit >= 0 ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {formatCompactCurrency(safeStats.avgProfit, currency)}
          </div>
        </div>
        <div className="bg-linear-to-br from-amber-100 to-yellow-100 backdrop-blur-sm p-5 rounded-3xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-700 font-semibold uppercase tracking-wider">
              Balance
            </div>
            <div className="text-2xl">💵</div>
          </div>
          <div className="text-2xl font-bold text-orange-800">
            {formatCompactCurrency(actualCurrentBalance, currency)}
          </div>
        </div>
      </Motion.div>

      {/* Entries Table */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-md rounded-3xl border border-orange-100 overflow-hidden shadow-xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-orange-200 bg-linear-to-r from-orange-50 to-amber-50">
                {[
                  "Date",
                  "Instrument",
                  "Type",
                  "Lot",
                  "Entry",
                  "Exit",
                  "Pips",
                  "P/L",
                  "Balance After",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className="text-left p-4 text-sm font-bold text-orange-900 whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry, index) => (
                <Motion.tr
                  key={entry.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-orange-100 hover:bg-linear-to-r hover:from-orange-50 hover:to-amber-50 transition-all duration-200"
                >
                  <td className="p-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                    {entry.date}
                  </td>
                  <td className="p-4 text-sm font-bold text-orange-800">
                    {entry.instrument}
                  </td>
                  <td
                    className={`p-4 text-sm font-bold ${
                      entry.type === "Buy"
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {entry.type}
                  </td>
                  <td className="p-4 text-sm text-gray-700 font-medium">
                    {formatLot(entry.lot)}
                  </td>
                  <td className="p-4 text-sm text-gray-700 font-medium">
                    {formatPrice(entry.entry)}
                  </td>
                  <td className="p-4 text-sm text-gray-700 font-medium">
                    {formatPrice(entry.exit)}
                  </td>
                  <td
                    className={`p-4 text-sm font-bold ${
                      entry.pips >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {formatPips(entry.pips)}
                  </td>
                  <td
                    className={`p-4 text-sm font-bold whitespace-nowrap ${
                      entry.profit >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {formatCurrency(entry.profit, currency)}
                  </td>
                  <td className="p-4 text-sm font-bold text-orange-700 whitespace-nowrap">
                    {formatCurrency(entry.balanceAfter, currency)}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openEdit(entry)}
                        className="text-orange-600 hover:text-orange-800 text-sm font-semibold hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-all shadow-sm"
                      >
                        ✏️ Edit
                      </Motion.button>
                      <Motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => removeItem(entry.id)}
                        disabled={isLoading}
                        className="text-rose-600 hover:text-rose-800 text-sm font-semibold hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-all shadow-sm disabled:opacity-50"
                      >
                        🗑️ Hapus
                      </Motion.button>
                    </div>
                  </td>
                </Motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📭</div>
              <div className="text-gray-600 text-lg mb-4 font-medium">
                No entries found
              </div>
              <Motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openAdd}
                className="bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-xl transition-all shadow-lg font-semibold"
              >
                ✨ Create Your First Entry
              </Motion.button>
            </div>
          )}
        </div>
      </Motion.div>

      {/* Action Buttons */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-3 justify-end"
      >
        <Motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={exportCSV}
          disabled={trades.length === 0}
          className="px-6 py-3 border-2 border-orange-300 bg-white/80 backdrop-blur-sm rounded-2xl text-orange-700 hover:bg-orange-50 transition-all font-semibold flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:opacity-50"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            ></path>
          </svg>
          <span>📥 Export CSV</span>
        </Motion.button>
      </Motion.div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <FormModal
            form={form}
            setForm={setForm}
            editing={editing}
            saveForm={saveForm}
            closeForm={closeForm}
            isLoading={isLoading}
            currentBalance={actualCurrentBalance}
            currency={currency}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Trades;