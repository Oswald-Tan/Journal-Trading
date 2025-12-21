import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  CheckCircle,
  Download,
  Mail,
  Smartphone,
  Home,
  Calendar,
  CreditCard,
  AlertCircle,
  Loader2,
  RefreshCw,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import axios from "axios";
import { API_URL } from "../config";
import Swal from "sweetalert2";

const CheckoutSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const pollingIntervalRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Get orderId dari berbagai sumber
  const getOrderId = () => {
    // 1. Dari URL query parameters (dari Midtrans redirect)
    const orderIdFromQuery =
      searchParams.get("order_id") || searchParams.get("orderId");

    // 2. Dari state navigation
    const orderIdFromState = location.state?.orderId;

    // 3. Dari localStorage
    const savedTransaction = JSON.parse(
      localStorage.getItem("lastTransaction") || "{}"
    );
    const orderIdFromStorage = savedTransaction.orderId;

    // Prioritas: URL > State > Storage
    return orderIdFromQuery || orderIdFromState || orderIdFromStorage;
  };

  const orderId = getOrderId();
  const snapToken = location.state?.snapToken;

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pollCount, setPollCount] = useState(0);
  const [setUserSubscription] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");

  // Fetch transaction status
  const fetchTransactionStatus = async (orderIdToCheck = orderId) => {
    if (!orderIdToCheck) {
      setError("ID transaksi tidak ditemukan");
      setLoading(false);
      return;
    }

    try {
      console.log(
        `🔍 Checking status for: ${orderIdToCheck}, attempt: ${pollCount + 1}`
      );

      const res = await axios.get(
        `${API_URL}/transactions/status/${orderIdToCheck}`
      );

      console.log("📊 Transaction status response:", res.data);

      if (res.data.success) {
        const transactionData = res.data.data;
        setTransaction(transactionData);

        // Simpan payment method
        if (transactionData.payment_method) {
          setPaymentMethod(transactionData.payment_method);
        }

        // Jika status PAID, stop polling dan update subscription
        if (
          transactionData.status === "PAID" ||
          transactionData.status === "settlement"
        ) {
          console.log("✅ Payment successful, stopping polling");
          stopPolling();
          await refreshUserSubscription();
        } else if (pollCount >= 60) {
          // Maksimal 60 polling (3 menit)
          console.log("⏰ Max polling reached");
          stopPolling();
          setError(
            "Pembayaran masih diproses. Silakan cek status di dashboard nanti."
          );
        }
      }
    } catch (error) {
      console.error("❌ Fetch transaction error:", error);

      // Jika error 401 (unauthorized), redirect ke login
      if (error.response?.status === 401) {
        setError("Sesi Anda telah berakhir. Silakan login kembali.");
        setTimeout(() => navigate("/login"), 3000);
        stopPolling();
      }
    } finally {
      setLoading(false);
    }
  };

  // Refresh user subscription
  const refreshUserSubscription = async () => {
    try {
      // Coba endpoint subscription
      const res = await axios.get(`${API_URL}/subscription/my-subscription`);

      if (res.data.success) {
        setUserSubscription(res.data.data);
        localStorage.setItem("userSubscription", JSON.stringify(res.data.data));
        window.dispatchEvent(new Event("subscriptionUpdated"));
      }
    } catch (error) {
      console.error("Failed to refresh subscription:", error);
    }
  };

  // Start polling
  const startPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(() => {
      if (pollCount < 60) {
        // Maksimal 60 kali polling
        setPollCount((prev) => prev + 1);
        fetchTransactionStatus();
      } else {
        stopPolling();
      }
    }, 3000); // Poll setiap 3 detik
  };

  // Stop polling
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // Initialize
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    console.log("🔄 Initializing CheckoutSuccess with orderId:", orderId);

    if (!orderId) {
      setError("ID transaksi tidak ditemukan");
      setLoading(false);
      return;
    }

    // Cek parameter URL dari Midtrans
    const urlParams = new URLSearchParams(window.location.search);
    const midtransOrderId = urlParams.get("order_id");
    const transactionStatus = urlParams.get("transaction_status");

    if (midtransOrderId && transactionStatus) {
      console.log(
        `🎯 Midtrans redirect detected: ${midtransOrderId}, status: ${transactionStatus}`
      );

      // Simpan data dari Midtrans
      const transactionData = {
        id: midtransOrderId,
        status: transactionStatus === "settlement" ? "PAID" : "PENDING",
        transaction_time: new Date().toISOString(),
        source: "midtrans_redirect",
      };

      localStorage.setItem("lastTransaction", JSON.stringify(transactionData));
      setTransaction(transactionData);

      // Jika status settlement, langsung update
      if (transactionStatus === "settlement") {
        refreshUserSubscription();
      }
    }

    // Mulai polling
    setLoading(true);
    fetchTransactionStatus().then(() => {
      startPolling();
    });

    // Cleanup
    return () => {
      stopPolling();
    };
  }, []);

  // Manual retry
  const handleRetryCheck = () => {
    setPollCount(0);
    setError(null);
    setLoading(true);
    fetchTransactionStatus().then(() => {
      startPolling();
    });
  };

  // Fungsi untuk melanjutkan pembayaran
  const handleContinuePayment = () => {
    navigate("/checkout", {
      state: {
        plan: transaction?.plan || location.state?.plan || "pro",
        orderId: orderId,
        continuePayment: true,
      },
    });
  };

  // Fungsi untuk membuka pembayaran di tab baru
  const handleOpenPaymentInNewTab = () => {
    if (snapToken) {
      // Buka Midtrans di tab baru dengan token
      window.open(
        `https://app.sandbox.midtrans.com/snap/v2/vtweb/${snapToken}`,
        "_blank"
      );
    } else if (transaction?.snap_redirect_url) {
      window.open(transaction.snap_redirect_url, "_blank");
    } else {
      Swal.fire({
        icon: "warning",
        title: "Link Pembayaran Tidak Tersedia",
        text: 'Silakan gunakan tombol "Lanjutkan Pembayaran"',
      });
    }
  };

  // Navigate handlers
  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  const handleGoToUpgrade = () => {
    navigate("/upgrade");
  };

  const handleGoToTransactions = () => {
    navigate("/transactions");
  };

  // Format functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Status determination
  const isSuccess =
    transaction?.status === "PAID" || transaction?.status === "settlement";
  const isPending =
    transaction?.status === "PENDING_PAYMENT" ||
    transaction?.status === "PENDING" ||
    transaction?.status === "pending";
  const isFailed = [
    "CANCELED",
    "EXPIRED",
    "DENIED",
    "CANCEL",
    "EXPIRE",
    "DENY",
  ].includes(transaction?.status?.toUpperCase());

  // DANA-specific messages
  const isDanaPayment = paymentMethod?.toLowerCase() === "dana";

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md mx-4">
          <Loader2 className="w-16 h-16 text-violet-600 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Memuat Status Pembayaran...
          </h3>
          <p className="text-slate-600 mb-4">
            {isDanaPayment
              ? "Pembayaran DANA sedang diproses. Mohon tunggu..."
              : "Memverifikasi status pembayaran Anda..."}
          </p>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-violet-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((pollCount / 60) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Polling: {pollCount}/60</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md mx-4 text-center">
          <AlertCircle className="w-20 h-20 text-red-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Terjadi Kesalahan
          </h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleRetryCheck}
              className="w-full py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors"
            >
              Coba Lagi
            </button>
            <button
              onClick={handleGoToDashboard}
              className="w-full py-3 bg-slate-200 text-slate-800 rounded-xl font-medium hover:bg-slate-300 transition-colors"
            >
              Ke Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-linear-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}

        <button
          onClick={() => navigate(-1)}
          className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-medium flex items-center justify-center gap-2 text-sm sm:text-base mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali
        </button>

        {/* Header Section */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {isSuccess ? (
            <>
              <div className="w-32 h-32 mx-auto mb-6 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-20 h-20 text-emerald-600" />
              </div>
              <h1 className="text-5xl font-bold text-slate-800 mb-4">
                Pembayaran Berhasil!
              </h1>
              <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                Terima kasih telah berlangganan. Akses premium Anda telah aktif.
              </p>
            </>
          ) : isPending ? (
            <>
              <div className="w-32 h-32 mx-auto mb-6 bg-amber-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-20 h-20 text-amber-600 animate-spin" />
              </div>
              <h1 className="text-5xl font-bold text-slate-800 mb-4">
                Pembayaran Diproses
              </h1>
              <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                {isDanaPayment
                  ? "Pembayaran DANA sedang diverifikasi. Proses ini bisa memakan waktu beberapa menit."
                  : "Pembayaran Anda sedang diverifikasi oleh sistem."}
              </p>

              {/* Pending Payment Info */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 max-w-2xl mx-auto mb-6">
                <h3 className="font-bold text-amber-800 mb-3 text-lg">
                  ⚠️ Pembayaran Belum Selesai
                </h3>
                <p className="text-amber-700 mb-4">
                  Anda belum menyelesaikan pembayaran. Silakan pilih salah satu
                  opsi di bawah:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-1">
                      <span className="text-violet-600 text-sm">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">
                        Lanjutkan di halaman ini
                      </p>
                      <p className="text-sm text-slate-600">
                        Klik "Lanjutkan Pembayaran" untuk membuka halaman
                        pembayaran di tab ini
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-1">
                      <span className="text-blue-600 text-sm">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">
                        Buka di tab baru
                      </p>
                      <p className="text-sm text-slate-600">
                        Klik "Buka Pembayaran di Tab Baru" jika ingin membayar
                        di tab terpisah
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* DANA-specific message */}
              {isDanaPayment && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 max-w-2xl mx-auto mb-4">
                  <p className="text-blue-700">
                    ⏳ Untuk pembayaran DANA, biasanya membutuhkan waktu 1-5
                    menit untuk diproses. Jangan tutup halaman ini. Sistem akan
                    otomatis memeriksa status.
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="w-32 h-32 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-20 h-20 text-red-600" />
              </div>
              <h1 className="text-5xl font-bold text-slate-800 mb-4">
                Pembayaran {transaction?.status?.toLowerCase() || "Gagal"}
              </h1>
              <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                Transaksi Anda tidak dapat diproses.
              </p>
            </>
          )}
        </Motion.div>

        {/* Transaction Details */}
        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Detail Transaksi
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Order ID</p>
                <p className="font-mono font-medium text-slate-800 break-all">
                  {orderId || "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">Status</p>
                {isSuccess ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Berhasil
                  </span>
                ) : isPending ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-medium">
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Diproses ({pollCount}/60)
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800 font-medium">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {transaction?.status || "Gagal"}
                  </span>
                )}
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">Metode Pembayaran</p>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-slate-600" />
                  <p className="font-medium text-slate-800 capitalize">
                    {paymentMethod || transaction?.payment_method || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Pembayaran</p>
                <p
                  className={`text-3xl font-bold ${
                    isSuccess ? "text-emerald-600" : "text-slate-600"
                  }`}
                >
                  {formatCurrency(transaction?.total || 0)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">Waktu</p>
                <p className="font-medium text-slate-800">
                  {formatDate(
                    transaction?.transaction_time || transaction?.created_at
                  )}
                </p>
              </div>

              {isPending && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">Status Polling</p>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((pollCount / 60) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Pengecekan otomatis: {pollCount}/60
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons - TAMBAHKAN TOMBOL LANJUTKAN PEMBAYARAN */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex flex-col gap-4">
              {isPending && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={handleContinuePayment}
                      className="py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-5 h-5" />
                      Lanjutkan Pembayaran
                    </button>

                    <button
                      onClick={handleOpenPaymentInNewTab}
                      className="py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Buka di Tab Baru
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <button
                      onClick={handleRetryCheck}
                      disabled={isLoading}
                      className="py-3 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <RefreshCw className="w-5 h-5" />
                      )}
                      Cek Status Sekarang
                    </button>
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={isFailed ? handleGoToUpgrade : handleGoToDashboard}
                  className="py-3 bg-slate-200 text-slate-800 rounded-xl font-medium hover:bg-slate-300 transition-colors"
                >
                  {isFailed ? "Coba Lagi" : "Ke Dashboard"}
                </button>

                <button
                  onClick={handleGoToTransactions}
                  className="py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >
                  Lihat Riwayat
                </button>

                <button
                  onClick={handleGoToUpgrade}
                  className="py-3 bg-violet-100 text-violet-700 rounded-xl font-medium hover:bg-violet-200 transition-colors"
                >
                  Upgrade Lainnya
                </button>
              </div>
            </div>

            {/* DANA note */}
            {isPending && isDanaPayment && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                <p className="text-blue-700 text-sm">
                  💡 <strong>Untuk pembayaran DANA:</strong>
                  Jika status tetap "Diproses" setelah 10 menit, silakan: 1. Cek
                  aplikasi DANA Anda 2. Tekan tombol "Cek Status Sekarang" 3.
                  Atau hubungi support kami
                </p>
              </div>
            )}
          </div>
        </Motion.div>

        {/* Support Info */}
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12 pt-8 border-t border-slate-200"
        >
          <p className="text-slate-600 mb-4">Butuh bantuan?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@pipsdiary.com"
              className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium"
            >
              <Mail className="w-5 h-5" />
              Email Support
            </a>
            <a
              href="https://wa.me/6285173246048"
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <Smartphone className="w-5 h-5" />
              WhatsApp Support
            </a>
          </div>
        </Motion.div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
