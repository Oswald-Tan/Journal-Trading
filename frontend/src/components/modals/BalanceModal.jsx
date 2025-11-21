// components/modals/BalanceModal.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  updateInitialBalance,
  resetBalance,
  getBalance,
} from "../../features/balanceSlice";
import {
  formatCurrency,
  getCurrencySymbol,
} from "../../utils/currencyFormatter";

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

  const [tempBalance, setTempBalance] = useState(initialBalance);
  const [tempCurrency, setTempCurrency] = useState(currentCurrency);
  const [localMessage, setLocalMessage] = useState("");
  const [hasUserAction, setHasUserAction] = useState(false);

  useEffect(() => {
    setTempBalance(initialBalance);
    setTempCurrency(currentCurrency);
  }, [initialBalance, currentCurrency]);

  // Reset state ketika modal dibuka
  useEffect(() => {
    dispatch(resetBalance());
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

  const handleUpdateBalance = () => {
    if (tempBalance <= 0) {
      setLocalMessage("Balance must be greater than 0");
      return;
    }

    if (!tempCurrency) {
      setLocalMessage("Please select a currency");
      return;
    }

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full border-2 border-orange-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-orange-900 flex items-center gap-2">
              <span className="text-3xl">💰</span>
              Update Initial Deposit
            </h2>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              className="text-orange-500 hover:text-orange-700 p-2 rounded-xl hover:bg-orange-100 transition-colors"
              disabled={isLoading}
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

          <div className="space-y-4">
            {/* Current Balance Info */}
            <div className="p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
              <div className="text-sm font-semibold text-orange-800 mb-1">
                Current Balance
              </div>
              <div className="text-2xl font-bold text-orange-900">
                {formatCurrency(currentBalance, currentCurrency)}
              </div>
              <div className="text-xs text-orange-600 mt-1">
                Currency: {currentCurrency}
              </div>
            </div>

            {/* Currency Selection */}
            <div>
              <label className="block text-sm font-bold text-orange-800 mb-2">
                Select Currency
              </label>
              <select
                value={tempCurrency}
                onChange={(e) => setTempCurrency(e.target.value)}
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-1 focus:outline-none focus:ring-orange-500 focus:border-orange-500 transition-all font-semibold text-orange-900"
              >
                <option value="IDR">Indonesian Rupiah (Rp)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="CENT">Cent (¢)</option>
              </select>
            </div>

            {/* Balance Input */}
            <div>
              <label className="block text-sm font-bold text-orange-800 mb-2">
                New Initial Deposit Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-700 font-semibold">
                  {getCurrencySymbol(tempCurrency)}
                </span>
                <input
                  type="number"
                  value={tempBalance}
                  onChange={(e) => setTempBalance(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-1 focus:outline-none focus:ring-orange-500 focus:border-orange-500 transition-all font-semibold text-orange-900"
                  placeholder="Enter initial deposit amount"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="text-xs text-orange-600 mt-2">
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
            </div>

            {/* Message Display */}
            {localMessage && (
              <motion.div
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
              </motion.div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClose}
                disabled={isLoading}
                className="px-6 py-3 border-2 border-orange-300 rounded-xl text-orange-700 hover:bg-orange-50 transition-colors font-bold disabled:opacity-50"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpdateBalance}
                disabled={isLoading}
                className="px-6 py-3 bg-linear-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  "Update Deposit"
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BalanceModal;
