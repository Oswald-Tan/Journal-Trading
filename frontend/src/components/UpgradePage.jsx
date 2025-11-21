import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// Subscription plans configuration
const subscriptionPlans = {
  free: {
    name: "Free",
    maxEntries: 30,
    features: [
      "Maksimal 30 Entri Trading",
      "Dashboard Dasar dengan Statistik Sederhana",
      "Grafik Equity Curve Dasar",
      "Export Data CSV",
      "Analytics Dasar"
    ],
    price: 0,
  },
  pro: {
    name: "Pro",
    maxEntries: Infinity,
    features: [
      "Unlimited Trading Entries",
      "Advanced Analytics dengan Berbagai Chart",
      "Performance Metrics Detail",
      "Analisis Instrument & Strategy",
      "Win/Loss Distribution Charts",
      "Time of Day Analysis",
      "Trade Type Performance",
      "Priority Support",
      "Update Fitur Gratis Selamanya",
      "Data Export Lengkap",
      "Backup Otomatis"
    ],
    price: 29000,
  },
  lifetime: {
    name: "Lifetime",
    maxEntries: Infinity,
    features: [
      "Semua Fitur Pro",
      "Akses Seumur Hidup",
      "Update Gratis Selamanya",
      "Priority Support Seumur Hidup"
    ],
    price: 399000,
  },
};

const UpgradePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { subscription } = useSelector((state) => state.auth);
  
  const currentPlan = subscriptionPlans[subscription?.plan || "free"];

  const handleUpgrade = (plan) => {
    console.log(`Upgrading to ${plan} plan`);
    // TODO: Implement payment integration here
    // Untuk sekarang, kita tampilkan alert dan redirect ke dashboard
    alert(`Fitur upgrade ke ${plan} plan akan segera tersedia!`);
    navigate("/dashboard");
  };

  const handleBack = () => {
    navigate(-1); // Kembali ke halaman sebelumnya
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <button
            onClick={handleBack}
            className="mb-6 flex items-center text-orange-600 hover:text-orange-800 font-semibold transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali
          </button>
          
          <motion.h1 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-5xl md:text-6xl font-bold text-orange-900 mb-4 flex items-center justify-center gap-4"
          >
            <span className="text-6xl">🚀</span>
            Upgrade Your Trading Journey
            <span className="text-6xl">💎</span>
          </motion.h1>
          
          <p className="text-xl text-orange-700 max-w-3xl mx-auto">
            Take your trading analysis to the next level with advanced features and unlimited access
          </p>

          {/* Current Plan Badge */}
          <div className="mt-6 inline-flex items-center px-6 py-3 rounded-full bg-white border-2 border-orange-300 shadow-lg">
            <span className="text-orange-700 font-semibold mr-2">Current Plan:</span>
            <span className="font-bold text-orange-900 text-lg">{currentPlan.name}</span>
          </div>
        </motion.div>

        {/* Plans Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16"
        >
          {/* Free Plan */}
          <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            className="relative bg-white rounded-3xl p-8 shadow-2xl border-2 border-gray-300 transition-all duration-300 h-full flex flex-col"
          >
            <div className="text-center mb-8 flex-1">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center shadow-inner">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">Free</h3>
              <div className="flex items-baseline justify-center mb-6">
                <span className="text-5xl font-bold text-gray-900">Free</span>
              </div>
              
              <ul className="space-y-4 text-left">
                {subscriptionPlans.free.features.map((feature, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="flex items-start text-base font-medium"
                  >
                    <svg className="w-6 h-6 text-emerald-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleUpgrade("free")}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 shadow-lg ${
                currentPlan.name === "Free" 
                  ? "bg-gray-300 text-gray-700 cursor-not-allowed" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              disabled={currentPlan.name === "Free"}
            >
              {currentPlan.name === "Free" ? "Current Plan" : "Downgrade"}
            </motion.button>
          </motion.div>

          {/* Pro Plan - Highlighted */}
          <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            className="relative bg-linear-to-br from-orange-50 to-amber-100 rounded-3xl p-8 shadow-2xl border-2 border-orange-500 transition-all duration-300 transform h-full flex flex-col"
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-linear-to-r from-orange-500 to-amber-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                ⭐ MOST POPULAR
              </span>
            </div>

            <div className="text-center mb-8 flex-1">
              <div className="w-20 h-20 mx-auto mb-6 bg-orange-100 rounded-2xl flex items-center justify-center shadow-inner">
                <span className="text-3xl">🚀</span>
              </div>
              <h3 className="text-3xl font-bold text-orange-900 mb-3">Pro</h3>
              <div className="flex items-baseline justify-center mb-6">
                <span className="text-5xl font-bold text-orange-900">Rp 29k</span>
                <span className="text-gray-600 ml-2 text-xl font-semibold">/bulan</span>
              </div>
              
              <ul className="space-y-4 text-left">
                {subscriptionPlans.pro.features.map((feature, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="flex items-start text-base font-medium"
                  >
                    <svg className="w-6 h-6 text-emerald-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleUpgrade("pro")}
              className={`w-full py-4 bg-linear-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl ${
                currentPlan.name === "Pro" ? "opacity-75 cursor-not-allowed" : "hover:from-orange-600 hover:to-amber-600"
              }`}
              disabled={currentPlan.name === "Pro"}
            >
              {currentPlan.name === "Pro" ? "Current Plan" : "Upgrade to Pro"}
            </motion.button>
          </motion.div>

          {/* Lifetime Plan */}
          <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            className="relative bg-linear-to-br from-purple-50 to-violet-100 rounded-3xl p-8 shadow-2xl border-2 border-purple-500 transition-all duration-300 h-full flex flex-col"
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-linear-to-r from-purple-600 to-violet-700 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                💎 BEST VALUE
              </span>
            </div>

            <div className="text-center mb-8 flex-1">
              <div className="w-20 h-20 mx-auto mb-6 bg-purple-100 rounded-2xl flex items-center justify-center shadow-inner">
                <span className="text-3xl">👑</span>
              </div>
              <h3 className="text-3xl font-bold text-purple-900 mb-3">Lifetime</h3>
              <div className="flex items-baseline justify-center mb-6">
                <span className="text-5xl font-bold text-purple-900">Rp 399k</span>
                <span className="text-gray-600 ml-2 text-xl font-semibold">/selamanya</span>
              </div>
              
              <ul className="space-y-4 text-left">
                {subscriptionPlans.lifetime.features.map((feature, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="flex items-start text-base font-medium"
                  >
                    <svg className="w-6 h-6 text-emerald-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 font-semibold">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleUpgrade("lifetime")}
              className={`w-full py-4 bg-linear-to-r from-purple-600 to-violet-700 text-white rounded-2xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl ${
                currentPlan.name === "Lifetime" ? "opacity-75 cursor-not-allowed" : "hover:from-purple-700 hover:to-violet-800"
              }`}
              disabled={currentPlan.name === "Lifetime"}
            >
              {currentPlan.name === "Lifetime" ? "Current Plan" : "Get Lifetime"}
            </motion.button>
          </motion.div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-8 shadow-2xl border border-orange-200 mb-12"
        >
          <h2 className="text-3xl font-bold text-orange-900 text-center mb-8 flex items-center justify-center gap-3">
            <span className="text-4xl">❓</span>
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                question: "Apakah bisa upgrade kapan saja?",
                answer: "Ya, Anda bisa upgrade dari plan Free ke Pro atau Lifetime kapan saja. Downgrade dari Pro ke Free akan berlaku pada akhir periode billing."
              },
              {
                question: "Apakah data trading saya aman?",
                answer: "Sangat aman! Semua data trading Anda disimpan secara encrypted dan tidak akan pernah kami share ke pihak manapun."
              },
              {
                question: "Bagaimana cara pembayaran?",
                answer: "Kami menerima berbagai metode pembayaran: transfer bank, e-wallet (Gopay, OVO, Dana), dan kartu kredit."
              },
              {
                question: "Apakah ada garansi uang kembali?",
                answer: "Ya! Kami menawarkan garansi 30 hari uang kembali jika Anda tidak puas dengan layanan kami."
              },
              {
                question: "Apakah bisa trial plan Pro?",
                answer: "Saat ini kami tidak menawarkan trial, tetapi Anda bisa upgrade kapan saja dan masih ada garansi 30 hari uang kembali."
              },
              {
                question: "Fitur apa saja yang akan datang?",
                answer: "Kami terus mengembangkan fitur baru seperti copy trading, AI analysis, mobile app, dan integration dengan broker."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="p-6 bg-orange-50 rounded-2xl border border-orange-200 hover:bg-orange-100 transition-colors"
              >
                <h3 className="font-bold text-orange-900 text-lg mb-2">{faq.question}</h3>
                <p className="text-orange-700">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <div className="bg-linear-to-r from-orange-500 to-amber-500 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Trading Journey?
            </h2>
            <p className="text-orange-100 text-lg mb-6 max-w-2xl mx-auto">
              Join thousands of traders who have upgraded their analysis and achieved better results with our advanced tools.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleUpgrade("pro")}
              className="bg-white text-orange-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              🚀 Upgrade Sekarang
            </motion.button>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-8 text-orange-600"
        >
          <p>Need help deciding? <span className="font-semibold">Contact our support team</span></p>
        </motion.div>
      </div>
    </div>
  );
};

export default UpgradePage;