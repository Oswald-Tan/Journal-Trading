import React, { useState, useEffect, useCallback } from "react";
import { motion as Motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateProfile, getMe, changePassword } from "../../features/authSlice";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  User,
  Lock,
  Shield,
  Eye,
  EyeOff,
  Save,
  Loader,
  CheckCircle,
  Lightbulb,
  Mail,
  Phone,
  Key
} from 'lucide-react';

// Komponen Input Password dengan Toggle yang dipisahkan
const PasswordInput = ({ label, name, value, onChange, placeholder, isVisible, onToggle }) => (
  <div>
    <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
      {label}
    </label>
    <div className="relative">
      <input
        type={isVisible ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-1 focus:outline-none focus:ring-violet-500 focus:border-violet-500 transition-all bg-white shadow-sm font-medium text-slate-700 pr-12"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-violet-600 transition-colors duration-200 focus:outline-none p-1"
      >
        {isVisible ? (
          <EyeOff className="w-5 h-5" />
        ) : (
          <Eye className="w-5 h-5" />
        )}
      </button>
    </div>
  </div>
);

const ProfileSettings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("profile");
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone_number: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [localSuccess, setLocalSuccess] = useState("");

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
      });
    }
  }, [user]);

  // Handle local alerts
  useEffect(() => {
    if (localError) {
      Swal.fire({
        title: "Error!",
        text: localError,
        icon: "error",
        confirmButtonColor: "#ef4444",
        background: "#fff",
        customClass: {
          popup: "rounded-3xl shadow-sm",
          title: "text-xl font-bold text-slate-800",
          confirmButton: "rounded-xl font-semibold px-6 py-3",
        },
      }).then(() => {
        setLocalError("");
      });
    }

    if (localSuccess) {
      Swal.fire({
        title: "Berhasil!",
        text: localSuccess,
        icon: "success",
        confirmButtonColor: "#8b5cf6",
        background: "#fff",
        customClass: {
          popup: "rounded-3xl shadow-sm",
          title: "text-xl font-bold text-slate-800",
          confirmButton: "rounded-xl font-semibold px-6 py-3",
        },
      }).then(() => {
        setLocalSuccess("");
      });
    }
  }, [localError, localSuccess]);

  // Sync form when user data changes and on profile tab
  useEffect(() => {
    if (user && activeTab === "profile") {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
      });
    }
  }, [user, activeTab]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = useCallback((e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const togglePasswordVisibility = useCallback((field) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    // Validasi data
    if (!profileForm.name.trim()) {
      setLocalError("Nama tidak boleh kosong");
      return;
    }

    if (!profileForm.email.trim()) {
      setLocalError("Email tidak boleh kosong");
      return;
    }

    try {
      setLocalError("");
      setLocalSuccess("");
      
      const result = await dispatch(updateProfile(profileForm)).unwrap();
      
      // Handle response dari backend
      if (result.message === "Tidak ada perubahan data") {
        Swal.fire({
          title: "Info!",
          text: result.message,
          icon: "info",
          confirmButtonColor: "#8b5cf6",
          background: "#fff",
          customClass: {
            popup: "rounded-3xl shadow-sm",
            title: "text-xl font-bold text-slate-800",
            confirmButton: "rounded-xl font-semibold px-6 py-3",
          },
        });
      } else {
        setLocalSuccess(result.message);
        // Refresh user data
        dispatch(getMe());
      }
    } catch (error) {
      console.error("Update profile failed:", error);
      setLocalError(error || "Terjadi kesalahan saat update profile");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsPasswordLoading(true);

    // Validasi password
    if (!passwordForm.currentPassword) {
      setLocalError("Password saat ini harus diisi");
      setIsPasswordLoading(false);
      return;
    }

    if (!passwordForm.newPassword) {
      setLocalError("Password baru harus diisi");
      setIsPasswordLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setLocalError("Password baru minimal 6 karakter");
      setIsPasswordLoading(false);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setLocalError("Konfirmasi password tidak cocok");
      setIsPasswordLoading(false);
      return;
    }

    try {
      setLocalError("");
      setLocalSuccess("");
      
      await dispatch(
        changePassword({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        })
      ).unwrap();

      setLocalSuccess("Password berhasil diubah");
      // Reset password form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Change password failed:", error);
      setLocalError(error || "Terjadi kesalahan saat mengubah password");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const TabButton = ({ active, onClick, children, icon: Icon }) => (
    <Motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center text-start gap-3 px-6 py-4 rounded-2xl font-bold transition-all duration-200 ${
        active
          ? "bg-linear-to-r from-violet-600 to-purple-600 text-white shadow-sm"
          : "bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-200"
      }`}
    >
      <Icon className="w-5 h-5" />
      {children}
    </Motion.button>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header dengan Back Button */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Back Button */}
          <Motion.button
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBackClick}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium mb-6 transition-all duration-200 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span>Kembali</span>
          </Motion.button>

          {/* Title Section */}
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-linear-to-r from-violet-600 to-purple-600 p-3 rounded-2xl shadow-sm">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-800">
                Profile Settings
              </h1>
              <p className="text-slate-600 text-lg mt-2 font-light">
                Kelola informasi profil dan keamanan akun Anda
              </p>
            </div>
          </div>
        </Motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <Motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 space-y-3"
          >
            <TabButton
              active={activeTab === "profile"}
              onClick={() => setActiveTab("profile")}
              icon={User}
            >
              Profil Saya
            </TabButton>
            <TabButton
              active={activeTab === "password"}
              onClick={() => setActiveTab("password")}
              icon={Lock}
            >
              Ubah Password
            </TabButton>
            <TabButton
              active={activeTab === "security"}
              onClick={() => setActiveTab("security")}
              icon={Shield}
            >
              Keamanan
            </TabButton>
          </Motion.div>

          {/* Main Content */}
          <Motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200 shadow-sm p-6">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <Motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                    <User className="w-7 h-7 text-violet-600" />
                    Informasi Profil
                  </h2>

                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name Field */}
                      <div>
                        <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Nama Lengkap
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={profileForm.name}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-1 focus:outline-none focus:ring-violet-500 focus:border-violet-500 transition-all bg-white shadow-sm font-medium text-slate-700"
                          placeholder="Masukkan nama lengkap"
                        />
                      </div>

                      {/* Email Field */}
                      <div>
                        <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={profileForm.email}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-1 focus:outline-none focus:ring-violet-500 focus:border-violet-500 transition-all bg-white shadow-sm font-medium text-slate-700"
                          placeholder="Masukkan email"
                        />
                      </div>
                    </div>

                    {/* Phone Number Field */}
                    <div>
                      <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Nomor Telepon
                      </label>
                      <input
                        type="tel"
                        name="phone_number"
                        value={profileForm.phone_number}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-1 focus:outline-none focus:ring-violet-500 focus:border-violet-500 transition-all bg-white shadow-sm font-medium text-slate-700"
                        placeholder="Masukkan nomor telepon"
                      />
                    </div>

                    <Motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-4 rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Simpan Perubahan
                        </>
                      )}
                    </Motion.button>
                  </form>
                </Motion.div>
              )}

              {/* Password Tab */}
              {activeTab === "password" && (
                <Motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                    <Lock className="w-7 h-7 text-violet-600" />
                    Ubah Password
                  </h2>

                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div className="space-y-4">
                      {/* Current Password */}
                      <PasswordInput
                        label={
                          <span className="flex items-center gap-2">
                            <Key className="w-4 h-4" />
                            Password Saat Ini
                          </span>
                        }
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Masukkan password saat ini"
                        isVisible={passwordVisibility.currentPassword}
                        onToggle={() => togglePasswordVisibility("currentPassword")}
                      />

                      {/* New Password */}
                      <PasswordInput
                        label={
                          <span className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Password Baru
                          </span>
                        }
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Masukkan password baru (min. 6 karakter)"
                        isVisible={passwordVisibility.newPassword}
                        onToggle={() => togglePasswordVisibility("newPassword")}
                      />

                      {/* Confirm Password */}
                      <PasswordInput
                        label={
                          <span className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Konfirmasi Password Baru
                          </span>
                        }
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Konfirmasi password baru"
                        isVisible={passwordVisibility.confirmPassword}
                        onToggle={() => togglePasswordVisibility("confirmPassword")}
                      />
                    </div>

                    <Motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isPasswordLoading}
                      className="w-full bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-4 rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isPasswordLoading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Mengubah Password...
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          Ubah Password
                        </>
                      )}
                    </Motion.button>
                  </form>
                </Motion.div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <Motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                    <Shield className="w-7 h-7 text-violet-600" />
                    Keamanan Akun
                  </h2>

                  <div className="space-y-6">
                    {/* Account Status */}
                    <div className="bg-emerald-50 rounded-2xl p-6 border-2 border-emerald-200">
                      <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        Status Akun
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700">
                          Akun aktif dan terverifikasi
                        </span>
                        <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          {user.status === "active" ? "Aktif" : "Non-aktif"}
                        </span>
                      </div>
                    </div>

                    {/* Security Recommendations */}
                    <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
                      <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-blue-600" />
                        Rekomendasi Keamanan
                      </h3>
                      <ul className="space-y-3 text-slate-700">
                        <li className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span>Gunakan password yang kuat dan unik</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span>Jangan bagikan password dengan siapapun</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <Lightbulb className="w-4 h-4 text-blue-500" />
                          <span>Update password secara berkala</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Motion.div>
              )}
            </div>
          </Motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;