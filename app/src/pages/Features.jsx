import React from "react";
import {
  FileText,
  BarChart3,
  Target,
  TrendingUp,
  Briefcase,
  Smartphone,
} from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Easy Trade Tracking",
      description:
        "Quickly log your trades with all the details that matter - entry, exit, strategy, emotions, and more.",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Advanced Analytics",
      description:
        "Deep insights into your performance with win rates, profit factors, and detailed metrics.",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Goal Setting",
      description:
        "Set and track trading targets with progress monitoring and milestone achievements.",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Performance Charts",
      description:
        "Visualize your equity curve, monthly performance, and trading patterns.",
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: "Risk Management",
      description:
        "Monitor your risk exposure, profit factors, and trading consistency.",
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Always Accessible",
      description:
        "Access your trading journal anywhere, anytime with our responsive web app.",
    },
  ];

  const handleLogin = () => {
    window.location.href = "https://app.pipsdiary.com";
  };

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-medium text-slate-900 mb-4">
            Powerful Features for <br /> Serious Traders
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-light">
            Everything you need to analyze, optimize, and master your trading
            performance in one intuitive platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-2xl p-6 border border-slate-100 transition-all duration-300 group"
            >
              {/* Icon Container */}
              <div className="text-purple-500 mb-4 group-hover:scale-105 transition-transform duration-300">
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-slate-800 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed font-light">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <button
            onClick={handleLogin}
            className="px-8 py-3 bg-black text-white rounded-full font-medium text-sm hover:bg-gray-800 transition-colors duration-200 shadow-lg cursor-pointer"
          >
            Explore All Features
          </button>
        </div>
      </div>
    </section>
  );
}
