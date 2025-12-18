import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  XCircle,
  RefreshCw,
  Home,
  AlertTriangle,
} from "lucide-react";

const CheckoutError = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { message = "Terjadi kesalahan saat pembayaran" } = location.state || {};

  const handleRetry = () => {
    navigate("/upgrade");
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-linear-to-b from-rose-50 to-white">
      <div className="max-w-4xl mx-auto">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-32 h-32 mx-auto mb-6 bg-rose-100 rounded-full flex items-center justify-center">
            <XCircle className="w-20 h-20 text-rose-600" />
          </div>
          
          <h1 className="text-5xl font-bold text-slate-800 mb-4">
            Pembayaran Gagal
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            {message}
          </p>

          <div className="inline-flex items-center gap-2 px-6 py-3 bg-rose-100 text-rose-800 rounded-full font-medium">
            <AlertTriangle className="w-5 h-5" />
            Coba lagi atau gunakan metode pembayaran lain
          </div>
        </Motion.div>

        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-lg p-8 mb-8"
        >
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            Solusi yang bisa dicoba:
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <div className="text-blue-600 font-medium">1</div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Cek Saldo/Kartu</h4>
                  <p className="text-slate-600 text-sm">
                    Pastikan saldo atau limit kartu kredit mencukupi
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <div className="text-blue-600 font-medium">2</div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Ganti Metode</h4>
                  <p className="text-slate-600 text-sm">
                    Coba metode pembayaran yang berbeda
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <div className="text-blue-600 font-medium">3</div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Refresh Halaman</h4>
                  <p className="text-slate-600 text-sm">
                    Tutup dan buka kembali halaman pembayaran
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <div className="text-blue-600 font-medium">4</div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Hubungi Support</h4>
                  <p className="text-slate-600 text-sm">
                    Jika masalah berlanjut, kontak tim support kami
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Motion.div>

        {/* Action Buttons */}
        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col md:flex-row gap-4 justify-center"
        >
          <button
            onClick={handleRetry}
            className="flex-1 max-w-md py-4 bg-linear-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3"
          >
            <RefreshCw className="w-5 h-5" />
            Coba Lagi
          </button>
          
          <button
            onClick={handleGoToDashboard}
            className="flex-1 max-w-md py-4 bg-white text-slate-800 border-2 border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
          >
            <Home className="w-5 h-5" />
            Kembali ke Dashboard
          </button>
        </Motion.div>

        {/* Support Info */}
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12 pt-8 border-t border-slate-200"
        >
          <p className="text-slate-600 mb-4">
            Masih mengalami masalah? Hubungi support kami:
          </p>
          <p className="text-rose-600 font-medium">
            support@tradingjournal.com • +62 812 3456 7890
          </p>
        </Motion.div>
      </div>
    </div>
  );
};

export default CheckoutError;