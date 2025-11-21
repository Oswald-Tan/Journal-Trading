import React from "react";
import { motion } from "framer-motion";

const UpgradeModal = ({
  upgradePlan,
  setShowUpgradeModal,
  subscriptionPlans
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl max-w-7xl w-full border-2 border-orange-200 max-h-[90vh] overflow-y-auto"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-orange-900 flex items-center gap-3">
              <span className="text-4xl">🚀</span>
              Upgrade Your Trading Journal
            </h2>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowUpgradeModal(false)}
              className="text-orange-500 hover:text-orange-700 p-2 rounded-xl hover:bg-orange-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              className="relative border-2 border-gray-300 rounded-2xl p-6 transition-all bg-white shadow-lg"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <div className="flex items-baseline justify-center mb-4">
                  <span className="text-4xl font-bold text-gray-900">Free</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start text-sm font-medium">
                  <svg className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Maksimal 30 Entri Trading</span>
                </li>
                <li className="flex items-start text-sm font-medium">
                  <svg className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Dashboard Dasar dengan Statistik Sederhana</span>
                </li>
                <li className="flex items-start text-sm font-medium">
                  <svg className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Grafik Equity Curve Dasar</span>
                </li>
                <li className="flex items-start text-sm font-medium">
                  <svg className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Export Data CSV</span>
                </li>
                <li className="flex items-start text-sm font-medium">
                  <svg className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Analytics Dasar</span>
                </li>
              </ul>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => upgradePlan("free")}
                className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-bold transition-all duration-200 shadow-md"
              >
                Current Plan
              </motion.button>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              className="relative border-2 border-orange-500 rounded-2xl p-6 transition-all bg-linear-to-br from-orange-50 to-amber-100 shadow-xl"
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                  ⭐ POPULAR
                </span>
              </div>

              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-2xl font-bold text-orange-900 mb-2">Pro</h3>
                <div className="flex items-baseline justify-center mb-4">
                  <span className="text-4xl font-bold text-orange-900">Rp 29k</span>
                  <span className="text-gray-600 ml-2 text-lg font-semibold">/bulan</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start text-sm font-medium">
                  <svg className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Unlimited Trading Entries</span>
                </li>
                <li className="flex items-start text-sm font-medium">
                  <svg className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Advanced Analytics dengan Berbagai Chart</span>
                </li>
                <li className="flex items-start text-sm font-medium">
                  <svg className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Performance Metrics Detail</span>
                </li>
                <li className="flex items-start text-sm font-medium">
                  <svg className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Analisis Instrument & Strategy</span>
                </li>
                <li className="flex items-start text-sm font-medium">
                  <svg className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Win/Loss Distribution Charts</span>
                </li>
                <li className="flex items-start text-sm font-medium">
                  <svg className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Time of Day Analysis</span>
                </li>
                <li className="flex items-start text-sm font-medium">
                  <svg className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Trade Type Performance</span>
                </li>
                <li className="flex items-start text-sm font-medium">
                  <svg className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Priority Support</span>
                </li>
                <li className="flex items-start text-sm font-medium">
                  <svg className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Update Fitur Gratis Selamanya</span>
                </li>
                <li className="flex items-start text-sm font-medium">
                  <svg className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Data Export Lengkap</span>
                </li>
                <li className="flex items-start text-sm font-medium">
                  <svg className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Backup Otomatis</span>
                </li>
              </ul>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => upgradePlan("pro")}
                className="w-full py-3 bg-linear-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Upgrade to Pro
              </motion.button>
            </motion.div>

            {/* Lifetime Plan */}
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              className="relative border-2 border-purple-500 rounded-2xl p-6 transition-all bg-linear-to-br from-purple-50 to-violet-100 shadow-xl"
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                  💎 BEST VALUE
                </span>
              </div>

              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">👑</span>
                </div>
                <h3 className="text-2xl font-bold text-purple-900 mb-2">Lifetime</h3>
                <div className="flex items-baseline justify-center mb-4">
                  <span className="text-4xl font-bold text-purple-900">Rp 399k</span>
                  <span className="text-gray-600 ml-2 text-lg font-semibold">/selamanya</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start text-sm font-medium">
                  <svg className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 font-bold">Semua Fitur Pro</span>
                </li>
                <li className="flex items-start text-sm font-medium">
                  <svg className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 font-bold">Akses Seumur Hidup</span>
                </li>
              </ul>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => upgradePlan("lifetime")}
                className="w-full py-3 bg-linear-to-r from-purple-600 to-violet-700 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get Lifetime
              </motion.button>
            </motion.div>
          </div>

          <div className="mt-8 text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUpgradeModal(false)}
              className="text-orange-600 hover:text-orange-800 font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Nanti saja
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UpgradeModal;