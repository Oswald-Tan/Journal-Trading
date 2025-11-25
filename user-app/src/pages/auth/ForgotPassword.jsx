import React, { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Key, 
  CheckCircle, 
  ArrowLeft, 
  AlertCircle,
  Send,
  Shield
} from 'lucide-react';

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
                <Key className="w-6 h-6 text-white" />
              </Motion.div>
              
              <h2 className="text-3xl font-bold bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {isSubmitted ? 'Check Your Email' : 'Reset Password'}
              </h2>
              <p className="text-slate-600 font-light">
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
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
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
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-violet-500 transition-all duration-300 text-slate-900 placeholder-slate-400 font-light"
                      placeholder="trader@example.com"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Mail className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 font-light">
                    We'll send a password reset link to this email
                  </p>
                </div>

                {/* Submit Button */}
                <Motion.button
                  type="submit"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
                >
                  <span>Send Reset Link</span>
                  <Send className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
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
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </Motion.div>

                {/* Success Text */}
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    Reset Link Sent!
                  </h3>
                  <p className="text-slate-600 font-light">
                    We've sent a password reset link to{' '}
                    <span className="font-medium text-slate-800">{formData.email}</span>
                  </p>
                  <p className="text-sm text-slate-500 mt-2 font-light">
                    Check your inbox and follow the instructions to reset your password.
                  </p>
                </div>

                {/* Back to Login */}
                <Motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsSubmitted(false)}
                  className="w-full bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Resend Email
                </Motion.button>
              </Motion.div>
            )}

            {/* Navigation Links */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex flex-col space-y-3 text-center">
                <Link 
                  to="/" 
                  className="inline-flex items-center justify-center text-sm font-medium text-violet-600 hover:text-violet-500 transition-colors duration-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Link>
                <p className="text-xs text-slate-500 font-light">
                  Need help?{' '}
                  <a href="mailto:support@pipsdiary.com" className="font-medium bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent hover:from-violet-700 hover:to-purple-700 transition-all duration-300">
                    Contact Support
                  </a>
                </p>
              </div>
            </div>

            {/* Security Note */}
            {!isSubmitted && (
              <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-900 mb-1">Security Notice</h4>
                    <p className="text-xs text-amber-700 font-light">
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