import { motion as Motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { HiMenuAlt2 } from "react-icons/hi";
import { formatCompactCurrency } from "../utils/currencyFormatter";
import GradientLogo from "../assets/gradient_logo.png";
import { LogOut, reset } from "../features/authSlice";
import Swal from "sweetalert2";
import { useSubscription } from "../hooks/useSubscription";
import { useSidebar } from "../context/useSidebar";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Header = ({
  stats,
  target,
  targetProgress,
  user,
  onShowBalanceModal,
  onShowTargetModal,
  onShowUpgradeModal,
  onProfileSettings,
  subscription: propsSubscription,
  currentPlan: propsCurrentPlan,
  showUserMenu,
  setShowUserMenu, // Tambahkan props ini
}) => {
  const { currency } = useSelector((state) => state.balance);
  const dispatch = useDispatch();
  const { toggleSidebar } = useSidebar();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Gunakan useSubscription hook
  const { subscription: reduxSubscription, isLoading: subscriptionLoading } =
    useSubscription(true);

  // Gabungkan subscription dari props dan Redux store
  const actualSubscription = reduxSubscription || { plan: "free" };

  // Tentukan currentPlan berdasarkan subscription
  const currentPlan = propsCurrentPlan || {
    name: actualSubscription.plan
      ? actualSubscription.plan.charAt(0).toUpperCase() +
        actualSubscription.plan.slice(1)
      : "Free",
  };

  // Handle click outside untuk menutup dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowUserMenu]);

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

  // Tampilkan loading jika subscription masih loading
  if (subscriptionLoading && !propsSubscription) {
    return (
      <div className="sticky top-0 z-50">
        <header className="bg-white">
          <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold bg-linear-to-r from-violet-600 to-purple-700 bg-clip-text text-transparent flex items-center gap-2">
                  <img src={GradientLogo} alt="Logo" className="w-10" />
                  Pips Diary
                </div>
              </div>
              <div className="animate-pulse bg-violet-200 h-8 w-24 rounded-xl"></div>
            </div>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-50">
      {/* TOP HEADER - Toggle Sidebar, Balance, Target Progress, Upgrade, Profile */}
      <header className="bg-white">
        <div className="">
          <div className="flex justify-between items-center h-16">
            {/* Toggle Sidebar */}
            <button
                className="cursor-pointer text-violet-900"
                onClick={toggleSidebar}
                aria-label="Toggle Sidebar"
              >
                <HiMenuAlt2 size={26} />
              </button>

            {/* Desktop Quick Stats & Actions */}
            <div className="flex items-center space-x-6">
              {/* Balance Display */}
              <Motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                onClick={onShowBalanceModal}
                className="cursor-pointer text-center"
              >
                <div className="text-xs text-violet-700 font-bold">Balance</div>
                <div className="font-bold text-violet-900 md:text-lg text-md">
                  {formatCompactCurrency(stats.currentBalance, currency)}
                </div>
              </Motion.div>

              {/* Target Progress */}
              {target.enabled && targetProgress && (
                <Motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  onClick={onShowTargetModal}
                  className="cursor-pointer text-center"
                >
                  <div className="text-xs text-emerald-700 font-bold">
                    Target Progress
                  </div>
                  <div className="font-bold text-emerald-900 md:text-lg text-md">
                    {targetProgress.progress.toFixed(1)}%
                  </div>
                </Motion.div>
              )}

              {/* Subscription Status - Hanya tampilkan upgrade button untuk plan free */}
              {actualSubscription.plan === "free" && (
                <Motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onShowUpgradeModal}
                  className="hidden md:block cursor-pointer bg-linear-to-r from-violet-500 to-purple-500 text-white px-5 py-2 rounded-xl hover:shadow-lg transition-all duration-200 font-bold border-2 border-violet-400/50"
                >
                  🚀 Upgrade
                </Motion.button>
              )}

              {/* User Profile Dropdown */}
              <div className="relative user-menu-container" ref={dropdownRef}>
                <Motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-r from-violet-500 to-purple-500 text-white hover:shadow-lg transition-all duration-200 border-2 border-violet-400/50"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </Motion.button>

                {/* User Menu Popup - PERBAIKAN: Gunakan showUserMenu untuk kontrol tampilan */}
                <AnimatePresence>
                  {showUserMenu && (
                    <Motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-violet-200 overflow-hidden z-50"
                    >
                      {/* User Info Header */}
                      <div className="p-4 border-b border-violet-200 bg-linear-to-r from-violet-50 to-purple-50">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-linear-to-r from-violet-500 to-purple-500 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {user?.name?.charAt(0)?.toUpperCase() || "U"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-violet-900 truncate">
                              {user?.name || "User"}
                            </p>
                            <p className="text-xs text-violet-700 truncate">
                              {user?.email || "user@example.com"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2 space-y-1">
                        {/* Profile Menu */}
                        <Motion.button
                          whileHover={{
                            x: 5,
                            backgroundColor: "rgba(128, 0, 128, 0.1)",
                          }}
                          className="w-full text-left px-4 py-3 rounded-xl text-sm text-violet-900 hover:text-violet-700 transition-all duration-200 flex items-center space-x-3"
                          onClick={() => {
                            onProfileSettings();
                            setShowUserMenu(false);
                          }}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span>Profile Settings</span>
                        </Motion.button>

                        {/* Balance Info in Menu */}
                        <div className="px-4 py-3 rounded-xl bg-linear-to-r from-violet-50 to-purple-100 border border-violet-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-violet-800">
                              Current Balance
                            </span>
                            <span className="text-xs font-bold text-violet-900 bg-violet-200 px-2 py-1 rounded-full">
                              {formatCompactCurrency(
                                stats.currentBalance,
                                currency
                              )}
                            </span>
                          </div>
                          <div className="text-xs text-violet-600">
                            Initial:{" "}
                            {formatCompactCurrency(stats.initialBalance, currency)}
                          </div>
                        </div>

                        {/* Plan Info */}
                        <div className="px-4 py-3 rounded-xl bg-linear-to-r from-gray-50 to-gray-100 border border-gray-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-gray-700">
                              Current Plan
                            </span>
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded-full ${
                                actualSubscription.plan === "free"
                                  ? "bg-gray-200 text-gray-700"
                                  : "bg-emerald-200 text-emerald-700"
                              }`}
                            >
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
                            className="w-full px-4 py-3 rounded-xl bg-linear-to-r from-violet-500 to-purple-500 text-white text-sm font-bold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                            onClick={() => {
                              onShowUpgradeModal();
                              setShowUserMenu(false);
                            }}
                          >
                            <span>🚀 Upgrade Plan</span>
                          </Motion.button>
                        )}

                        {/* Update Balance Button */}
                        <Motion.button
                          whileHover={{
                            x: 5,
                            backgroundColor: "rgba(34, 197, 94, 0.1)",
                          }}
                          className="w-full text-left px-4 py-3 rounded-xl text-sm text-emerald-600 hover:text-emerald-700 transition-all duration-200 flex items-center space-x-3"
                          onClick={() => {
                            onShowBalanceModal();
                            setShowUserMenu(false);
                          }}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>Update Balance</span>
                        </Motion.button>

                        {/* Divider */}
                        <div className="border-t border-violet-200 my-2"></div>

                        {/* Logout Button */}
                        <Motion.button
                          whileHover={{
                            x: 5,
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                          }}
                          className="w-full text-left px-4 py-3 rounded-xl text-sm text-red-600 hover:text-red-700 transition-all duration-200 flex items-center space-x-3"
                          onClick={() => {
                            setShowUserMenu(false);
                            handleLogout();
                          }}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          <span>Logout</span>
                        </Motion.button>
                      </div>
                    </Motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;