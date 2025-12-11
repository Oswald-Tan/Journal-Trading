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
import { Wallet, AlertTriangle } from "lucide-react";
import Swal from "sweetalert2";

const BalanceModal = ({ setShowBalanceModal }) => {
  const dispatch = useDispatch();

  const {
    initialBalance,
    currentBalance,
    currency: currentCurrency,
    isLoading,
    isSuccess,
    isError,
    message,
  } = useSelector((state) => state.balance);

  const { trades = [], isLoading: tradesLoading } = useSelector(
    (state) => state.trades
  );

  const { target } = useSelector((state) => state.target);

  const [tempBalance, setTempBalance] = useState(initialBalance);
  const [tempCurrency, setTempCurrency] = useState(currentCurrency);
  const [localMessage, setLocalMessage] = useState("");
  const [hasUserAction, setHasUserAction] = useState(false);
  const [deletingTrades, setDeletingTrades] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    setTempBalance(initialBalance);
    setTempCurrency(currentCurrency);
  }, [initialBalance, currentCurrency]);

  useEffect(() => {
    dispatch(resetBalance());
    dispatch(getTrades());
    dispatch(getTarget());
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
  }, [isSuccess, isError, message, setShowBalanceModal, dispatch, hasUserAction]);

  // Fungsi untuk menghapus semua trades tanpa konfirmasi (sudah dikonfirmasi sebelumnya)
  const performDeleteAllTrades = async () => {
    try {
      setDeletingTrades(true);
      const result = await dispatch(deleteAllTrades()).unwrap();
      
      // Reset target di Redux state jika ada target aktif
      if (target && target.enabled) {
        dispatch(clearTarget());
      }

      // Refresh target data
      await dispatch(getTarget());

      return result;
    } finally {
      setDeletingTrades(false);
    }
  };

  // Fungsi untuk mengekspor data trades
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

  // Fungsi untuk menampilkan warning berdasarkan jenis perubahan
  const showUpdateWarning = (changeType) => {
    let title = '';
    let message = '';
    let confirmButtonText = '';

    if (changeType === 'currency') {
      title = 'Mengubah Currency';
      message = `Anda akan mengubah currency dari ${currentCurrency} ke ${tempCurrency}.`;
      confirmButtonText = 'Hapus Data & Ubah Currency';
    } else if (changeType === 'balance') {
      title = 'Mengubah Initial Deposit';
      message = `Anda akan mengubah initial deposit dari ${formatCurrency(initialBalance, currentCurrency)} menjadi ${formatCurrency(tempBalance, currentCurrency)}.`;
      confirmButtonText = 'Hapus Data & Ubah Deposit';
    } else if (changeType === 'both') {
      title = 'Mengubah Currency dan Deposit';
      message = `Anda akan mengubah currency dari ${currentCurrency} ke ${tempCurrency} dan mengubah deposit dari ${formatCurrency(initialBalance, currentCurrency)} menjadi ${formatCurrency(tempBalance, tempCurrency)}.`;
      confirmButtonText = 'Hapus Data & Ubah Semua';
    }

    const hasActiveTarget = target && target.enabled;

    Swal.fire({
      title: title,
      html: `
        <div class="text-left">
          <p class="text-slate-700 mb-4">
            ${message}
          </p>
          <p class="text-slate-700 mb-4">
            Anda memiliki <strong>${trades.length} data trading</strong> yang masih tersimpan.
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
                    Anda memiliki target yang aktif. Mengubah balance/currency akan menghapus semua data trading dan menonaktifkan target.
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
                <p class="font-semibold text-rose-800">Apa yang akan terjadi?</p>
                <ul class="text-sm text-rose-700 mt-2 space-y-1">
                  <li>• <strong>Semua ${trades.length} data trading akan dihapus permanen</strong></li>
                  <li>• Balance akan direset ke deposit baru (${formatCurrency(tempBalance, tempCurrency)})</li>
                  ${hasActiveTarget ? '<li>• Target yang aktif akan dinonaktifkan</li>' : ''}
                  <li>• Anda akan memulai trading journey yang baru</li>
                </ul>
              </div>
            </div>
          </div>
          <p class="text-slate-700 mt-4">
            Untuk melanjutkan, Anda harus:
          </p>
          <ol class="list-decimal pl-5 text-slate-700 mt-2 space-y-1">
            <li>Export data trading terlebih dahulu (opsional)</li>
            <li>Hapus semua data trading yang ada</li>
            <li>Target akan dinonaktifkan secara otomatis</li>
          </ol>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: confirmButtonText,
      cancelButtonText: "Batal",
      showDenyButton: true,
      denyButtonColor: "#3b82f6",
      denyButtonText: "Export Data Dulu",
      background: "#fff",
      color: "#1f2937",
      customClass: {
        popup: "rounded-3xl shadow-2xl max-w-2xl",
        title: "text-xl font-bold text-rose-900 mb-2",
        htmlContainer: "!text-left",
        confirmButton: "rounded-xl font-semibold px-6 py-3",
        cancelButton: "rounded-xl font-semibold px-6 py-3",
        denyButton: "rounded-xl font-semibold px-6 py-3 mr-2",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Hapus semua trades dan lanjutkan update
        await handleResetAndUpdate(changeType);
      } else if (result.isDenied) {
        exportTradesData();
      }
    });
  };

  // Fungsi untuk menghapus trades dan melanjutkan update
  const handleResetAndUpdate = async () => {
    try {
      setIsResetting(true);
      
      // Hapus semua trades
      await performDeleteAllTrades();
      
      // Tunggu sebentar untuk memastikan state terupdate
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Setelah berhasil menghapus, update balance
      setHasUserAction(true);
      dispatch(
        updateInitialBalance({
          initialBalance: tempBalance,
          currency: tempCurrency,
        })
      );
      
    } catch (error) {
      console.error('Reset and update error:', error);
      setLocalMessage('Gagal menghapus data trading. Silakan coba lagi.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleUpdateBalance = async () => {
    // Validasi balance
    if (tempBalance <= 0) {
      setLocalMessage("Balance must be greater than 0");
      return;
    }

    if (!tempCurrency) {
      setLocalMessage("Please select a currency");
      return;
    }

    // Deteksi jenis perubahan
    const balanceChanged = tempBalance !== initialBalance;
    const currencyChanged = tempCurrency !== currentCurrency;
    
    // Cek apakah ada perubahan
    if (!balanceChanged && !currencyChanged) {
      setLocalMessage("Tidak ada perubahan yang dilakukan");
      setTimeout(() => setLocalMessage(""), 3000);
      return;
    }

    // Jika ada trades dan ada perubahan (balance atau currency)
    if (trades.length > 0 && (balanceChanged || currencyChanged)) {
      // Tentukan jenis perubahan untuk menampilkan pesan yang tepat
      let changeType = '';
      if (balanceChanged && currencyChanged) {
        changeType = 'both';
      } else if (currencyChanged) {
        changeType = 'currency';
      } else {
        changeType = 'balance';
      }
      
      // Tampilkan warning
      showUpdateWarning(changeType);
      return;
    }

    // Jika tidak ada trades, langsung update
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

  // Deteksi apakah ada perubahan
  const hasChanges = tempBalance !== initialBalance || tempCurrency !== currentCurrency;
  const willDeleteTrades = hasChanges && trades.length > 0;

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
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full border-2 border-violet-200 max-h-[90vh] overflow-y-auto"
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
              disabled={isLoading || deletingTrades || isResetting}
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

            {/* Warning jika akan menghapus data */}
            {willDeleteTrades && (
              <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-rose-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-rose-800 mb-1">
                      Perhatian: Data Trading Akan Dihapus
                    </p>
                    <p className="text-sm text-rose-700">
                      Mengubah {tempCurrency !== currentCurrency ? 'currency' : 'initial deposit'} dengan data trading yang ada akan menghapus <strong>{trades.length} entri trading</strong> permanen.
                      {target && target.enabled && ' Target aktif juga akan dinonaktifkan.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Currency Selection */}
            <div>
              <label className="block text-sm font-bold text-violet-800 mb-2">
                Select Currency
              </label>
              <select
                value={tempCurrency}
                onChange={(e) => setTempCurrency(e.target.value)}
                className="w-full px-4 py-3 border-2 border-violet-200 rounded-xl focus:outline-none focus:border-violet-500 transition-all font-semibold text-violet-900"
                disabled={deletingTrades || tradesLoading || isResetting}
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
                      <strong>Warning:</strong> Mengubah currency akan menghapus semua data trading.
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
                  disabled={deletingTrades || isResetting}
                />
              </div>
              <div className="text-xs text-violet-600 mt-2">
                Note: This will reset your current balance to the new initial amount
                {trades.length > 0 && tempBalance !== initialBalance && (
                  <span className="text-amber-600 font-semibold ml-1">
                    • All {trades.length} trades will be deleted
                  </span>
                )}
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
              {tempBalance !== initialBalance && (
                <div className="text-xs text-blue-600 mt-1">
                  Deposit changed from {formatCurrency(initialBalance, currentCurrency)} 
                  {tempCurrency === currentCurrency ? '' : ` (${currentCurrency})`}
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
                disabled={isLoading || deletingTrades || isResetting}
                className="px-6 py-3 border-2 border-violet-300 rounded-xl text-violet-700 hover:bg-violet-50 transition-colors font-bold disabled:opacity-50"
              >
                Cancel
              </Motion.button>
              <Motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpdateBalance}
                disabled={isLoading || deletingTrades || isResetting || !hasChanges}
                className="px-6 py-3 bg-linear-to-r from-violet-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {(isLoading || deletingTrades || isResetting) ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isResetting ? "Resetting Data..." : "Processing..."}
                  </>
                ) : (
                  <>
                    {willDeleteTrades ? (
                      <>
                        <AlertTriangle className="w-4 h-4" />
                        Update & Delete Trades
                      </>
                    ) : (
                      "Update Deposit"
                    )}
                  </>
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