import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import axios from "axios";
import WhiteLogo from "../assets/white_logo.png";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to get first name only
  const getFirstName = (fullName) => {
    if (!fullName) return "User";
    return fullName.split(" ")[0];
  };

  // Cek status login dengan Axios
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get("http://localhost:8082/api/v1/auth/me", {
          withCredentials: true, // Penting untuk mengirim session cookie
        });

        if (response.data) {
          setIsLoggedIn(true);
          setUser(response.data);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Handle navigation to dashboard
  const handleGoToDashboard = () => {
    window.location.href = "http://localhost:5173/dashboard";
  };

  const handleLogin = () => {
    window.location.href = "http://localhost:5173/";
  };

  // Tampilkan loading state jika masih checking auth
  if (loading) {
    return (
      <header className="w-full absolute top-4 left-0 bg-transparent z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-md">
                <img src={WhiteLogo} alt="Logo" className="w-6 h-6" />
              </div>
              <span className="font-semibold text-lg">Pips Diary</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-20 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full absolute top-4 left-0 bg-transparent z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-md">
              <img src={WhiteLogo} alt="Logo" className="w-6 h-6" />
            </div>
            <span className="font-semibold text-lg">Pips Diary</span>
          </div>

          <ul className="hidden md:flex items-center gap-8 text-sm text-slate-700">
            <li className="hover:text-slate-900 cursor-pointer">Home</li>
            <li className="hover:text-slate-900 cursor-pointer">Features</li>
            <li className="hover:text-slate-900 cursor-pointer">Pricing</li>
            <li className="hover:text-slate-900 cursor-pointer">Company</li>
          </ul>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <span className="hidden md:block text-sm text-slate-700">
                  Hi, {getFirstName(user?.name)}
                </span>
                <button
                  onClick={handleGoToDashboard}
                  className="px-4 py-2 rounded-full bg-pink-600 text-white text-sm shadow hover:brightness-95 cursor-pointer"
                >
                  Dashboard
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 rounded-full bg-violet-600 text-white text-sm shadow hover:brightness-95"
                >
                  Try free
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}