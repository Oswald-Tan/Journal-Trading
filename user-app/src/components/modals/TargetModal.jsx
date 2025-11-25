import React from "react";
import { motion as Motion } from 'framer-motion';
import { useDispatch, useSelector } from "react-redux";
import { updateTarget, resetLoading  } from "../../features/targetSlice";
import { formatCompactCurrency } from '../../utils/currencyFormatter';
import {
  Target,
  X,
  TrendingUp,
  Calendar,
  FileText,
  BarChart3,
  Save,
  Loader
} from 'lucide-react';

const TargetModal = ({ setShowTargetModal }) => {
  const dispatch = useDispatch();
  const { target, isLoading } = useSelector((state) => state.target);
  const { initialBalance, currentBalance, currency } = useSelector(
    (state) => state.balance
  );

  const [tempTarget, setTempTarget] = React.useState({
    enabled: false,
    targetBalance: 0,
    targetDate: "",
    description: "",
    useDailyTarget: false,
    dailyTargetPercentage: 0,
    dailyTargetAmount: 0,
    ...target,
  });

  // Safe values untuk menghindari null
  const safeInitialBalance = initialBalance || 0;
  const safeCurrentBalance = currentBalance || 0;

  // Hitung daily target amount berdasarkan percentage
  const calculateDailyTarget = (percentage) => {
    return (safeInitialBalance * percentage) / 100;
  };

  const handleUpdateTarget = async () => {
    try {
      const targetData = {
        ...tempTarget,
        dailyTargetAmount: tempTarget.useDailyTarget
          ? calculateDailyTarget(tempTarget.dailyTargetPercentage || 0)
          : 0,
      };

      console.log("Updating target with data:", targetData);
      await dispatch(updateTarget(targetData)).unwrap();
      
      // Tunggu sebentar sebelum menutup modal
      setTimeout(() => {
        setShowTargetModal(false);
      }, 100);
      
    } catch (error) {
      console.error("Failed to update target:", error);
      // Reset loading state jika error
      dispatch(resetLoading());
    }
  };

  // Update dailyTargetAmount ketika percentage berubah
  const handleDailyPercentageChange = (percentage) => {
    const newPercentage = Number(percentage) || 0;
    setTempTarget({
      ...tempTarget,
      dailyTargetPercentage: newPercentage,
      dailyTargetAmount: calculateDailyTarget(newPercentage),
    });
  };

  const handleClose = () => {
    // Reset loading state ketika modal ditutup
    dispatch(resetLoading());
    setShowTargetModal(false);
  };

  const handleTargetTypeChange = (useDaily) => {
    setTempTarget({
      ...tempTarget,
      useDailyTarget: useDaily,
      // Reset values ketika ganti tipe target
      targetBalance: useDaily ? 0 : tempTarget.targetBalance,
      targetDate: useDaily ? "" : tempTarget.targetDate,
      dailyTargetPercentage: useDaily
        ? tempTarget.dailyTargetPercentage || 0
        : 0,
      dailyTargetAmount: useDaily
        ? calculateDailyTarget(tempTarget.dailyTargetPercentage || 0)
        : 0,
    });
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
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full border-2 border-slate-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Target className="w-7 h-7 text-violet-600" />
              Set Trading Target
            </h2>
            <Motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              className="text-slate-500 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </Motion.button>
          </div>

          <div className="space-y-4">
            {/* Enable Target Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Enable Target
              </label>
              <button
                onClick={() =>
                  setTempTarget({ ...tempTarget, enabled: !tempTarget.enabled })
                }
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                  tempTarget.enabled ? "bg-violet-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all shadow-md ${
                    tempTarget.enabled ? "translate-x-8" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {tempTarget.enabled && (
              <>
                {/* Target Type Selection */}
                <div className="p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
                  <label className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Target Type
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="targetType"
                        checked={!tempTarget.useDailyTarget}
                        onChange={() => handleTargetTypeChange(false)}
                        className="text-violet-500 focus:ring-violet-500"
                      />
                      <span className="text-sm font-semibold text-slate-800">
                        Date-based Target
                      </span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="targetType"
                        checked={tempTarget.useDailyTarget}
                        onChange={() => handleTargetTypeChange(true)}
                        className="text-violet-500 focus:ring-violet-500"
                      />
                      <span className="text-sm font-semibold text-slate-800">
                        Daily Target (No Date)
                      </span>
                    </label>
                  </div>
                </div>

                {!tempTarget.useDailyTarget ? (
                  // DATE-BASED TARGET
                  <>
                    {/* Target Balance */}
                    <div>
                      <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Target Balance
                      </label>
                      <input
                        type="number"
                        value={tempTarget.targetBalance || ""}
                        onChange={(e) =>
                          setTempTarget({
                            ...tempTarget,
                            targetBalance: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 transition-all font-semibold text-slate-800"
                        placeholder="Example: 10000000 for 10 million"
                        min="0"
                        step="1000"
                      />
                    </div>

                    {/* Target Date */}
                    <div>
                      <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Target Date
                      </label>
                      <input
                        type="date"
                        value={tempTarget.targetDate || ""}
                        onChange={(e) =>
                          setTempTarget({
                            ...tempTarget,
                            targetDate: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 transition-all font-semibold text-slate-800"
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </>
                ) : (
                  // DAILY TARGET
                  <div>
                    <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Daily Profit Target (% of Capital)
                    </label>
                    <input
                      type="number"
                      value={tempTarget.dailyTargetPercentage || ""}
                      onChange={(e) =>
                        handleDailyPercentageChange(e.target.value)
                      }
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 transition-all font-semibold text-slate-800"
                      placeholder="Example: 20 for 20% per day"
                      min="0"
                      max="1000"
                      step="0.1"
                    />
                    <div className="text-xs font-semibold text-violet-600 mt-2 flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      Daily target: {formatCompactCurrency(
                        calculateDailyTarget(tempTarget.dailyTargetPercentage || 0),
                        currency
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Target Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={tempTarget.description || ""}
                    onChange={(e) =>
                      setTempTarget({
                        ...tempTarget,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 transition-all font-semibold text-slate-800"
                    placeholder={
                      tempTarget.useDailyTarget
                        ? "Example: Daily 20% profit target"
                        : "Example: 10x target in 2 months"
                    }
                  />
                </div>

                {/* Preview */}
                <div className="p-4 bg-linear-to-br from-violet-50 to-purple-50 rounded-xl border-2 border-violet-200">
                  <h4 className="font-bold text-sm mb-3 text-slate-800 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-violet-600" />
                    Target Preview:
                  </h4>
                  {!tempTarget.useDailyTarget ? (
                    <div className="text-sm space-y-2 text-slate-700 font-semibold">
                      <div className="flex justify-between">
                        <span>From:</span>
                        <span className="font-bold text-violet-700">
                          {formatCompactCurrency(safeInitialBalance, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>To:</span>
                        <span className="font-bold text-violet-700">
                          {formatCompactCurrency(tempTarget.targetBalance || 0, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Required:</span>
                        <span className="font-bold text-emerald-600">
                          {formatCompactCurrency(
                            (tempTarget.targetBalance || 0) - safeInitialBalance,
                            currency
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Target Date:</span>
                        <span className="font-bold text-violet-700">
                          {tempTarget.targetDate || "Not set"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm space-y-2 text-slate-700 font-semibold">
                      <div className="flex justify-between">
                        <span>Initial Capital:</span>
                        <span className="font-bold text-violet-700">
                          {formatCompactCurrency(safeInitialBalance, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Daily Target:</span>
                        <span className="font-bold text-violet-700">
                          {tempTarget.dailyTargetPercentage || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Daily Amount:</span>
                        <span className="font-bold text-emerald-600">
                          {formatCompactCurrency(
                            calculateDailyTarget(tempTarget.dailyTargetPercentage || 0),
                            currency
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-bold text-violet-700">Daily Target</span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClose}
                className="px-6 py-3 border-2 border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors font-medium flex items-center gap-2"
                disabled={isLoading}
              >
                <X className="w-4 h-4" />
                Cancel
              </Motion.button>
              <Motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpdateTarget}
                disabled={isLoading}
                className="px-6 py-3 bg-linear-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : tempTarget.enabled ? (
                  <>
                    <Save className="w-4 h-4" />
                    Set Target
                  </>
                ) : (
                  "Disable"
                )}
              </Motion.button>
            </div>
          </div>
        </div>
      </Motion.div>
    </Motion.div>
  );
};

export default TargetModal;