import React from "react";
import { motion as Motion } from 'framer-motion';
import { useDispatch, useSelector } from "react-redux";
import { updateTarget, resetLoading  } from "../../features/targetSlice";
import { formatCompactCurrency } from '../../utils/currencyFormatter';

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
      
      // PERBAIKAN: Tunggu sebentar sebelum menutup modal
      setTimeout(() => {
        setShowTargetModal(false);
      }, 100);
      
    } catch (error) {
      console.error("Failed to update target:", error);
      // Reset loading state jika error
      dispatch(resetLoading());
    }
  };

  // PERBAIKAN: Update dailyTargetAmount ketika percentage berubah
  const handleDailyPercentageChange = (percentage) => {
    const newPercentage = Number(percentage) || 0;
    setTempTarget({
      ...tempTarget,
      dailyTargetPercentage: newPercentage,
      dailyTargetAmount: calculateDailyTarget(newPercentage),
    });
  };

  const handleClose = () => {
    // PERBAIKAN: Reset loading state ketika modal ditutup
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
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full border-2 border-orange-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-orange-900 flex items-center gap-2">
              <span className="text-3xl">🎯</span>
              Set Trading Target
            </h2>
            <Motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
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
            </Motion.button>
          </div>

          <div className="space-y-4">
            {/* Enable Target Toggle */}
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
              <label className="text-sm font-bold text-orange-800">
                Aktifkan Target
              </label>
              <button
                onClick={() =>
                  setTempTarget({ ...tempTarget, enabled: !tempTarget.enabled })
                }
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                  tempTarget.enabled ? "bg-orange-500" : "bg-gray-300"
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
                <div className="p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
                  <label className="block text-sm font-bold text-orange-800 mb-3">
                    Tipe Target
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="targetType"
                        checked={!tempTarget.useDailyTarget}
                        onChange={() => handleTargetTypeChange(false)}
                        className="text-orange-500"
                      />
                      <span className="text-sm font-semibold text-orange-900">
                        Target dengan Tanggal
                      </span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="targetType"
                        checked={tempTarget.useDailyTarget}
                        onChange={() => handleTargetTypeChange(true)}
                        className="text-orange-500"
                      />
                      <span className="text-sm font-semibold text-orange-900">
                        Target Harian (Tanpa Tanggal)
                      </span>
                    </label>
                  </div>
                </div>

                {!tempTarget.useDailyTarget ? (
                  // TARGET DENGAN TANGGAL
                  <>
                    {/* Target Balance */}
                    <div>
                      <label className="block text-sm font-bold text-orange-800 mb-2">
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
                        className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:border-orange-500 transition-all font-semibold text-orange-900"
                        placeholder="Contoh: 10000000 untuk 10 juta"
                        min="0"
                        step="1000"
                      />
                    </div>

                    {/* Target Date */}
                    <div>
                      <label className="block text-sm font-bold text-orange-800 mb-2">
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
                        className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:border-orange-500 transition-all font-semibold text-orange-900"
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </>
                ) : (
                  // TARGET HARIAN
                  <div>
                    <label className="block text-sm font-bold text-orange-800 mb-2">
                      Target Profit Harian (% dari Modal)
                    </label>
                    <input
                      type="number"
                      value={tempTarget.dailyTargetPercentage || ""}
                      onChange={(e) =>
                        handleDailyPercentageChange(e.target.value)
                      }
                      className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:border-orange-500 transition-all font-semibold text-orange-900"
                      placeholder="Contoh: 20 untuk 20% per hari"
                      min="0"
                      max="1000"
                      step="0.1"
                    />
                    <div className="text-xs font-semibold text-orange-600 mt-2">
                      Target harian: {formatCompactCurrency(
                        calculateDailyTarget(tempTarget.dailyTargetPercentage || 0),
                        currency
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-orange-800 mb-2">
                    Deskripsi Target (Opsional)
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
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:border-orange-500 transition-all font-semibold text-orange-900"
                    placeholder={
                      tempTarget.useDailyTarget
                        ? "Contoh: Target profit 20% per hari"
                        : "Contoh: Target 10x dalam 2 bulan"
                    }
                  />
                </div>

                {/* Preview */}
                <div className="p-4 bg-linear-to-br from-orange-100 to-amber-100 rounded-xl border-2 border-orange-300">
                  <h4 className="font-bold text-sm mb-3 text-orange-900 flex items-center gap-2">
                    <span>📊</span> Preview Target:
                  </h4>
                  {!tempTarget.useDailyTarget ? (
                    <div className="text-sm space-y-2 text-orange-800 font-semibold">
                      <div className="flex justify-between">
                        <span>Dari:</span>
                        <span className="font-bold">
                          {formatCompactCurrency(safeInitialBalance, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ke:</span>
                        <span className="font-bold">
                          {formatCompactCurrency(tempTarget.targetBalance || 0, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Perlu:</span>
                        <span className="font-bold text-orange-900">
                          {formatCompactCurrency(
                            (tempTarget.targetBalance || 0) - safeInitialBalance,
                            currency
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Target Date:</span>
                        <span className="font-bold">
                          {tempTarget.targetDate || "Not set"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm space-y-2 text-orange-800 font-semibold">
                      <div className="flex justify-between">
                        <span>Modal Awal:</span>
                        <span className="font-bold">
                          {formatCompactCurrency(safeInitialBalance, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Target Harian:</span>
                        <span className="font-bold">
                          {tempTarget.dailyTargetPercentage || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Amount Harian:</span>
                        <span className="font-bold text-orange-900">
                          {formatCompactCurrency(
                            calculateDailyTarget(tempTarget.dailyTargetPercentage || 0),
                            currency
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tipe:</span>
                        <span className="font-bold">Target Harian</span>
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
                className="px-6 py-3 border-2 border-orange-300 rounded-xl text-orange-700 hover:bg-orange-50 transition-colors font-bold"
                disabled={isLoading}
              >
                Batal
              </Motion.button>
              <Motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpdateTarget}
                disabled={isLoading}
                className="px-6 py-3 bg-linear-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-bold disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Menyimpan...
                  </>
                ) : tempTarget.enabled ? (
                  "Set Target"
                ) : (
                  "Nonaktifkan"
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