import React from 'react';
import { motion as Motion } from 'framer-motion';

const Loading = ({ 
  message = "Loading Data...", 
  subMessage = "This may take a few moments",
  size = "medium",
  type = "spinner", // 'spinner' or 'dots'
  color = "orange" 
}) => {
  // Size configurations
  const sizes = {
    small: {
      spinner: "h-12 w-12",
      dots: "h-2 w-2",
      text: "text-base",
      subText: "text-sm",
      space: "space-y-3"
    },
    medium: {
      spinner: "h-24 w-24", 
      dots: "h-3 w-3",
      text: "text-lg",
      subText: "text-sm",
      space: "space-y-4"
    },
    large: {
      spinner: "h-32 w-32",
      dots: "h-4 w-4",
      text: "text-xl",
      subText: "text-base",
      space: "space-y-6"
    }
  };

  // Color configurations
  const colors = {
    orange: {
      primary: "text-orange-700",
      secondary: "text-orange-500",
      border: "border-orange-500",
      bg: "bg-orange-500"
    },
    blue: {
      primary: "text-blue-700", 
      secondary: "text-blue-500",
      border: "border-blue-500",
      bg: "bg-blue-500"
    },
    emerald: {
      primary: "text-emerald-700",
      secondary: "text-emerald-500", 
      border: "border-emerald-500",
      bg: "bg-emerald-500"
    }
  };

  const { spinner, dots, text, subText, space } = sizes[size];
  const { primary, secondary, border, bg } = colors[color];

  // Spinner type loading
  const renderSpinner = () => (
    <Motion.div
      initial={{ scale: 0.8, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      className={`animate-spin rounded-full border-b-2 ${border} ${spinner}`}
    ></Motion.div>
  );

  // Dots type loading
  const renderDots = () => (
    <div className="flex space-x-2">
      {[0, 1, 2].map((index) => (
        <Motion.div
          key={index}
          className={`rounded-full ${bg} ${dots}`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: index * 0.2
          }}
        />
      ))}
    </div>
  );

  return (
    <Motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`min-h-screen flex items-center justify-center flex-col ${space}`}
    >
      {type === 'spinner' ? renderSpinner() : renderDots()}
      
      <div className="text-center space-y-2">
        <Motion.p 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`font-semibold ${primary} ${text}`}
        >
          {message}
        </Motion.p>
        
        {subMessage && (
          <Motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`${secondary} ${subText}`}
          >
            {subMessage}
          </Motion.p>
        )}
      </div>
    </Motion.div>
  );
};

export default Loading;