import React from "react";
import { motion as Motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Rocket,
  Crown,
  Target,
  Check,
  Star,
  Zap,
  Shield,
  Download,
  BarChart3,
  TrendingUp,
  HelpCircle,
  Mail
} from 'lucide-react';

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
    <div className="min-h-screen py-8 px-4 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <button
            onClick={handleBack}
            className="mb-6 flex items-center text-slate-600 hover:text-slate-800 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali
          </button>
          
          <Motion.h1 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-5xl md:text-6xl font-bold text-slate-800 mb-4 flex items-center justify-center gap-4"
          >
            <Rocket className="w-12 h-12 text-violet-600" />
            Upgrade Your Trading Journey
            <Zap className="w-12 h-12 text-violet-600" />
          </Motion.h1>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light">
            Take your trading analysis to the next level with advanced features and unlimited access
          </p>

          {/* Current Plan Badge */}
          <div className="mt-6 inline-flex items-center px-6 py-3 rounded-full bg-white border-2 border-slate-200 shadow-sm">
            <span className="text-slate-700 font-medium mr-2">Current Plan:</span>
            <span className="font-bold text-slate-800 text-lg">{currentPlan.name}</span>
          </div>
        </Motion.div>

        {/* Plans Comparison */}
        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16"
        >
          {/* Free Plan */}
          <Motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            className="relative bg-white rounded-3xl p-8 shadow-sm border-2 border-slate-200 transition-all duration-300 h-full flex flex-col"
          >
            <div className="text-center mb-8 flex-1">
              <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center shadow-inner">
                <Target className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mb-3">Free</h3>
              <div className="flex items-baseline justify-center mb-6">
                <span className="text-5xl font-bold text-slate-800">Free</span>
              </div>
              
              <ul className="space-y-4 text-left">
                {subscriptionPlans.free.features.map((feature, index) => (
                  <Motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="flex items-start text-base font-medium"
                  >
                    <Check className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" />
                    <span className="text-slate-700">{feature}</span>
                  </Motion.li>
                ))}
              </ul>
            </div>

            <Motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleUpgrade("free")}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 shadow-sm ${
                currentPlan.name === "Free" 
                  ? "bg-slate-300 text-slate-700 cursor-not-allowed" 
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
              disabled={currentPlan.name === "Free"}
            >
              {currentPlan.name === "Free" ? "Current Plan" : "Downgrade"}
            </Motion.button>
          </Motion.div>

          {/* Pro Plan - Highlighted */}
          <Motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            className="relative bg-linear-to-br from-violet-50 to-purple-50 rounded-3xl p-8 shadow-sm border-2 border-violet-400 transition-all duration-300 transform h-full flex flex-col"
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-linear-to-r from-violet-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-sm flex items-center gap-2">
                <Star className="w-4 h-4" />
                Most Popular
              </span>
            </div>

            <div className="text-center mb-8 flex-1">
              <div className="w-20 h-20 mx-auto mb-6 bg-violet-100 rounded-2xl flex items-center justify-center shadow-inner">
                <Rocket className="w-8 h-8 text-violet-600" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mb-3">Pro</h3>
              <div className="flex items-baseline justify-center mb-6">
                <span className="text-5xl font-bold text-slate-800">Rp 29k</span>
                <span className="text-slate-600 ml-2 text-xl font-semibold">/month</span>
              </div>
              
              <ul className="space-y-4 text-left">
                {subscriptionPlans.pro.features.map((feature, index) => (
                  <Motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="flex items-start text-base font-medium"
                  >
                    <Check className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" />
                    <span className="text-slate-700">{feature}</span>
                  </Motion.li>
                ))}
              </ul>
            </div>

            <Motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleUpgrade("pro")}
              className={`w-full py-4 bg-linear-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-bold text-lg transition-all duration-200 shadow-sm hover:shadow-md ${
                currentPlan.name === "Pro" ? "opacity-75 cursor-not-allowed" : "hover:from-violet-700 hover:to-purple-700"
              }`}
              disabled={currentPlan.name === "Pro"}
            >
              {currentPlan.name === "Pro" ? "Current Plan" : "Upgrade to Pro"}
            </Motion.button>
          </Motion.div>

          {/* Lifetime Plan */}
          <Motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            className="relative bg-linear-to-br from-slate-50 to-slate-100 rounded-3xl p-8 shadow-sm border-2 border-amber-400 transition-all duration-300 h-full flex flex-col"
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-linear-to-r from-amber-500 to-yellow-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-sm flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Best Value
              </span>
            </div>

            <div className="text-center mb-8 flex-1">
              <div className="w-20 h-20 mx-auto mb-6 bg-amber-100 rounded-2xl flex items-center justify-center shadow-inner">
                <Crown className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mb-3">Lifetime</h3>
              <div className="flex items-baseline justify-center mb-6">
                <span className="text-5xl font-bold text-slate-800">Rp 399k</span>
              </div>
              
              <ul className="space-y-4 text-left">
                {subscriptionPlans.lifetime.features.map((feature, index) => (
                  <Motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="flex items-start text-base font-medium"
                  >
                    <Check className="w-5 h-5 text-emerald-500 mr-3 shrink-0 mt-0.5" />
                    <span className="text-slate-700 font-semibold">{feature}</span>
                  </Motion.li>
                ))}
              </ul>
            </div>

            <Motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleUpgrade("lifetime")}
              className={`w-full py-4 bg-linear-to-r from-amber-500 to-yellow-500 text-white rounded-2xl font-bold text-lg transition-all duration-200 shadow-sm hover:shadow-md ${
                currentPlan.name === "Lifetime" ? "opacity-75 cursor-not-allowed" : "hover:from-amber-600 hover:to-yellow-600"
              }`}
              disabled={currentPlan.name === "Lifetime"}
            >
              {currentPlan.name === "Lifetime" ? "Current Plan" : "Get Lifetime"}
            </Motion.button>
          </Motion.div>
        </Motion.div>

        {/* FAQ Section */}
        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-12"
        >
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-8 flex items-center justify-center gap-3">
            <HelpCircle className="w-8 h-8 text-violet-600" />
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
              <Motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                <h3 className="font-bold text-slate-800 text-lg mb-2">{faq.question}</h3>
                <p className="text-slate-700">{faq.answer}</p>
              </Motion.div>
            ))}
          </div>
        </Motion.div>

        {/* Final CTA */}
        <Motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <div className="bg-linear-to-r from-violet-600 to-purple-600 rounded-3xl p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Trading Journey?
            </h2>
            <p className="text-violet-100 text-lg mb-6 max-w-2xl mx-auto font-light">
              Join thousands of traders who have upgraded their analysis and achieved better results with our advanced tools.
            </p>
            <Motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleUpgrade("pro")}
              className="bg-white text-violet-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 mx-auto"
            >
              <Rocket className="w-5 h-5" />
              Upgrade Sekarang
            </Motion.button>
          </div>
        </Motion.div>

        {/* Footer Note */}
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-8 text-slate-600"
        >
          <p className="flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" />
            Need help deciding? <span className="font-semibold ml-1">Contact our support team</span>
          </p>
        </Motion.div>
      </div>
    </div>
  );
};

export default UpgradePage;