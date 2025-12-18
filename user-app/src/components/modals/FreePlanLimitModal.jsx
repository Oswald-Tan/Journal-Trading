import React from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Zap, Crown, X, AlertTriangle, BarChart3, CheckCircle } from "lucide-react";

const FreePlanLimitModal = ({ 
  setShowLimitModal, 
  currentEntries = 0,
  maxEntries = 30 
}) => {
  const navigate = useNavigate();
  
  const handleUpgrade = () => {
    setShowLimitModal(false);
    navigate("/upgrade");
  };

  const handleClose = () => {
    setShowLimitModal(false);
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
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full border-2 border-rose-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-rose-500 to-red-600 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Limit Reached!
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Free Plan: {currentEntries}/{maxEntries} entries
                </p>
              </div>
            </div>
            <Motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              className="text-rose-500 hover:text-rose-700 p-2 rounded-xl hover:bg-rose-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </Motion.button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Current Usage */}
            <div className="p-4 bg-linear-to-r from-rose-50 to-red-50 rounded-xl border-2 border-rose-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-rose-800">
                  Current Usage
                </div>
                <div className="px-3 py-1 bg-white border border-rose-300 rounded-full text-xs font-bold text-rose-700">
                  {currentEntries}/{maxEntries}
                </div>
              </div>
              <div className="mb-3">
                <div className="w-full bg-rose-200 rounded-full h-3">
                  <div 
                    className="bg-linear-to-r from-rose-600 to-red-600 h-3 rounded-full"
                    style={{ width: `${(currentEntries / maxEntries) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-rose-600 mt-2">
                  You've used {currentEntries} of {maxEntries} available entries
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-r from-slate-100 to-slate-200 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Free Plan Limit</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    You've reached the maximum of {maxEntries} trading entries in the Free plan.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-r from-violet-100 to-purple-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Upgrade to Pro</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Upgrade to Pro plan for unlimited trading entries and advanced features.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <Motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpgrade}
                className="w-full px-6 py-3 bg-linear-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-bold flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                View Upgrade Plans
              </Motion.button>
              
              <Motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClose}
                className="w-full px-6 py-3 border-2 border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors font-bold"
              >
                Maybe Later
              </Motion.button>
            </div>
          </div>
        </div>
      </Motion.div>
    </Motion.div>
  );
};

export default FreePlanLimitModal;