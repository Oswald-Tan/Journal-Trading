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
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  ArrowRight,
  Send
} from "lucide-react";

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
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-purple-50 to-indigo-50 overflow-hidden relative">
      {/* Background Effects matching landing page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* violet gradient from bottom left */}
        <div className="absolute bottom-0 left-0 w-1/2 h-3/4 bg-linear-to-t from-violet-500/30 via-violet-300/20 to-transparent blur-3xl"></div>

        {/* purple gradient from bottom right */}
        <div className="absolute bottom-0 right-0 w-1/2 h-3/4 bg-linear-to-t from-purple-500/30 via-purple-300/20 to-transparent blur-3xl"></div>

        {/* Center violet glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-2/3 bg-linear-to-t from-violet-400/15 to-transparent blur-2xl"></div>

        {/* Grain/Noise Effect */}
        <div
          className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter'%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        ></div>
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
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="text-center mb-6">
                <Motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-violet-100 rounded-2xl mb-4"
                >
                  <Mail className="w-8 h-8 text-violet-600" />
                </Motion.div>

                <h2 className="text-2xl font-bold bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Email Verification Required
                </h2>
                <p className="text-slate-600 font-light">
                  Please verify your email to access your trading journal
                </p>
              </div>

              {/* Modal Content */}
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                  <div className="flex items-start">
                    <div className="shrink-0">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Check Your Email
                      </h3>
                      <p className="text-sm text-yellow-700 mt-1 font-light">
                        We've sent a verification link to{" "}
                        <strong>{formData.email}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <div className="flex items-start">
                    <div className="shrink-0">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Can't find the email?
                      </h3>
                      <ul className="text-sm text-blue-700 mt-1 list-disc list-inside space-y-1 font-light">
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
                    className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl text-sm font-light"
                  >
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    {message}
                  </Motion.div>
                )}

                {/* Error Message dari resend verification */}
                {error && error.includes("verification") && (
                  <Motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-light"
                  >
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    {error}
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
                  className="w-full bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <span>Resend Verification Email</span>
                      <Send className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Motion.button>

                <Motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCloseModal}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-4 rounded-2xl transition-all duration-300"
                >
                  Close
                </Motion.button>
              </div>

              {/* Help Text */}
              <div className="text-center mt-4">
                <p className="text-xs text-slate-500 font-light">
                  Still having trouble?{" "}
                  <Link
                    to="/contact-support"
                    className="text-violet-600 hover:text-violet-700 underline"
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
            className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-100 p-8"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <Motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-violet-500 to-purple-500 rounded-2xl shadow-lg mb-4"
              >
                <Lock className="w-6 h-6 text-white" />
              </Motion.div>

              <h2 className="text-3xl font-bold bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Welcome Back
              </h2>
              <p className="text-slate-600 font-light">Sign in to your trading journal</p>
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
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 text-sm font-light flex items-center"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </Motion.div>
              )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className={`block transition-all duration-200 text-sm text-slate-700 mb-2 font-light`}
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
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-violet-500 transition-all duration-300 text-slate-900 placeholder-slate-400 font-light"
                    placeholder="trader@example.com"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Mail className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className={`block transition-all duration-200 text-sm text-slate-700 mb-2 font-light`}
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
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-violet-500 transition-all duration-300 text-slate-900 placeholder-slate-400 font-light pr-12"
                    placeholder="Enter your password"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                    className="w-4 h-4 text-violet-600 bg-slate-100 border-slate-300 rounded"
                  />
                  <label
                    htmlFor="rememberMe"
                    className="ml-2 block text-sm text-slate-700 font-light"
                  >
                    Remember me
                  </label>
                </div>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-violet-600 hover:text-violet-500 transition-all duration-300"
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
                className={`w-full bg-linear-to-r from-violet-600 to-violet-600 hover:from-violet-700 hover:to-violet-700 text-white font-medium py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <span>Sign In to Your Journal</span>
                    <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Motion.button>
            </form>

            {/* Divider */}
            <div className="mt-8 mb-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500 font-light">
                    New to PipsDiary?
                  </span>
                </div>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <Link
                to="/register"
                className="inline-flex items-center text-sm font-medium text-violet-600 hover:text-violet-500 transition-colors duration-300"
              >
                Create your trading journal
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </Motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;