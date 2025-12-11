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
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">
            Kategori tidak ditemukan
          </h1>
          <button
            onClick={() => navigate("/education")}
            className="bg-linear-to-r from-violet-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-md transition-all"
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
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={() => navigate("/education")}
            className="p-2 sm:p-3 bg-slate-100 hover:bg-slate-200 rounded-lg sm:rounded-xl transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
          </button>
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="p-3 sm:p-4 bg-white/80 backdrop-blur-md rounded-xl sm:rounded-2xl border border-slate-200 shrink-0">
              <CategoryIcon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-700" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 truncate">
                {currentCategory.title}
              </h1>
              <p className="text-slate-600 text-sm sm:text-base font-light truncate">
                Pelajari semua konsep {currentCategory.title.toLowerCase()} secara mendalam
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
        className={`rounded-2xl sm:rounded-3xl p-4 sm:p-6 ${currentCategory.bgColor} border ${currentCategory.borderColor}`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 mb-1 sm:mb-2">
              Materi Pembelajaran
            </h2>
            <p className="text-slate-700 text-sm sm:text-base font-light">
              {currentCategory.sections.length} topik tersedia • Pelajari secara berurutan untuk hasil terbaik
            </p>
          </div>
          <div className="text-left sm:text-right bg-white/30 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4 py-3 sm:px-5 sm:py-4 border border-white/40 w-full sm:w-auto mt-2 sm:mt-0">
            <div className="text-xs sm:text-sm text-slate-700 font-medium">
              Progress Belajar
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-800">
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
          className="bg-amber-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-amber-200"
        >
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg shrink-0">
              <span className="text-amber-600 text-lg">💡</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Pembelajaran Visual</h3>
              <p className="text-slate-700 text-xs sm:text-sm mt-1">
                Kategori ini dilengkapi dengan visualisasi interaktif untuk memudahkan pemahaman struktur dan pola candlestick
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
        className="space-y-3 sm:space-y-4"
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
                <div className="mt-4">
                  <CandlestickStructureVisual />
                </div>
              ) : shouldShowCandlestickViz && section.id === "pola-dasar" ? (
                <div className="mt-4">
                  <CandlestickVisualization />
                </div>
              ) : shouldShowCandlestickViz &&
                section.id === "double-top-bottom" ? (
                <div className="mt-4">
                  <DoubleTopBottomVisual />
                </div>
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
        className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 sm:pt-8 border-t border-slate-200"
      >
        <button
          onClick={() => navigate("/education")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium transition-colors text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Semua Kategori</span>
        </button>

        <div className="text-xs sm:text-sm text-slate-600 text-center sm:text-right">
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