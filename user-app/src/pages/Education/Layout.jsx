import React from 'react';
import { motion as Motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { educationCategories } from '../../data/educationData';

const Layout = () => {
  const navigate = useNavigate();

  const CategoryCard = ({ categoryKey, category }) => {
    const CategoryIcon = category.icon;

    return (
      <Motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm overflow-hidden cursor-pointer group hover:shadow-md transition-all duration-300"
        onClick={() => navigate(`/education/${categoryKey}`)}
      >
        <div className={`p-4 sm:p-6 ${category.bgColor} border-b ${category.borderColor}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-white/80 rounded-xl sm:rounded-2xl shrink-0">
                <CategoryIcon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-700" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 truncate">
                  {category.title}
                </h3>
                <p className="text-slate-600 text-sm sm:text-base mt-1">
                  {category.sections.length} topik pembelajaran
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 group-hover:text-slate-600 transition-colors self-end sm:self-center ml-auto sm:ml-0" />
          </div>
        </div>
        
        <div className="p-4 sm:p-6">
          <div className="space-y-2 sm:space-y-3">
            {category.sections.slice(0, 3).map((section, index) => (
              <div key={index} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full shrink-0"></div>
                <span className="text-slate-700 truncate">{section.title}</span>
              </div>
            ))}
            {category.sections.length > 3 && (
              <div className="text-xs sm:text-sm text-slate-500 font-medium pt-1">
                +{category.sections.length - 3} topik lainnya...
              </div>
            )}
          </div>
        </div>
      </Motion.div>
    );
  };

  return (
    <div className="space-y-6 min-h-screen">
      {/* Header */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
          <div className="p-3 bg-linear-to-r from-violet-600 to-purple-600 rounded-xl sm:rounded-2xl">
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800">
            Pusat Edukasi Trading
          </h1>
        </div>
        <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-3xl mx-auto font-light px-2">
          Tingkatkan pengetahuan trading Anda dengan materi pembelajaran terstruktur dari dasar hingga mahir.
        </p>
      </Motion.div>

      {/* Categories Grid */}
      <Motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        {Object.entries(educationCategories).map(([key, category]) => (
          <CategoryCard key={key} categoryKey={key} category={category} />
        ))}
      </Motion.div>

      {/* Footer CTA */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center mt-8 sm:mt-12"
      >
        <div className="bg-linear-to-r from-violet-600 to-purple-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4">
            Mulai Perjalanan Belajar Anda
          </h2>
          <p className="text-violet-100/90 text-sm sm:text-base mb-4 sm:mb-6 max-w-2xl mx-auto font-light px-2">
            Pilih kategori yang paling sesuai dengan kebutuhan belajar Anda. Setiap materi disusun secara bertahap untuk memudahkan pemahaman.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {Object.entries(educationCategories).slice(0, 3).map(([key, category]) => {
              const Icon = category.icon;
              return (
                <Motion.button
                  key={key}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/education/${key}`)}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {category.title}
                </Motion.button>
              );
            })}
          </div>
        </div>
      </Motion.div>
    </div>
  );
};

export default Layout;