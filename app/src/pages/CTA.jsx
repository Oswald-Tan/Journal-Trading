import React from "react";

export default function CTA() {
  const handleLogin = () => {
    window.location.href = "http://localhost:5173/";
  };

  return (
    <section className="py-20 bg-white">

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-medium text-slate-900 mb-4">
            Ready to Transform <br /> Your Trading?
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-light">
            Join thousands of traders who have improved their performance with Pips Diary.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleLogin}
            className="px-8 py-3 bg-black text-white rounded-full font-medium text-sm hover:bg-gray-800 transition-colors duration-200 shadow-lg"
          >
            Get Started Free
          </button>
          <button className="px-8 py-3 border border-slate-300 text-slate-700 rounded-full font-medium text-sm hover:bg-slate-50 transition-colors duration-200">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}