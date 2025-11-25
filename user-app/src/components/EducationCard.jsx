import React from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const EducationCard = ({ section, categoryId, isExpanded, onToggle, customContent }) => {
  const SectionIcon = section.icon;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-4"
    >
      <button
        onClick={() => onToggle(`${categoryId}-${section.id}`)}
        className="w-full text-left p-6 hover:bg-slate-50 transition-all duration-200 flex justify-between items-center"
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-slate-100 rounded-xl">
            <SectionIcon className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">{section.title}</h3>
            <p className="text-sm text-slate-600 mt-1">Klik untuk mempelajari lebih lanjut</p>
          </div>
        </div>
        <Motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="text-slate-500"
        >
          <ChevronDown className="w-5 h-5" />
        </Motion.span>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <Motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 border-t border-slate-200 bg-slate-50">
              {/* Regular Content */}
              <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line leading-relaxed mb-6">
                {section.content.split('\n').map((line, index) => (
                  <p key={index} className="mb-3">
                    {line.startsWith('**') && line.endsWith('**') ? (
                      <strong className="text-slate-800">{line.slice(2, -2)}</strong>
                    ) : line.startsWith('•') ? (
                      <span className="flex items-start">
                        <span className="text-emerald-500 mr-2 mt-1">•</span>
                        {line.slice(1)}
                      </span>
                    ) : (
                      line
                    )}
                  </p>
                ))}
              </div>
              
              {/* Custom Content (Candlestick Visualization) */}
              {customContent && (
                <div className="mt-6">
                  {customContent}
                </div>
              )}
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </Motion.div>
  );
};

export default EducationCard;