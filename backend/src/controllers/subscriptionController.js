import Subscription from '../models/subscription.js';
import User from '../models/user.js';
import Target from '../models/target.js';
import nodemailer from 'nodemailer';
import transporter from '../config/email.js';
import db from '../config/database.js';

// Get user subscription
export const getSubscription = async (req, res) => {
  try {
    const userId = req.userId;

    const subscription = await Subscription.findOne({
      where: { userId },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!subscription) {
      return res.json({
        success: true,
        data: {
          plan: 'free',
          isActive: true,
          expiresAt: null,
          isExpired: false,
          isValid: true
        }
      });
    }

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getUserSubscription = async (req, res) => {
  try {
    const userId = req.userId;

    const subscription = await Subscription.findOne({
      where: { userId }
    });

    if (!subscription) {
      // Return free plan sebagai default
      return res.json({
        success: true,
        data: {
          plan: 'free',
          isActive: true,
          expiresAt: null,
          isExpired: false,
          isValid: true
        }
      });
    }

    // Cek apakah subscription sudah expired
    const now = new Date();
    const isExpired = subscription.expiresAt && new Date(subscription.expiresAt) < now;

    res.json({
      success: true,
      data: {
        ...subscription.toJSON(),
        isExpired,
        isValid: subscription.isActive && !isExpired
      }
    });
  } catch (error) {
    console.error('Get user subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// controllers/subscriptionController.js - tambahkan endpoint
export const getMySubscription = async (req, res) => {
  try {
    const userId = req.userId;

    const subscription = await Subscription.findOne({
      where: { userId },
      order: [['created_at', 'DESC']]
    });

    if (!subscription) {
      // Return free plan as default
      return res.json({
        success: true,
        data: {
          plan: 'free',
          isActive: true,
          expiresAt: null,
          isExpired: false,
          isValid: true
        }
      });
    }

    // Check if subscription is expired
    const now = new Date();
    const isExpired = subscription.expiresAt && new Date(subscription.expiresAt) < now;
    
    // Untuk plan lifetime, selalu valid
    const isValid = subscription.plan === 'lifetime' ? true : (subscription.isActive && !isExpired);

    // Untuk plan lifetime, set isExpired menjadi false meskipun ada expiresAt
    const finalIsExpired = subscription.plan === 'lifetime' ? false : isExpired;

    res.json({
      success: true,
      data: {
        ...subscription.toJSON(),
        isExpired: finalIsExpired,
        isValid
      }
    });
  } catch (error) {
    console.error('Get my subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const disableUserTarget = async (userId) => {
  try {
    const target = await Target.findOne({
      where: { userId }
    });

    if (target) {
      // Nonaktifkan target dan reset data target
      await target.update({
        enabled: false,
        targetBalance: 0.00,
        targetDate: null,
        description: '',
        useDailyTarget: false,
        dailyTargetPercentage: 0,
        dailyTargetAmount: 0,
        updated_at: new Date(),
      });
      console.log('✅ Target disabled for user:', userId);
      return true;
    }
    console.log('ℹ️ No target found for user:', userId);
    return false;
  } catch (error) {
    console.error('Error disabling target:', error);
    return false;
  }
};

// Update subscription (for admin or when user upgrades)
export const updateSubscription = async (req, res) => {
  try {
    const userId = req.userId;
    const { plan, expiresAt, isActive, paymentMethod, transactionId } = req.body;

    console.log('📥 Update Subscription Request:', {
      userId,
      plan,
      expiresAt,
      isActive,
      paymentMethod,
      transactionId
    });

    let subscription = await Subscription.findOne({
      where: { userId }
    });

    if (!subscription) {
      // Jika plan adalah free, set semua field yang relevan menjadi null/kosong
      const subscriptionData = {
        userId,
        plan: plan || 'free',
        expiresAt: plan === 'free' ? null : (expiresAt || null),
        isActive: plan === 'free' ? true : (isActive !== undefined ? isActive : true),
        paymentMethod: plan === 'free' ? 'free' : (paymentMethod || null),
        transactionId: plan === 'free' ? null : (transactionId || null)
      };
      
      subscription = await Subscription.create(subscriptionData);
      
      console.log('✅ Created new subscription:', subscription.toJSON());
      
      // Jika plan free, nonaktifkan target
      if (plan === 'free') {
        await disableUserTarget(userId);
      }
    } else {
      // **PERBAIKAN UTAMA: Jika update ke free plan dari plan berbayar, nonaktifkan target**
      const wasPaidPlan = subscription.plan !== 'free';
      const isDowngradingToFree = plan === 'free' && wasPaidPlan;
      
      if (isDowngradingToFree) {
        console.log(`🔄 User ${userId} downgrading from ${subscription.plan} to free`);
        await disableUserTarget(userId);
      }

      // Jika update ke free plan, reset semua field yang berhubungan dengan pembayaran
      const updateData = {
        plan: plan || subscription.plan,
        updated_at: new Date(),
      };

      // Jika plan adalah free, reset field-field yang berhubungan dengan pembayaran
      if (plan === 'free') {
        updateData.expiresAt = null;
        updateData.isActive = true;
        updateData.paymentMethod = 'free';
        updateData.transactionId = null;
      } else {
        // Untuk plan berbayar, gunakan nilai dari request atau tetap
        updateData.expiresAt = expiresAt !== undefined ? expiresAt : subscription.expiresAt;
        updateData.isActive = isActive !== undefined ? isActive : subscription.isActive;
        updateData.paymentMethod = paymentMethod || subscription.paymentMethod;
        updateData.transactionId = transactionId || subscription.transactionId;
      }
      
      await subscription.update(updateData);
      
      console.log('✅ Updated subscription to:', subscription.toJSON());
      
      // **PERBAIKAN: Juga nonaktifkan target jika user mengubah plan ke free meski sebelumnya sudah free**
      if (plan === 'free') {
        await disableUserTarget(userId);
      }
    }

    // Reload untuk mendapatkan data terbaru
    await subscription.reload();

    // Cek apakah expired
    const now = new Date();
    const isExpired = subscription.expiresAt && new Date(subscription.expiresAt) < now;
    const isValid = subscription.isActive && !isExpired;

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: {
        ...subscription.toJSON(),
        isExpired,
        isValid
      }
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Downgrade to free plan
export const downgradeToFree = async (req, res) => {
  try {
    const userId = req.userId;

    console.log('🔄 Downgrading to free for user:', userId);

    let subscription = await Subscription.findOne({
      where: { userId }
    });

    if (!subscription) {
      // Buat subscription free baru dengan semua field yang diperlukan direset
      subscription = await Subscription.create({
        userId,
        plan: 'free',
        expiresAt: null,
        isActive: true,
        paymentMethod: 'free',
        transactionId: null,
      });
    } else {
      // Update ke free dan reset semua field terkait pembayaran
      await subscription.update({
        plan: 'free',
        expiresAt: null,
        isActive: true,
        paymentMethod: 'free',
        transactionId: null,
        updated_at: new Date(),
      });
    }

    // **PERBAIKAN: Nonaktifkan target user saat downgrade ke free**
    await disableUserTarget(userId);

    await subscription.reload();

    res.json({
      success: true,
      message: 'Berhasil downgrade ke plan Free',
      data: {
        ...subscription.toJSON(),
        isExpired: false,
        isValid: true
      }
    });
  } catch (error) {
    console.error('Downgrade to free error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Check subscription status
export const checkSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.userId;

    const subscription = await Subscription.findOne({
      where: { userId }
    });

    if (!subscription) {
      return res.json({
        success: true,
        data: {
          plan: 'free',
          isActive: true,
          expiresAt: null,
          isExpired: false,
          isValid: true
        }
      });
    }

    const now = new Date();
    const isExpired = subscription.expiresAt && new Date(subscription.expiresAt) < now;

    res.json({
      success: true,
      data: {
        ...subscription.toJSON(),
        isExpired,
        isValid: subscription.isActive && !isExpired
      }
    });
  } catch (error) {
    console.error('Check subscription status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Fungsi untuk mengirim email reminder
const sendExpirationReminder = async (user, subscription, daysLeft) => {
  try {
    const mailOptions = {
      from: `"Pips Diary" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `⚠️ Subscription Anda akan berakhir dalam ${daysLeft} hari`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">Pips Diary</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Trading Journal Platform</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #374151; margin-top: 0;">Subscription Akan Berakhir</h2>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <h3 style="color: #6b7280; margin-top: 0;">Detail Subscription</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                  <p style="margin: 0; color: #6b7280;">Plan:</p>
                  <p style="margin: 0; font-weight: bold; color: #374151;">${subscription.plan.toUpperCase()}</p>
                </div>
                <div>
                  <p style="margin: 0; color: #6b7280;">Berakhir:</p>
                  <p style="margin: 0; font-weight: bold; color: #374151;">
                    ${new Date(subscription.expiresAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
            
            <div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <h3 style="color: #991b1b; margin-top: 0;">⚠️ Tersisa ${daysLeft} Hari!</h3>
              <p style="color: #7f1d1d; margin: 0;">
                Subscription Anda akan berakhir dalam ${daysLeft} hari. 
                Setelah berakhir, akun Anda akan dikembalikan ke plan Free dan beberapa fitur premium akan dinonaktifkan.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/upgrade" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold;
                        display: inline-block;">
                Upgrade Sekarang
              </a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; color: #6b7280; font-size: 14px;">
              <p>Jika Anda tidak ingin memperpanjang, tidak ada tindakan yang diperlukan. 
                 Akun Anda akan otomatis kembali ke plan Free saat subscription berakhir.</p>
              <p style="margin-top: 10px;">Terima kasih telah menggunakan Pips Diary!</p>
            </div>
          </div>
          
          <div style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px; padding: 10px;">
            <p>Email ini dikirim otomatis. Mohon jangan membalas email ini.</p>
            <p>&copy; ${new Date().getFullYear()} Pips Diary. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email reminder terkirim ke ${user.email} (${daysLeft} hari menuju expired)`);
  } catch (error) {
    console.error('❌ Error mengirim email reminder:', error);
  }
};

// Fungsi untuk mengirim email downgrade notification
const sendDowngradeNotification = async (user) => {
  try {
    const mailOptions = {
      from: `"Pips Diary" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '📉 Subscription Anda telah berakhir - Kembali ke Plan Free',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f87171 0%, #ef4444 100%); padding: 20px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">Pips Diary</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Trading Journal Platform</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #374151; margin-top: 0;">Subscription Telah Berakhir</h2>
            
            <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #92400e; margin-top: 0;">⚠️ Plan Anda telah dikembalikan ke Free</h3>
              <p style="color: #92400e; margin: 0;">
                Subscription premium Anda telah berakhir. Akun Anda sekarang menggunakan plan Free.
                Beberapa fitur premium seperti Trading Targets, Advanced Analytics, dan fitur lainnya tidak lagi tersedia.
              </p>
            </div>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <h3 style="color: #6b7280; margin-top: 0;">Fitur yang tidak tersedia di Plan Free:</h3>
              <ul style="color: #374151; padding-left: 20px;">
                <li>Trading Targets & Progress Tracking</li>
                <li>Advanced Analytics & Reports</li>
                <li>Unlimited Trade History</li>
                <li>Priority Support</li>
                <li>Dan fitur premium lainnya</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/upgrade" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold;
                        display: inline-block;">
                Upgrade Kembali ke Premium
              </a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; color: #6b7280; font-size: 14px;">
              <p>Terima kasih telah menggunakan layanan premium Pips Diary. 
                 Anda dapat meng-upgrade kapan saja untuk kembali menikmati fitur premium.</p>
              <p style="margin-top: 10px;">Jika Anda memiliki pertanyaan, hubungi support@pipsdiary.com</p>
            </div>
          </div>
          
          <div style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px; padding: 10px;">
            <p>Email ini dikirim otomatis. Mohon jangan membalas email ini.</p>
            <p>&copy; ${new Date().getFullYear()} Pips Diary. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email downgrade notification terkirim ke ${user.email}`);
  } catch (error) {
    console.error('❌ Error mengirim email downgrade:', error);
  }
};

// Fungsi untuk cek dan downgrade subscription yang sudah expired
export const checkAndDowngradeExpiredSubscriptions = async () => {
  try {
    console.log('🔄 Checking for expired subscriptions...');
    
    const now = new Date();
    
    // Cari semua subscription yang sudah expired
    const expiredSubscriptions = await Subscription.findAll({
      where: {
        plan: ['pro'], // Hanya untuk plan pro, lifetime tidak termasuk
        expiresAt: {
          [db.Sequelize.Op.lt]: now // expiresAt < now
        },
        isActive: true // Hanya yang masih aktif
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    console.log(`📊 Found ${expiredSubscriptions.length} expired subscriptions`);

    for (const subscription of expiredSubscriptions) {
      try {
        console.log(`🔄 Downgrading user ${subscription.User?.email || subscription.userId}...`);
        
        // Downgrade ke free
        await subscription.update({
          plan: 'free',
          expiresAt: null,
          isActive: true,
          paymentMethod: 'free',
          transactionId: null,
          updated_at: new Date(),
        });

        // Nonaktifkan target user
        const target = await Target.findOne({
          where: { userId: subscription.userId }
        });

        if (target) {
          await target.update({
            enabled: false,
            targetBalance: 0.00,
            targetDate: null,
            description: '',
            useDailyTarget: false,
            dailyTargetPercentage: 0,
            dailyTargetAmount: 0,
            updated_at: new Date(),
          });
          console.log(`✅ Target disabled for user ${subscription.User?.email || subscription.userId}`);
        }

        // Kirim email notifikasi downgrade
        if (subscription.User?.email) {
          await sendDowngradeNotification(subscription.User);
        }

        console.log(`✅ Successfully downgraded user ${subscription.User?.email || subscription.userId} to free plan`);
      } catch (error) {
        console.error(`❌ Error downgrading user ${subscription.userId}:`, error);
      }
    }

    return {
      success: true,
      message: `Successfully processed ${expiredSubscriptions.length} expired subscriptions`
    };
  } catch (error) {
    console.error('❌ Error checking expired subscriptions:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// Fungsi untuk cek dan kirim reminder untuk subscription yang akan expired
export const checkAndSendExpirationReminders = async () => {
  try {
    console.log('🔄 Checking for upcoming subscription expirations...');
    
    const now = new Date();
    const reminders = [7, 3, 1]; // Reminder pada 7, 3, dan 1 hari sebelum expired
    
    // Hitung tanggal untuk masing-masing reminder
    const reminderDates = reminders.map(days => {
      const date = new Date(now);
      date.setDate(date.getDate() + days);
      return date;
    });

    // Format tanggal untuk query
    const reminderDateStrings = reminderDates.map(date => 
      date.toISOString().split('T')[0]
    );

    // Cari subscription yang akan expired dalam 7, 3, atau 1 hari
    const upcomingSubscriptions = await Subscription.findAll({
      where: {
        plan: ['pro'], // Hanya untuk plan pro, lifetime tidak termasuk
        isActive: true,
        [db.Sequelize.Op.and]: [
          {
            expiresAt: {
              [db.Sequelize.Op.gte]: now // expiresAt >= now (belum expired)
            }
          },
          {
            expiresAt: {
              [db.Sequelize.Op.lte]: reminderDates[0] // expiresAt <= 7 hari dari sekarang
            }
          }
        ]
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    console.log(`📊 Found ${upcomingSubscriptions.length} subscriptions expiring soon`);

    let remindersSent = 0;

    for (const subscription of upcomingSubscriptions) {
      try {
        const expiresAt = new Date(subscription.expiresAt);
        const timeDiff = expiresAt.getTime() - now.getTime();
        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        // Cek apakah hari ini adalah hari untuk mengirim reminder
        if (reminders.includes(daysLeft)) {
          console.log(`📧 Sending ${daysLeft}-day reminder to ${subscription.User?.email || subscription.userId}`);
          
          if (subscription.User?.email) {
            await sendExpirationReminder(subscription.User, subscription, daysLeft);
            remindersSent++;
          }
        }
      } catch (error) {
        console.error(`❌ Error sending reminder to user ${subscription.userId}:`, error);
      }
    }

    return {
      success: true,
      message: `Sent ${remindersSent} expiration reminders`
    };
  } catch (error) {
    console.error('❌ Error checking upcoming expirations:', error);
    return {
      success: false,
      message: error.message
    };
  }
};