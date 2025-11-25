import React from "react";
import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import WhiteLogo from "../assets/white_logo.png";

const PrivacyPolicy = () => {
  const lastUpdated = "1 Januari 2024";

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Effects matching landing page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Purple linear from bottom left */}
        <div className="absolute bottom-0 left-0 w-1/2 h-3/4 bg-linear-to-t from-purple-500/20 via-purple-300/10 to-transparent blur-3xl"></div>
        
        {/* Pink linear from bottom right */}
        <div className="absolute bottom-0 right-0 w-1/2 h-3/4 bg-linear-to-t from-pink-500/20 via-pink-300/10 to-transparent blur-3xl"></div>
        
        {/* Center purple glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-2/3 bg-linear-to-t from-purple-400/10 to-transparent blur-2xl"></div>

        {/* Grain/Noise Effect */}
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter'%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        ></div>
      </div>

      {/* Header */}
      <Motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-md">
                <img src={WhiteLogo} alt="Logo" className="w-6 h-6" />
              </div>
              <span className="font-semibold text-lg text-slate-900">Pips Diary</span>
            </Link>
            
            <Link
              to="/"
              className="px-6 py-2 bg-black text-white rounded-full font-medium text-sm hover:bg-gray-800 transition-colors duration-200 shadow-lg"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </Motion.header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-12 px-6 relative z-10">
        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
        >
          {/* Header Section */}
          <div className="bg-linear-to-r from-purple-600 to-pink-600 p-8 text-center">
            <Motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-medium text-white mb-4"
            >
              Privacy Policy
            </Motion.h1>
            <p className="text-purple-100 text-lg font-light">
              Terakhir diperbarui: {lastUpdated}
            </p>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12 space-y-12">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">1. Pengantar</h2>
              <p className="text-slate-600 leading-relaxed font-light">
                Di PipsDiary, kami menghargai privasi Anda dan berkomitmen untuk melindungi data pribadi Anda. 
                Kebijakan privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-900">2. Informasi yang Kami Kumpulkan</h2>
              
              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <h3 className="font-semibold text-slate-800 mb-3">2.1 Informasi Pribadi</h3>
                  <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4 font-light">
                    <li>Nama dan alamat email</li>
                    <li>Informasi profil akun</li>
                    <li>Data pembayaran (diproses oleh penyedia pembayaran pihak ketiga)</li>
                  </ul>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <h3 className="font-semibold text-slate-800 mb-3">2.2 Data Trading</h3>
                  <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4 font-light">
                    <li>Entri trading (pair, entry/exit, lot size, dll.)</li>
                    <li>Analisis performa trading</li>
                    <li>Grafik dan statistik trading</li>
                    <li>Catatan dan komentar trading</li>
                  </ul>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <h3 className="font-semibold text-slate-800 mb-3">2.3 Data Teknis</h3>
                  <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4 font-light">
                    <li>Alamat IP dan informasi browser</li>
                    <li>Data penggunaan aplikasi</li>
                    <li>Cookies dan teknologi pelacakan serupa</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">3. Cara Kami Menggunakan Informasi</h2>
              <div className="space-y-3 text-slate-600 font-light">
                <p><strong className="font-semibold text-slate-800">3.1 Menyediakan Layanan:</strong> Untuk mengoperasikan dan memelihara platform PipsDiary.</p>
                <p><strong className="font-semibold text-slate-800">3.2 Analisis dan Pengembangan:</strong> Untuk meningkatkan fitur dan pengalaman pengguna.</p>
                <p><strong className="font-semibold text-slate-800">3.3 Komunikasi:</strong> Untuk mengirim pembaruan, notifikasi, dan dukungan pelanggan.</p>
                <p><strong className="font-semibold text-slate-800">3.4 Keamanan:</strong> Untuk melindungi akun dan mencegah penipuan.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">4. Perlindungan Data Trading</h2>
              <div className="space-y-3 text-slate-600 font-light">
                <p><strong className="font-semibold text-slate-800">4.1 Enkripsi:</strong> Semua data trading dienkripsi selama transmisi dan penyimpanan.</p>
                <p><strong className="font-semibold text-slate-800">4.2 Akses Terbatas:</strong> Hanya personel yang berwenang yang dapat mengakses data untuk tujuan pemeliharaan sistem.</p>
                <p><strong className="font-semibold text-slate-800">4.3 Backup Rutin:</strong> Data dicadangkan secara teratur untuk mencegah kehilangan.</p>
                <p><strong className="font-semibold text-slate-800">4.4 Tidak Dijual:</strong> Kami tidak akan pernah menjual data trading spesifik Anda kepada pihak ketiga.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">5. Berbagi Informasi</h2>
              <p className="text-slate-600 leading-relaxed font-light">
                Kami tidak membagikan informasi pribadi Anda dengan pihak ketiga, kecuali dalam keadaan berikut:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4 font-light">
                <li>Dengan persetujuan Anda</li>
                <li>Untuk mematuhi kewajiban hukum</li>
                <li>Dengan penyedia layanan yang membantu operasi kami (dengan perjanjian kerahasiaan)</li>
                <li>Dalam merger atau akuisisi perusahaan</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">6. Penyimpanan Data</h2>
              <div className="space-y-3 text-slate-600 font-light">
                <p><strong className="font-semibold text-slate-800">6.1 Lokasi:</strong> Data disimpan di server aman yang berlokasi di Indonesia.</p>
                <p><strong className="font-semibold text-slate-800">6.2 Retensi:</strong> Kami menyimpan data selama akun Anda aktif. Anda dapat menghapus akun kapan saja.</p>
                <p><strong className="font-semibold text-slate-800">6.3 Ekspor Data:</strong> Anda dapat mengekspor data trading Anda kapan saja dalam format CSV.</p>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-900">7. Hak Anda</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2">Hak Akses</h3>
                  <p className="text-purple-700 text-sm font-light">Anda dapat mengakses data pribadi Anda kapan saja.</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2">Hak Perbaikan</h3>
                  <p className="text-purple-700 text-sm font-light">Anda dapat memperbaiki data yang tidak akurat.</p>
                </div>
                <div className="bg-pink-50 p-4 rounded-xl border border-pink-200">
                  <h3 className="font-semibold text-pink-900 mb-2">Hak Penghapusan</h3>
                  <p className="text-pink-700 text-sm font-light">Anda dapat meminta penghapusan data pribadi.</p>
                </div>
                <div className="bg-pink-50 p-4 rounded-xl border border-pink-200">
                  <h3 className="font-semibold text-pink-900 mb-2">Hak Oposisi</h3>
                  <p className="text-pink-700 text-sm font-light">Anda dapat menolak pemrosesan data tertentu.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">8. Cookies</h2>
              <p className="text-slate-600 leading-relaxed font-light">
                Kami menggunakan cookies untuk meningkatkan pengalaman pengguna, menganalisis traffic, dan personalisasi konten. 
                Anda dapat mengontrol pengaturan cookies melalui browser Anda.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">9. Keamanan</h2>
              <div className="space-y-3 text-slate-600 font-light">
                <p><strong className="font-semibold text-slate-800">9.1 Enkripsi SSL:</strong> Semua data ditransmisikan melalui koneksi terenkripsi.</p>
                <p><strong className="font-semibold text-slate-800">9.2 Autentikasi:</strong> Sistem autentikasi multi-faktor tersedia untuk keamanan tambahan.</p>
                <p><strong className="font-semibold text-slate-800">9.3 Audit Keamanan:</strong> Sistem kami secara rutin diaudit untuk kerentanan keamanan.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">10. Perubahan Kebijakan</h2>
              <p className="text-slate-600 leading-relaxed font-light">
                Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Perubahan signifikan akan dikomunikasikan 
                melalui email atau pemberitahuan dalam aplikasi.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Kontak</h2>
              <p className="text-slate-600 leading-relaxed font-light">
                Untuk pertanyaan tentang privasi atau untuk menggunakan hak privasi Anda, hubungi:
              </p>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <p className="text-slate-700 font-light">
                  <strong className="font-semibold">Data Protection Officer:</strong><br/>
                  <strong className="font-semibold">Email:</strong> privacy@pipsdiary.com<br/>
                  <strong className="font-semibold">Telepon:</strong> +62 851-724-6048<br/>
                  <strong className="font-semibold">Waktu Respon:</strong> 2-3 hari kerja
                </p>
              </div>
            </section>

            <section className="bg-amber-50 p-6 rounded-xl border border-amber-200">
              <h2 className="text-xl font-semibold text-amber-900 mb-3">Peringatan Penting</h2>
              <p className="text-amber-700 font-light">
                <strong>PipsDiary adalah alat jurnal trading, bukan penasihat finansial.</strong> Kami tidak bertanggung jawab 
                atas keputusan trading yang Anda buat berdasarkan analisis dari platform kami. Trading mengandung risiko kerugian finansial.
              </p>
            </section>
          </div>
        </Motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-100 py-8 px-6 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <p className="font-light">© {new Date().getFullYear()} PipsDiary. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;