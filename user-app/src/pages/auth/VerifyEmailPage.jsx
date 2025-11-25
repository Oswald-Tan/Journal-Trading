// components/VerifyEmailPage.js
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { verifyEmail, resendVerification } from "../../features/authSlice";
import { 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ArrowRight,
  Send,
  Shield
} from 'lucide-react';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [email, setEmail] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [isFocused, setIsFocused] = useState({ email: false });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, isSuccess, isError, error, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (token) {
      console.log("Dispatching verifyEmail with token:", token);
      dispatch(verifyEmail(token))
        .unwrap()
        .then((result) => {
          console.log("Verify email success:", result);
        })
        .catch((error) => {
          console.log("Verify email error payload:", error);
        });
    }
  }, [token, dispatch]);

  // Validasi format email
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    // Clear errors ketika user mengetik
    if (formErrors.email) {
      setFormErrors({ ...formErrors, email: '' });
    }
  };

  const handleFocus = (field) => {
    setIsFocused({ ...isFocused, [field]: true });
  };

  const handleBlur = (field) => {
    setIsFocused({ ...isFocused, [field]: false });
  };

  const handleResendVerification = (e) => {
    e.preventDefault();
    
    // Validasi frontend
    const errors = {};
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    console.log("Dispatching resendVerification for email:", email);
    dispatch(resendVerification(email))
      .unwrap()
      .then((result) => {
        console.log("Resend verification success:", result);
      })
      .catch((error) => {
        console.log("Resend verification error:", error);
      });
  };

  // Tampilkan loading/result untuk verifikasi token
  if (token) {
    if (isSuccess) {
      // Success case - email verified
      return (
        <div className="min-h-screen bg-linear-to-br from-violet-50 via-purple-50 to-indigo-50 overflow-hidden relative">
          {/* Background Effects matching login page */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute bottom-0 left-0 w-1/2 h-3/4 bg-linear-to-t from-violet-500/30 via-violet-300/20 to-transparent blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-1/2 h-3/4 bg-linear-to-t from-purple-500/30 via-purple-300/20 to-transparent blur-3xl"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-2/3 bg-linear-to-t from-violet-400/15 to-transparent blur-2xl"></div>
            <div
              className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter'%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
              }}
            ></div>
          </div>

          <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-md w-full">
              <Motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-100 p-8 text-center"
              >
                <Motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-2xl mb-6 border border-emerald-200"
                >
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </Motion.div>

                <h2 className="text-3xl font-bold bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  Email Verified!
                </h2>
                
                <p className="text-slate-600 font-light mb-2">
                  Your email has been successfully verified
                </p>
                <p className="text-slate-500 text-sm font-light mb-8">
                  {message || "You can now access all features of your trading journal"}
                </p>

                <Motion.button
                  onClick={() => navigate("/")}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
                >
                  <span>Continue to Login</span>
                  <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </Motion.button>
              </Motion.div>
            </div>
          </div>
        </div>
      );
    }

    // Still loading or error case for token verification
    return (
      <div className="min-h-screen bg-linear-to-br from-violet-50 via-purple-50 to-indigo-50 overflow-hidden relative">
        {/* Background Effects matching login page */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-0 w-1/2 h-3/4 bg-linear-to-t from-violet-500/30 via-violet-300/20 to-transparent blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-3/4 bg-linear-to-t from-purple-500/30 via-purple-300/20 to-transparent blur-3xl"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-2/3 bg-linear-to-t from-violet-400/15 to-transparent blur-2xl"></div>
          <div
            className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter'%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
            }}
          ></div>
        </div>

        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-md w-full">
            <Motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-100 p-8 text-center"
            >
              <Motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-2xl mb-6 border border-amber-200"
              >
                {isLoading ? (
                  <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                ) : (
                  <AlertCircle className="w-10 h-10 text-amber-500" />
                )}
              </Motion.div>

              <h2 className="text-3xl font-bold bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-4">
                {isLoading ? "Verifying Email..." : "Verification Failed"}
              </h2>

              {isError && (
                <div className="mb-6">
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-4 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {error || "Invalid or expired verification token"}
                  </div>
                  
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                    <p className="text-amber-800 text-sm font-light mb-3">
                      Need a new verification link?
                    </p>
                    <Link
                      to="/verify-email"
                      className="text-amber-600 hover:text-amber-700 font-medium underline text-sm"
                    >
                      Click here to request a new one
                    </Link>
                  </div>
                </div>
              )}

              <Motion.button
                onClick={() => navigate("/")}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Back to Login
              </Motion.button>
            </Motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Default case - no token, show resend form
  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-purple-50 to-indigo-50 overflow-hidden relative">
      {/* Background Effects matching login page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-0 w-1/2 h-3/4 bg-linear-to-t from-violet-500/30 via-violet-300/20 to-transparent blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-3/4 bg-linear-to-t from-purple-500/30 via-purple-300/20 to-transparent blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-2/3 bg-linear-to-t from-violet-400/15 to-transparent blur-2xl"></div>
        <div
          className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter'%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        ></div>
      </div>

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
                <Mail className="w-6 h-6 text-white" />
              </Motion.div>

              <h2 className="text-3xl font-bold bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Verify Your Email
              </h2>
              <p className="text-slate-600 font-light">
                Enter your email to resend the verification link
              </p>
            </div>

            {/* Success Message */}
            <AnimatePresence>
              {isSuccess && message && (
                <Motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl mb-6 flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {message}
                </Motion.div>
              )}
            </AnimatePresence>

            {/* Error Message dari backend */}
            <AnimatePresence>
              {isError && error && (
                <Motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 flex items-center"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </Motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleResendVerification} className="space-y-6">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className={`block transition-all duration-200 ${
                    isFocused.email || email
                      ? "text-xs text-violet-600 mb-1 font-medium"
                      : "text-sm text-slate-700 mb-2 font-light"
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
                    value={email}
                    onChange={handleEmailChange}
                    onFocus={() => handleFocus("email")}
                    onBlur={() => handleBlur("email")}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl focus:outline-none transition-all duration-300 text-slate-900 placeholder-slate-400 font-light ${
                      formErrors.email 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-slate-200 focus:border-violet-500'
                    }`}
                    placeholder="trader@example.com"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Mail className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
                {/* Tampilkan error validasi frontend */}
                {formErrors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center font-light">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {formErrors.email}
                  </p>
                )}
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
                className={`w-full bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                    Sending...
                  </>
                ) : (
                  <>
                    <span>Resend Verification Email</span>
                    <Send className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Motion.button>
            </form>

            {/* Security Note */}
            <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-200">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-900 mb-1">Verification Required</h4>
                  <p className="text-xs text-amber-700 font-light">
                    You need to verify your email before accessing your trading journal. 
                    Check your spam folder if you don't see the email.
                  </p>
                </div>
              </div>
            </div>

            {/* Back to Login */}
            <div className="mt-6 pt-6 border-t border-slate-200 text-center">
              <Link 
                to="/" 
                className="inline-flex items-center text-sm font-medium text-violet-600 hover:text-violet-500 transition-colors duration-300"
              >
                Back to Sign In
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </Motion.div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;