import React, { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [formData, setFormData] = useState({
    email: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle password reset logic here
    console.log('Password reset requested for:', formData.email);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <Motion.div
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
        <Motion.div
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
      </div>

      

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full">
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-orange-200 p-8"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <Motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-orange-500 to-amber-500 rounded-2xl shadow-lg mb-4"
              >
                <span className="text-2xl text-white">🔑</span>
              </Motion.div>
              
              <h2 className="text-3xl font-bold bg-linear-to-r from-orange-600 to-amber-700 bg-clip-text text-transparent mb-2">
                {isSubmitted ? 'Check Your Email' : 'Reset Password'}
              </h2>
              <p className="text-orange-700">
                {isSubmitted 
                  ? 'We sent a reset link to your email' 
                  : 'Enter your email to reset your password'
                }
              </p>
            </div>

            {!isSubmitted ? (
              /* Reset Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-orange-900 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-2xl focus:outline-none focus:border-orange-500 transition-all duration-300 text-orange-900 placeholder-orange-400"
                      placeholder="trader@example.com"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-orange-400">✉️</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-orange-600">
                    We'll send a password reset link to this email
                  </p>
                </div>

                {/* Submit Button */}
                <Motion.button
                  type="submit"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
                >
                  <span>Send Reset Link</span>
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                  </svg>
                </Motion.button>
              </form>
            ) : (
              /* Success Message */
              <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-center space-y-6"
              >
                {/* Success Icon */}
                <Motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full border border-emerald-200"
                >
                  <span className="text-3xl text-emerald-500">✅</span>
                </Motion.div>

                {/* Success Text */}
                <div>
                  <h3 className="text-xl font-bold text-orange-900 mb-2">
                    Reset Link Sent!
                  </h3>
                  <p className="text-orange-700">
                    We've sent a password reset link to{' '}
                    <span className="font-semibold text-orange-900">{formData.email}</span>
                  </p>
                  <p className="text-sm text-orange-600 mt-2">
                    Check your inbox and follow the instructions to reset your password.
                  </p>
                </div>

                {/* Back to Login */}
                <Motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsSubmitted(false)}
                  className="w-full bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Resend Email
                </Motion.button>
              </Motion.div>
            )}

            {/* Navigation Links */}
            <div className="mt-8 pt-6 border-t border-orange-200">
              <div className="flex flex-col space-y-3 text-center">
                <Link 
                  to="/" 
                  className="text-sm font-medium text-orange-700 hover:text-orange-500 transition-colors duration-300"
                >
                  ← Back to Sign In
                </Link>
                <p className="text-xs text-orange-600">
                  Need help?{' '}
                  <a href="mailto:support@pipsdiary.com" className="font-medium bg-linear-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent hover:from-orange-600 hover:to-amber-600 transition-all duration-300">
                    Contact Support
                  </a>
                </p>
              </div>
            </div>

            {/* Security Note */}
            {!isSubmitted && (
              <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <div className="flex items-start space-x-3">
                  <span className="text-amber-500 text-lg">🔒</span>
                  <div>
                    <h4 className="text-sm font-semibold text-amber-900 mb-1">Security Notice</h4>
                    <p className="text-xs text-amber-700">
                      For your security, the reset link will expire in 1 hour. Make sure to check your spam folder if you don't see the email.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Motion.div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;