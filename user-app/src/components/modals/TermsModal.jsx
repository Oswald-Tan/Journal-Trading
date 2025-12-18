import React from "react";
import { motion as Motion } from "framer-motion";
import { Check, X, FileText, Shield, AlertTriangle, Lock, Clock, UserCheck, Mail } from "lucide-react";

const TermsModal = ({ showTermsModal, setShowTermsModal }) => {
  const handleClose = () => {
    setShowTermsModal(false);
  };

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleClose}
    >
      <Motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border-2 border-violet-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-7 h-7 text-violet-600" />
              Syarat & Ketentuan Trading Journal
            </h2>
            <Motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              className="text-violet-500 hover:text-violet-700 p-2 rounded-xl hover:bg-violet-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </Motion.button>
          </div>

          <div className="space-y-6">
            {/* Introduction */}
            <div className="bg-violet-50 border-2 border-violet-200 rounded-xl p-4">
              <p className="text-violet-800 font-medium">
                Dengan menggunakan Trading Journal, Anda setuju untuk mematuhi syarat dan ketentuan berikut.
                Mohon baca dengan seksama sebelum melanjutkan.
              </p>
            </div>

            {/* Terms Sections */}
            <div className="space-y-8">
              {/* Section 1 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-violet-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">1. Keanggotaan & Akun</h3>
                </div>
                <div className="pl-11 space-y-2">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-slate-700">
                      Anda harus berusia minimal 18 tahun untuk menggunakan layanan ini.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-slate-700">
                      Anda bertanggung jawab penuh atas keamanan akun dan password Anda.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-slate-700">
                      Setiap akun hanya boleh digunakan oleh satu pengguna. Berbagi akun tidak diperbolehkan.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-slate-700 font-medium">
                      Kami berhak menangguhkan atau menghentikan akun yang melanggar ketentuan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-violet-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">2. Keamanan Data & Privasi</h3>
                </div>
                <div className="pl-11 space-y-2">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-slate-700">
                      Semua data trading Anda disimpan dengan enkripsi 256-bit dan keamanan tingkat tinggi.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-slate-700">
                      Kami tidak akan pernah menjual, membagikan, atau mengungkap data pribadi Anda kepada pihak ketiga.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-slate-700">
                      Anda bertanggung jawab untuk menjaga kerahasiaan data login dan informasi sensitif lainnya.
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mt-3">
                    <p className="text-sm text-slate-600">
                      <span className="font-bold">Catatan:</span> Trading Journal adalah alat untuk analisis trading, bukan platform trading atau investasi. 
                      Kami tidak bertanggung jawab atas keputusan trading yang Anda buat berdasarkan analisis dari aplikasi ini.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 3 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-violet-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">3. Pembayaran & Subscription</h3>
                </div>
                <div className="pl-11 space-y-2">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-slate-700">
                      Pembayaran untuk plan Pro dan Lifetime bersifat non-refundable kecuali dalam kondisi tertentu yang diatur dalam garansi 30 hari.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-slate-700">
                      Untuk plan bulanan (Pro), pembayaran akan diperbarui otomatis setiap bulan hingga dibatalkan.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-slate-700">
                      Plan Lifetime memberikan akses seumur hidup untuk satu akun. Tidak termasuk transfer ke akun lain.
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <span className="text-blue-700 font-bold text-sm">!</span>
                      </div>
                      <div>
                        <p className="font-bold text-blue-800 mb-1">Garansi 30 Hari Uang Kembali</p>
                        <p className="text-sm text-blue-700">
                          Jika tidak puas dengan layanan kami dalam 30 hari pertama, Anda bisa meminta pengembalian dana penuh. 
                          Hubungi support untuk proses refund.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4 */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-violet-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">4. Hak & Kewajiban Pengguna</h3>
                </div>
                <div className="pl-11 space-y-2">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-slate-700">
                      Anda memiliki hak untuk mengekspor data trading Anda kapan saja dalam format CSV.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-slate-700">
                      Anda tidak diperbolehkan menggunakan aplikasi ini untuk tujuan ilegal atau melanggar hukum yang berlaku.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-slate-700">
                      Kami berhak mengupdate syarat dan ketentuan ini. Perubahan akan diberitahukan melalui email atau notifikasi dalam aplikasi.
                    </p>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-amber-800 mb-2">Peringatan Penting</h4>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• Trading mengandung risiko kerugian finansial yang signifikan</li>
                      <li>• Trading Journal adalah alat analisis, bukan saran finansial</li>
                      <li>• Lakukan riset dan konsultasi dengan profesional sebelum mengambil keputusan trading</li>
                      <li>• Anda bertanggung jawab penuh atas keputusan trading yang Anda buat</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Acceptance */}
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-800 mb-1">Persetujuan</h4>
                    <p className="text-sm text-emerald-700">
                      Dengan melanjutkan pembayaran atau menggunakan layanan Trading Journal, Anda menyatakan telah membaca,
                      memahami, dan menyetujui semua syarat dan ketentuan di atas.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="border-t border-slate-200 pt-4">
              <h4 className="font-bold text-slate-800 mb-3">Kontak & Support</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4" />
                  <span>support@tradingjournal.com</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span>Support 24/7 via Email</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4">
                Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <Motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClose}
                className="px-6 py-3 bg-linear-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Saya Memahami & Menyetujui
              </Motion.button>
            </div>
          </div>
        </div>
      </Motion.div>
    </Motion.div>
  );
};

export default TermsModal;