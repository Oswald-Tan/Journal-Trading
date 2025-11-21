import { motion as Motion, AnimatePresence  } from 'framer-motion';
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { formatCompactCurrency } from '../utils/currencyFormatter';
import GradientLogo from "../assets/gradient_logo.png";
import { LogOut, reset } from "../features/authSlice";
import Swal from "sweetalert2";

const Header = ({
  activeTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  showUserMenu,
  setShowUserMenu,
  stats,
  target,
  targetProgress,
  user,
  onShowLanding,
  onShowBalanceModal,
  onShowTargetModal,
  onShowUpgradeModal,
  onProfileSettings
}) => {
  const { currency } = useSelector((state) => state.balance);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Ambil data subscription dari Redux store
  const { subscription: reduxSubscription } = useSelector((state) => state.subscription);

  // Gabungkan subscription dari props dan Redux store, dengan fallback ke free
  const actualSubscription = reduxSubscription || { plan: 'free' };

  // Tentukan currentPlan berdasarkan subscription
  const currentPlan = {
    name: actualSubscription.plan ? 
      actualSubscription.plan.charAt(0).toUpperCase() + actualSubscription.plan.slice(1) : 
      'Free'
  };

  // Navigation tabs dengan Link
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
    { id: 'trades', label: 'Trades', path: '/trades' },
    { id: 'calculator', label: 'Calculator', path: '/calculator' },
    { id: 'analytics', label: 'Analytics', path: '/analytics' },
    { id: 'performance', label: 'Performance', path: '/performance' },
    { id: 'targets', label: 'Targets', path: '/targets' },
  ];

  const handleLogout = async () => {
    Swal.fire({
      title: "Konfirmasi Logout",
      text: "Apakah Anda yakin ingin logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#f97316",
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(LogOut());
        dispatch(reset());
        navigate("/");
      }
    });
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b-2 border-gray-100 sticky top-0 z-40">
      <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo dan Brand */}
          <div className="flex items-center space-x-4">
            <Motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onShowLanding}
              className="text-2xl font-bold bg-linear-to-r from-orange-600 to-amber-700 bg-clip-text text-transparent flex items-center gap-2"
            >
              <img src={GradientLogo} alt="Logo" className="w-12" />
              PipsDiary
            </Motion.button>
            
            {/* Desktop Navigation dengan Link */}
            <nav className="hidden md:flex space-x-2">
              {tabs.map(tab => (
                <Motion.div
                  key={tab.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={tab.path}
                    className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 flex items-center space-x-2 ${
                      activeTab === tab.id 
                        ? 'text-orange-400' 
                        : 'text-orange-700 hover:text-orange-900'
                    }`}
                  >
                    <span>{tab.label}</span>
                  </Link>
                </Motion.div>
              ))}
            </nav>
          </div>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Quick Stats */}
            <div className="flex items-center space-x-4">
              {/* Balance Display */}
              <Motion.div 
                whileHover={{ scale: 1.05, y: -2 }}
                onClick={onShowBalanceModal}
                className="cursor-pointer"
              >
                <div className="text-xs text-orange-700 font-bold">Balance</div>
                <div className="font-bold text-orange-900 text-lg">
                  {formatCompactCurrency(stats.currentBalance, currency)}
                </div>
              </Motion.div>

              {target.enabled && targetProgress && (
                <Motion.div 
                  whileHover={{ scale: 1.05, y: -2 }}
                  onClick={onShowTargetModal}
                  className="cursor-pointer"
                >
                  <div className="text-xs text-emerald-700 font-bold">Target Progress</div>
                  <div className="font-bold text-emerald-900 text-lg">
                    {targetProgress.progress.toFixed(1)}%
                  </div>
                </Motion.div>
              )}
            </div>

            {/* Subscription Status - Hanya tampilkan upgrade button untuk plan free */}
            {actualSubscription.plan === "free" && (
              <div>
                <Motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/upgrade")}
                  className="cursor-pointer bg-linear-to-r from-orange-500 to-amber-500 text-white px-5 py-2 rounded-xl hover:shadow-lg transition-all duration-200 font-bold border-2 border-orange-400/50"
                >
                  🚀 Upgrade
                </Motion.button>
              </div>
            )}

            {/* User Profile Dropdown */}
            <div className="relative user-menu-container">
              <Motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg transition-all duration-200 border-2 border-orange-400/50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Motion.button>

              {/* User Menu Popup */}
              <AnimatePresence>
                {showUserMenu && (
                  <Motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-orange-200 overflow-hidden z-50"
                  >
                    {/* User Info Header */}
                    <div className="p-4 border-b border-orange-200 bg-linear-to-r from-orange-50 to-amber-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-r from-orange-500 to-amber-500 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-orange-900 truncate">
                            {user?.name || 'User'}
                          </p>
                          <p className="text-xs text-orange-700 truncate">
                            {user?.email || 'user@example.com'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2 space-y-1">
                      {/* Profile Menu */}
                      <Motion.button
                        whileHover={{ x: 5, backgroundColor: "rgba(249, 115, 22, 0.1)" }}
                        className="w-full text-left px-4 py-3 rounded-xl text-sm text-orange-900 hover:text-orange-700 transition-all duration-200 flex items-center space-x-3"
                        onClick={onProfileSettings}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Profile Settings</span>
                      </Motion.button>

                      {/* Balance Info in Menu */}
                      <div className="px-4 py-3 rounded-xl bg-linear-to-r from-orange-50 to-amber-100 border border-orange-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-orange-800">Current Balance</span>
                          <span className="text-xs font-bold text-orange-900 bg-orange-200 px-2 py-1 rounded-full">
                            {formatCompactCurrency(stats.currentBalance, currency)}
                          </span>
                        </div>
                        <div className="text-xs text-orange-600">
                          Initial: {formatCompactCurrency(stats.initialBalance, currency)}
                        </div>
                      </div>

                      {/* Plan Info - Data dari subscription slice */}
                      <div className="px-4 py-3 rounded-xl bg-linear-to-r from-gray-50 to-gray-100 border border-gray-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-gray-700">Current Plan</span>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            actualSubscription.plan === "free" 
                              ? "bg-gray-200 text-gray-700" 
                              : "bg-emerald-200 text-emerald-700"
                          }`}>
                            {currentPlan.name}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {actualSubscription.plan === "free" 
                            ? "Upgrade for advanced features" 
                            : "Premium features active"}
                        </div>
                      </div>

                      {/* Upgrade Button in Menu - Hanya untuk plan free */}
                      {actualSubscription.plan === "free" && (
                        <Motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full px-4 py-3 rounded-xl bg-linear-to-r from-orange-500 to-amber-500 text-white text-sm font-bold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                          onClick={() => {
                            setShowUserMenu(false);
                            onShowUpgradeModal();
                          }}
                        >
                          <span>🚀 Upgrade Plan</span>
                        </Motion.button>
                      )}

                      {/* Update Balance Button */}
                      <Motion.button
                        whileHover={{ x: 5, backgroundColor: "rgba(34, 197, 94, 0.1)" }}
                        className="w-full text-left px-4 py-3 rounded-xl text-sm text-emerald-600 hover:text-emerald-700 transition-all duration-200 flex items-center space-x-3"
                        onClick={() => {
                          setShowUserMenu(false);
                          onShowBalanceModal();
                        }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Update Balance</span>
                      </Motion.button>

                      {/* Divider */}
                      <div className="border-t border-orange-200 my-2"></div>

                      {/* Logout Button - MENGGUNAKAN handleLogout LOKAL */}
                      <Motion.button
                        whileHover={{ x: 5, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                        className="w-full text-left px-4 py-3 rounded-xl text-sm text-red-600 hover:text-red-700 transition-all duration-200 flex items-center space-x-3"
                        onClick={() => {
                          setShowUserMenu(false);
                          handleLogout();
                        }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                      </Motion.button>
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-xl hover:bg-orange-100 text-orange-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation dengan Link */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <Motion.nav 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/80 backdrop-blur-md border-t-2 border-orange-200"
          >
            <div className="px-4 py-3 space-y-2">
              {tabs.map(tab => (
                <Motion.div
                  key={tab.id}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link
                    to={tab.path}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center space-x-3 transition-all ${
                      activeTab === tab.id 
                        ? 'bg-linear-to-r from-orange-500 to-amber-500 text-white shadow-lg' 
                        : 'text-orange-700 hover:bg-orange-100 border-2 border-orange-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                  </Link>
                </Motion.div>
              ))}
              
              {/* Mobile User Info */}
              <div className="pt-3 border-t-2 border-orange-200">
                <div className="flex items-center space-x-3 p-4 bg-linear-to-br from-orange-100 to-amber-100 rounded-2xl border-2 border-orange-200 mb-3">
                  <div className="w-12 h-12 rounded-full bg-linear-to-r from-orange-500 to-amber-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-orange-900">{user?.name || 'User'}</p>
                    <p className="text-sm text-orange-700">{user?.email || 'user@example.com'}</p>
                    {/* Plan info dari subscription slice */}
                    <p className="text-xs text-orange-600 mt-1">{currentPlan.name} Plan</p>
                  </div>
                </div>

                {/* Mobile Quick Stats */}
                <div className="grid grid-cols-2 gap-3 p-4 bg-linear-to-br from-orange-100 to-amber-100 rounded-2xl border-2 border-orange-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-900">
                      {formatCompactCurrency(stats.currentBalance, currency)}
                    </div>
                    <div className="text-xs text-orange-700 font-semibold">Balance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-700">{stats.winRate}%</div>
                    <div className="text-xs text-emerald-600 font-semibold">Win Rate</div>
                  </div>
                </div>

                {/* Mobile Upgrade Button - Hanya untuk plan free */}
                {actualSubscription.plan === "free" && (
                  <Motion.button
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onShowUpgradeModal();
                    }}
                    className="w-full mb-3 px-4 py-3 rounded-xl bg-linear-to-r from-orange-500 to-amber-500 text-white font-bold flex items-center justify-center space-x-2 border-2 border-orange-400"
                  >
                    <span>🚀 Upgrade Plan</span>
                  </Motion.button>
                )}

                {/* Mobile Update Balance Button */}
                <Motion.button
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onShowBalanceModal();
                  }}
                  className="w-full mb-3 px-4 py-3 rounded-xl bg-emerald-500 text-white font-bold flex items-center justify-center space-x-2 border-2 border-emerald-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Update Balance</span>
                </Motion.button>

                {/* Mobile Logout Button - MENGGUNAKAN handleLogout LOKAL */}
                <Motion.button
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-red-500 text-white font-bold flex items-center justify-center space-x-2 border-2 border-red-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </Motion.button>
              </div>
            </div>
          </Motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;