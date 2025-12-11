import React from "react";
import { motion as Motion } from 'framer-motion';
import { useDispatch, useSelector } from "react-redux";
import { updateTarget, resetLoading } from "../../features/targetSlice";
import { formatCompactCurrency } from '../../utils/currencyFormatter';
import {
  Target,
  X,
  TrendingUp,
  Calendar,
  FileText,
  Save,
  Loader,
  AlertCircle
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
    ...target,
  });

  const [errors, setErrors] = React.useState({
    targetBalance: "",
    targetDate: "",
  });

  const [touched, setTouched] = React.useState({
    targetBalance: false,
    targetDate: false,
  });

  // Safe values untuk menghindari null
  const safeInitialBalance = initialBalance || 0;
  const safeCurrentBalance = currentBalance || 0;

  // Validasi form
  const validateForm = () => {
    const newErrors = {
      targetBalance: "",
      targetDate: "",
    };

    if (tempTarget.enabled) {
      // Validasi targetBalance
      if (!tempTarget.targetBalance || tempTarget.targetBalance <= 0) {
        newErrors.targetBalance = "Target balance is required and must be greater than 0";
      } else if (tempTarget.targetBalance <= safeInitialBalance) {
        newErrors.targetBalance = "Target balance must be greater than initial balance";
      }

      // Validasi targetDate
      if (!tempTarget.targetDate) {
        newErrors.targetDate = "Target date is required";
      } else {
        const today = new Date();
        const selectedDate = new Date(tempTarget.targetDate);
        if (selectedDate <= today) {
          newErrors.targetDate = "Target date must be in the future";
        }
      }
    }

    setErrors(newErrors);
    
    // Cek jika ada error
    return !Object.values(newErrors).some(error => error !== "");
  };

  const handleUpdateTarget = async () => {
    if (tempTarget.enabled && !validateForm()) {
      // Mark all fields as touched to show errors
      setTouched({
        targetBalance: true,
        targetDate: true,
      });
      return;
    }

    try {
      console.log("Updating target with data:", tempTarget);
      await dispatch(updateTarget(tempTarget)).unwrap();
      
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

  const handleClose = () => {
    // Reset loading state ketika modal ditutup
    dispatch(resetLoading());
    setShowTargetModal(false);
  };

  // Handler untuk input change dengan validasi real-time
  const handleInputChange = (field, value) => {
    setTempTarget(prev => ({
      ...prev,
      [field]: value
    }));

    // Reset error saat user mulai mengetik
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  // Handler untuk blur (ketika user keluar dari input)
  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));

    // Lakukan validasi untuk field ini
    if (tempTarget.enabled) {
      const newErrors = { ...errors };
      
      if (field === 'targetBalance') {
        if (!tempTarget.targetBalance || tempTarget.targetBalance <= 0) {
          newErrors.targetBalance = "Target balance is required and must be greater than 0";
        } else if (tempTarget.targetBalance <= safeInitialBalance) {
          newErrors.targetBalance = "Target balance must be greater than initial balance";
        } else {
          newErrors.targetBalance = "";
        }
      }
      
      if (field === 'targetDate') {
        if (!tempTarget.targetDate) {
          newErrors.targetDate = "Target date is required";
        } else {
          const today = new Date();
          const selectedDate = new Date(tempTarget.targetDate);
          if (selectedDate <= today) {
            newErrors.targetDate = "Target date must be in the future";
          } else {
            newErrors.targetDate = "";
          }
        }
      }
      
      setErrors(newErrors);
    }
  };

  // Cek apakah form valid untuk men-disable/enable button
  const isFormValid = () => {
    if (!tempTarget.enabled) return true;
    
    if (!tempTarget.targetBalance || tempTarget.targetBalance <= 0 || 
        tempTarget.targetBalance <= safeInitialBalance) {
      return false;
    }
    
    if (!tempTarget.targetDate) return false;
    
    const today = new Date();
    const selectedDate = new Date(tempTarget.targetDate);
    if (selectedDate <= today) return false;
    
    return true;
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
                onClick={() => {
                  const newEnabled = !tempTarget.enabled;
                  setTempTarget({ 
                    ...tempTarget, 
                    enabled: newEnabled 
                  });
                  // Reset errors when disabling target
                  if (!newEnabled) {
                    setErrors({
                      targetBalance: "",
                      targetDate: "",
                    });
                    setTouched({
                      targetBalance: false,
                      targetDate: false,
                    });
                  }
                }}
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
                {/* DATE-BASED TARGET ONLY */}
                <>
                  {/* Target Balance */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Target Balance
                        <span className="text-rose-500 ml-1">*</span>
                      </label>
                      {touched.targetBalance && errors.targetBalance && (
                        <div className="flex items-center gap-1 text-xs text-rose-600">
                          <AlertCircle className="w-3 h-3" />
                          <span>Required</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="number"
                      value={tempTarget.targetBalance || ""}
                      onChange={(e) => handleInputChange('targetBalance', Number(e.target.value) || 0)}
                      onBlur={() => handleBlur('targetBalance')}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all font-semibold text-slate-800 ${
                        touched.targetBalance && errors.targetBalance
                          ? "border-rose-400 bg-rose-50 focus:border-rose-500"
                          : "border-slate-200 focus:border-violet-500"
                      }`}
                      placeholder="Example: 10000000 for 10 million"
                      min="0"
                      step="1000"
                      required
                    />
                    {touched.targetBalance && errors.targetBalance && (
                      <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {errors.targetBalance}
                      </p>
                    )}
                    {!errors.targetBalance && tempTarget.targetBalance > 0 && (
                      <p className="mt-1 text-xs text-slate-500">
                        Current: {formatCompactCurrency(safeInitialBalance, currency)} → Target: {formatCompactCurrency(tempTarget.targetBalance, currency)}
                      </p>
                    )}
                  </div>

                  {/* Target Date */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Target Date
                        <span className="text-rose-500 ml-1">*</span>
                      </label>
                      {touched.targetDate && errors.targetDate && (
                        <div className="flex items-center gap-1 text-xs text-rose-600">
                          <AlertCircle className="w-3 h-3" />
                          <span>Required</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="date"
                      value={tempTarget.targetDate || ""}
                      onChange={(e) => handleInputChange('targetDate', e.target.value)}
                      onBlur={() => handleBlur('targetDate')}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all font-semibold text-slate-800 ${
                        touched.targetDate && errors.targetDate
                          ? "border-rose-400 bg-rose-50 focus:border-rose-500"
                          : "border-slate-200 focus:border-violet-500"
                      }`}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                    {touched.targetDate && errors.targetDate && (
                      <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {errors.targetDate}
                      </p>
                    )}
                    {!errors.targetDate && tempTarget.targetDate && (
                      <p className="mt-1 text-xs text-slate-500">
                        Selected: {new Date(tempTarget.targetDate).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    )}
                  </div>
                </>

                {/* Description */}
                <div>
                  <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Target Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={tempTarget.description || ""}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 transition-all font-semibold text-slate-800"
                    placeholder="Example: 10x target in 2 months"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Optional: Add a description to help you remember your target
                  </p>
                </div>

                {/* Preview */}
                <div className="p-4 bg-linear-to-br from-violet-50 to-purple-50 rounded-xl border-2 border-violet-200">
                  <h4 className="font-bold text-sm mb-3 text-slate-800 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-violet-600" />
                    Target Preview:
                  </h4>
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
                      <span className={`font-bold ${
                        (tempTarget.targetBalance || 0) - safeInitialBalance >= 0 
                          ? "text-emerald-600" 
                          : "text-rose-600"
                      }`}>
                        {formatCompactCurrency(
                          (tempTarget.targetBalance || 0) - safeInitialBalance,
                          currency
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Target Date:</span>
                      <span className="font-bold text-violet-700">
                        {tempTarget.targetDate 
                          ? new Date(tempTarget.targetDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })
                          : "Not set"
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Validation Summary */}
                {Object.values(errors).some(error => error !== "") && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                    <div className="flex items-center gap-2 text-rose-700 text-sm font-semibold">
                      <AlertCircle className="w-4 h-4" />
                      Please fix the following errors:
                    </div>
                    <ul className="mt-2 text-xs text-rose-600 space-y-1 pl-6 list-disc">
                      {errors.targetBalance && <li>Target Balance: {errors.targetBalance}</li>}
                      {errors.targetDate && <li>Target Date: {errors.targetDate}</li>}
                    </ul>
                  </div>
                )}
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
                disabled={isLoading || (tempTarget.enabled && !isFormValid())}
                className={`px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-medium flex items-center gap-2 ${
                  tempTarget.enabled && !isFormValid()
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-linear-to-r from-violet-600 to-purple-600 text-white hover:shadow-lg"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : tempTarget.enabled ? (
                  <>
                    <Save className="w-4 h-4" />
                    {isFormValid() ? "Set Target" : "Fill Required Fields"}
                  </>
                ) : (
                  "Disable"
                )}
              </Motion.button>
            </div>

            {/* Required Fields Note */}
            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <span className="text-rose-500 font-bold">*</span>
                Indicates required fields
              </p>
              {tempTarget.enabled && (
                <p className="text-xs text-slate-500 mt-1">
                  All fields except description are required when target is enabled
                </p>
              )}
            </div>
          </div>
        </div>
      </Motion.div>
    </Motion.div>
  );
};

export default TargetModal;