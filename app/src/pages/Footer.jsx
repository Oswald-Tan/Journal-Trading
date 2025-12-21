import React from "react";
import { Link } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";
import WhiteLogo from "../assets/white_logo.png";

export default function Footer() {

  return (
    <footer className="p-4">
      <div className="bg-white text-slate-900 relative overflow-hidden rounded-2xl">
        {/* Background Effects sama seperti Hero */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Purple linear from bottom left */}
          <div className="absolute bottom-0 left-0 w-1/2 h-3/4 bg-linear-to-t from-purple-500/60 via-purple-300/40 to-transparent blur-3xl"></div>

          {/* Pink linear from bottom right */}
          <div className="absolute bottom-0 right-0 w-1/2 h-3/4 bg-linear-to-t from-pink-500/60 via-pink-300/40 to-transparent blur-3xl"></div>

          {/* Center purple glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-2/3 bg-linear-to-t from-purple-400/10 0 to-transparent blur-2xl"></div>

          {/* Grain/Noise Effect */}
          <div
            className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter'%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand & Contact Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-md">
                  <img src={WhiteLogo} alt="Logo" className="w-5 h-5" />
                </div>
                <span className="font-semibold text-xl text-slate-900">
                  Pips Diary
                </span>
              </div>
              <p className="text-slate-700 mb-6 max-w-md font-light leading-relaxed">
                Master your trading journey with the most intuitive journal
                platform. Track, analyze, and optimize your trading strategies.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-700">
                  <Phone size={18} className="text-slate-500" />
                  <span className="font-light">+62 851 7324 6048</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <Mail size={18} className="text-slate-500" />
                  <span className="font-light">hello@pipsdiary.com</span>
                </div>
                <div className="flex items-start gap-3 text-slate-700">
                  <MapPin
                    size={18}
                    className="text-slate-500 mt-0.5 shrink-0"
                  />
                  <span className="font-light">
                    Manado, Indonesia
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-lg mb-6 text-slate-900">
                Quick Links
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-slate-700 hover:text-slate-900 font-light transition-colors duration-200"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="text-slate-700 hover:text-slate-900 font-light transition-colors duration-200"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-slate-700 hover:text-slate-900 font-light transition-colors duration-200"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="text-slate-700 hover:text-slate-900 font-light transition-colors duration-200"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="#company"
                    className="text-slate-700 hover:text-slate-900 font-light transition-colors duration-200"
                  >
                    Company
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-lg mb-6 text-slate-900">
                Legal
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/terms-conditions"
                    className="text-slate-700 hover:text-slate-900 font-light transition-colors duration-200"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy"
                    className="text-slate-700 hover:text-slate-900 font-light transition-colors duration-200"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Social Media & Bottom Bar */}
          <div className="border-t border-black/5 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              {/* Social Media dengan warna */}
              <div className="flex items-center gap-4">
                <a
                  href="#"
                  className="text-sky-500 hover:text-sky-600 bg-white p-2 rounded-xl transition-all duration-200"
                >
                  <Twitter size={17} />
                </a>
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-700 bg-white p-2 rounded-xl transition-all duration-200"
                >
                  <Facebook size={17} />
                </a>
                <a
                  href="#"
                  className="text-pink-600 hover:text-pink-700 bg-white p-2 rounded-xl transition-all duration-200"
                >
                  <Instagram size={17} />
                </a>
                <a
                  href="#"
                  className="text-blue-700 hover:text-blue-800 bg-white p-2 rounded-xl transition-all duration-200"
                >
                  <Linkedin size={17} />
                </a>
              </div>

              {/* Copyright */}
              <div className="text-slate-700 text-sm font-light text-center md:text-right">
                <p>
                  &copy; {new Date().getFullYear()} Pips Diary. All rights
                  reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
