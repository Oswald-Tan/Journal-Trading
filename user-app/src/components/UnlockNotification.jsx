import React, { useEffect, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { clearRecentUnlocks } from "../features/gamificationSlice";
import { Award, X, Crown, Zap, Star } from "lucide-react";

const UnlockNotification = () => {
  const dispatch = useDispatch();
  const { recentUnlocks } = useSelector((state) => state.gamification);
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    if (recentUnlocks.length > 0) {
      const newUnlocks = recentUnlocks.filter(
        unlock => !visibleNotifications.find(n => n.id === unlock.id)
      );
      
      setVisibleNotifications(prev => [...prev, ...newUnlocks]);

      // Auto-remove after 5 seconds
      const timer = setTimeout(() => {
        setVisibleNotifications(prev => prev.slice(1));
        if (recentUnlocks.length === visibleNotifications.length + newUnlocks.length) {
          dispatch(clearRecentUnlocks());
        }
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [recentUnlocks, visibleNotifications, dispatch]);

  const removeNotification = (id) => {
    setVisibleNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case "badge":
        return <Award className="w-6 h-6" />;
      case "level":
        return <Crown className="w-6 h-6" />;
      case "achievement":
        return <Star className="w-6 h-6" />;
      default:
        return <Zap className="w-6 h-6" />;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case "badge":
        return "from-purple-500 to-pink-500";
      case "level":
        return "from-yellow-500 to-orange-500";
      case "achievement":
        return "from-blue-500 to-cyan-500";
      default:
        return "from-violet-500 to-purple-500";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {visibleNotifications.map((notification) => (
          <Motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            className={`bg-linear-to-r ${getColor(notification.type)} rounded-2xl p-4 shadow-2xl border-2 border-white/20 text-white min-w-80`}
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0">
                {getIcon(notification.type)}
              </div>
              
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-1">
                  {notification.title}
                </h4>
                <p className="text-sm opacity-90 mb-2">
                  {notification.description}
                </p>
                
                {notification.xp && (
                  <div className="flex items-center gap-1 text-xs opacity-80">
                    <Zap className="w-3 h-3" />
                    +{notification.xp} XP
                  </div>
                )}
              </div>

              <button
                onClick={() => removeNotification(notification.id)}
                className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </Motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default UnlockNotification;