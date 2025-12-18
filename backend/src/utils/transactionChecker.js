import Transaction from "../models/transaction.js";
import Subscription from "../models/subscription.js";
import User from "../models/user.js";
import midtransClient from "midtrans-client";
import { Op } from "sequelize";

// Fungsi untuk mendapatkan config Midtrans
const getMidtransConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const serverKey = isProduction 
    ? process.env.MIDTRANS_SERVER_KEY_PRODUCTION || process.env.MIDTRANS_SERVER_KEY
    : process.env.MIDTRANS_SERVER_KEY_SANDBOX || process.env.MIDTRANS_SERVER_KEY;
    
  return {
    isProduction,
    serverKey
  };
};

export const checkPendingTransactions = async () => {
  try {
    console.log('🔄 Checking pending transactions...');
    
    // Cari semua transaksi yang masih pending
    const pendingTransactions = await Transaction.findAll({
      where: {
        status: 'PENDING_PAYMENT',
        created_at: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 jam terakhir
        }
      },
      limit: 50
    });

    console.log(`📊 Found ${pendingTransactions.length} pending transactions`);

    for (const transaction of pendingTransactions) {
      try {
        console.log(`🔍 Checking transaction: ${transaction.id}`);
        
        // Coba multiple environment
        let midtransStatus = null;
        
        // Coba sandbox
        try {
          const config = getMidtransConfig();
          const snap = new midtransClient.Snap({
            isProduction: config.isProduction,
            serverKey: config.serverKey,
          });
          midtransStatus = await snap.transaction.status(transaction.id);
          console.log(`✅ Found in ${config.isProduction ? 'PRODUCTION' : 'SANDBOX'}`);
        } catch (error) {
          console.log(`⚠️ Not found in primary environment`);
        }
        
        // Jika tidak ditemukan, coba environment sebaliknya
        if (!midtransStatus) {
          try {
            const config = getMidtransConfig();
            const altSnap = new midtransClient.Snap({
              isProduction: !config.isProduction,
              serverKey: !config.isProduction 
                ? process.env.MIDTRANS_SERVER_KEY_PRODUCTION 
                : process.env.MIDTRANS_SERVER_KEY_SANDBOX,
            });
            midtransStatus = await altSnap.transaction.status(transaction.id);
            console.log(`✅ Found in alternative environment`);
          } catch (altError) {
            console.log(`❌ Not found in any environment`);
          }
        }
        
        if (midtransStatus && midtransStatus.transaction_status === "settlement") {
          console.log(`💰 Transaction ${transaction.id} is settled!`);
          
          // Update transaction
          await transaction.update({
            status: 'PAID',
            payment_method: midtransStatus.payment_type,
            transaction_time: midtransStatus.settlement_time,
            midtrans_transaction_id: midtransStatus.transaction_id,
            updated_at: new Date(),
          });

          // Update subscription
          const user = await User.findByPk(transaction.user_id);
          if (user) {
            let expiresAt = null;
            if (transaction.plan === "pro") {
              expiresAt = new Date();
              expiresAt.setMonth(expiresAt.getMonth() + 1);
            } else if (transaction.plan === "lifetime") {
              expiresAt = new Date();
              expiresAt.setFullYear(expiresAt.getFullYear() + 100);
            }

            await Subscription.upsert({
              userId: transaction.user_id,
              plan: transaction.plan,
              expiresAt: expiresAt,
              isActive: true,
              paymentMethod: midtransStatus.payment_type,
              transactionId: transaction.id,
              updated_at: new Date(),
            });

            console.log(`✅ Subscription updated for user ${user.id}`);
          }
        } else if (!midtransStatus) {
          // Jika tidak ditemukan di Midtrans dan sudah lebih dari 1 jam, mark as expired
          const transactionAge = Date.now() - new Date(transaction.created_at).getTime();
          const oneHour = 60 * 60 * 1000;
          
          if (transactionAge > oneHour) {
            console.log(`🕐 Transaction ${transaction.id} expired (not found in Midtrans)`);
            await transaction.update({
              status: 'EXPIRED',
              updated_at: new Date(),
            });
          }
        }
      } catch (error) {
        console.error(`❌ Error checking transaction ${transaction.id}:`, error.message);
      }
    }
    
    console.log('✅ Finished checking pending transactions');
  } catch (error) {
    console.error('❌ Error in checkPendingTransactions:', error);
  }
};