import Transaction from "../models/transaction.js";
import Subscription from "../models/subscription.js";
import User from "../models/user.js";
import midtransClient from "midtrans-client";
import { Op } from "sequelize";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === MIDTRANS CONFIG ===
let snap;
let core;
try {
  console.log("🔧 Initializing Midtrans...");

  // Snap API untuk pembayaran
  snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });

  // Core API untuk cek status (V2 API)
  core = new midtransClient.CoreApi({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });

  console.log("✅ Midtrans initialized successfully");
} catch (error) {
  console.error("❌ Failed to initialize Midtrans:", error.message);
}

// Harga plan
const planPrices = {
  free: 0,
  pro: 69000,
  lifetime: 799000,
};

const generateInvoiceNumber = async (maxRetries = 3) => {
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");

      // Ambil count transaksi hari ini untuk sequential number
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));

      const todaysCount = await Transaction.count({
        where: {
          created_at: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
      });

      const sequence = (todaysCount + 1).toString().padStart(6, "0");
      const invoiceNumber = `INV/PD/${year}/${month}/${day}/${sequence}`;

      // Cek apakah invoice number sudah ada
      const existing = await Transaction.findOne({
        where: { invoice_number: invoiceNumber },
      });

      if (!existing) {
        return invoiceNumber;
      }

      retryCount++;
      console.log(
        `⚠️ Invoice number ${invoiceNumber} exists, retry ${retryCount}/${maxRetries}`
      );

      // Tunggu sebentar sebelum retry
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error("Error generating invoice number:", error);
      throw error;
    }
  }

  // Jika semua retry gagal, gunakan timestamp
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `INV/EMERGENCY/${timestamp}-${random}`;
};

// === CREATE TRANSACTION (DENGAN DEBUGGING LENGKAP) ===
export const createTransaction = async (req, res) => {
  console.log("\n=== 🚀 START CREATE TRANSACTION ===");

  try {
    const userId = req.userId;
    const { plan } = req.body;

    console.log("📋 Request data:", { userId, plan });

    // Validasi plan
    if (!planPrices[plan]) {
      console.log("❌ Invalid plan:", plan);
      return res.status(400).json({
        success: false,
        message: "Plan tidak valid",
      });
    }

    const grossAmount = planPrices[plan];
    console.log("💰 Amount:", grossAmount);

    // Cari user
    const user = await User.findByPk(userId);
    if (!user) {
      console.log("❌ User not found:", userId);
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    console.log("👤 User found:", user.email);

    // Generate invoice number DENGAN ERROR HANDLING
    let invoiceNumber;
    try {
      invoiceNumber = await generateInvoiceNumber();
      console.log("🧾 Generated Invoice:", invoiceNumber);

      // Cek duplikasi sebelum melanjutkan
      const existingInvoice = await Transaction.findOne({
        where: { invoice_number: invoiceNumber },
      });

      if (existingInvoice) {
        console.log("⚠️ Invoice number already exists, generating new one...");
        // Generate ulang dengan timestamp
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000000);
        invoiceNumber = `INV/${timestamp}-${random}`;
        console.log("🔄 New invoice number:", invoiceNumber);
      }
    } catch (invoiceError) {
      console.error("❌ Error generating invoice:", invoiceError);
      // Fallback invoice number
      invoiceNumber = `INV-FALLBACK-${Date.now()}-${Math.floor(
        Math.random() * 10000
      )}`;
      console.log("🔄 Using fallback invoice:", invoiceNumber);
    }

    // Generate order ID yang UNIK
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const orderId = `ORDER-${timestamp}-${random}`;
    console.log("🆔 Generated Order ID:", orderId);

    // **PERIKSA ENVIRONMENT VARIABLE**
    console.log("\n🔍 Checking environment variables:");
    console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
    console.log("BACKEND_URL:", process.env.BACKEND_URL);
    console.log("MIDTRANS_APP_URL:", process.env.MIDTRANS_APP_URL);

    if (!process.env.MIDTRANS_SERVER_KEY) {
      console.error("❌ MIDTRANS_SERVER_KEY is missing!");
      return res.status(500).json({
        success: false,
        message: "Server configuration error: Midtrans key missing",
      });
    }

    // Setup URLs
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const successUrl = `${frontendUrl}/checkout/success?order_id=${orderId}`;
    const pendingUrl = `${frontendUrl}/checkout/success?order_id=${orderId}`;
    const errorUrl = `${frontendUrl}/checkout/error?order_id=${orderId}`;

    console.log("🔗 URLs:", { successUrl, pendingUrl, errorUrl });

    // **Parameter untuk Midtrans (SIMPLE VERSION)**
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: user.name?.split(" ")[0] || "Customer",
        email: user.email,
        phone: user.phone_number || "081234567890",
      },
      item_details: [
        {
          id: plan,
          price: grossAmount,
          quantity: 1,
          name: `${plan.toUpperCase()} Plan Subscription`,
        },
      ],
      // **CALLBACKS sangat penting!**
      callbacks: {
        finish: successUrl,
        pending: pendingUrl,
        error: errorUrl,
        notification: `${process.env.BACKEND_URL}/api/v1/transactions/notification`,
      },
    };

    console.log("\n📦 Sending to Midtrans with parameters:");
    console.log(JSON.stringify(parameter, null, 2));

    let midtransResponse;
    try {
      // **HIT API MIDTRANS LANGSUNG untuk debugging**
      console.log("\n🌐 Making request to Midtrans API...");

      // Option 1: Use midtransClient
      midtransResponse = await snap.createTransaction(parameter);

      console.log("✅ Midtrans response received!");
      console.log("Token:", midtransResponse.token ? "Present" : "MISSING");
      console.log("Redirect URL:", midtransResponse.redirect_url);
    } catch (error) {
      console.error("\n❌ MIDTRANS API ERROR DETAILS:");
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);

      // Coba hit API langsung untuk debug
      try {
        const axios = (await import("axios")).default;
        const response = await axios.post(
          "https://app.sandbox.midtrans.com/snap/v1/transactions",
          parameter,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization:
                "Basic " +
                Buffer.from(process.env.MIDTRANS_SERVER_KEY + ":").toString(
                  "base64"
                ),
            },
          }
        );
        console.log("Direct API response:", response.data);
        midtransResponse = response.data;
      } catch (directError) {
        console.error(
          "Direct API also failed:",
          directError.response?.data || directError.message
        );

        return res.status(500).json({
          success: false,
          message: "Gagal membuat transaksi di Midtrans",
          error: directError.message,
          debug: {
            serverKeyLength: process.env.MIDTRANS_SERVER_KEY?.length,
            environment: process.env.NODE_ENV,
            midtransUrl:
              "https://app.sandbox.midtrans.com/snap/v1/transactions",
          },
        });
      }
    }

    // Validasi response
    if (!midtransResponse || !midtransResponse.token) {
      console.error("❌ Invalid Midtrans response:", midtransResponse);
      return res.status(500).json({
        success: false,
        message: "Response tidak valid dari Midtrans",
        data: midtransResponse,
      });
    }

    console.log("\n💾 Saving to database...");

    // Simpan ke database dengan TRY-CATCH untuk handle duplicate
    try {
      const transactionData = {
        id: orderId,
        invoice_number: invoiceNumber,
        total: grossAmount,
        status: "PENDING_PAYMENT",
        customer_name: user.name,
        customer_email: user.email,
        snap_token: midtransResponse.token,
        snap_redirect_url: midtransResponse.redirect_url,
        user_id: userId,
        plan: plan,
        created_at: new Date(),
        updated_at: new Date(),
      };

      await Transaction.create(transactionData);
      console.log("✅ Transaction saved to database");
    } catch (dbError) {
      console.error("❌ Database save error:", dbError);

      // Jika error karena duplicate invoice number, generate baru dan coba lagi
      if (dbError.name === "SequelizeUniqueConstraintError") {
        console.log("🔄 Duplicate invoice detected, generating new one...");

        // Generate invoice number baru
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000000);
        const newInvoiceNumber = `INV/${timestamp}-${random}`;

        // Update data dan save ulang
        const transactionData = {
          id: orderId,
          invoice_number: newInvoiceNumber,
          total: grossAmount,
          status: "PENDING_PAYMENT",
          customer_name: user.name,
          customer_email: user.email,
          snap_token: midtransResponse.token,
          snap_redirect_url: midtransResponse.redirect_url,
          user_id: userId,
          plan: plan,
          created_at: new Date(),
          updated_at: new Date(),
        };

        await Transaction.create(transactionData);
        console.log(
          "✅ Transaction saved with new invoice number:",
          newInvoiceNumber
        );

        invoiceNumber = newInvoiceNumber; // Update untuk response
      } else {
        throw dbError;
      }
    }

    // Response untuk frontend
    const responseData = {
      success: true,
      message: "Transaksi berhasil dibuat",
      data: {
        token: midtransResponse.token,
        redirect_url: midtransResponse.redirect_url,
        orderId: orderId,
        invoiceNumber: invoiceNumber,
        amount: grossAmount,
        plan: plan,
      },
    };

    console.log("\n✅ Transaction created successfully!");
    console.log("Order ID:", orderId);
    console.log("Redirect URL:", midtransResponse.redirect_url);
    console.log("=== 🏁 END CREATE TRANSACTION ===\n");

    return res.json(responseData);
  } catch (error) {
    console.error("\n❌ CREATE TRANSACTION ERROR:", error);
    console.error("Stack:", error.stack);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// === GET TRANSACTION TOKEN (UNTUK CONTINUE PAYMENT) ===
export const getTransactionToken = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    console.log(`🔍 Getting token for transaction: ${orderId}`);

    // Cari transaksi
    const transaction = await Transaction.findOne({
      where: {
        id: orderId,
        user_id: userId,
        status: "PENDING_PAYMENT",
      },
      attributes: ["id", "snap_token", "plan", "status", "created_at"],
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaksi pending tidak ditemukan",
      });
    }

    // Cek apakah token masih valid (kurang dari 24 jam)
    const transactionAge = new Date() - new Date(transaction.created_at);
    const hoursOld = transactionAge / (1000 * 60 * 60);

    if (hoursOld > 24) {
      return res.status(400).json({
        success: false,
        message: "Token pembayaran sudah kadaluarsa",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.json({
      success: true,
      data: {
        token: transaction.snap_token,
        orderId: transaction.id,
        plan: transaction.plan,
        status: transaction.status,
        expiresIn: `${Math.floor(24 - hoursOld)} jam`,
      },
    });
  } catch (error) {
    console.error("Get transaction token error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// === GET TRANSACTION STATUS (FIXED - GABUNGAN SNAP & CORE API) ===
export const getTransactionStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    console.log(`\n🔍 Checking status for: ${orderId}`);

    // Cari transaksi
    const transaction = await Transaction.findOne({
      where: {
        id: orderId,
        user_id: userId,
      },
    });

    if (!transaction) {
      console.log("❌ Transaction not found in database");
      return res.status(404).json({
        success: false,
        message: "Transaksi tidak ditemukan",
      });
    }

    console.log(`📊 Database status: ${transaction.status}`);
    console.log(`📅 Plan: ${transaction.plan}`);

    // Jika sudah PAID, tetap update subscription
    if (transaction.status === "PAID") {
      console.log("✅ Transaction already PAID, checking subscription...");
      await updateUserSubscription(userId, transaction);
      // Kembalikan data termasuk snap_token untuk reference
      const transactionData = {
        id: transaction.id,
        invoice_number: transaction.invoice_number,
        total: transaction.total,
        status: transaction.status,
        customer_name: transaction.customer_name,
        customer_email: transaction.customer_email,
        payment_method: transaction.payment_method,
        plan: transaction.plan,
        snap_token: transaction.snap_token, // <- TAMBAHKAN
        snap_redirect_url: transaction.snap_redirect_url,
        midtrans_transaction_id: transaction.midtrans_transaction_id,
        transaction_time: transaction.transaction_time,
        created_at: transaction.created_at,
        updated_at: transaction.updated_at,
      };
      return res.json({
        success: true,
        data: transactionData,
        message: "Transaksi sudah dibayar",
      });
    }

    // **PERBAIKAN 1: Coba Core API dulu (V2 API)**
    console.log("🔄 Checking Midtrans with Core API (V2)...");

    try {
      const status = await core.transaction.status(orderId);
      console.log(`📡 Core API status: ${status.transaction_status}`);

      let newStatus = transaction.status;
      let isPaid = false;

      if (
        status.transaction_status === "settlement" ||
        status.transaction_status === "capture"
      ) {
        newStatus = "PAID";
        isPaid = true;
      } else if (status.transaction_status === "pending") {
        newStatus = "PENDING_PAYMENT";
      } else if (
        ["cancel", "deny", "expire"].includes(status.transaction_status)
      ) {
        newStatus = "CANCELED";
      }

      console.log(`🔄 Update: ${transaction.status} -> ${newStatus}`);

      // Update transaksi
      await transaction.update({
        status: newStatus,
        payment_method: status.payment_type || transaction.payment_method,
        transaction_time:
          status.settlement_time || status.transaction_time || new Date(),
        midtrans_transaction_id: status.transaction_id,
        updated_at: new Date(),
      });

      // Jika berhasil dibayar
      if (isPaid) {
        console.log(`💰 Payment successful, updating subscription...`);
        await updateUserSubscription(userId, transaction);
      }

      await transaction.reload();

      const transactionData = {
        id: transaction.id,
        invoice_number: transaction.invoice_number,
        total: transaction.total,
        status: transaction.status,
        customer_name: transaction.customer_name,
        customer_email: transaction.customer_email,
        payment_method: transaction.payment_method,
        plan: transaction.plan,
        snap_token: transaction.snap_token, // <- TAMBAHKAN
        snap_redirect_url: transaction.snap_redirect_url,
        midtrans_transaction_id: transaction.midtrans_transaction_id,
        transaction_time: transaction.transaction_time,
        created_at: transaction.created_at,
        updated_at: transaction.updated_at,
      };

      return res.json({
        success: true,
        data: transactionData,
        message: `Status: ${transaction.status}`,
      });
    } catch (coreError) {
      console.log("⚠️ Core API failed, trying Snap API...", coreError.message);

      // **PERBAIKAN 2: Coba Snap API sebagai fallback**
      try {
        const status = await snap.transaction.status(orderId);
        console.log(`📡 Snap API status: ${status.transaction_status}`);

        let newStatus = transaction.status;
        let isPaid = false;

        if (status.transaction_status === "settlement") {
          newStatus = "PAID";
          isPaid = true;
        } else if (status.transaction_status === "pending") {
          newStatus = "PENDING_PAYMENT";
        } else if (
          ["cancel", "deny", "expire"].includes(status.transaction_status)
        ) {
          newStatus = "CANCELED";
        }

        console.log(`🔄 Update: ${transaction.status} -> ${newStatus}`);

        // Update transaksi
        await transaction.update({
          status: newStatus,
          payment_method: status.payment_type || transaction.payment_method,
          transaction_time: status.settlement_time || new Date(),
          midtrans_transaction_id: status.transaction_id,
          updated_at: new Date(),
        });

        // Jika berhasil dibayar
        if (isPaid) {
          console.log(`💰 Payment successful, updating subscription...`);
          await updateUserSubscription(userId, transaction);
        }

        await transaction.reload();

        return res.json({
          success: true,
          data: transaction,
          message: `Status: ${newStatus}`,
        });
      } catch (snapError) {
        console.log("⚠️ Snap API also failed:", snapError.message);

        // **PERBAIKAN 3: Coba direct API call**
        try {
          const axios = (await import("axios")).default;

          console.log("🌐 Trying direct API call...");
          const response = await axios.get(
            `https://api.sandbox.midtrans.com/v2/${orderId}/status`,
            {
              headers: {
                Accept: "application/json",
                Authorization:
                  "Basic " +
                  Buffer.from(process.env.MIDTRANS_SERVER_KEY + ":").toString(
                    "base64"
                  ),
              },
            }
          );

          console.log(
            `📡 Direct API status: ${response.data.transaction_status}`
          );

          if (response.data.transaction_status === "settlement") {
            await transaction.update({
              status: "PAID",
              payment_method: response.data.payment_type || "dana",
              midtrans_transaction_id: response.data.transaction_id,
              transaction_time: response.data.settlement_time || new Date(),
              updated_at: new Date(),
            });

            await updateUserSubscription(userId, transaction);
            await transaction.reload();
          }

          return res.json({
            success: true,
            data: transaction,
            message: `Status from direct API: ${response.data.transaction_status}`,
          });
        } catch (directError) {
          console.log("⚠️ All API methods failed");

          // Jika semua gagal, coba manual check dari dashboard data
          // Cek apakah transaksi sudah lebih dari 1 jam
          const transactionAge = new Date() - new Date(transaction.created_at);
          const hoursOld = transactionAge / (1000 * 60 * 60);

          if (hoursOld > 1) {
            console.log("🕒 Transaction is old, checking locally...");
            // Berdasarkan data dashboard, transaksi sudah settlement
            // Tapi karena API gagal, kita beri warning saja

            return res.json({
              success: true,
              data: transaction,
              warning: "Cannot connect to Midtrans API",
              note: "Please check Midtrans dashboard manually. Transaction in dashboard shows SETTLEMENT.",
              dashboard_check:
                "https://dashboard.sandbox.midtrans.com/transactions",
            });
          }

          return res.json({
            success: true,
            data: transaction,
            warning: "Tidak bisa menghubungi Midtrans",
            note: "Status lokal: " + transaction.status,
            suggestion:
              "Try again in a few minutes or check Midtrans dashboard",
          });
        }
      }
    }
  } catch (error) {
    console.error("❌ Status check error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// === SYNC FROM MIDTRANS DASHBOARD (NEW) ===
export const syncFromDashboard = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    console.log(`🔄 Syncing from dashboard: ${orderId}`);

    // Cari transaksi
    const transaction = await Transaction.findOne({
      where: {
        id: orderId,
        user_id: userId,
      },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Data dari dashboard (dibaca dari parameter)
    const {
      midtransTransactionId,
      paymentMethod,
      transactionTime,
      dashboardStatus,
    } = req.body;

    console.log("📊 Dashboard data:", {
      midtransTransactionId,
      paymentMethod,
      transactionTime,
      dashboardStatus,
    });

    // Update berdasarkan dashboard data
    let newStatus = transaction.status;
    let isPaid = false;

    if (dashboardStatus === "settlement" || dashboardStatus === "Settlement") {
      newStatus = "PAID";
      isPaid = true;
    }

    console.log(`🔄 Updating: ${transaction.status} -> ${newStatus}`);

    // Update transaksi
    await transaction.update({
      status: newStatus,
      payment_method: paymentMethod || transaction.payment_method,
      midtrans_transaction_id:
        midtransTransactionId || transaction.midtrans_transaction_id,
      transaction_time:
        transactionTime || transaction.transaction_time || new Date(),
      updated_at: new Date(),
    });

    // Jika berhasil dibayar
    if (isPaid) {
      console.log(`💰 Updating subscription for user ${userId}`);
      await updateUserSubscription(userId, transaction);
    }

    await transaction.reload();

    return res.json({
      success: true,
      message: "Sync from dashboard successful",
      data: transaction,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// === AUTO-FIX PAST TRANSACTIONS (CRON JOB) ===
export const autoFixPastTransactions = async () => {
  console.log("\n🔧 Running auto-fix for past transactions...");

  try {
    // Cari transaksi yang PENDING lebih dari 30 menit
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const pendingTransactions = await Transaction.findAll({
      where: {
        status: "PENDING_PAYMENT",
        created_at: {
          [Op.lt]: thirtyMinutesAgo,
        },
      },
      limit: 50,
    });

    console.log(`Found ${pendingTransactions.length} old pending transactions`);

    for (const transaction of pendingTransactions) {
      try {
        console.log(`🔍 Checking: ${transaction.id}`);

        // Coba cek ke Midtrans dengan Core API
        const status = await core.transaction.status(transaction.id);

        if (status.transaction_status === "settlement") {
          console.log(`✅ Found settlement for ${transaction.id}`);

          // Update database
          await transaction.update({
            status: "PAID",
            payment_method: status.payment_type,
            midtrans_transaction_id: status.transaction_id,
            transaction_time: status.settlement_time || new Date(),
            updated_at: new Date(),
          });

          // Update subscription
          await updateUserSubscription(transaction.user_id, transaction);

          console.log(`✅ Fixed transaction ${transaction.id}`);
        }
      } catch (error) {
        console.log(`⚠️ Could not check ${transaction.id}:`, error.message);
      }
    }

    console.log("✅ Auto-fix completed");
  } catch (error) {
    console.error("Auto-fix error:", error);
  }
};

// === HELPER FUNCTION: UPDATE SUBSCRIPTION ===
const updateUserSubscription = async (userId, transaction) => {
  try {
    console.log(`\n🔄 Updating subscription for user ${userId}`);

    const user = await User.findByPk(userId);
    if (!user) {
      console.error("User not found:", userId);
      return;
    }

    // Calculate expiration date
    let expiresAt = new Date();
    if (transaction.plan === "pro") {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      console.log(`📅 Pro plan: 1 month from now`);
    } else if (transaction.plan === "lifetime") {
      expiresAt.setFullYear(expiresAt.getFullYear() + 100);
      console.log(`📅 Lifetime plan: 100 years from now`);
    }

    // Update or create subscription
    const [subscription, created] = await Subscription.upsert(
      {
        userId: userId,
        plan: transaction.plan,
        expiresAt: expiresAt,
        isActive: true,
        paymentMethod: transaction.payment_method || "midtrans",
        transactionId: transaction.id,
        updated_at: new Date(),
      },
      {
        returning: true,
      }
    );

    if (created) {
      console.log(`✅ Created new subscription: ${transaction.plan} plan`);
    } else {
      console.log(
        `✅ Updated existing subscription to: ${transaction.plan} plan`
      );
    }

    // Update user status jika perlu
    if (user.status === "pending") {
      await user.update({ status: "active" });
      console.log(`✅ Updated user status to active`);
    }

    console.log(`🎉 Subscription updated successfully for user ${userId}`);
    return subscription;
  } catch (error) {
    console.error("❌ Error updating subscription:", error);
    throw error;
  }
};

// === HANDLE NOTIFICATION (UPDATED - WITH SIGNATURE VALIDATION) ===
export const handleNotification = async (req, res) => {
  try {
    const notification = req.body;
    console.log(
      "📩 Notification received:",
      JSON.stringify(notification, null, 2)
    );

    // 1. VALIDASI SIGNATURE KEY [citation:1][citation:6]
    const hash = crypto
      .createHash("sha512")
      .update(
        notification.order_id +
          notification.status_code +
          notification.gross_amount +
          process.env.MIDTRANS_SERVER_KEY
      )
      .digest("hex");

    if (notification.signature_key !== hash) {
      console.error("❌ Invalid signature key!");
      // Kembalikan status 400 untuk menunjukkan request yang buruk, Midtrans akan coba ulang [citation:1]
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    // 2. CEK STATUS CODE & FRAUD STATUS [citation:1]
    // Status code harus 200 untuk transaksi sukses
    if (notification.status_code !== "200") {
      console.log(
        `⚠️ Status code bukan 200: ${notification.status_code}. Transaksi mungkin gagal atau masih pending.`
      );
    }

    // Untuk transaksi capture, fraud_status harus 'accept' [citation:1]
    if (
      notification.transaction_status === "capture" &&
      notification.fraud_status !== "accept"
    ) {
      console.error(
        `❌ Fraud status tidak diterima: ${notification.fraud_status}`
      );
      // Update status transaksi di database ke status yang sesuai (misal: DENIED)
      await Transaction.update(
        { status: "DENIED", updated_at: new Date() },
        { where: { id: notification.order_id } }
      );
      return res
        .status(200)
        .json({ success: true, message: "Fraud denied handled" });
    }

    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;

    console.log(
      `🔍 Processing: ${orderId}, Status: ${transactionStatus}, Fraud: ${notification.fraud_status}`
    );

    // 3. CARI TRANSAKSI DAN UPDATE STATUS [citation:1]
    const transaction = await Transaction.findOne({
      where: { id: orderId },
    });

    if (!transaction) {
      console.error("❌ Transaction not found in database:", orderId);
      // Kembalikan 404, Midtrans akan coba ulang [citation:1]
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    // Hindari pembaruan status yang "mundur" (misal: settlement notif datang setelah cancel) [citation:1]
    const statusPrecedence = {
      PAID: 3,
      PENDING_PAYMENT: 2,
      CANCELED: 1,
      EXPIRED: 1,
      DENIED: 1,
    };

    let newStatus = transaction.status;
    let isPaid = false;

    // Tentukan status baru berdasarkan notifikasi
    if (transactionStatus === "capture" || transactionStatus === "settlement") {
      newStatus = "PAID";
      isPaid = true;
    } else if (transactionStatus === "pending") {
      newStatus = "PENDING_PAYMENT";
    } else if (["cancel", "deny", "expire"].includes(transactionStatus)) {
      newStatus = "CANCELED";
    }

    // Jika status di database sudah lebih tinggi (misal sudah PAID), jangan update ke status lebih rendah
    if (statusPrecedence[transaction.status] > statusPrecedence[newStatus]) {
      console.log(
        `⚠️ Ignoring delayed status update. Current: ${transaction.status}, Incoming: ${newStatus}`
      );
      return res
        .status(200)
        .json({ success: true, message: "Ignored delayed status" });
    }

    console.log(`🔄 Updating database: ${transaction.status} -> ${newStatus}`);

    // Update transaksi di database
    await transaction.update({
      status: newStatus,
      payment_method: notification.payment_type,
      transaction_time:
        notification.settlement_time ||
        notification.transaction_time ||
        new Date(),
      midtrans_transaction_id: notification.transaction_id,
      updated_at: new Date(),
    });

    // 4. UPDATE SUBSCRIPTION JIKA PEMBAYARAN BERHASIL
    if (isPaid) {
      console.log(
        `💰 Payment successful, updating subscription for user: ${transaction.user_id}`
      );
      await updateUserSubscription(transaction.user_id, transaction);
    }

    console.log("✅ Notification processed successfully");
    // Selalu kembalikan 2xx untuk menandakan notifikasi berhasil diterima [citation:1]
    res.status(200).json({ success: true, message: "Notification processed" });
  } catch (error) {
    console.error("❌ Notification processing error:", error);
    // Kembalikan 5xx untuk error server, Midtrans akan coba ulang [citation:1]
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// PERBAIKAN: forceSyncTransaction di transactionController.js
export const forceSyncTransaction = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    console.log(`🔄 Force sync: ${orderId}`);

    const transaction = await Transaction.findOne({
      where: {
        id: orderId,
        user_id: userId,
      },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // === TAMBAHKAN VALIDASI KEAMANAN ===

    // 1. Cek apakah transaksi sudah dibatalkan/expired di Midtrans
    let midtransStatus;
    try {
      // Gunakan Core API untuk cek status
      const status = await core.transaction.status(orderId);
      midtransStatus = status.transaction_status;
      console.log(`📡 Midtrans status: ${midtransStatus}`);

      // JIKA STATUS DI MIDTRANS BUKAN "settlement" ATAU "capture", TOLAK!
      if (!["settlement", "capture"].includes(midtransStatus)) {
        return res.status(400).json({
          success: false,
          message: `Transaksi belum dibayar. Status di Midtrans: ${midtransStatus}`,
          data: {
            midtrans_status: midtransStatus,
            order_id: orderId,
          },
        });
      }
    } catch (error) {
      console.error("❌ Error checking Midtrans status:", error.message);
      return res.status(500).json({
        success: false,
        message: "Gagal memverifikasi status pembayaran di Midtrans",
        error: "Cannot verify payment with Midtrans",
      });
    }

    // 2. Validasi tambahan: cek waktu transaksi (jika > 24 jam, butuh approval manual)
    const transactionAge = new Date() - new Date(transaction.created_at);
    const hoursOld = transactionAge / (1000 * 60 * 60);

    if (hoursOld > 24) {
      return res.status(400).json({
        success: false,
        message: "Transaksi sudah kadaluarsa. Silakan buat transaksi baru.",
        code: "TRANSACTION_EXPIRED",
      });
    }

    // 3. Hanya update jika status di Midtrans adalah settlement/capture
    if (midtransStatus === "settlement" || midtransStatus === "capture") {
      console.log(`✅ Midtrans confirmed payment for ${orderId}`);

      // Update transaksi di database
      await transaction.update({
        status: "PAID",
        payment_method: transaction.payment_method || "midtrans",
        updated_at: new Date(),
      });

      // Update subscription
      const user = await User.findByPk(userId);
      if (user && transaction.plan) {
        let expiresAt = new Date();
        if (transaction.plan === "pro") {
          expiresAt.setMonth(expiresAt.getMonth() + 1);
        } else if (transaction.plan === "lifetime") {
          expiresAt.setFullYear(expiresAt.getFullYear() + 100);
        }

        await Subscription.upsert({
          userId: userId,
          plan: transaction.plan,
          expiresAt: expiresAt,
          isActive: true,
          transactionId: transaction.id,
          updated_at: new Date(),
        });
      }

      await transaction.reload();

      return res.json({
        success: true,
        message: "Force sync completed. Subscription activated.",
        data: transaction,
      });
    } else {
      // Jika Midtrans status bukan settlement, kembalikan error
      return res.status(400).json({
        success: false,
        message: `Pembayaran belum terkonfirmasi. Status: ${midtransStatus}`,
        data: {
          midtrans_status: midtransStatus,
          required_status: ["settlement", "capture"],
        },
      });
    }
  } catch (error) {
    console.error("Force sync error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// transactionController.js - tambahkan endpoint baru
export const cancelTransaction = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    const transaction = await Transaction.findOne({
      where: {
        id: orderId,
        user_id: userId,
        status: "PENDING_PAYMENT",
      },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found or already processed",
      });
    }

    // Update status to canceled
    await transaction.update({
      status: "CANCELED",
      updated_at: new Date(),
    });

    res.json({
      success: true,
      message: "Transaction cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel transaction error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// === GET USER TRANSACTIONS ===
export const getUserTransactions = async (req, res) => {
  try {
    const userId = req.userId;

    const transactions = await Transaction.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Fungsi untuk format currency
const formatCurrency = (amount) => {
  const numAmount = Number(amount);
  if (isNaN(numAmount)) return "Rp 0";
  return `Rp ${numAmount.toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

// Fungsi fallback untuk generate invoice number jika tidak ada di database
const generateInvoiceNumberFallback = (transactionId, transactionDate) => {
  const date = new Date(transactionDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const shortId = transactionId.replace("ORDER-", "").substring(0, 8);
  return `INV/PD/${year}/${month}/${day}/${shortId}`;
};

// Get invoice data (JSON untuk preview) - UPDATED: menggunakan invoice_number dari database
export const getInvoiceData = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    // Cari transaksi
    const transaction = await Transaction.findOne({
      where: {
        id: orderId,
        user_id: userId,
        status: "PAID",
      },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaksi tidak ditemukan",
      });
    }

    // Cari user
    const user = await User.findByPk(userId);

    // Cari subscription
    const subscription = await Subscription.findOne({
      where: {
        transactionId: orderId,
        userId: userId,
      },
    });

    // Di controller getInvoiceData, tambahkan log:
    console.log("Transaction found:", transaction);
    console.log("Subscription found:", subscription);
    console.log("Subscription plan:", subscription?.plan);
    console.log("ExpiresAt:", subscription?.expiresAt);

    // Gunakan invoice_number dari database, jika kosong gunakan fallback
    const invoiceNumber =
      transaction.invoice_number ||
      generateInvoiceNumberFallback(transaction.id, transaction.created_at);

    // **PERBAIKAN: Tentukan teks untuk "Berlaku Hingga" berdasarkan plan**
    let expiresAtText = "Tidak tersedia";
    let expiresAtDate = null;

    if (subscription) {
      if (subscription.plan === "lifetime") {
        expiresAtText = "Seumur Hidup";
      } else if (subscription.plan === "free") {
        expiresAtText = "Selamanya";
      } else if (subscription.expiresAt) {
        // Untuk plan pro, format tanggal
        expiresAtDate = subscription.expiresAt;
        expiresAtText = new Date(subscription.expiresAt).toLocaleDateString(
          "id-ID",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        );
      }
    }

    const invoiceData = {
      invoiceNumber: invoiceNumber,
      orderId: transaction.id,
      date: transaction.created_at,
      paymentDate: transaction.transaction_time || transaction.created_at,
      customer: {
        name: transaction.customer_name,
        email: transaction.customer_email,
        phone: user?.phone_number,
      },
      items: [
        {
          description: `${transaction.plan.toUpperCase()} Plan Subscription`,
          price: transaction.total,
          quantity: 1,
          total: transaction.total,
        },
      ],
      subtotal: transaction.total,
      tax: 0,
      total: transaction.total,
      paymentMethod: transaction.payment_method || "Midtrans",
      status: "PAID",
      plan: transaction.plan,
      expiresAt: subscription?.expiresAt,
      // **PERBAIKAN: Tambahkan field untuk teks yang sudah diformat**
      expiresAtText: expiresAtText,
      expiresAtDate: expiresAtDate,
      isLifetimePlan: subscription?.plan === "lifetime",
      isFreePlan: subscription?.plan === "free",
    };

    res.json({
      success: true,
      data: invoiceData,
    });
  } catch (error) {
    console.error("Error getting invoice data:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Generate invoice PDF - UPDATED: menggunakan invoice_number dari database
export const generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    console.log(`📄 Generating invoice for: ${orderId}`);

    // Cari transaksi
    const transaction = await Transaction.findOne({
      where: {
        id: orderId,
        user_id: userId,
        status: "PAID",
      },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaksi tidak ditemukan atau belum dibayar",
      });
    }

    // Cari user dan subscription
    const user = await User.findByPk(userId);
    const subscription = await Subscription.findOne({
      where: {
        transactionId: orderId,
        userId: userId,
      },
    });

    // Path ke font Outfit
    const fontPath = path.join(__dirname, "../../fonts");

    // Load font Outfit
    let fonts;
    try {
      fonts = {
        regular: fs.readFileSync(path.join(fontPath, "Outfit-Regular.ttf")),
        bold: fs.readFileSync(path.join(fontPath, "Outfit-Bold.ttf")),
        medium: fs.readFileSync(path.join(fontPath, "Outfit-Medium.ttf")),
        semibold: fs.readFileSync(path.join(fontPath, "Outfit-SemiBold.ttf")),
        light: fs.readFileSync(path.join(fontPath, "Outfit-Light.ttf")),
      };
    } catch (error) {
      console.log("⚠️ Font Outfit tidak ditemukan, menggunakan font default");
      fonts = {
        regular: null,
        bold: null,
        medium: null,
        semibold: null,
        light: null,
      };
    }

    // Buat PDF document
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      bufferPages: true,
    });

    // Register font Outfit jika tersedia
    if (fonts.regular) {
      doc.registerFont("Outfit-Regular", fonts.regular);
      doc.registerFont("Outfit-Bold", fonts.bold);
      doc.registerFont("Outfit-Medium", fonts.medium);
      doc.registerFont("Outfit-SemiBold", fonts.semibold);
      doc.registerFont("Outfit-Light", fonts.light);
    }

    // Setup response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoice-${orderId}.pdf"`
    );

    // Pipe PDF ke response
    doc.pipe(res);

    // Konstanta untuk layout yang konsisten
    const MARGIN = 50;
    const PAGE_WIDTH = doc.page.width;
    const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

    let currentY = 0;

    // =========== HEADER INVOICE ===========
    const HEADER_HEIGHT = 110;

    // Background header biru dengan gradasi
    const headerGradient = doc
      .linearGradient(0, 0, 0, HEADER_HEIGHT)
      .stop(0, "#1e293b")
      .stop(1, "#0f172a");

    doc.rect(0, 0, PAGE_WIDTH, HEADER_HEIGHT).fill(headerGradient);

    // Logo/Teks perusahaan di kiri
    doc
      .fillColor("#ffffff")
      .fontSize(24)
      .font(fonts.bold ? "Outfit-Bold" : "Helvetica-Bold")
      .text("Pips Diary", MARGIN, 32);

    doc
      .fillColor("#cbd5e1")
      .fontSize(10)
      .font(fonts.light ? "Outfit-Light" : "Helvetica")
      .text("Master Your Trading Journey", MARGIN, 60);

    // Invoice info di kanan atas
    // GUNAKAN invoice_number DARI DATABASE, JIKA KOSONG GUNAKAN FALLBACK
    const invoiceNumber =
      transaction.invoice_number ||
      generateInvoiceNumberFallback(transaction.id, transaction.created_at);

    doc
      .fillColor("#ffffff")
      .fontSize(20)
      .font(fonts.bold ? "Outfit-Bold" : "Helvetica-Bold")
      .text("INVOICE", PAGE_WIDTH - 200, 32, {
        width: 150,
        align: "right",
      });

    doc
      .fillColor("#cbd5e1")
      .fontSize(10)
      .font(fonts.regular ? "Outfit-Regular" : "Helvetica")
      .text(invoiceNumber, PAGE_WIDTH - 200, 60, {
        width: 150,
        align: "right",
      });

    currentY = HEADER_HEIGHT + 20;

    // =========== INFORMASI PERUSAHAAN & PELANGGAN ===========
    const INFO_SECTION_HEIGHT = 95;

    // Kolom kiri: Perusahaan
    doc
      .fillColor("#1e293b")
      .fontSize(11)
      .font(fonts.semibold ? "Outfit-SemiBold" : "Helvetica-Bold")
      .text("DARI:", MARGIN, currentY);

    doc
      .fillColor("#475569")
      .fontSize(9)
      .font(fonts.regular ? "Outfit-Regular" : "Helvetica")
      .text("Pips Diary", MARGIN, currentY + 18)
      .text("Manado, Indonesia", MARGIN, currentY + 32)
      .text("support@pipsdiary.com", MARGIN, currentY + 46)
      .text("+62 851 7324 6048", MARGIN, currentY + 60);

    // Kolom kanan: Pelanggan
    const customerX = PAGE_WIDTH / 2 + 20;

    doc
      .fillColor("#1e293b")
      .fontSize(11)
      .font(fonts.semibold ? "Outfit-SemiBold" : "Helvetica-Bold")
      .text("KEPADA:", customerX, currentY);

    const customerName = transaction.customer_name || "Pelanggan";
    const customerEmail = transaction.customer_email;

    doc
      .fillColor("#475569")
      .fontSize(9)
      .font(fonts.regular ? "Outfit-Regular" : "Helvetica")
      .text(customerName, customerX, currentY + 18)
      .text(customerEmail, customerX, currentY + 32);

    if (user?.phone_number) {
      doc.text(user.phone_number, customerX, currentY + 46);
    }

    currentY += INFO_SECTION_HEIGHT + 20;

    // =========== RINGKASAN TRANSAKSI ===========
    doc
      .fillColor("#1e293b")
      .fontSize(13)
      .font(fonts.bold ? "Outfit-Bold" : "Helvetica-Bold")
      .text("Ringkasan Transaksi", MARGIN, currentY);

    currentY += 20;

    // Container ringkasan dengan border
    const SUMMARY_BOX_HEIGHT = 120;
    doc
      .rect(MARGIN, currentY, CONTENT_WIDTH, SUMMARY_BOX_HEIGHT)
      .fillAndStroke("#f8fafc", "#e2e8f0")
      .lineWidth(1);

    // Padding dalam box
    const BOX_PADDING = 18;
    const boxContentY = currentY + BOX_PADDING;
    const col1X = MARGIN + BOX_PADDING;
    const col2X = MARGIN + CONTENT_WIDTH / 2;
    const ROW_SPACING = 32;

    // Baris 1: Nomor Invoice & Order ID
    doc
      .fillColor("#64748b")
      .fontSize(8)
      .font(fonts.regular ? "Outfit-Regular" : "Helvetica")
      .text("Nomor Invoice", col1X, boxContentY);

    doc
      .fillColor("#1e293b")
      .fontSize(10)
      .font(fonts.medium ? "Outfit-Medium" : "Helvetica-Bold")
      .text(invoiceNumber, col1X, boxContentY + 11, { width: 200 });

    doc
      .fillColor("#64748b")
      .fontSize(8)
      .font(fonts.regular ? "Outfit-Regular" : "Helvetica")
      .text("Order ID", col2X, boxContentY);

    doc
      .fillColor("#1e293b")
      .fontSize(10)
      .font(fonts.medium ? "Outfit-Medium" : "Helvetica-Bold")
      .text(transaction.id, col2X, boxContentY + 11, { width: 200 });

    // Baris 2: Tanggal Transaksi & Status
    const row2Y = boxContentY + ROW_SPACING;

    doc
      .fillColor("#64748b")
      .fontSize(8)
      .font(fonts.regular ? "Outfit-Regular" : "Helvetica")
      .text("Tanggal Transaksi", col1X, row2Y);

    doc
      .fillColor("#1e293b")
      .fontSize(10)
      .font(fonts.medium ? "Outfit-Medium" : "Helvetica-Bold")
      .text(
        format(new Date(transaction.created_at), "dd MMMM yyyy HH:mm", {
          locale: id,
        }),
        col1X,
        row2Y + 11,
        { width: 200 }
      );

    doc
      .fillColor("#64748b")
      .fontSize(8)
      .font(fonts.regular ? "Outfit-Regular" : "Helvetica")
      .text("Status", col2X, row2Y);

    doc
      .fillColor("#10b981")
      .fontSize(10)
      .font(fonts.semibold ? "Outfit-SemiBold" : "Helvetica-Bold")
      .text("✓ Dibayar", col2X, row2Y + 11);

    // Baris 3: Metode Pembayaran & Tanggal Jatuh Tempo
    const row3Y = boxContentY + ROW_SPACING * 2;

    doc
      .fillColor("#64748b")
      .fontSize(8)
      .font(fonts.regular ? "Outfit-Regular" : "Helvetica")
      .text("Metode Pembayaran", col1X, row3Y);

    doc
      .fillColor("#1e293b")
      .fontSize(10)
      .font(fonts.medium ? "Outfit-Medium" : "Helvetica-Bold")
      .text(transaction.payment_method || "Midtrans", col1X, row3Y + 11);

    doc
      .fillColor("#64748b")
      .fontSize(8)
      .font(fonts.regular ? "Outfit-Regular" : "Helvetica")
      .text("Tanggal Jatuh Tempo", col2X, row3Y);

    doc
      .fillColor("#1e293b")
      .fontSize(10)
      .font(fonts.medium ? "Outfit-Medium" : "Helvetica-Bold")
      .text(
        format(new Date(transaction.created_at), "dd MMMM yyyy", {
          locale: id,
        }),
        col2X,
        row3Y + 11
      );

    currentY += SUMMARY_BOX_HEIGHT + 20;

    // =========== DETAIL LANGGANAN ===========
    doc
      .fillColor("#1e293b")
      .fontSize(11)
      .font(fonts.semibold ? "Outfit-SemiBold" : "Helvetica-Bold")
      .text("Detail Langganan:", MARGIN, currentY);

    if (subscription?.expiresAt) {
      doc
        .fillColor("#475569")
        .fontSize(9)
        .font(fonts.regular ? "Outfit-Regular" : "Helvetica")
        .text(
          `${transaction.plan.toUpperCase()} Plan • Periode: ${format(
            new Date(transaction.created_at),
            "dd MMM yyyy",
            { locale: id }
          )} - ${format(new Date(subscription.expiresAt), "dd MMM yyyy", {
            locale: id,
          })}`,
          MARGIN,
          currentY + 16
        );
    }

    currentY += 40;

    // =========== DETAIL PRODUK/SERVIS ===========
    doc
      .fillColor("#1e293b")
      .fontSize(13)
      .font(fonts.bold ? "Outfit-Bold" : "Helvetica-Bold")
      .text("Detail Produk/Servis", MARGIN, currentY);

    currentY += 20;

    // Header tabel
    const TABLE_HEADER_HEIGHT = 28;
    doc
      .rect(MARGIN, currentY, CONTENT_WIDTH, TABLE_HEADER_HEIGHT)
      .fill("#475569");

    // Kolom tabel dengan proporsi yang baik
    const descWidth = CONTENT_WIDTH * 0.5;
    const qtyWidth = CONTENT_WIDTH * 0.1;
    const priceWidth = CONTENT_WIDTH * 0.2;
    const totalWidth = CONTENT_WIDTH * 0.2;

    const descX = MARGIN + 15;
    const qtyX = MARGIN + descWidth;
    const priceX = MARGIN + descWidth + qtyWidth;
    const totalX = MARGIN + descWidth + qtyWidth + priceWidth;

    doc
      .fillColor("#ffffff")
      .fontSize(10)
      .font(fonts.semibold ? "Outfit-SemiBold" : "Helvetica-Bold")
      .text("DESKRIPSI", descX, currentY + 9)
      .text("QTY", qtyX + 10, currentY + 9, {
        width: qtyWidth - 20,
        align: "center",
      })
      .text("HARGA", priceX + 10, currentY + 9, {
        width: priceWidth - 20,
        align: "right",
      })
      .text("TOTAL", totalX + 10, currentY + 9, {
        width: totalWidth - 20,
        align: "right",
      });

    currentY += TABLE_HEADER_HEIGHT;

    // Baris produk dengan background
    const PRODUCT_ROW_HEIGHT = 48;
    doc
      .rect(MARGIN, currentY, CONTENT_WIDTH, PRODUCT_ROW_HEIGHT)
      .fillAndStroke("#ffffff", "#e2e8f0")
      .lineWidth(1);

    const productRowY = currentY + 11;

    // Deskripsi produk
    doc
      .fillColor("#1e293b")
      .fontSize(10)
      .font(fonts.semibold ? "Outfit-SemiBold" : "Helvetica-Bold")
      .text(
        `${transaction.plan.toUpperCase()} Plan Subscription`,
        descX,
        productRowY
      );

    doc
      .fillColor("#64748b")
      .fontSize(8)
      .font(fonts.regular ? "Outfit-Regular" : "Helvetica")
      .text("Akses premium ke platform Pips Diary", descX, productRowY + 14, {
        width: descWidth - 30,
      });

    // QTY
    doc
      .fillColor("#1e293b")
      .fontSize(10)
      .font(fonts.medium ? "Outfit-Medium" : "Helvetica")
      .text("1", qtyX + 10, productRowY + 5, {
        width: qtyWidth - 20,
        align: "center",
      });

    // Harga dan Total
    const itemPrice = formatCurrency(transaction.total);

    doc
      .fillColor("#1e293b")
      .fontSize(10)
      .font(fonts.medium ? "Outfit-Medium" : "Helvetica")
      .text(itemPrice, priceX + 10, productRowY + 5, {
        width: priceWidth - 20,
        align: "right",
      });

    doc
      .fillColor("#1e293b")
      .fontSize(10)
      .font(fonts.medium ? "Outfit-Medium" : "Helvetica")
      .text(itemPrice, totalX + 10, productRowY + 5, {
        width: totalWidth - 20,
        align: "right",
      });

    currentY += PRODUCT_ROW_HEIGHT + 20;

    // =========== RINGKASAN PEMBAYARAN ===========
    const SUMMARY_WIDTH = 260;
    const summaryBoxX = PAGE_WIDTH - MARGIN - SUMMARY_WIDTH;

    // Container ringkasan pembayaran
    const PAYMENT_BOX_HEIGHT = 150;
    doc
      .rect(summaryBoxX, currentY, SUMMARY_WIDTH, PAYMENT_BOX_HEIGHT)
      .fillAndStroke("#f8fafc", "#e2e8f0")
      .lineWidth(1);

    const summaryPadding = 15;
    let summaryY = currentY + summaryPadding;

    // Judul
    doc
      .fillColor("#1e293b")
      .fontSize(12)
      .font(fonts.bold ? "Outfit-Bold" : "Helvetica-Bold")
      .text("Ringkasan Pembayaran", summaryBoxX + summaryPadding, summaryY);

    summaryY += 25;

    // Subtotal
    const subtotalAmount = formatCurrency(transaction.total);

    doc
      .fillColor("#64748b")
      .fontSize(9)
      .font(fonts.regular ? "Outfit-Regular" : "Helvetica")
      .text("Subtotal", summaryBoxX + summaryPadding, summaryY);

    doc
      .fillColor("#1e293b")
      .fontSize(9)
      .font(fonts.medium ? "Outfit-Medium" : "Helvetica")
      .text(
        subtotalAmount,
        summaryBoxX + SUMMARY_WIDTH - summaryPadding - 80,
        summaryY,
        {
          width: 80,
          align: "right",
        }
      );

    summaryY += 16;

    // Pajak
    doc
      .fillColor("#64748b")
      .fontSize(9)
      .font(fonts.regular ? "Outfit-Regular" : "Helvetica")
      .text("Pajak (0%)", summaryBoxX + summaryPadding, summaryY);

    doc
      .fillColor("#1e293b")
      .fontSize(9)
      .font(fonts.medium ? "Outfit-Medium" : "Helvetica")
      .text(
        "Rp 0",
        summaryBoxX + SUMMARY_WIDTH - summaryPadding - 80,
        summaryY,
        {
          width: 80,
          align: "right",
        }
      );

    summaryY += 18;

    // Garis pemisah
    doc
      .moveTo(summaryBoxX + summaryPadding, summaryY)
      .lineTo(summaryBoxX + SUMMARY_WIDTH - summaryPadding, summaryY)
      .stroke("#cbd5e1")
      .lineWidth(1);

    summaryY += 14;

    // Total
    doc
      .fillColor("#1e293b")
      .fontSize(11)
      .font(fonts.semibold ? "Outfit-SemiBold" : "Helvetica-Bold")
      .text("Total", summaryBoxX + summaryPadding, summaryY);

    const totalAmount = formatCurrency(transaction.total);
    doc
      .fillColor("#10b981")
      .fontSize(13)
      .font(fonts.bold ? "Outfit-Bold" : "Helvetica-Bold")
      .text(
        totalAmount,
        summaryBoxX + SUMMARY_WIDTH - summaryPadding - 100,
        summaryY,
        {
          width: 100,
          align: "right",
        }
      );

    summaryY += 26;

    // Status pembayaran badge
    const badgeWidth = SUMMARY_WIDTH - summaryPadding * 2;
    doc
      .roundedRect(summaryBoxX + summaryPadding, summaryY, badgeWidth, 24, 4)
      .fill("#10b981");

    doc
      .fillColor("#ffffff")
      .fontSize(10)
      .font(fonts.semibold ? "Outfit-SemiBold" : "Helvetica-Bold")
      .text("✓ DIBAYAR", summaryBoxX + summaryPadding, summaryY + 7, {
        width: badgeWidth,
        align: "center",
      });

    // =========== INFORMASI TAMBAHAN (di kiri, sejajar dengan ringkasan) ===========
    let notesY = currentY;

    doc
      .fillColor("#64748b")
      .fontSize(10)
      .font(fonts.semibold ? "Outfit-SemiBold" : "Helvetica-Bold")
      .text("Catatan:", MARGIN, notesY);

    notesY += 18;

    const notes = [
      "• Invoice ini sah dan dikeluarkan secara elektronik",
      "• Pembayaran sudah diterima dan diproses",
      "• Untuk pertanyaan atau bantuan, hubungi:",
    ];

    notes.forEach((note) => {
      doc
        .fillColor("#64748b")
        .fontSize(8)
        .font(fonts.regular ? "Outfit-Regular" : "Helvetica")
        .text(note, MARGIN, notesY);
      notesY += 13;
    });

    doc
      .fillColor("#1e293b")
      .fontSize(9)
      .font(fonts.medium ? "Outfit-Medium" : "Helvetica")
      .text("support@pipsdiary.com", MARGIN + 10, notesY);

    // =========== FOOTER ===========
    const footerY = doc.page.height - 75;

    // Garis footer
    doc
      .moveTo(MARGIN, footerY)
      .lineTo(PAGE_WIDTH - MARGIN, footerY)
      .stroke("#e2e8f0")
      .lineWidth(1);

    // Informasi perusahaan di footer kiri
    doc
      .fillColor("#94a3b8")
      .fontSize(7)
      .font(fonts.regular ? "Outfit-Regular" : "Helvetica")
      .text("support@pipsdiary.com | +62 851 7324 6048", MARGIN, footerY + 12);

    // Informasi kontak di kanan footer
    const rightFooterX = PAGE_WIDTH - MARGIN - 180;
    doc.text("www.pipsdiary.com", rightFooterX, footerY + 12, {
      width: 180,
      align: "right",
    });

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error("❌ Error generating invoice:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghasilkan invoice",
      error: error.message,
    });
  }
};
