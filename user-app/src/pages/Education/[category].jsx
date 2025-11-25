import React, { useState } from "react";
import { motion as Motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { educationCategories } from "../../data/educationData";
import EducationCard from "../../components/EducationCard";
import CandlestickVisualization from "../../components/CandlestickVisualization";
import CandlestickStructureVisual from "../../components/CandlestickStructureVisual";
import DoubleTopBottomVisual from "../../components/DoubleTopBottomVisual";

const EducationCategory = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState({});

  const currentCategory = educationCategories[category];

  if (!currentCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">
            Kategori tidak ditemukan
          </h1>
          <button
            onClick={() => navigate("/education")}
            className="bg-linear-to-r from-violet-600 to-purple-600 text-white px-6 py-3 rounded-xl"
          >
            Kembali ke Edukasi
          </button>
        </div>
      </div>
    );
  }

  const CategoryIcon = currentCategory.icon;

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Check if this is candlestick category and should show visualization
  const shouldShowCandlestickViz = category === "candlestick";

  return (
    <div className="space-y-6 min-h-screen">
      {/* Header */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/education")}
            className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200">
              <CategoryIcon className="w-8 h-8 text-slate-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                {currentCategory.title}
              </h1>
              <p className="text-slate-600 font-light">
                Pelajari semua konsep {currentCategory.title.toLowerCase()}{" "}
                secara mendalam
              </p>
            </div>
          </div>
        </div>
      </Motion.div>

      {/* Category Banner */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-3xl p-6 ${currentCategory.bgColor} border ${currentCategory.borderColor}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Materi Pembelajaran
            </h2>
            <p className="text-slate-700 font-light">
              {currentCategory.sections.length} topik tersedia • Pelajari secara
              berurutan untuk hasil terbaik
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-600 font-medium">
              Progress Belajar
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {Object.values(expandedSections).filter(Boolean).length}/
              {currentCategory.sections.length}
            </div>
          </div>
        </div>
      </Motion.div>

      {/* Candlestick Visualization Banner */}
      {shouldShowCandlestickViz && (
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-amber-50 rounded-2xl p-6 border border-amber-200"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <span className="text-amber-600 text-lg">💡</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Pembelajaran Visual</h3>
              <p className="text-slate-700 text-sm">
                Kategori ini dilengkapi dengan visualisasi interaktif untuk
                memudahkan pemahaman struktur dan pola candlestick
              </p>
            </div>
          </div>
        </Motion.div>
      )}

      {/* Content Sections */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {currentCategory.sections.map((section) => (
          <EducationCard
            key={section.id}
            section={section}
            categoryId={category}
            isExpanded={expandedSections[`${category}-${section.id}`]}
            onToggle={toggleSection}
            customContent={
              shouldShowCandlestickViz &&
              section.id === "struktur-candlestick" ? (
                <CandlestickStructureVisual />
              ) : shouldShowCandlestickViz && section.id === "pola-dasar" ? (
                <CandlestickVisualization />
              ) : shouldShowCandlestickViz &&
                section.id === "double-top-bottom" ? (
                <DoubleTopBottomVisual />
              ) : null
            }
          />
        ))}
      </Motion.div>

      {/* Navigation Footer */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-between items-center pt-8 border-t border-slate-200"
      >
        <button
          onClick={() => navigate("/education")}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Semua Kategori</span>
        </button>

        <div className="text-sm text-slate-600">
          Selesai belajar?{" "}
          <span className="font-medium text-slate-800">
            {Object.values(expandedSections).filter(Boolean).length}
          </span>{" "}
          dari{" "}
          <span className="font-medium text-slate-800">
            {currentCategory.sections.length}
          </span>{" "}
          topik telah dibuka
        </div>
      </Motion.div>
    </div>
  );
};

export default EducationCategory;
