import React from "react";
import Dashboard from "./Dashboard";

export default function Hero() {
  const handleLogin = () => {
    window.location.href = "https://app.pipsdiary.com";
  };

  return (
    <section className="h-[120vh] overflow-visible p-4">
      <div className="relative h-full flex flex-col">
        {/* linear Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
          {/* Purple linear from bottom left */}
          <div className="absolute bottom-0 left-0 w-1/2 h-3/4 bg-linear-to-t from-purple-500/70 via-purple-300/40 to-transparent blur-3xl"></div>

          {/* Pink linear from bottom right */}
          <div className="absolute bottom-0 right-0 w-1/2 h-3/4 bg-linear-to-t from-pink-500/70 via-pink-300/40 to-transparent blur-3xl"></div>

          {/* Center purple glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-2/3 bg-linear-to-t from-purple-400/25 to-transparent blur-2xl"></div>

          {/* Grain/Noise Effect */}
          <div
            className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter'%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
            }}
          ></div>
        </div>

        {/* Main Content Container dengan Grid untuk kontrol yang lebih baik */}
        <div className="flex-1 grid grid-rows-[1fr_auto_1fr] relative z-10">
          {/* Spacer atas - mengkompensasi tinggi header */}
          <div className="row-start-1"></div>

          {/* Title Hero Content - tepat di tengah antara header dan dashboard */}
          <div className="row-start-2 flex items-center justify-center pt-8">
            <div className="max-w-7xl mx-auto px-6 w-full text-center">
              <div className="flex flex-col items-center text-center w-full">
                <h1 className="text-5xl md:text-7xl font-medium leading-tight tracking-tight max-w-3xl mx-auto">
                  Master Your <br /> Trading Journey
                </h1>

                <p className="mt-4 text-slate-600 max-w-xl mx-auto font-light">
                  Track, analyze, and optimize your trading strategies with the most
                  intuitive journal platform built for.
                </p>

                {/* Get Started Button */}
                <button onClick={handleLogin} className="mt-8 px-10 py-3 bg-black text-white rounded-full font-base text-sm hover:bg-gray-800 transition-colors duration-200 shadow-lg cursor-pointer">
                  Get Started
                </button>
              </div>
            </div>
          </div>

          {/* Spacer bawah - memberikan ruang yang sama seperti spacer atas */}
          <div className="row-start-3"></div>

          {/* Dashboard - posisi tetap di bawah */}
          <div className="row-start-4 w-full max-w-7xl mx-auto px-6 z-20">
            <div className="clip-dashboard max-h-[400px] overflow-hidden">
              <Dashboard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}