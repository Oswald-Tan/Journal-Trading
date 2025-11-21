import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GradientLogo from "../assets/gradient_logo.png";

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Cek status login
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("http://localhost:8082/api/v1/auth/me", {
          method: "GET",
          credentials: "include", // Penting untuk mengirim session cookie
        });

        if (response.ok) {
          const userData = await response.json();
          setIsLoggedIn(true);
          setUser(userData);
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    checkAuthStatus();
  }, []);

  // Handle scroll effect (existing code)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle navigation to dashboard
  const handleGoToDashboard = () => {
    window.location.href = "http://localhost:5173/dashboard"; // URL aplikasi dashboard
  };

  const handleLogin = () => {
    window.location.href = "http://localhost:5173/login";
  };

  const handleRegister = () => {
    window.location.href = "http://localhost:5173/register";
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50 overflow-hidden">
      {/* Enhanced Hero Section with Floating Header */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Floating Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`absolute top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
            isScrolled
              ? "bg-white/90 backdrop-blur-md shadow-lg"
              : "bg-white/80 backdrop-blur-md shadow-lg"
          } rounded-full border border-orange-200`}
          style={{ width: "calc(100% - 2rem)", maxWidth: "1200px" }}
        >
          <div className="px-6 py-3">
            <div className="flex justify-between items-center">
              {/* Logo */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <img src={GradientLogo} alt="Logo" className="w-9" />
                <span className="text-xl font-semibold bg-linear-to-r from-orange-600 to-amber-700 bg-clip-text text-transparent">
                  PipsDiary
                </span>
              </motion.div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                {["Features", "Dashboard", "Pricing", "About"].map((item) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    whileHover={{ y: -2 }}
                    className="font-medium transition-all duration-200 text-orange-700 hover:text-orange-500 text-sm"
                  >
                    {item}
                  </motion.a>
                ))}
              </nav>

              {/* CTA Buttons - MODIFIED SECTION */}
              <div className="flex items-center space-x-3">
                {isLoggedIn ? (
                  // Tampilkan ini jika user sudah login
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="font-medium transition-all duration-200 text-orange-700 hover:text-orange-500 text-sm"
                    >
                      Hi, {user?.name || "User"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleGoToDashboard}
                      className="bg-linear-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
                    >
                      Go to Dashboard
                    </motion.button>
                  </>
                ) : (
                  // Tampilkan ini jika user belum login
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="hidden md:block font-medium transition-all duration-200 text-orange-700 hover:text-orange-500 text-sm"
                      onClick={handleLogin}
                    >
                      Sign In
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-linear-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
                      onClick={handleRegister}
                    >
                      Get Started
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.header>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-orange-400/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.1, 1, 1.1],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl"
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-orange-400/10 via-amber-400/10 to-yellow-400/10"></div>

        <div className="relative max-w-7xl mx-auto text-center z-10 mt-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
            >
              <span className="bg-linear-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                Master Your
              </span>
              <br />
              <span className="bg-linear-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
                Trading Journey
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-lg text-orange-700 max-w-2xl mx-auto mb-10"
            >
              Join thousands of successful traders who use PipsDiary to track,
              analyze, and optimize their trading strategies for consistent
              profits.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRegister}
                className="bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-lg font-bold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center group"
              >
                <span>Start Journaling Free</span>
                <svg
                  className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  ></path>
                </svg>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-orange-600 border-2 border-orange-200 hover:border-orange-300 text-lg font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center group"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="text-sm text-orange-600 mb-4"
            >
              No credit card required • 30-day free trial • Setup in 2 minutes
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center text-orange-600"
          >
            <span className="text-sm font-medium mb-2">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-orange-400 rounded-full flex justify-center">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1 h-3 bg-orange-500 rounded-full mt-2"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Background decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-white to-transparent"></div>
      </section>
      {/* Rest of the sections remain exactly the same */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-orange-900 mb-6">
              Everything You Need to Master Your Trading
            </h2>
            <p className="text-xl text-orange-700 max-w-3xl mx-auto">
              Professional tools that help you track, analyze, and improve your
              trading performance
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "📝",
                title: "Easy Trade Tracking",
                description:
                  "Quickly log your trades with all the details that matter - entry, exit, strategy, emotions, and more.",
              },
              {
                icon: "📊",
                title: "Advanced Analytics",
                description:
                  "Deep insights into your performance with win rates, profit factors, and detailed metrics.",
              },
              {
                icon: "🎯",
                title: "Goal Setting",
                description:
                  "Set and track trading targets with progress monitoring and milestone achievements.",
              },
              {
                icon: "📈",
                title: "Performance Charts",
                description:
                  "Visualize your equity curve, monthly performance, and trading patterns.",
              },
              {
                icon: "💼",
                title: "Risk Management",
                description:
                  "Monitor your risk exposure, profit factors, and trading consistency.",
              },
              {
                icon: "📱",
                title: "Always Accessible",
                description:
                  "Access your trading journal anywhere, anytime with cloud synchronization.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="bg-linear-to-br from-orange-50 to-amber-50 p-8 rounded-3xl border border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-orange-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-orange-700">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Dashboard Preview */}
      <section
        id="dashboard"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-orange-100 to-amber-100"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-orange-900 mb-6">
              Professional Trading Dashboard
            </h2>
            <p className="text-xl text-orange-700 max-w-3xl mx-auto">
              Get a complete overview of your trading performance with our
              intuitive dashboard
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-orange-200"
          >
            <div className="bg-linear-to-r from-orange-500 to-amber-500 p-4 flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <div className="text-white text-sm font-medium flex-1 text-center">
                PipsDiary Trading Dashboard
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Stats Preview */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-orange-900 mb-4">
                    Your Trading Overview
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Win Rate", value: "68%", trend: "📈 +5%" },
                      {
                        label: "Total Profit",
                        value: "Rp 2.5M",
                        trend: "💰 +12%",
                      },
                      {
                        label: "Total Trades",
                        value: "142",
                        trend: "📊 28/mo",
                      },
                      {
                        label: "Avg. Profit",
                        value: "Rp 17.6K",
                        trend: "🎯 Consistent",
                      },
                    ].map((stat, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        className="bg-linear-to-br from-orange-50 to-amber-50 p-4 rounded-2xl border border-orange-200"
                      >
                        <div className="text-sm text-orange-700 font-medium">
                          {stat.label}
                        </div>
                        <div className="text-xl font-bold text-orange-900">
                          {stat.value}
                        </div>
                        <div className="text-xs text-orange-600 mt-1">
                          {stat.trend}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="bg-linear-to-br from-orange-100 to-amber-100 p-4 rounded-2xl border border-orange-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-orange-800 font-bold">
                        Target Progress
                      </span>
                      <span className="text-orange-600 text-sm">
                        75% Complete
                      </span>
                    </div>
                    <div className="w-full bg-orange-200 rounded-full h-3">
                      <div className="bg-linear-to-r from-orange-500 to-amber-500 h-3 rounded-full w-3/4"></div>
                    </div>
                    <div className="flex justify-between text-xs text-orange-700 mt-1">
                      <span>Rp 5M</span>
                      <span>Rp 20M</span>
                    </div>
                  </div>
                </div>

                {/* Chart Preview */}
                <div className="bg-linear-to-br from-orange-50 to-amber-50 p-6 rounded-2xl border border-orange-200">
                  <h4 className="text-lg font-bold text-orange-900 mb-4">
                    Equity Growth
                  </h4>
                  <div className="h-48 bg-white rounded-xl border border-orange-200 flex items-end justify-between p-4">
                    {[30, 45, 60, 55, 75, 80, 90].map((height, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className="w-6 bg-linear-to-t from-orange-400 to-amber-400 rounded-t-lg"
                          style={{ height: `${height}%` }}
                        ></div>
                        <div className="text-xs text-orange-700 mt-1">
                          W{index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Pricing Section - MODIFIED */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-orange-900 mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-orange-700 max-w-3xl mx-auto">
              Start for free, upgrade as you grow. No hidden fees, no surprises.
            </p>
          </motion.div>

          {/* Plans Comparison - SAME AS UPGRADE PAGE */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
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
                  {[
                    "Maksimal 30 Entri Trading",
                    "Dashboard Dasar dengan Statistik Sederhana",
                    "Grafik Equity Curve Dasar",
                    "Export Data CSV",
                    "Analytics Dasar",
                  ].map((feature, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className="flex items-start text-base font-medium"
                    >
                      <svg
                        className="w-6 h-6 text-emerald-500 mr-3 shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRegister}
                className="w-full py-4 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-2xl font-bold text-lg transition-all duration-200 shadow-lg"
              >
                Get Started Free
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
                  <span className="text-5xl font-bold text-orange-900">
                    Rp 29k
                  </span>
                  <span className="text-gray-600 ml-2 text-xl font-semibold">
                    /bulan
                  </span>
                </div>

                <ul className="space-y-4 text-left">
                  {[
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
                    "Backup Otomatis",
                  ].map((feature, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      className="flex items-start text-base font-medium"
                    >
                      <svg
                        className="w-6 h-6 text-emerald-500 mr-3 shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRegister}
                className="w-full py-4 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Start Free Trial
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
                <h3 className="text-3xl font-bold text-purple-900 mb-3">
                  Lifetime
                </h3>
                <div className="flex items-baseline justify-center mb-6">
                  <span className="text-5xl font-bold text-purple-900">
                    Rp 399k
                  </span>
                  <span className="text-gray-600 ml-2 text-xl font-semibold">
                    /selamanya
                  </span>
                </div>

                <ul className="space-y-4 text-left">
                  {[
                    "Semua Fitur Pro",
                    "Akses Seumur Hidup",
                    "Update Gratis Selamanya",
                    "Priority Support Seumur Hidup",
                  ].map((feature, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className="flex items-start text-base font-medium"
                    >
                      <svg
                        className="w-6 h-6 text-emerald-500 mr-3 shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-700 font-semibold">
                        {feature}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRegister}
                className="w-full py-4 bg-linear-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white rounded-2xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get Lifetime
              </motion.button>
            </motion.div>
          </motion.div>

          {/* FAQ Section - SAME AS UPGRADE PAGE */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
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
                  answer:
                    "Ya, Anda bisa upgrade dari plan Free ke Pro atau Lifetime kapan saja. Downgrade dari Pro ke Free akan berlaku pada akhir periode billing.",
                },
                {
                  question: "Apakah data trading saya aman?",
                  answer:
                    "Sangat aman! Semua data trading Anda disimpan secara encrypted dan tidak akan pernah kami share ke pihak manapun.",
                },
                {
                  question: "Bagaimana cara pembayaran?",
                  answer:
                    "Kami menerima berbagai metode pembayaran: transfer bank, e-wallet (Gopay, OVO, Dana), dan kartu kredit.",
                },
                {
                  question: "Apakah ada garansi uang kembali?",
                  answer:
                    "Ya! Kami menawarkan garansi 30 hari uang kembali jika Anda tidak puas dengan layanan kami.",
                },
                {
                  question: "Apakah bisa trial plan Pro?",
                  answer:
                    "Saat ini kami tidak menawarkan trial, tetapi Anda bisa upgrade kapan saja dan masih ada garansi 30 hari uang kembali.",
                },
                {
                  question: "Fitur apa saja yang akan datang?",
                  answer:
                    "Kami terus mengembangkan fitur baru seperti copy trading, AI analysis, mobile app, dan integration dengan broker.",
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="p-6 bg-orange-50 rounded-2xl border border-orange-200 hover:bg-orange-100 transition-colors"
                >
                  <h3 className="font-bold text-orange-900 text-lg mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-orange-700">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-center mt-12"
          >
            <p className="text-orange-700">
              All plans include a 30-day free trial of premium features. No
              credit card required.
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-orange-500 via-amber-500 to-yellow-500">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Trading?
            </h2>
            <p className="text-xl text-orange-100 mb-10 max-w-2xl mx-auto">
              Join thousands of traders who have improved their performance with
              PipsDiary
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogin}
                className="bg-white text-orange-600 text-lg font-bold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300"
              >
                Start Your Free Journal
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-transparent border-2 border-white text-white text-lg font-bold px-8 py-4 rounded-2xl hover:bg-white/10 transition-all duration-300"
              >
                Watch Demo
              </motion.button>
            </div>

            <div className="mt-8 text-orange-100 text-sm">
              <p>No credit card required • Setup in less than 2 minutes</p>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-orange-900 text-orange-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <span className="text-2xl font-bold text-white">PipsDiary</span>
              </div>
              <p className="text-orange-200 max-w-md">
                Professional trading journal software designed to help traders
                improve performance through detailed tracking and analysis.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2">
                {["Features", "Pricing", "Use Cases", "Updates"].map(
                  (item, index) => (
                    <li key={index}>
                      <a
                        href="#"
                        className="text-orange-200 hover:text-white transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                {["About", "Blog", "Careers", "Contact"].map((item, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-orange-200 hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-orange-800 mt-12 pt-8 text-center text-orange-300">
            <p>© {new Date().getFullYear()} PipsDiary. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
