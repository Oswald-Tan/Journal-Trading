import bcrypt from "bcrypt";
import User from "../models/user.js";
import Role from "../models/role.js";
import transporter from "../config/email.js";
import crypto from "crypto";
import Subscription from "../models/subscription.js";
import Target from "../models/target.js";
import { Op } from "sequelize";

export const handleRegister = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password sebelum disimpan
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 jam

    // Find or create the 'user' role
    const [userRole, created] = await Role.findOrCreate({
      where: { role_name: 'user' },
      defaults: { role_name: 'user' }
    });

    console.log('Using role:', userRole.id, userRole.role_name);

    // Create user dengan status pending dan verification token
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role_id: userRole.id,
      status: 'pending', // Status awal pending
      emailVerificationToken,
      emailVerificationExpires
    });

    // Create default subscription
    await Subscription.create({
      userId: user.id,
      plan: 'free'
    });

    // Create empty target
    await Target.create({
      userId: user.id,
      enabled: false
    });

    // Kirim email verifikasi
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${emailVerificationToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Verify Your Email - PipsDiary',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF6B35;">Welcome to PipsDiary!</h2>
          <p>Hi ${user.name},</p>
          <p>Thank you for registering with PipsDiary. Please verify your email address to activate your account and start using your trading journal.</p>
          <p>Click the button below to verify your email:</p>
          <a href="${verificationUrl}" style="background-color: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 16px 0;">Verify Email</a>
          <p>If the button doesn't work, copy and paste the following link into your browser:</p>
          <p>${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
          <br>
          <p>Best regards,<br>The PipsDiary Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    // Get user with role information for response
    const userWithRole = await User.findOne({
      where: { id: user.id },
      include: [{
        model: Role,
        as: 'userRole',
        attributes: ['role_name']
      }]
    });

    res.status(201).json({
      message: 'User created successfully. Please check your email to verify your account.',
      user: {
        id: userWithRole.id,
        email: userWithRole.email,
        name: userWithRole.name,
        role: userWithRole.userRole.role_name,
        initialBalance: userWithRole.initialBalance,
        status: userWithRole.status
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Fungsi verifikasi email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    const user = await User.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    // Update user status menjadi active dan hapus token
    await user.update({
      status: 'active',
      emailVerificationToken: null,
      emailVerificationExpires: null
    });

    res.status(200).json({
      message: 'Email verified successfully! You can now login to your account.'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Fungsi untuk kirim ulang email verifikasi
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.status === 'active') {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate token baru
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await user.update({
      emailVerificationToken,
      emailVerificationExpires
    });

    // Kirim email verifikasi
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${emailVerificationToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Verify Your Email - PipsDiary',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF6B35;">Verify Your Email</h2>
          <p>Hi ${user.name},</p>
          <p>Please verify your email address to activate your PipsDiary account.</p>
          <p>Click the button below to verify your email:</p>
          <a href="${verificationUrl}" style="background-color: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 16px 0;">Verify Email</a>
          <p>If the button doesn't work, copy and paste the following link into your browser:</p>
          <p>${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <br>
          <p>Best regards,<br>The PipsDiary Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: 'Verification email sent. Please check your email.'
    });
  } catch (error) {
    console.error('Resend verification email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const handleLogin = async (req, res) => {
  try {
    // Validasi input
    if (!req.body || !req.body.email || !req.body.password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Role,
          as: "userRole",
          attributes: ["role_name"],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Cek apakah email sudah diverifikasi
    if (user.status === 'pending') {
      return res.status(403).json({ 
        message: "Please verify your email before logging in.",
        needsVerification: true 
      });
    }

    // Cek jika akun suspended atau inactive
    if (user.status === 'suspended') {
      return res.status(403).json({ message: "Your account has been suspended. Please contact support." });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ message: "Your account is inactive. Please contact support." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Wrong password" });
    }

    if (
      user.userRole.role_name !== "admin" &&
      user.userRole.role_name !== "user"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update last login
    await user.update({ last_login: new Date() });

    req.session.userId = user.id;
    req.session.role = user.userRole.role_name;

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.userRole.role_name,
      status: user.status
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const Me = async (req, res) => {
  try {
    // Cek apakah user sudah login (punya session)
    if (!req.session.userId) {
      return res.status(401).json({ message: "Mohon login ke akun Anda!" });
    }

    // Ambil data user berdasarkan session userId
    const user = await User.findOne({
      attributes: ["id", "name", "email", "phone_number", "status", "role_id"],
      include: [
        {
          model: Role,
          as: "userRole",
          attributes: ["role_name"],
        },
      ],
      where: { id: req.session.userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Kirim data user lengkap
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.userRole.role_name,
      phone_number: user.phone_number,
      status: user.status,
    });
  } catch (error) {
    console.error("Me error:", error);
    res.status(500).json({ message: "Terjadi kesalahan di server." });
  }
};

export const updatePassword = async (req, res) => {
  const id = req.params.id;

  try {
    // Ambil data user berdasarkan ID
    const user = await User.findOne({ where: { id: id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const email = user.email; // Ambil email dari user
    const password = `${email}123`; // Buat password baru

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

    await User.update(
      {
        password: hashedPassword,
      },
      {
        where: { id: id },
      }
    );

    await logAction(
      req,
      "password_reset",
      "user",
      id,
      `Password direset oleh admin`,
      null,
      { by: req.session.userId } // ID admin yang melakukan reset
    );

    return res.status(200).json({
      message: "Password berhasil diubah.",
      success: true,
    });
  } catch (err) {
    console.log("Error saat update password:", err);
    return res.status(500).json({ message: err.message });
  }
};

//handle logout
export const handleLogout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(400).json({ message: "Logout failed" });
    res.status(200).json({ message: "Logout success" });
  });
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone_number } = req.body;
    const userId = req.session.userId;

    console.log("Session userId:", userId); // Debug logging
    console.log("Update data:", { name, email, phone_number }); // Debug logging

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Cari user yang akan diupdate
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email already exists (excluding current user)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        where: {
          email,
          id: { [Op.ne]: userId }
        }
      });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    // Update user data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone_number !== undefined) updateData.phone_number = phone_number;

    await User.update(updateData, {
      where: { id: userId }
    });

    // Get updated user data with role
    const updatedUser = await User.findOne({
      attributes: ["id", "name", "email", "phone_number", "role_id"],
      include: [
        {
          model: Role,
          as: "userRole",
          attributes: ["role_name"],
        },
      ],
      where: { id: userId },
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found after update" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone_number: updatedUser.phone_number,
        role: updatedUser.userRole?.role_name,
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.session.userId;

    // Validasi input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Password saat ini dan password baru harus diisi" 
      });
    }

    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized - Silakan login kembali" 
      });
    }

    // Validasi panjang password baru
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: "Password baru minimal 6 karakter"
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User tidak ditemukan" 
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: "Password saat ini tidak sesuai" 
      });
    }

    // Cek jika password baru sama dengan password lama
    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) {
      return res.status(400).json({ 
        success: false,
        message: "Password baru tidak boleh sama dengan password lama" 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.update(
      { password: hashedPassword },
      { where: { id: userId } }
    );

    res.status(200).json({ 
      success: true,
      message: "Password berhasil diubah" 
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ 
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message 
    });
  }
};

export const requestResetOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // Cari user berdasarkan email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    console.log(`User with email ${email} found.`);

    // Generate OTP
    const resetOtp = crypto.randomInt(100000, 999999).toString();
    console.log(`Generated OTP: ${resetOtp}`); // Logging OTP untuk debugging

    // Simpan OTP dan waktu kadaluarsa ke database
    user.resetOtp = resetOtp;
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
    await user.save();

    // Kirim OTP ke email dengan styling
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Your OTP Code for Password Reset",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
              color: #007BFF;
              text-align: center;
            }
            p {
              font-size: 16px;
              text-align: center;
            }
            .otp {
              font-size: 24px;
              font-weight: bold;
              color: #007BFF;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Password Reset OTP</h1>
            <p>Your OTP code is:</p>
            <p class="otp">${resetOtp}</p>
            <p>This code will expire in 10 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
          </div>
        </body>
        </html>
      `,
    };

    // Logging data OTP dan waktu kadaluarsa untuk debugging
    console.log(
      `OTP Data to be Saved: resetOtp=${
        user.resetOtp
      }, resetOtpExpires=${new Date(user.resetOtpExpires).toISOString()}`
    );

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP telah dikirim ke email Anda." });
  } catch (error) {
    console.error("Error in requestResetOtp:", error.message);
    res.status(500).json({
      message: "Terjadi kesalahan saat mengirim OTP",
      error: error.message,
    });
  }
};

export const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user || user.resetOtp !== otp || user.resetOtpExpires < Date.now()) {
      return res
        .status(400)
        .json({ message: "OTP tidak valid atau telah kedaluwarsa" });
    }

    // OTP valid
    user.resetOtp = null;
    user.resetOtpExpires = null;
    await user.save();

    // AUDIT LOG: Catat verifikasi OTP berhasil
    await logAction(
      req,
      "otp_verify",
      "user",
      user.id,
      `OTP berhasil diverifikasi`
    );

    res.status(200).json({ message: "OTP berhasil diverifikasi" });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan saat memverifikasi OTP",
      error: error.message,
    });
  }
};

const validatePassword = (password) => {
  const minLength = 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return (
    password.length >= minLength && hasLetter && hasNumber && hasSpecialChar
  );
};

// Reset password after OTP verification
export const resetPassword = async (req, res) => {
  const { newPassword, confirmPassword, email } = req.body;

  try {
    // Validasi konfirmasi password
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Password baru dan konfirmasi password tidak cocok" });
    }

    // Validasi password baru
    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        message:
          "Password baru harus memiliki minimal 8 karakter, mengandung huruf, angka, dan karakter khusus",
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Enkripsi password baru
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password di database, reset attempts, and clear lockout
    await User.update(
      {
        password: hashedNewPassword,
        resetOtp: null,
        resetOtpExpires: null,
      },
      { where: { email } }
    );

    res.status(200).json({ message: "Password berhasil diubah" });
  } catch (err) {
    console.error("Error resetting password:", err.message);
    return res.status(500).json({
      message: "Terjadi kesalahan saat mengubah password",
      error: err.message,
    });
  }
};

export const getResetOtpExpiry = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    if (!user.resetOtpExpires) {
      return res.status(400).json({ message: "OTP belum dibuat" });
    }

    res.status(200).json({ expiryTime: user.resetOtpExpires });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan", error: error.message });
  }
};
