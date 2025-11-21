import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = ({ onShowTradingJournal }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    if (onShowTradingJournal) {
      onShowTradingJournal();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50 overflow-hidden relative">
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
            ease: "easeInOut"
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
            delay: 1
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
            delay: 2
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl"
        />
      </div>

      {/* Header Navigation */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50 bg-white/80 backdrop-blur-md shadow-lg rounded-full border border-orange-200"
        style={{ width: 'calc(100% - 2rem)', maxWidth: '1200px' }}
      >
        <div className="px-6 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3 cursor-pointer"
              onClick={handleGoHome}
            >
              <div className="w-8 h-8 bg-linear-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">📊</span>
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-orange-600 to-amber-700 bg-clip-text text-transparent">
                PipsDiary
              </span>
            </motion.div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {['Features', 'Dashboard', 'Pricing', 'About'].map((item) => (
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

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoHome}
              className="bg-linear-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
            >
              Back to App
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Floating Elements */}
            <motion.div
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 5, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-20 -left-20 text-6xl opacity-20"
            >
              📈
            </motion.div>
            <motion.div
              animate={{ 
                y: [0, 20, 0],
                rotate: [0, -5, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute -bottom-20 -right-20 text-6xl opacity-20"
            >
              💰
            </motion.div>
            <motion.div
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, 8, 0]
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
              className="absolute top-1/2 -right-16 text-5xl opacity-15"
            >
              📊
            </motion.div>

            {/* 404 Number */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                delay: 0.2 
              }}
              className="relative mb-8"
            >
              <h1 className="text-9xl md:text-[12rem] font-bold bg-linear-to-r from-orange-400 via-amber-500 to-yellow-500 bg-clip-text text-transparent relative">
                404
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-linear-to-r from-orange-400 via-amber-500 to-yellow-500 bg-clip-text text-transparent blur-sm"
                >
                  404
                </motion.div>
              </h1>
            </motion.div>

            {/* Main Message */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-4xl md:text-5xl font-bold text-orange-900 mb-6"
            >
              Oops! Page Not Found
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-xl text-orange-700 max-w-2xl mx-auto mb-8 leading-relaxed"
            >
              It looks like this trade didn't go as planned. The page you're looking for seems to have taken an unexpected direction.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-lg text-orange-600 mb-12 max-w-xl mx-auto"
            >
              Don't worry though - even the best traders encounter unexpected moves. Let's get you back to your trading journal.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGoHome}
                className="bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-lg font-bold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center group"
              >
                <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Back to Trading Journal
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.history.back()}
                className="bg-white text-orange-600 border-2 border-orange-200 hover:border-orange-300 text-lg font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center group"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Go Back
              </motion.button>
            </motion.div>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-orange-200 max-w-2xl mx-auto"
            >
              <h3 className="text-2xl font-bold text-orange-900 mb-6">
                While you're here, remember:
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { 
                    icon: "🎯",
                    title: "Stay Focused",
                    description: "Keep your trading goals clear"
                  },
                  { 
                    icon: "📈",
                    title: "Track Everything",
                    description: "Every trade tells a story"
                  },
                  { 
                    icon: "💡",
                    title: "Learn & Adapt",
                    description: "Every mistake is a lesson"
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="text-center p-6 bg-linear-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200 hover:border-orange-300 transition-all duration-300"
                  >
                    <div className="text-3xl mb-3">{item.icon}</div>
                    <h4 className="text-lg font-bold text-orange-900 mb-2">{item.title}</h4>
                    <p className="text-orange-700 text-sm">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Funny Trading Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="mt-8 bg-linear-to-r from-orange-100 to-amber-100 rounded-2xl p-6 border border-orange-200 max-w-md mx-auto"
            >
              <div className="flex items-center justify-center space-x-3">
                <span className="text-2xl">😅</span>
                <p className="text-orange-700 font-medium text-sm">
                  "This 404 page has better risk management than my first trading account!"
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-orange-900 text-orange-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-8 h-8 bg-linear-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-sm">📊</span>
              </div>
              <span className="text-lg font-bold text-white">PipsDiary</span>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-orange-300 text-sm">
                © {new Date().getFullYear()} PipsDiary. All rights reserved. • Even the 404s are professionally managed
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NotFoundPage;