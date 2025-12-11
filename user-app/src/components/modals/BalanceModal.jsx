import React, { useState, useEffect } from "react";
import { motion as Motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  updateInitialBalance,
  resetBalance,
  getBalance,
} from "../../features/balanceSlice";
import { getTrades, deleteAllTrades } from "../../features/tradeSlice";
import { clearTarget, getTarget } from "../../features/targetSlice";
import {
  formatCurrency,
  getCurrencySymbol,
} from "../../utils/currencyFormatter";
import { exportTradesToCSV, downloadCSV } from "../../utils/exportTrades";
import { Wallet } from "lucide-react";
import Swal from "sweetalert2";

const BalanceModal = ({ setShowBalanceModal }) => {
  const dispatch = useDispatch();

  // State untuk balance
  const {
    initialBalance,
    currentBalance,
    currency: currentCurrency,
    isLoading,
    isSuccess,
    isError,
    message,
  } = useSelector((state) => state.balance);

  // State untuk trades (untuk cek apakah ada data)
  const { trades = [], isLoading: tradesLoading } = useSelector(
    (state) => state.trades
  );

  // State untuk target (untuk cek apakah ada target aktif)
  const { target } = useSelector((state) => state.target);

  const [tempBalance, setTempBalance] = useState(initialBalance);
  const [tempCurrency, setTempCurrency] = useState(currentCurrency);
  const [localMessage, setLocalMessage] = useState("");
  const [hasUserAction, setHasUserAction] = useState(false);
  const [deletingTrades, setDeletingTrades] = useState(false);

  useEffect(() => {
    setTempBalance(initialBalance);
    setTempCurrency(currentCurrency);
  }, [initialBalance, currentCurrency]);

  // Load trades dan reset state ketika modal dibuka
  useEffect(() => {
    dispatch(resetBalance());
    dispatch(getTrades());
    dispatch(getTarget()); // Load target data
    setHasUserAction(false);
    setLocalMessage("");
  }, [dispatch]);

  useEffect(() => {
    if (hasUserAction) {
      if (isSuccess) {
        setLocalMessage("Balance updated successfully!");
        const timer = setTimeout(() => {
          dispatch(getBalance());
          setShowBalanceModal(false);
          dispatch(resetBalance());
        }, 2000);
        return () => clearTimeout(timer);
      }
      if (isError) {
        setLocalMessage(message);
      }
    }
  }, [
    isSuccess,
    isError,
    message,
    setShowBalanceModal,
    dispatch,
    hasUserAction,
  ]);

  // Fungsi untuk menampilkan warning jika ada trades
  const showTradesWarning = () => {
    const hasActiveTarget = target && target.enabled;

    Swal.fire({
      title: "Tidak Dapat Mengubah Currency!",
      html: `
        <div class="text-left">
          <p class="text-slate-700 mb-4">
            Anda memiliki <strong>${
              trades.length
            } data trading</strong> yang masih tersimpan.
          </p>
          ${
            hasActiveTarget
              ? `
            <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <div class="flex items-start gap-3">
                <svg class="w-6 h-6 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p class="font-semibold text-amber-800">Target Juga Akan Terpengaruh</p>
                  <p class="text-sm text-amber-700 mt-1">
                    Anda memiliki target yang aktif. Mengubah currency akan menghapus semua data trading dan menonaktifkan target.
                  </p>
                </div>
              </div>
            </div>
          `
              : ""
          }
          <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p class="font-semibold text-amber-800">Mengapa tidak bisa mengubah currency?</p>
                <p class="text-sm text-amber-700 mt-1">
                  Data trading dan target Anda memiliki nilai yang dihitung berdasarkan currency saat ini. 
                  Mengubah currency akan menyebabkan konflik perhitungan data yang sudah ada.
                </p>
              </div>
            </div>
          </div>
          <p class="text-slate-700">
            Untuk mengubah currency, Anda harus:
          </p>
          <ol class="list-decimal pl-5 text-slate-700 mt-2 space-y-1">
            <li>Export data trading terlebih dahulu (opsional)</li>
            <li>Hapus semua data trading yang ada</li>
            <li>Target akan dinonaktifkan secara otomatis</li>
            <li>Setelah kosong, Anda bisa mengubah currency dengan aman</li>
          </ol>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#8b5cf6",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Hapus Semua Data Trading",
      cancelButtonText: "Batal",
      showDenyButton: true,
      denyButtonColor: "#3b82f6",
      denyButtonText: "Export Data Dulu",
      background: "#fff",
      color: "#1f2937",
      customClass: {
        popup: "rounded-3xl shadow-2xl max-w-2xl",
        title: "text-xl font-bold text-amber-900 mb-2",
        htmlContainer: "!text-left",
        confirmButton: "rounded-xl font-semibold px-6 py-3",
        cancelButton: "rounded-xl font-semibold px-6 py-3",
        denyButton: "rounded-xl font-semibold px-6 py-3 mr-2",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        showDeleteAllTradesConfirmation();
      } else if (result.isDenied) {
        exportTradesData();
      }
    });
  };

  // Fungsi untuk export data trades
  const exportTradesData = () => {
    if (trades.length === 0) {
      Swal.fire({
        title: "Tidak Ada Data",
        text: "Tidak ada data trading untuk diexport.",
        icon: "info",
        confirmButtonColor: "#8b5cf6",
      });
      return;
    }

    const csvContent = exportTradesToCSV(trades, currentCurrency);

    if (csvContent) {
      const filename = `trading_data_${currentCurrency}_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      downloadCSV(csvContent, filename);

      Swal.fire({
        title: "Data Berhasil Diexport!",
        text: `Data ${trades.length} trading telah diexport.`,
        icon: "success",
        confirmButtonColor: "#8b5cf6",
      });
    }
  };

  // Fungsi untuk konfirmasi hapus semua trades
  const showDeleteAllTradesConfirmation = () => {
    const hasActiveTarget = target && target.enabled;

    Swal.fire({
      title: "Hapus Semua Data Trading?",
      html: `
        <div class="text-left">
          <p class="text-slate-700 mb-4">
            Anda akan menghapus <strong>${
              trades.length
            } data trading</strong> secara permanen.
          </p>
          ${
            hasActiveTarget
              ? `
            <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <div class="flex items-start gap-3">
                <svg class="w-6 h-6 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p class="font-semibold text-amber-800">Target Akan Dinonaktifkan!</p>
                  <p class="text-sm text-amber-700 mt-1">
                    Anda memiliki target yang aktif. Semua target akan dinonaktifkan secara otomatis karena bergantung pada data trading.
                  </p>
                </div>
              </div>
            </div>
          `
              : ""
          }
          <div class="bg-rose-50 border border-rose-200 rounded-xl p-4">
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-rose-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p class="font-semibold text-rose-800">Tindakan ini tidak dapat dibatalkan!</p>
                <ul class="text-sm text-rose-700 mt-1 space-y-1">
                  <li>• Semua data trading akan dihapus permanen</li>
                  ${
                    hasActiveTarget
                      ? "<li>• Target yang aktif akan dinonaktifkan</li>"
                      : ""
                  }
                  <li>• Balance akan tetap menggunakan currency lama</li>
                  <li>• Setelah kosong, Anda bisa mengubah currency baru</li>
                  <li>• Pastikan Anda sudah export data jika diperlukan</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus Semua",
      cancelButtonText: "Batal",
      background: "#fff",
      color: "#1f2937",
      customClass: {
        popup: "rounded-3xl shadow-2xl max-w-2xl",
        title: "text-xl font-bold text-rose-900 mb-2",
        htmlContainer: "!text-left",
        confirmButton: "rounded-xl font-semibold px-6 py-3",
        cancelButton: "rounded-xl font-semibold px-6 py-3",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        handleDeleteAllTrades();
      }
    });
  };

  // Fungsi untuk menghapus semua trades menggunakan Axios
  const handleDeleteAllTrades = async () => {
    try {
      setDeletingTrades(true);

      // Gunakan Redux thunk untuk menghapus semua trades
      const result = await dispatch(deleteAllTrades()).unwrap();

      // Reset target di Redux state jika ada target aktif
      if (target && target.enabled) {
        dispatch(clearTarget());
      }

      // Refresh target data
      await dispatch(getTarget());

      let successMessage =
        result.message || "Semua data trading telah dihapus.";
      let targetMessage = "";

      if (result.targetAction === "disabled") {
        targetMessage = " Target telah dinonaktifkan dan balance direset ke 0.";
      } else if (result.targetAction === "balance_reset") {
        targetMessage = " Target balance telah direset ke 0.";
      }

      Swal.fire({
        title: "Berhasil!",
        html: `
        <div class="text-left">
          <p class="text-slate-700 mb-3">${successMessage}${targetMessage}</p>
          ${
            result.targetAction === "disabled" ||
            result.targetAction === "balance_reset"
              ? `
            <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <p class="text-sm text-emerald-700 flex items-start gap-2">
                <svg class="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  ${
                    result.targetAction === "disabled"
                      ? "Target berhasil dinonaktifkan dan balance direset ke 0 karena bergantung pada data trading."
                      : "Target balance berhasil direset ke 0 karena semua data trading dihapus."
                  }
                </span>
              </p>
            </div>
          `
              : ""
          }
        </div>
      `,
        icon: "success",
        confirmButtonColor: "#8b5cf6",
        background: "#fff",
        color: "#1f2937",
        customClass: {
          popup: "rounded-3xl shadow-2xl max-w-2xl",
          title: "text-xl font-bold text-emerald-900 mb-2",
          htmlContainer: "!text-left",
          confirmButton: "rounded-xl font-semibold px-6 py-3",
        },
      }).then(() => {
        setShowBalanceModal(false);
      });
    } catch (error) {
      console.error("Error deleting trades:", error);

      Swal.fire({
        title: "Error!",
        text: error.message || "Gagal menghapus data trading.",
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
    } finally {
      setDeletingTrades(false);
    }
  };

  const handleUpdateBalance = () => {
    // Validasi balance
    if (tempBalance <= 0) {
      setLocalMessage("Balance must be greater than 0");
      return;
    }

    if (!tempCurrency) {
      setLocalMessage("Please select a currency");
      return;
    }

    // Cek apakah currency berubah DAN ada data trades
    if (tempCurrency !== currentCurrency && trades.length > 0) {
      showTradesWarning();
      return;
    }

    // Jika tidak ada trades atau currency tidak berubah, lanjutkan update
    setHasUserAction(true);
    dispatch(
      updateInitialBalance({
        initialBalance: tempBalance,
        currency: tempCurrency,
      })
    );
  };

  const handleClose = () => {
    dispatch(resetBalance());
    setShowBalanceModal(false);
  };

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleClose}
    >
      <Motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full border-2 border-violet-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Wallet className="w-7 h-7 text-violet-600" />
              Update Initial Deposit
            </h2>
            <Motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              className="text-violet-500 hover:text-violet-700 p-2 rounded-xl hover:bg-violet-100 transition-colors"
              disabled={isLoading || deletingTrades}
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
            </Motion.button>
          </div>

          <div className="space-y-4">
            {/* Current Balance Info */}
            <div className="p-4 bg-violet-50 rounded-xl border-2 border-violet-200">
              <div className="text-sm font-semibold text-violet-800 mb-1">
                Current Balance
              </div>
              <div className="text-2xl font-bold text-violet-900">
                {formatCurrency(currentBalance, currentCurrency)}
              </div>
              <div className="text-xs text-violet-600 mt-1">
                Currency: {currentCurrency}
                {trades.length > 0 && (
                  <span className="ml-2 text-amber-600 font-semibold">
                    • {trades.length} trades recorded
                  </span>
                )}
                {target && target.enabled && (
                  <span className="ml-2 text-blue-600 font-semibold">
                    • Target aktif
                  </span>
                )}
              </div>
            </div>

            {/* Currency Selection */}
            <div>
              <label className="block text-sm font-bold text-violet-800 mb-2">
                Select Currency
              </label>
              <select
                value={tempCurrency}
                onChange={(e) => setTempCurrency(e.target.value)}
                className="w-full px-4 py-3 border-2 border-violet-200 rounded-xl focus:outline-none focus:border-violet-500 transition-all font-semibold text-violet-900"
                disabled={deletingTrades || tradesLoading}
              >
                <option value="IDR">Indonesian Rupiah (Rp)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="CENT">Cent (¢)</option>
              </select>
              {tempCurrency !== currentCurrency && trades.length > 0 && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700 flex items-start gap-2">
                    <svg
                      className="w-4 h-4 mt-0.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <span>
                      <strong>Warning:</strong> Mengubah currency akan terkunci
                      karena ada {trades.length} data trading.
                      {target &&
                        target.enabled &&
                        " Target yang aktif juga akan dinonaktifkan."}
                      Hapus semua data trading terlebih dahulu.
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Balance Input */}
            <div>
              <label className="block text-sm font-bold text-violet-800 mb-2">
                New Initial Deposit Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-700 font-semibold">
                  {getCurrencySymbol(tempCurrency)}
                </span>
                <input
                  type="number"
                  value={tempBalance}
                  onChange={(e) => setTempBalance(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 border-2 border-violet-200 rounded-xl focus:outline-none focus:border-violet-500 transition-all font-semibold text-violet-900"
                  placeholder="Enter initial deposit amount"
                  min="0"
                  step="0.01"
                  disabled={deletingTrades}
                />
              </div>
              <div className="text-xs text-violet-600 mt-2">
                Note: This will reset your current balance to the new initial
                amount
              </div>
            </div>

            {/* Preview */}
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <div className="text-sm text-blue-700 font-semibold mb-1">
                Preview:
              </div>
              <div className="text-lg font-bold text-blue-900">
                {formatCurrency(tempBalance, tempCurrency)}
              </div>
              {tempCurrency !== currentCurrency && (
                <div className="text-xs text-blue-600 mt-1">
                  Currency changed from {currentCurrency} to {tempCurrency}
                </div>
              )}
            </div>

            {/* Message Display */}
            {localMessage && (
              <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-xl text-sm font-semibold ${
                  isSuccess && hasUserAction
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                    : isError && hasUserAction
                    ? "bg-rose-100 text-rose-700 border border-rose-300"
                    : "bg-blue-100 text-blue-700 border border-blue-300"
                }`}
              >
                {localMessage}
              </Motion.div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClose}
                disabled={isLoading || deletingTrades}
                className="px-6 py-3 border-2 border-violet-300 rounded-xl text-violet-700 hover:bg-violet-50 transition-colors font-bold disabled:opacity-50"
              >
                Cancel
              </Motion.button>
              <Motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpdateBalance}
                disabled={isLoading || deletingTrades}
                className="px-6 py-3 bg-linear-to-r from-violet-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading || deletingTrades ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {deletingTrades ? "Deleting Trades..." : "Updating..."}
                  </>
                ) : (
                  "Update Deposit"
                )}
              </Motion.button>
            </div>
          </div>
        </div>
      </Motion.div>
    </Motion.div>
  );
};

export default BalanceModal;
