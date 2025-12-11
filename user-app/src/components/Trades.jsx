import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useOutletContext } from "react-router-dom";
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
import FormModal from "./FormModal";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  BarChart3,
  Target,
  DollarSign,
  Wallet,
  Crown,
  Zap,
  FileText,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

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

// PERBAIKAN: Pindahkan getEmptyForm ke luar komponen atau gunakan useCallback dengan dependencies yang tepat
const getEmptyForm = () => {
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
};

// Main Trades Component
const Trades = () => {
  // PERBAIKAN: Gunakan useOutletContext untuk mendapatkan data dari LayoutUser
  const {
    stats = {},
    currentPlan = {},
    subscription = {},
    currentBalance = 0,
  } = useOutletContext();

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

  // PERBAIKAN: Gunakan subscription langsung dari props tanpa override
  const actualSubscription = useMemo(() => {
    return subscription || { plan: "free" };
  }, [subscription]);

  // PERBAIKAN: Safe currentPlan berdasarkan actual subscription
  const safeCurrentPlan = useMemo(() => {
    const planName = actualSubscription.plan || "free";

    // Jika plan adalah pro atau lifetime, berikan unlimited entries
    if (planName === "pro" || planName === "lifetime") {
      return {
        name: planName.charAt(0).toUpperCase() + planName.slice(1),
        maxEntries: 1000, // Essentially unlimited
        ...currentPlan,
      };
    }

    // Default ke Free plan
    return {
      name: currentPlan?.name || "Free",
      maxEntries: currentPlan?.maxEntries || 30,
      ...currentPlan,
    };
  }, [currentPlan, actualSubscription]);

  // PERBAIKAN: Safe stats dengan default values
  const safeStats = useMemo(
    () => ({
      winRate: stats?.winRate || 0,
      avgProfit: stats?.avgProfit || 0,
      ...stats,
    }),
    [stats]
  );

  // PERBAIKAN: Pindahkan inisialisasi state setelah semua useMemo
  const [filter, setFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(getEmptyForm());
  const [localMessage, setLocalMessage] = useState("");
  const [originalData, setOriginalData] = useState(null);
  const [lastAction, setLastAction] = useState(null);

  // PERBAIKAN: Gunakan useRef untuk melacak apakah effect sudah dijalankan
  const effectRun = useRef(false);

  // PERBAIKAN: Reset form menggunakan useCallback
  const resetForm = useCallback(() => {
    setForm(getEmptyForm());
  }, []);

  // Load trades dan subscription on component mount
  useEffect(() => {
    dispatch(getTrades());
  }, [dispatch]);

  // PERBAIKAN: Handle messages dengan pendekatan yang lebih aman - pisahkan effect untuk success dan error
  useEffect(() => {
    // Skip jika tidak ada message atau action yang dikecualikan
    const shouldNotShowMessage = [
      "close",
      "cancel",
      "error",
      "no-changes",
    ].includes(lastAction);

    if (!message || shouldNotShowMessage || effectRun.current) {
      return;
    }

    // Handle success message
    if (isSuccess && message) {
      effectRun.current = true;
      const timer = setTimeout(() => {
        setLocalMessage(message);
        const hideTimer = setTimeout(() => {
          setLocalMessage("");
          dispatch(resetTrade());
          setLastAction(null);
          effectRun.current = false;
        }, 3000);

        return () => clearTimeout(hideTimer);
      }, 0);

      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [isSuccess, message, lastAction, dispatch]);

  useEffect(() => {
    // Skip jika tidak ada message atau action yang dikecualikan
    const shouldNotShowMessage = [
      "close",
      "cancel",
      "error",
      "no-changes",
    ].includes(lastAction);

    if (!message || shouldNotShowMessage || effectRun.current) {
      return;
    }

    // Handle error message
    if (isError && message) {
      effectRun.current = true;
      const timer = setTimeout(() => {
        setLocalMessage(message);
        const hideTimer = setTimeout(() => {
          setLocalMessage("");
          dispatch(resetTrade());
          setLastAction(null);
          effectRun.current = false;
        }, 5000);

        return () => clearTimeout(hideTimer);
      }, 0);

      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [isError, message, lastAction, dispatch]);

  const formatNumberForInput = (value) => {
    if (value === null || value === undefined || value === "") return "";
    return parseFloat(value).toString();
  };

  // PERBAIKAN: Fungsi openAdd dengan redirect ke halaman upgrade
  const openAdd = () => {
    // PERBAIKAN: Validasi balance tidak boleh 0
    if (
      actualCurrentBalance === 0 ||
      actualCurrentBalance === null ||
      actualCurrentBalance === undefined
    ) {
      Swal.fire({
        title: "Balance Masih 0",
        text: "Silakan set balance terlebih dahulu sebelum membuat entri trading.",
        icon: "warning",
        confirmButtonColor: "#8b5cf6",
        background: "#fff",
        color: "#1f2937",
        customClass: {
          popup: "rounded-3xl shadow-2xl",
          title: "text-xl font-bold text-violet-900",
          confirmButton: "rounded-xl font-semibold px-6 py-3",
        },
      });
      return;
    }

    // PERBAIKAN: Redirect ke halaman upgrade jika melebihi batas dan plan free
    if (
      trades.length >= safeCurrentPlan.maxEntries &&
      actualSubscription.plan === "free"
    ) {
      navigate("/upgrade");
      return;
    }

    resetForm();
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

  // PERBAIKAN: Fungsi untuk mengecek perubahan data dengan lebih akurat
  const checkForChanges = useCallback((newData, originalData) => {
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
          return true;
        }
      }
      // Handle pips (integer)
      else if (field === "pips") {
        if (parseInt(newValue) !== parseInt(oldValue)) {
          return true;
        }
      }
      // Handle other fields
      else {
        if (String(newValue || "") !== String(oldValue || "")) {
          return true;
        }
      }
    }
    return false;
  }, []);

  // PERBAIKAN: Fungsi saveForm dengan redirect ke halaman upgrade
  const saveForm = async (e) => {
    e.preventDefault();

    // PERBAIKAN: Redirect ke halaman upgrade jika melebihi batas dan plan free
    if (
      !editing &&
      trades.length >= safeCurrentPlan.maxEntries &&
      actualSubscription.plan === "free"
    ) {
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
        setLastAction("no-changes");
        setTimeout(() => {
          setLocalMessage("");
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
      setLastAction("error");
      setLocalMessage(
        "Gagal menyimpan entri: " + (error.message || "Unknown error")
      );
    }
  };

  const removeItem = async (id) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Entri trading ini akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#8b5cf6",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      background: "#fff",
      color: "#1f2937",
      customClass: {
        popup: "rounded-3xl shadow-2xl",
        title: "text-xl font-bold text-violet-900",
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
          confirmButtonColor: "#8b5cf6",
          background: "#fff",
          color: "#1f2937",
          customClass: {
            popup: "rounded-3xl shadow-2xl",
            title: "text-xl font-bold text-violet-900",
            confirmButton: "rounded-xl font-semibold px-6 py-3",
          },
        });
      } catch (error) {
        console.error("Error deleting trade:", error);
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
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-8 h-8 text-violet-600" />
            Trading Entries
            {/* Tampilkan badge plan */}
            {actualSubscription.plan !== "free" && (
              <span className="bg-linear-to-r from-green-500 to-emerald-600 text-white text-sm px-3 py-1 rounded-full font-semibold">
                {actualSubscription.plan.toUpperCase()} PLAN
              </span>
            )}
          </h1>
          <p className="text-slate-600 mt-1 font-light">
            Manage your trading journal entries
            {actualSubscription.plan !== "free" && (
              <span className="text-green-600 font-semibold ml-2">
                • Unlimited entries
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari entri..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-4 pr-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-violet-500 transition-all bg-white/80 backdrop-blur-sm shadow-sm font-light"
            />
          </div>
          <Motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={openAdd}
            disabled={isLoading}
            className="bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl transition-all duration-200 font-medium flex items-center justify-center space-x-2 shadow-sm hover:shadow-md disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
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
          className={`p-4 rounded-2xl text-sm font-medium ${
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
      {actualSubscription.plan === "free" && (
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-r from-red-100 to-red-100 border-2 border-red-300 rounded-3xl p-5 shadow-sm"
        >
          {/* Ubah flex-col pada mobile, dan atur alignment */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full sm:w-auto">
              <h3 className="font-bold text-red-900 text-lg flex items-center gap-2">
                <Crown className="w-5 h-5 text-red-600 shrink-0" />
                Free Plan
                {/* Tambah badge di mobile untuk info cepat */}
                <span className="sm:hidden ml-2 bg-red-200 text-red-800 text-xs px-2 py-0.5 rounded-full">
                  {entriesLeft} left
                </span>
              </h3>
              <p className="text-red-800 text-sm mt-1 font-light">
                {entriesLeft} entries remaining of {safeCurrentPlan.maxEntries}
                {/* Sembunyikan info lengkap di mobile jika sudah ada badge */}
                <span className="hidden sm:inline">
                  • Upgrade for unlimited entries
                </span>
              </p>
              {/* Info tambahan hanya di mobile */}
              <p className="text-red-700 text-xs mt-2 sm:hidden">
                Upgrade to Pro for unlimited entries
              </p>
            </div>

            {/* Tombol upgrade - full width di mobile, auto di desktop */}
            <Motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUpgradeClick}
              className="w-full sm:w-auto bg-linear-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 text-white px-6 py-3 rounded-xl transition-all duration-200 text-sm font-medium shadow-sm flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 shrink-0" />
              <span>Upgrade Now</span>
              {/* Arrow icon hanya di mobile */}
              <svg
                className="w-4 h-4 ml-1 sm:hidden"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
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
        <div className="bg-white p-5 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-slate-700 font-medium uppercase tracking-wider">
              Total Entries
            </div>
            <BarChart3 className="w-5 h-5 text-violet-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {trades.length}
            {actualSubscription.plan === "free" && (
              <span className="text-sm text-slate-600 ml-1">
                / {safeCurrentPlan.maxEntries}
              </span>
            )}
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-slate-700 font-medium uppercase tracking-wider">
              Win Rate
            </div>
            <Target className="w-5 h-5 text-violet-600" />
          </div>
          <div className="text-2xl font-bold text-slate-700">
            {safeStats.winRate}%
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-slate-700 font-medium uppercase tracking-wider">
              Avg Profit
            </div>
            {safeStats.avgProfit >= 0 ? (
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-rose-600" />
            )}
          </div>
          <div
            className={`text-2xl font-bold ${
              safeStats.avgProfit >= 0 ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {formatCompactCurrency(safeStats.avgProfit, currency)}
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-slate-700 font-medium uppercase tracking-wider">
              Balance
            </div>
            <Wallet className="w-5 h-5 text-violet-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {formatCompactCurrency(actualCurrentBalance, currency)}
          </div>
        </div>
      </Motion.div>

      {/* Entries Table */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 overflow-hidden shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-linear-to-r from-slate-50 to-violet-50">
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
                    className="text-left p-4 text-sm font-bold text-slate-800 whitespace-nowrap"
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
                  className="border-b border-slate-100 hover:bg-linear-to-r hover:from-slate-50 hover:to-violet-50 transition-all duration-200"
                >
                  <td className="p-4 text-sm font-medium text-slate-900 whitespace-nowrap">
                    {entry.date}
                  </td>
                  <td className="p-4 text-sm font-bold text-violet-700">
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
                  <td className="p-4 text-sm text-slate-700 font-medium">
                    {formatLot(entry.lot)}
                  </td>
                  <td className="p-4 text-sm text-slate-700 font-medium">
                    {formatPrice(entry.entry)}
                  </td>
                  <td className="p-4 text-sm text-slate-700 font-medium">
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
                  <td className="p-4 text-sm font-bold text-violet-700 whitespace-nowrap">
                    {formatCurrency(entry.balanceAfter, currency)}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openEdit(entry)}
                        className="text-violet-600 hover:text-violet-800 text-sm font-medium hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-all shadow-sm flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </Motion.button>
                      <Motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => removeItem(entry.id)}
                        disabled={isLoading}
                        className="text-rose-600 hover:text-rose-800 text-sm font-medium hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-all shadow-sm disabled:opacity-50 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Hapus
                      </Motion.button>
                    </div>
                  </td>
                </Motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <div className="text-slate-600 text-lg mb-4 font-medium">
                No entries found
              </div>
              <Motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openAdd}
                className="bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all shadow-sm font-medium flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Create Your First Entry
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
          className="px-6 py-3 border-2 border-slate-300 bg-white/80 backdrop-blur-sm rounded-2xl text-slate-700 hover:bg-slate-50 transition-all font-medium flex items-center justify-center space-x-2 shadow-md hover:shadow-sm disabled:opacity-50"
        >
          <Download className="w-5 h-5" />
          <span>Export CSV</span>
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
            originalData={originalData}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Trades;
