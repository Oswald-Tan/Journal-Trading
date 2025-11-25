import React from "react";
import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import WhiteLogo from "../assets/white_logo.png";

const TermsConditions = () => {
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
              Terms & Conditions
            </Motion.h1>
            <p className="text-purple-100 text-lg font-light">
              Terakhir diperbarui: {lastUpdated}
            </p>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12 space-y-12">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">1. Penerimaan Syarat</h2>
              <p className="text-slate-600 leading-relaxed font-light">
                Dengan mengakses dan menggunakan PipsDiary ("Layanan"), Anda setuju untuk terikat oleh syarat dan ketentuan ini. 
                Jika Anda tidak setuju dengan syarat apa pun, Anda tidak boleh menggunakan Layanan kami.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">2. Definisi Layanan</h2>
              <p className="text-slate-600 leading-relaxed font-light">
                PipsDiary adalah platform jurnal trading digital yang menyediakan alat untuk mencatat, menganalisis, dan melacak 
                aktivitas trading. Layanan ini mencakup fitur-fitur seperti:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4 font-light">
                <li>Pencatatan entri trading</li>
                <li>Analisis performa trading</li>
                <li>Visualisasi data trading</li>
                <li>Tools manajemen risiko</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">3. Akun Pengguna</h2>
              <div className="space-y-3 text-slate-600 font-light">
                <p><strong className="font-semibold text-slate-800">3.1 Registrasi:</strong> Anda harus mendaftar akun untuk mengakses fitur premium. Informasi yang diberikan harus akurat dan lengkap.</p>
                <p><strong className="font-semibold text-slate-800">3.2 Keamanan Akun:</strong> Anda bertanggung jawab untuk menjaga kerahasiaan kredensial akun dan semua aktivitas yang terjadi under akun Anda.</p>
                <p><strong className="font-semibold text-slate-800">3.3 Usia Minimum:</strong> Anda harus berusia minimal 18 tahun untuk menggunakan Layanan kami.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">4. Data Trading</h2>
              <div className="space-y-3 text-slate-600 font-light">
                <p><strong className="font-semibold text-slate-800">4.1 Kepemilikan Data:</strong> Anda mempertahankan semua hak kepemilikan atas data trading yang Anda input ke dalam sistem.</p>
                <p><strong className="font-semibold text-slate-800">4.2 Lisensi:</strong> Anda memberikan PipsDiary lisensi terbatas untuk memproses data Anda guna menyediakan Layanan.</p>
                <p><strong className="font-semibold text-slate-800">4.3 Kerahasiaan:</strong> Kami tidak akan membagikan data trading spesifik Anda kepada pihak ketiga tanpa persetujuan, kecuali diwajibkan oleh hukum.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">5. Berlangganan dan Pembayaran</h2>
              <div className="space-y-3 text-slate-600 font-light">
                <p><strong className="font-semibold text-slate-800">5.1 Model Berlangganan:</strong> Layanan kami menggunakan model berlangganan dengan opsi Free, Pro, dan Lifetime.</p>
                <p><strong className="font-semibold text-slate-800">5.2 Pembayaran:</strong> Pembayaran dilakukan di muka dan berulang secara otomatis untuk paket Pro.</p>
                <p><strong className="font-semibold text-slate-800">5.3 Pembatalan:</strong> Anda dapat membatalkan berlangganan kapan saja, dan akses akan tetap aktif hingga akhir periode billing.</p>
                <p><strong className="font-semibold text-slate-800">5.4 Pengembalian Dana:</strong> Kami menawarkan garansi uang kembali 30 hari untuk pembelian pertama.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">6. Batasan Tanggung Jawab</h2>
              <div className="space-y-3 text-slate-600 font-light">
                <p><strong className="font-semibold text-slate-800">6.1 Bukan Saran Finansial:</strong> PipsDiary adalah alat jurnal trading, bukan pemberi saran finansial. Kami tidak memberikan rekomendasi trading.</p>
                <p><strong className="font-semibold text-slate-800">6.2 Keputusan Trading:</strong> Semua keputusan trading adalah tanggung jawab Anda sepenuhnya.</p>
                <p><strong className="font-semibold text-slate-800">6.3 Kerugian Trading:</strong> Kami tidak bertanggung jawab atas kerugian finansial yang mungkin terjadi dari aktivitas trading Anda.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">7. Hak Kekayaan Intelektual</h2>
              <p className="text-slate-600 leading-relaxed font-light">
                Semua hak kekayaan intelektual terkait platform PipsDiary, termasuk namun tidak terbatas pada kode sumber, 
                desain, logo, dan dokumentasi, adalah milik PipsDiary dan dilindungi oleh hukum hak cipta.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">8. Penghentian Layanan</h2>
              <p className="text-slate-600 leading-relaxed font-light">
                Kami berhak untuk menghentikan atau menangguhkan akses Anda ke Layanan jika melanggar syarat dan ketentuan ini. 
                Dalam hal penghentian, Anda berhak untuk mengekspor data trading Anda.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">9. Perubahan Syarat</h2>
              <p className="text-slate-600 leading-relaxed font-light">
                Kami dapat memperbarui syarat dan ketentuan ini dari waktu ke waktu. Perubahan signifikan akan dikomunikasikan 
                melalui email atau pemberitahuan dalam aplikasi.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">10. Hukum yang Berlaku</h2>
              <p className="text-slate-600 leading-relaxed font-light">
                Syarat dan ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia. 
                Setiap sengketa akan diselesaikan melalui pengadilan yang berwenang di Indonesia.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">Kontak</h2>
              <p className="text-slate-600 leading-relaxed font-light">
                Untuk pertanyaan mengenai Terms & Conditions ini, silakan hubungi kami di:
              </p>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <p className="text-slate-700 font-light">
                  <strong className="font-semibold">Email:</strong> legal@pipsdiary.com<br/>
                  <strong className="font-semibold">Telepon:</strong> +62 851-7324-6048<br/>
                  <strong className="font-semibold">Alamat:</strong> Jakarta, Indonesia
                </p>
              </div>
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

export default TermsConditions;