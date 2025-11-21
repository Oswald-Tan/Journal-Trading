import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { motion as Motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { RegisterUser, reset } from "../../features/authSlice";

const RegisterPage = ({ onShowTradingJournal }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isSuccess, isLoading, isError, message } = useSelector((state) => state.auth);

  // Redirect effect setelah registrasi berhasil
  useEffect(() => {
    if (user || isSuccess) {
      navigate("/");
      
      if (onShowTradingJournal) {
        onShowTradingJournal();
      }
    }

    return () => {
      dispatch(reset());
    };
  }, [user, isSuccess, dispatch, navigate, onShowTradingJournal]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error ketika user mulai mengetik
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFocus = (field) => {
    setIsFocused({ ...isFocused, [field]: true });
  };

  const handleBlur = (field) => {
    setIsFocused({ ...isFocused, [field]: false });
  };

  const validateForm = () => {
    const errors = {};

    // Validasi nama
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Validasi email
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    // Validasi password
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    // Validasi konfirmasi password
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Validasi terms
    if (!formData.agreeToTerms) {
      errors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      dispatch(RegisterUser({ 
        name: formData.name,
        email: formData.email, 
        password: formData.password,
      }));
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    const strengthMap = {
      1: { label: 'Very Weak', color: 'bg-red-500' },
      2: { label: 'Weak', color: 'bg-orange-500' },
      3: { label: 'Fair', color: 'bg-yellow-500' },
      4: { label: 'Good', color: 'bg-blue-500' },
      5: { label: 'Strong', color: 'bg-green-500' }
    };

    return strengthMap[strength] || { strength: 0, label: '', color: '' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

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
                <span className="text-2xl text-white">🚀</span>
              </Motion.div>
              
              <h2 className="text-3xl font-bold bg-linear-to-r from-orange-600 to-amber-700 bg-clip-text text-transparent mb-2">
                Start Your Journey
              </h2>
              <p className="text-orange-700">
                Create your professional trading journal
              </p>
            </div>

            {/* Error Message */}
            {isError && (
              <Motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 text-sm"
              >
                {message}
              </Motion.div>
            )}

            {/* Success Message */}
            {isSuccess && (
              <Motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl mb-6 text-sm"
              >
                Registration successful! Redirecting...
              </Motion.div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name Field */}
              <div>
                <label 
                  htmlFor="name" 
                  className={`block transition-all duration-200 ${
                    isFocused.name || formData.name
                      ? "text-xs text-orange-600 mb-1"
                      : "text-sm text-orange-900 mb-2"
                  }`}
                >
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => handleFocus("name")}
                    onBlur={() => handleBlur("name")}
                    className={`w-full px-4 py-3 bg-orange-50 border rounded-2xl focus:outline-none transition-all duration-300 text-orange-900 placeholder-orange-400 ${
                      formErrors.name 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-orange-200 focus:border-orange-500'
                    }`}
                    placeholder="John Trader"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-orange-400">👤</span>
                  </div>
                </div>
                {formErrors.name && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>
                )}
              </div>

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
                    className={`w-full px-4 py-3 bg-orange-50 border rounded-2xl focus:outline-none transition-all duration-300 text-orange-900 placeholder-orange-400 ${
                      formErrors.email 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-orange-200 focus:border-orange-500'
                    }`}
                    placeholder="trader@example.com"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-orange-400">✉️</span>
                  </div>
                </div>
                {formErrors.email && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>
                )}
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
                    className={`w-full px-4 py-3 bg-orange-50 border rounded-2xl focus:outline-none transition-all duration-300 text-orange-900 placeholder-orange-400 pr-12 ${
                      formErrors.password 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-orange-200 focus:border-orange-500'
                    }`}
                    placeholder="Create a strong password"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-orange-400 hover:text-orange-600 transition-colors duration-200"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-orange-600">Password strength:</span>
                      <span className={`font-medium ${
                        passwordStrength.label === 'Strong' ? 'text-green-600' :
                        passwordStrength.label === 'Good' ? 'text-blue-600' :
                        passwordStrength.label === 'Fair' ? 'text-yellow-600' :
                        passwordStrength.label === 'Weak' ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.color
                        }`}
                        style={{ 
                          width: `${(passwordStrength.strength / 5) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {formErrors.password && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label 
                  htmlFor="confirmPassword" 
                  className={`block transition-all duration-200 ${
                    isFocused.confirmPassword || formData.confirmPassword
                      ? "text-xs text-orange-600 mb-1"
                      : "text-sm text-orange-900 mb-2"
                  }`}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => handleFocus("confirmPassword")}
                    onBlur={() => handleBlur("confirmPassword")}
                    className={`w-full px-4 py-3 bg-orange-50 border rounded-2xl focus:outline-none transition-all duration-300 text-orange-900 placeholder-orange-400 pr-12 ${
                      formErrors.confirmPassword 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-orange-200 focus:border-orange-500'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-orange-400 hover:text-orange-600 transition-colors duration-200"
                    >
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.confirmPassword}</p>
                )}
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  required
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className={`w-4 h-4 mt-1 rounded ${
                    formErrors.agreeToTerms
                      ? 'text-red-500 bg-red-100 border-red-300'
                      : 'text-orange-500 bg-orange-100 border-orange-300'
                  }`}
                />
                <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-orange-700">
                  I agree to the{' '}
                  <a href="#" className="font-medium bg-linear-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent hover:from-orange-600 hover:to-amber-600 transition-all duration-300">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="font-medium bg-linear-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent hover:from-orange-600 hover:to-amber-600 transition-all duration-300">
                    Privacy Policy
                  </a>
                </label>
              </div>
              {formErrors.agreeToTerms && (
                <p className="text-xs text-red-600 -mt-2">{formErrors.agreeToTerms}</p>
              )}

              {/* Submit Button */}
              <Motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02, y: isLoading ? 0 : -2 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
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
                    Creating Account...
                  </>
                ) : (
                  <>
                    <span>Create My Trading Journal</span>
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
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
                  <span className="px-2 bg-white text-orange-500">Already have an account?</span>
                </div>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <Link 
                to="/" 
                className="inline-flex items-center text-sm font-medium text-orange-700 hover:text-orange-500 transition-colors duration-300"
              >
                Sign in to your account
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            </div>
          </Motion.div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;