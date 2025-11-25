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
        className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm overflow-hidden cursor-pointer group"
        onClick={() => navigate(`/education/${categoryKey}`)}
      >
        <div className={`p-6 ${category.bgColor} border-b ${category.borderColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/80 rounded-xl">
                <CategoryIcon className="w-8 h-8 text-slate-700" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">{category.title}</h3>
                <p className="text-slate-600 mt-1">{category.sections.length} topik pembelajaran</p>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-3">
            {category.sections.slice(0, 3).map((section, index) => (
              <div key={index} className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-slate-700">{section.title}</span>
              </div>
            ))}
            {category.sections.length > 3 && (
              <div className="text-sm text-slate-500 font-medium">
                +{category.sections.length - 3} topik lainnya...
              </div>
            )}
          </div>
        </div>
      </Motion.div>
    );
  };

  return (
    <div className="space-y-6 min-h-screen py-6">
      {/* Header */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-linear-to-r from-violet-600 to-purple-600 rounded-2xl">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800">Pusat Edukasi Trading</h1>
        </div>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto font-light">
          Tingkatkan pengetahuan trading Anda dengan materi pembelajaran terstruktur dari dasar hingga mahir.
        </p>
      </Motion.div>

      {/* Categories Grid */}
      <Motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
        className="text-center mt-12"
      >
        <div className="bg-linear-to-r from-violet-600 to-purple-600 rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-white mb-4">
            Mulai Perjalanan Belajar Anda
          </h2>
          <p className="text-violet-100 mb-6 max-w-2xl mx-auto font-light">
            Pilih kategori yang paling sesuai dengan kebutuhan belajar Anda. Setiap materi disusun secara bertahap untuk memudahkan pemahaman.
          </p>
        </div>
      </Motion.div>
    </div>
  );
};

export default Layout;