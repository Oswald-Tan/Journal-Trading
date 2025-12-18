import React, { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Crown,
  Rocket,
  Target,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import axios from "axios";
import { API_URL } from "../../config";

const Layout = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentTransaction, setRecentTransaction] = useState(null);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      // Fetch subscription
      const subRes = await axios.get(`${API_URL}/subscription/my-subscription`);
      if (subRes.data.success) {
        setSubscription(subRes.data.data);
      }

      // Fetch recent transactions for context
      const txRes = await axios.get(`${API_URL}/transactions/user`);
      if (txRes.data.success && txRes.data.data.length > 0) {
        setRecentTransaction(txRes.data.data[0]);
      }
    } catch (error) {
      console.error("Error fetching subscription data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (plan) => {
    switch (plan) {
      case "lifetime":
        return <Crown className="w-6 h-6 text-amber-600" />;
      case "pro":
        return <Rocket className="w-6 h-6 text-violet-600" />;
      default:
        return <Target className="w-6 h-6 text-slate-600" />;
    }
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case "lifetime":
        return "bg-amber-100 text-amber-800";
      case "pro":
        return "bg-violet-100 text-violet-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Tidak ada";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fungsi untuk mendapatkan teks tanggal berakhir berdasarkan plan
  const getExpirationText = (subscription) => {
    if (!subscription) return "-";

    const { plan, expiresAt } = subscription;

    if (plan === "lifetime") {
      return "Seumur Hidup";
    }

    if (plan === "free") {
      return "Selamanya";
    }

    if (plan === "pro") {
      if (expiresAt) {
        return formatDate(expiresAt);
      }
      return "-";
    }

    return "-";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat data subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pt-0">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-6 w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Kembali ke Dashboard
        </button>

        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold text-slate-800 flex items-center gap-2">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-violet-600" />
              Subscription Details
            </h1>

            <p className="text-sm sm:text-sm md:text-base text-slate-600 mt-1 font-light">
              Detail langganan dan status akses Anda
            </p>
          </div>
        </Motion.div>

        {/* Subscription Card */}
        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center ${getPlanColor(
                  subscription?.plan
                )}`}
              >
                {getPlanIcon(subscription?.plan)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {subscription?.plan
                    ? subscription.plan.toUpperCase()
                    : "FREE"}{" "}
                  Plan
                </h2>
                <p className="text-slate-600">
                  {subscription?.plan === "free"
                    ? "Plan Dasar"
                    : subscription?.plan === "pro"
                    ? "Untuk Trader Serius"
                    : "Akses Seumur Hidup"}
                </p>
              </div>
            </div>

            <div
              className={`px-4 py-2 rounded-full font-medium ${
                subscription?.isValid
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {subscription?.isValid ? "AKTIF" : "TIDAK AKTIF"}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Tanggal Mulai</span>
              </div>
              <p className="text-slate-800 font-medium">
                {formatDate(subscription?.created_at)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Berakhir Pada</span>
              </div>
              <p className="text-slate-800 font-medium">
                {getExpirationText(subscription)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-600">
                <CreditCard className="w-5 h-5" />
                <span className="font-medium">Status</span>
              </div>
              <div className="flex items-center gap-2">
                {subscription?.isExpired ? (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                ) : subscription?.isValid ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Clock className="w-5 h-5 text-amber-600" />
                )}
                <p className="text-slate-800 font-medium">
                  {subscription?.isExpired
                    ? "Kedaluwarsa"
                    : subscription?.isValid
                    ? "Berjalan"
                    : "Menunggu"}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="font-medium text-slate-800 mb-4">Status Detail</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Plan Aktif</span>
                <span className="font-medium text-slate-800">
                  {subscription?.plan}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Mode Pembayaran</span>
                <span className="font-medium text-slate-800">
                  {subscription?.paymentMethod || "Free Plan"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Transaction ID</span>
                <span className="font-mono text-slate-800 text-sm">
                  {subscription?.transactionId || "-"}
                </span>
              </div>
            </div>
          </div>
        </Motion.div>

        {/* Recent Transaction */}
        {recentTransaction && (
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6"
          >
            <h3 className="text-lg font-medium text-slate-800 mb-4">
              Transaksi Terakhir
            </h3>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="w-4 h-4 text-slate-600" />
                  <span className="font-medium text-slate-800">
                    {recentTransaction.plan
                      ? `${recentTransaction.plan.toUpperCase()} Plan`
                      : "Subscription"}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      recentTransaction.status === "PAID"
                        ? "bg-emerald-100 text-emerald-800"
                        : recentTransaction.status === "PENDING_PAYMENT"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {recentTransaction.status === "PAID"
                      ? "Berhasil"
                      : recentTransaction.status === "PENDING_PAYMENT"
                      ? "Pending"
                      : "Gagal"}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  {formatDate(recentTransaction.created_at)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-slate-800">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(recentTransaction.total)}
                </p>
                <button
                  onClick={() => navigate(`/transactions`)}
                  className="text-sm text-violet-600 hover:text-violet-700 font-medium mt-1"
                >
                  Lihat Semua →
                </button>
              </div>
            </div>
          </Motion.div>
        )}

        {/* Actions */}
        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <button
            onClick={() => navigate("/upgrade")}
            className="p-6 bg-linear-to-r from-violet-600 to-purple-600 text-white rounded-2xl text-left hover:shadow-md transition-all"
          >
            <h3 className="text-lg font-bold mb-2">Upgrade Plan</h3>
            <p className="text-violet-100 text-sm mb-4">
              Tingkatkan ke plan yang lebih tinggi untuk fitur lebih lengkap
            </p>
            <span className="text-sm font-medium">Lihat Pilihan Plan →</span>
          </button>

          <button
            onClick={fetchSubscriptionData}
            className="p-6 bg-white border-2 border-slate-200 text-slate-800 rounded-2xl text-left hover:bg-slate-50 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold">Refresh Status</h3>
            </div>
            <p className="text-slate-600 text-sm">
              Perbarui status subscription terbaru dari server
            </p>
          </button>
        </Motion.div>
      </div>
    </div>
  );
};

export default Layout;
