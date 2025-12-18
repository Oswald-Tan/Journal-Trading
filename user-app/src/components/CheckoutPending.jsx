import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  Clock,
  RefreshCw,
  Home,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { API_URL } from "../config";

const CheckoutPending = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = location.state || {};
  const [checkingStatus, setCheckingStatus] = useState(false);

  const checkTransactionStatus = async () => {
    if (!orderId) return;

    setCheckingStatus(true);
    try {
      const response = await axios.get(`${API_URL}/transactions/status/${orderId}`);
      const transaction = response.data.data;

      if (transaction.status === "success") {
        navigate("/checkout/success", {
          state: { orderId, plan: transaction.plan, amount: transaction.grossAmount },
        });
      } else if (transaction.status === "failure") {
        navigate("/checkout/error", {
          state: { orderId, message: "Pembayaran gagal" },
        });
      }
      // Jika masih pending, tidak redirect
    } catch (error) {
      console.error("Check status error:", error);
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    // Check status setiap 30 detik
    const interval = setInterval(checkTransactionStatus, 30000);
    return () => clearInterval(interval);
  }, [orderId]);

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-linear-to-b from-amber-50 to-white">
      <div className="max-w-4xl mx-auto">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-32 h-32 mx-auto mb-6 bg-amber-100 rounded-full flex items-center justify-center">
            <Clock className="w-20 h-20 text-amber-600" />
          </div>
          
          <h1 className="text-5xl font-bold text-slate-800 mb-4">
            Menunggu Pembayaran
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Pembayaran Anda sedang diproses. Harap selesaikan pembayaran di halaman Midtrans.
          </p>

          <div className="inline-flex items-center gap-2 px-6 py-3 bg-amber-100 text-amber-800 rounded-full font-medium">
            <AlertCircle className="w-5 h-5" />
            Jangan tutup halaman ini selama proses pembayaran
          </div>
        </Motion.div>

        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-lg p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Order ID: {orderId || "-"}
              </h3>
              <p className="text-slate-600">
                Status pembayaran akan diperbarui secara otomatis
              </p>
            </div>
            
            <button
              onClick={checkTransactionStatus}
              disabled={checkingStatus}
              className="px-8 py-3 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <RefreshCw className={`w-5 h-5 ${checkingStatus ? "animate-spin" : ""}`} />
              {checkingStatus ? "Memeriksa..." : "Periksa Status"}
            </button>
          </div>
        </Motion.div>

        {/* Instructions */}
        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-blue-50 rounded-2xl p-6">
            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                1
              </div>
              Selesaikan Pembayaran
            </h4>
            <p className="text-slate-600 text-sm">
              Buka halaman Midtrans dan selesaikan pembayaran dengan metode yang dipilih
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-2xl p-6">
            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                2
              </div>
              Tunggu Konfirmasi
            </h4>
            <p className="text-slate-600 text-sm">
              Sistem akan otomatis mendeteksi pembayaran dalam 1-2 menit
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-2xl p-6">
            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                3
              </div>
              Akses Fitur Premium
            </h4>
            <p className="text-slate-600 text-sm">
              Setelah konfirmasi, Anda akan diarahkan ke halaman sukses
            </p>
          </div>
        </Motion.div>

        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <button
            onClick={handleGoToDashboard}
            className="px-8 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-900 transition-colors inline-flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            Kembali ke Dashboard
          </button>
        </Motion.div>
      </div>
    </div>
  );
};

export default CheckoutPending;