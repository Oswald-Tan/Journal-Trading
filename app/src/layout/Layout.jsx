import React from "react";
import Header from "../pages/Header";
import FAQ from "../pages/FAQ";
import CTA from "../pages/CTA";
import Footer from "../pages/Footer";
import Hero from "../pages/Hero";
import Features from "../pages/Features";
import Pricing from "../pages/Pricing";

export default function AuroraLanding() {
  return (
    <div className="min-h-screen text-slate-900">
      <div className="relative">
        <Header />
        <Hero />
      </div>
      <Features />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
