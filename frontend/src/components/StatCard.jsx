import React from "react";
import { motion as Motion } from "framer-motion";

const StatCard = ({ label, value, color, trend, bg, icon }) => (
  <Motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.05, y: -2 }}
    className={`p-5 rounded-2xl ${bg} backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border-2`}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="text-xs font-semibold uppercase tracking-wider opacity-80">{label}</div>
      {icon && <div className="text-2xl">{icon}</div>}
    </div>
    <div className={`text-2xl font-bold ${color} mb-1`}>{value}</div>
    {trend && (
      <div className="text-xs font-medium opacity-70">{trend}</div>
    )}
  </Motion.div>
);

export default StatCard;