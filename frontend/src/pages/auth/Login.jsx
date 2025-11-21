import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from "react-router-dom";
import {
  LoginUser,
  reset,
  resendVerification,
  clearError,
} from "../../features/authSlice";
import { getDashboardPathByRole } from "../../utils/roleRoutes";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({
    email: false,
    password: false,
  });
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isSuccess, isLoading, error, message } = useSelector(
    (state) => state.auth
  );

  // Redirect effect
  useEffect(() => {
    if (user || isSuccess) {
      const path = getDashboardPathByRole(user?.role);
      navigate(path);
    }

    // Reset state hanya ketika pengguna logout
    return () => {
      dispatch(reset());
    };
  }, [user, isSuccess, dispatch, navigate]);

  // Effect untuk menampilkan modal jika error verifikasi
  useEffect(() => {
    if (
      error &&
      (error.includes("verify your email") ||
        error.includes("Please verify your email") ||
        error.includes("verification") ||
        error.includes("pending"))
    ) {
      console.log("Showing verification modal because of error:", error);
      setShowVerificationModal(true);
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFocus = (field) => {
    setIsFocused({ ...isFocused, [field]: true });
  };

  const handleBlur = (field) => {
    setIsFocused({ ...isFocused, [field]: false });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(
      LoginUser({
        email: formData.email,
        password: formData.password,
      })
    );
  };

  const handleResendVerification = () => {
    console.log("Resending verification to:", formData.email);
    dispatch(resendVerification(formData.email));
  };

  const handleCloseModal = () => {
    console.log("Closing verification modal");
    setShowVerificationModal(false);
    dispatch(clearError()); // Clear error state instead of reset
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
            ease: "easeInOut",
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
            delay: 1,
          }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl"
        />
      </div>

      {/* Verification Modal */}
      <AnimatePresence>
        {showVerificationModal && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={handleCloseModal}
          >
            <Motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="text-center mb-6">
                <Motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-2xl mb-4"
                >
                  <span className="text-3xl">📧</span>
                </Motion.div>

                <h2 className="text-2xl font-bold bg-linear-to-r from-orange-600 to-amber-700 bg-clip-text text-transparent mb-2">
                  Email Verification Required
                </h2>
                <p className="text-gray-600">
                  Please verify your email to access your trading journal
                </p>
              </div>

              {/* Modal Content */}
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                  <div className="flex items-start">
                    <div className="shrink-0">
                      <span className="text-yellow-600 text-lg">⚠️</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Check Your Email
                      </h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        We've sent a verification link to{" "}
                        <strong>{formData.email}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <div className="flex items-start">
                    <div className="shrink-0">
                      <span className="text-blue-600 text-lg">💡</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Can't find the email?
                      </h3>
                      <ul className="text-sm text-blue-700 mt-1 list-disc list-inside space-y-1">
                        <li>Check your spam or junk folder</li>
                        <li>Make sure you entered the correct email</li>
                        <li>Wait a few minutes for the email to arrive</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Success Message dari resend verification */}
                {message && (
                  <Motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl text-sm"
                  >
                    ✅ {message}
                  </Motion.div>
                )}

                {/* Error Message dari resend verification */}
                {error && error.includes("verification") && (
                  <Motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm"
                  >
                    ❌ {error}
                  </Motion.div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col space-y-3 mt-6">
                <Motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleResendVerification}
                  disabled={isLoading}
                  className="w-full bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 px-4 rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <span>Resend Verification Email</span>
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        ></path>
                      </svg>
                    </>
                  )}
                </Motion.button>

                <Motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCloseModal}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-2xl transition-all duration-300"
                >
                  Close
                </Motion.button>
              </div>

              {/* Help Text */}
              <div className="text-center mt-4">
                <p className="text-xs text-gray-500">
                  Still having trouble?{" "}
                  <Link
                    to="/contact-support"
                    className="text-orange-500 hover:text-orange-600 underline"
                    onClick={handleCloseModal}
                  >
                    Contact Support
                  </Link>
                </p>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

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
                <span className="text-2xl text-white">🔐</span>
              </Motion.div>

              <h2 className="text-3xl font-bold bg-linear-to-r from-orange-600 to-amber-700 bg-clip-text text-transparent mb-2">
                Welcome Back
              </h2>
              <p className="text-orange-700">Sign in to your trading journal</p>
            </div>

            {/* Error Message (untuk error selain verifikasi) */}
            {error &&
              !error.includes("verify your email") &&
              !error.includes("Please verify your email") &&
              !error.includes("verification") &&
              !error.includes("pending") && (
                <Motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 text-sm"
                >
                  {error}
                </Motion.div>
              )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className={`block transition-all duration-200 ${
                    isFocused.email || formData.email
                      ? "text-xs text-orange-600 mb-1"
                      : "text-sm text-orange-900 mb-2"
                  }`}
                >
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
                    onFocus={() => handleFocus("email")}
                    onBlur={() => handleBlur("email")}
                    className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-2xl focus:outline-none focus:border-orange-500 transition-all duration-300 text-orange-900 placeholder-orange-400"
                    placeholder="trader@example.com"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-orange-400">✉️</span>
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className={`block transition-all duration-200 ${
                    isFocused.password || formData.password
                      ? "text-xs text-orange-600 mb-1"
                      : "text-sm text-orange-900 mb-2"
                  }`}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => handleFocus("password")}
                    onBlur={() => handleBlur("password")}
                    className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-2xl focus:outline-none focus:border-orange-500 transition-all duration-300 text-orange-900 placeholder-orange-400 pr-12"
                    placeholder="Enter your password"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-orange-400 hover:text-orange-600 transition-colors duration-200"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 text-orange-500 bg-orange-100 border-orange-300 rounded focus:ring-orange-500 focus:ring-2"
                  />
                  <label
                    htmlFor="rememberMe"
                    className="ml-2 block text-sm text-orange-700"
                  >
                    Remember me
                  </label>
                </div>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium bg-linear-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent hover:from-orange-600 hover:to-amber-600 transition-all duration-300"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{
                  scale: isLoading ? 1 : 1.02,
                  y: isLoading ? 0 : -2,
                }}
                whileTap={{ scale: 0.98 }}
                className={`w-full bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <span>Sign In to Your Journal</span>
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
                  </>
                )}
              </Motion.button>
            </form>

            {/* Divider */}
            <div className="mt-8 mb-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-orange-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-orange-500">
                    New to PipsDiary?
                  </span>
                </div>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <Link
                to="/register"
                className="inline-flex items-center text-sm font-medium text-orange-700 hover:text-orange-500 transition-colors duration-300"
              >
                Create your trading journal
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </Link>
            </div>
          </Motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
