import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../config";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  parseISO,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  startOfWeek as startOfWeekFn,
  isToday as isTodayFn,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Circle,
  Target,
  TrendingUp,
  Clock,
  AlertCircle,
  FileText,
  Zap,
  Filter,
  Grid,
  List,
  BarChart3,
  Globe,
  ChevronDown,
  ChevronUp,
  X,
  ArrowLeft,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
  AlertTriangle,
  Save,
} from "lucide-react";
import {
  getCalendarEvents,
  getDateEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  toggleEventCompletion,
  setSelectedDate,
} from "../../features/calendarSlice";
import Swal from "sweetalert2";
import UpgradeRequiredModal from "../../components/modals/UpgradeRequiredModal";

// Event types configuration
const eventTypes = {
  market_news: {
    label: "News",
    icon: <Globe className="w-3 h-3" />,
    color: "#3b82f6",
    bgColor: "#dbeafe",
  },
  economic_event: {
    label: "Economic",
    icon: <TrendingUp className="w-3 h-3" />,
    color: "#10b981",
    bgColor: "#d1fae5",
  },
  trade_idea: {
    label: "Idea",
    icon: <Target className="w-3 h-3" />,
    color: "#8b5cf6",
    bgColor: "#ede9fe",
  },
  reminder: {
    label: "Reminder",
    icon: <Clock className="w-3 h-3" />,
    color: "#f59e0b",
    bgColor: "#fef3c7",
  },
  trade_review: {
    label: "Review",
    icon: <FileText className="w-3 h-3" />,
    color: "#ec4899",
    bgColor: "#fce7f3",
  },
  journal_entry: {
    label: "Journal",
    icon: <Edit className="w-3 h-3" />,
    color: "#6366f1",
    bgColor: "#e0e7ff",
  },
};

// Impact colors
const impactColors = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#10b981",
  none: "#6b7280",
};

// Calendar Event Modal Component (mirip FormModal)
const CalendarEventModal = ({
  showModal,
  setShowModal,
  eventForm,
  setEventForm,
  editingEvent,
  setEditingEvent,
  handleEventSubmit,
  isLoading,
  formErrors,
  setFormErrors,
}) => {
  const [showValidation, setShowValidation] = useState(false);

  // Field yang wajib diisi
  const requiredFields = ["date", "title", "description"];

  // Validasi form sebelum submit
  const validateForm = () => {
    const errors = {};

    // Validasi field tidak boleh kosong
    requiredFields.forEach((field) => {
      if (!eventForm[field] || eventForm[field].toString().trim() === "") {
        errors[field] = `Field ini wajib diisi`;
      }
    });

    // Validasi format date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (eventForm.date && !dateRegex.test(eventForm.date)) {
      errors.date = "Format tanggal harus YYYY-MM-DD";
    }

    // Validasi time format jika ada
    if (
      eventForm.time &&
      !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(eventForm.time)
    ) {
      errors.time = "Format waktu harus HH:mm";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setEventForm({ ...eventForm, [field]: value });

    // Clear validation error for this field
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowValidation(true);

    if (!validateForm()) {
      const firstErrorField = Object.keys(formErrors)[0];
      if (firstErrorField) {
        const element = document.querySelector(
          `[data-field="${firstErrorField}"]`
        );
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }

    handleEventSubmit(e);
  };

  const hasEmptyRequiredFields = () => {
    return requiredFields.some(
      (field) => !eventForm[field] || eventForm[field].toString().trim() === ""
    );
  };

  if (!showModal) return null;

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={() => {
        setShowModal(false);
        setEditingEvent(null);
        setEventForm({
          date: new Date().toISOString().split("T")[0],
          title: "",
          type: "journal_entry",
          description: "",
          time: "",
          impact: "none",
          instrument: "",
          strategy: "",
          sentiment: "neutral",
          color: "#8b5cf6",
          isCompleted: false,
        });
        setFormErrors({});
      }}
    >
      <Motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-violet-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-7 h-7 text-violet-600" />
              {editingEvent ? "Edit Calendar Event" : "New Calendar Event"}
            </h2>
            <Motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setShowModal(false);
                setEditingEvent(null);
                setEventForm({
                  date: new Date().toISOString().split("T")[0],
                  title: "",
                  type: "journal_entry",
                  description: "",
                  time: "",
                  impact: "none",
                  instrument: "",
                  strategy: "",
                  sentiment: "neutral",
                  color: "#8b5cf6",
                  isCompleted: false,
                });
                setFormErrors({});
              }}
              type="button"
              className="text-slate-500 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </Motion.button>
          </div>

          {/* Info Required Fields */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  <span className="text-red-500 font-bold">*</span> Field dengan
                  tanda bintang wajib diisi
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Pastikan semua field wajib diisi sebelum menyimpan event.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Date Field */}
              <div data-field="date">
                <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-violet-600" />
                  Date
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all font-semibold text-slate-800 ${
                    formErrors.date
                      ? "border-red-500 bg-red-50"
                      : "border-slate-200 focus:border-violet-500"
                  }`}
                  required
                />
                {formErrors.date && (
                  <div className="mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-red-600">
                      {formErrors.date}
                    </span>
                  </div>
                )}
              </div>

              {/* Time Field */}
              <div data-field="time">
                <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1">
                  <Clock className="w-4 h-4 text-violet-600" />
                  Time
                </label>
                <input
                  type="time"
                  value={eventForm.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all font-semibold text-slate-800 ${
                    formErrors.time
                      ? "border-red-500 bg-red-50"
                      : "border-slate-200 focus:border-violet-500"
                  }`}
                  placeholder="HH:mm"
                />
                {formErrors.time && (
                  <div className="mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-red-600">
                      {formErrors.time}
                    </span>
                  </div>
                )}
              </div>

              {/* Title Field */}
              <div className="md:col-span-2" data-field="title">
                <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1">
                  <FileText className="w-4 h-4 text-violet-600" />
                  Title
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all font-semibold text-slate-800 ${
                    formErrors.title
                      ? "border-red-500 bg-red-50"
                      : "border-slate-200 focus:border-violet-500"
                  }`}
                  placeholder="Enter event title"
                  required
                />
                {formErrors.title && (
                  <div className="mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-red-600">
                      {formErrors.title}
                    </span>
                  </div>
                )}
              </div>

              {/* Event Type */}
              <div>
                <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1">
                  <Target className="w-4 h-4 text-violet-600" />
                  Event Type
                </label>
                <select
                  value={eventForm.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 font-semibold text-slate-800"
                >
                  {Object.entries(eventTypes).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Impact Level */}
              <div>
                <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-violet-600" />
                  Impact Level
                </label>
                <select
                  value={eventForm.impact}
                  onChange={(e) => handleInputChange("impact", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 font-semibold text-slate-800"
                >
                  <option value="none">None</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Instrument */}
              <div>
                <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1">
                  <BarChart3 className="w-4 h-4 text-violet-600" />
                  Instrument
                </label>
                <input
                  type="text"
                  value={eventForm.instrument}
                  onChange={(e) =>
                    handleInputChange("instrument", e.target.value)
                  }
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 font-semibold text-slate-800"
                  placeholder="e.g., XAUUSD, EURUSD"
                />
              </div>

              {/* Strategy */}
              <div>
                <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-violet-600" />
                  Strategy
                </label>
                <input
                  type="text"
                  value={eventForm.strategy}
                  onChange={(e) =>
                    handleInputChange("strategy", e.target.value)
                  }
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 font-semibold text-slate-800"
                  placeholder="e.g., Breakout, Pullback"
                />
              </div>

              {/* Sentiment */}
              <div>
                <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1">
                  <Globe className="w-4 h-4 text-violet-600" />
                  Market Sentiment
                </label>
                <select
                  value={eventForm.sentiment}
                  onChange={(e) =>
                    handleInputChange("sentiment", e.target.value)
                  }
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 font-semibold text-slate-800"
                >
                  <option value="neutral">Neutral</option>
                  <option value="bullish">Bullish</option>
                  <option value="bearish">Bearish</option>
                </select>
              </div>

              {/* Color */}
              <div>
                <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: eventForm.color }}
                  />
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "#8b5cf6",
                    "#3b82f6",
                    "#10b981",
                    "#f59e0b",
                    "#ef4444",
                    "#ec4899",
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleInputChange("color", color)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        eventForm.color === color
                          ? "border-slate-800"
                          : "border-slate-300"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Description Field */}
              <div className="md:col-span-2" data-field="description">
                <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1">
                  <FileText className="w-4 h-4 text-violet-600" />
                  Description
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={4}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all font-semibold text-slate-800 ${
                    formErrors.description
                      ? "border-red-500 bg-red-50"
                      : "border-slate-200 focus:border-violet-500"
                  }`}
                  placeholder="Add detailed description about this event..."
                  required
                />
                {formErrors.description && (
                  <div className="mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-red-600">
                      {formErrors.description}
                    </span>
                  </div>
                )}
              </div>

              {/* Completion Status */}
              <div className="flex items-center md:col-span-2">
                <input
                  type="checkbox"
                  id="isCompleted"
                  checked={eventForm.isCompleted}
                  onChange={(e) =>
                    handleInputChange("isCompleted", e.target.checked)
                  }
                  className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                />
                <label
                  htmlFor="isCompleted"
                  className="ml-2 text-sm font-medium text-slate-700"
                >
                  Mark as completed
                </label>
              </div>
            </div>

            {/* Validation Warning */}
            {showValidation && hasEmptyRequiredFields() && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Harap lengkapi semua field yang wajib diisi
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
              <Motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingEvent(null);
                  setEventForm({
                    date: new Date().toISOString().split("T")[0],
                    title: "",
                    type: "journal_entry",
                    description: "",
                    time: "",
                    impact: "none",
                    instrument: "",
                    strategy: "",
                    sentiment: "neutral",
                    color: "#8b5cf6",
                    isCompleted: false,
                  });
                  setFormErrors({});
                }}
                disabled={isLoading}
                className="px-6 py-3 border-2 border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Cancel
              </Motion.button>
              <Motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading || hasEmptyRequiredFields()}
                className={`px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-medium flex items-center gap-2 ${
                  hasEmptyRequiredFields()
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-linear-to-r from-violet-600 to-purple-600 text-white"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editingEvent ? "Update Event" : "Save Event"}
                  </>
                )}
              </Motion.button>
            </div>
          </form>
        </div>
      </Motion.div>
    </Motion.div>
  );
};

// Calendar Controls Component
const CalendarControls = ({
  viewMode,
  setViewMode,
  filterType,
  setFilterType,
  currentMonth,
  selectedDate,
  isMobile,
  showFilterPanel,
  setShowFilterPanel,
  handlePrev,
  handleNext,
  setCurrentMonth,
  dispatch,
  dateStats,
  canAddEvent,
  handleAddEventClick,
}) => {
  // Tentukan apakah selectedDate adalah hari ini
  const isSelectedDateToday = useMemo(() => {
    if (!selectedDate) return false;
    const today = format(new Date(), "yyyy-MM-dd");
    return selectedDate === today;
  }, [selectedDate]);

  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 mb-4 sm:mb-6"
    >
      {/* Baris pertama: Navigation dan Date Display */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 lg:mb-6">
        {/* Left: View Mode Controls - hanya untuk desktop/tablet */}
        <div className="w-full lg:w-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            {/* View Mode - Desktop & Tablet */}
            {!isMobile && (
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                {[
                  { mode: "month", icon: Grid, label: "Month" },
                  { mode: "week", icon: List, label: "Week" },
                  { mode: "day", icon: Calendar, label: "Day" },
                ].map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm md:text-base font-medium ${
                      viewMode === mode
                        ? "bg-white text-violet-700 shadow-sm"
                        : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                    }`}
                  >
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Filter Button for Mobile */}
            {isMobile && (
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl text-sm font-medium text-slate-700 w-full justify-center"
              >
                <Filter className="w-4 h-4" />
                <span>Filter Events</span>
                {showFilterPanel ? (
                  <ChevronUpIcon className="w-4 h-4 ml-auto" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4 ml-auto" />
                )}
              </button>
            )}

            {/* Filter Panel for Mobile */}
            {isMobile && showFilterPanel && (
              <div className="w-full bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFilterType("all")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      filterType === "all"
                        ? "bg-violet-100 text-violet-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    All Events
                  </button>
                  {Object.entries(eventTypes).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setFilterType(key)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
                        filterType === key
                          ? "bg-violet-100 text-violet-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Filter - Desktop & Tablet */}
            {!isMobile && (
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-violet-500 text-xs sm:text-sm md:text-base bg-white min-w-[120px] sm:min-w-[140px]"
                >
                  <option value="all">All Events</option>
                  {Object.entries(eventTypes).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Middle: Navigation Controls - dipisah untuk tablet */}
        <div className="flex items-center justify-between lg:justify-center gap-2 sm:gap-3 w-full lg:w-auto">
          {/* Navigation Arrows */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrev}
              className="p-1.5 sm:p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
              aria-label="Previous"
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            </Motion.button>

            {/* Current Period Display */}
            <div className="text-center min-w-[100px] sm:min-w-[140px] md:min-w-[180px]">
              <h2 className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold text-slate-800 truncate">
                {viewMode === "month" && format(currentMonth, "MMM yyyy")}
                {viewMode === "week" &&
                  `Week of ${format(startOfWeekFn(currentMonth), "MMM d")}`}
                {viewMode === "day" &&
                  selectedDate &&
                  format(parseISO(selectedDate), "MMM d, yyyy")}
              </h2>
              {!isMobile && (
                <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
                  {viewMode === "month"
                    ? "Month View"
                    : viewMode === "week"
                    ? "Week View"
                    : "Day View"}
                </p>
              )}
            </div>

            <Motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNext}
              className="p-1.5 sm:p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
              aria-label="Next"
            >
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            </Motion.button>
          </div>

          {/* Today Button - Desktop & Tablet */}
          {!isMobile && (
            <Motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const today = new Date();
                const todayFormatted = format(today, "yyyy-MM-dd");
                setCurrentMonth(today);
                dispatch(setSelectedDate(todayFormatted));
                // Juga load events untuk hari ini
                dispatch(getDateEvents(todayFormatted));
              }}
              className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-violet-100 text-violet-700 rounded-xl hover:bg-violet-200 font-medium text-xs sm:text-sm md:text-base whitespace-nowrap ml-2"
            >
              <span className="hidden sm:inline">Today</span>
              <span className="sm:hidden">Now</span>
            </Motion.button>
          )}
        </div>
      </div>

      {/* Baris kedua: Actions dan Add Button untuk tablet/desktop */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        {/* View Mode for Mobile - pindah ke sini jika perlu */}
        {isMobile && (
          <div className="w-full mb-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              {[
                { mode: "month", label: "Month" },
                { mode: "week", label: "Week" },
                { mode: "day", label: "Day" },
              ].map(({ mode, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                    viewMode === mode
                      ? "bg-white text-violet-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Event Count Display - untuk tablet/desktop */}
        {!isMobile && selectedDate && (
          <div className="flex-1 flex items-center gap-3 mr-4">
            <div className="text-center p-2 sm:p-3 bg-violet-50 rounded-xl">
              <div className="text-xs sm:text-sm text-violet-700 font-medium">
                {isSelectedDateToday
                  ? "Events Today"
                  : `Events on ${format(parseISO(selectedDate), "MMM d")}`}
              </div>
              <div className="text-base sm:text-xl font-bold text-violet-800">
                {dateStats ? dateStats.eventCount : 0}
              </div>
            </div>
          </div>
        )}

        {/* Add Button untuk semua ukuran */}
        <div className="w-full sm:w-auto">
          <Motion.button
            whileHover={{ scale: canAddEvent ? 1.05 : 1 }}
            whileTap={{ scale: canAddEvent ? 0.95 : 1 }}
            onClick={handleAddEventClick}
            disabled={!canAddEvent}
            className={`w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium text-sm sm:text-base flex items-center justify-center gap-2 transition-all ${
              canAddEvent
                ? "bg-linear-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700"
                : "bg-slate-300 text-slate-500 cursor-not-allowed"
            }`}
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">
              {canAddEvent ? "Add Event" : "Limit Reached"}
            </span>
            <span className="sm:hidden">
              {canAddEvent ? "Add Event" : "Limit Reached"}
            </span>
          </Motion.button>
        </div>
      </div>

      {/* Today Button untuk Mobile */}
      {isMobile && (
        <div className="mt-4">
          <Motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const today = new Date();
              const todayFormatted = format(today, "yyyy-MM-dd");
              setCurrentMonth(today);
              dispatch(setSelectedDate(todayFormatted));
              // Juga load events untuk hari ini
              dispatch(getDateEvents(todayFormatted));
            }}
            className="w-full px-3 py-2 bg-violet-100 text-violet-700 rounded-xl text-sm font-medium"
          >
            Go to Today
          </Motion.button>
        </div>
      )}
    </Motion.div>
  );
};

// Mobile Date Summary Component (Simplified)
const MobileDateSummary = ({
  selectedDate,
  showDateSummary,
  setShowDateSummary,
  canAddEvent,
  handleAddEventClick,
}) => {
  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 p-4 mb-4 relative"
    >
      {/* Konten reguler */}
      <div className={`${!canAddEvent ? "opacity-30" : ""}`}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-violet-600" />
            {selectedDate
              ? format(parseISO(selectedDate), "EEE, MMM d")
              : "Select a date"}
          </h3>
          <button
            onClick={() => setShowDateSummary(!showDateSummary)}
            className="p-1 rounded-lg hover:bg-slate-100"
          >
            {showDateSummary ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {showDateSummary && selectedDate && (
          <div className="space-y-3">
            <Motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAddEventClick(selectedDate)}
              disabled={!canAddEvent}
              className={`w-full py-2.5 rounded-xl transition-all duration-200 font-medium flex items-center justify-center gap-2 ${
                canAddEvent
                  ? "bg-violet-600 hover:bg-violet-700 text-white"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed"
              }`}
            >
              <Plus className="w-4 h-4" />
              {canAddEvent ? "Add Event" : "Limit Reached"}
            </Motion.button>
          </div>
        )}
      </div>
    </Motion.div>
  );
};

// Mobile Events List Component
const MobileEventsList = ({
  filteredDateEvents,
  isLoading,
  handleToggleCompletion,
  handleDeleteEvent,
  setEventForm,
  setEditingEvent,
  setShowEventModal,
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 p-4 mb-4">
      <h3 className="text-base font-bold mb-3 text-slate-800 flex items-center gap-2">
        <FileText className="w-4 h-4 text-violet-600" />
        Events ({filteredDateEvents.length})
      </h3>

      {isLoading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600 mx-auto"></div>
        </div>
      ) : filteredDateEvents.length > 0 ? (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {filteredDateEvents.map((event) => (
            <Motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              whileTap={{ scale: 0.98 }}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                event.isCompleted ? "opacity-75" : ""
              }`}
              style={{
                backgroundColor: `${event.color}10`,
                borderColor: `${event.color}30`,
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: event.color }}
                    />
                    <span
                      className="text-xs font-medium px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: `${event.color}20`,
                        color: event.color,
                      }}
                    >
                      {eventTypes[event.type]?.label}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-800 text-sm mb-1">
                    {event.title}
                  </h4>
                  {event.description && (
                    <p className="text-slate-600 text-xs mb-1 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => handleToggleCompletion(event.id)}
                    className={`p-1 rounded ${
                      event.isCompleted
                        ? "text-emerald-600 hover:bg-emerald-50"
                        : "text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    {event.isCompleted ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <Circle className="w-3 h-3" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setEditingEvent(event);
                      setEventForm({
                        date: event.date,
                        title: event.title,
                        type: event.type,
                        description: event.description || "",
                        time: event.time || "",
                        impact: event.impact || "none",
                        instrument: event.instrument || "",
                        strategy: event.strategy || "",
                        sentiment: event.sentiment || "neutral",
                        color: event.color || "#8b5cf6",
                        isCompleted: event.isCompleted || false,
                      });
                      setShowEventModal(true);
                    }}
                    className="p-1 rounded text-violet-600 hover:bg-violet-50"
                  >
                    <Edit className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-1 rounded text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </Motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <FileText className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-slate-600 text-sm">No events for this date</p>
        </div>
      )}
    </div>
  );
};

const Layout = () => {
  const dispatch = useDispatch();
  const { events, dateEvents, isLoading, selectedDate } = useSelector(
    (state) => state.calendar
  );

  const { subscription = {} } = useOutletContext();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    date: new Date().toISOString().split("T")[0],
    title: "",
    type: "journal_entry",
    description: "",
    time: "",
    impact: "none",
    instrument: "",
    strategy: "",
    sentiment: "neutral",
    color: "#8b5cf6",
    isCompleted: false,
  });
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState("month");
  const [localMessage, setLocalMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [showDateSummary, setShowDateSummary] = useState(true);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [totalEventCount, setTotalEventCount] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const calendarContainerRef = useRef(null);
  const monthGridRef = useRef(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Inisialisasi tanggal hari ini saat pertama kali mount
  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd");

    // Set selectedDate ke hari ini jika belum ada atau kosong
    if (!selectedDate) {
      dispatch(setSelectedDate(today));
      dispatch(getDateEvents(today));
    }
  }, [dispatch, selectedDate]); // Hanya jalankan sekali saat mount

  // Auto-scroll to selected date on mobile
  useEffect(() => {
    if (selectedDate && monthGridRef.current && isMobile) {
      const selectedElement = monthGridRef.current.querySelector(
        `[data-date="${selectedDate}"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      }
    }
  }, [selectedDate, isMobile]);

  // Load calendar data
  useEffect(() => {
    const year = format(currentMonth, "yyyy");
    const month = format(currentMonth, "M");

    // Dispatch actions
    dispatch(getCalendarEvents({ year, month }));

    // Jika ada selectedDate, load date events
    if (selectedDate) {
      dispatch(getDateEvents(selectedDate));
    }

    // Load total event count
    fetchTotalEventCount();
  }, [currentMonth, dispatch, selectedDate]);

  const fetchTotalEventCount = async () => {
    try {
      const res = await axios.get(`${API_URL}/calendar/events/total-count`);

      if (res.data.success) {
        setTotalEventCount(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching total event count:", error);
    }
  };

  // Check if user can add more events
  const canAddEvent = useMemo(() => {
    if (subscription?.plan === "free") {
      return totalEventCount < 10;
    }
    return true;
  }, [subscription?.plan, totalEventCount]);

  // Function untuk handle add event button dengan parameter date opsional
  const handleAddEventClick = (date = null) => {
    if (!canAddEvent) {
      setShowUpgradeModal(true);
      return;
    }

    setEventForm({
      date: date || selectedDate || format(new Date(), "yyyy-MM-dd"),
      title: "",
      type: "journal_entry",
      description: "",
      time: "",
      impact: "none",
      instrument: "",
      strategy: "",
      sentiment: "neutral",
      color: "#8b5cf6",
      isCompleted: false,
    });
    setFormErrors({});
    setEditingEvent(null);
    setShowEventModal(true);
  };

  // Function untuk handle quick add di calendar grid
  const handleQuickAdd = (dayKey) => {
    if (!canAddEvent) {
      setShowUpgradeModal(true);
      return;
    }

    setEventForm({
      date: dayKey,
      title: "",
      type: "journal_entry",
      description: "",
      time: "",
      impact: "none",
      instrument: "",
      strategy: "",
      sentiment: "neutral",
      color: "#8b5cf6",
      isCompleted: false,
    });
    setFormErrors({});
    setEditingEvent(null);
    setShowEventModal(true);
  };

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === "month") {
      setCurrentMonth(subMonths(currentMonth, 1));
    } else if (viewMode === "week") {
      setCurrentMonth(subWeeks(currentMonth, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === "month") {
      setCurrentMonth(addMonths(currentMonth, 1));
    } else if (viewMode === "week") {
      setCurrentMonth(addWeeks(currentMonth, 1));
    }
  };

  // Filtered events for selected date
  const filteredDateEvents = useMemo(() => {
    return dateEvents.filter(
      (event) => filterType === "all" || event.type === filterType
    );
  }, [dateEvents, filterType]);

  // Calculate event stats for selected date (ALL events, not filtered)
  const dateStats = useMemo(() => {
    const eventCount = dateEvents.length; // Menggunakan semua events
    const completedCount = dateEvents.filter((e) => e.isCompleted).length;

    return {
      eventCount,
      completedCount,
      completionRate: eventCount > 0 ? (completedCount / eventCount) * 100 : 0,
    };
  }, [dateEvents]); // Dependency pada dateEvents, bukan filteredDateEvents

  // Generate month grid for mobile
  const renderMobileMonthView = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    // Day headers - compact for mobile dengan spacing lebih baik
    const dayHeaders = ["S", "M", "T", "W", "T", "F", "S"].map(
      (dayName, index) => (
        <div
          key={`day-header-${index}`}
          className="text-center font-bold text-slate-600 py-1 text-xs"
        >
          {dayName}
        </div>
      )
    );

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dayDate = day;
        const formattedDay = format(dayDate, "d");
        const isCurrentMonth = isSameMonth(dayDate, currentMonth);
        const isToday = isTodayFn(dayDate);
        const isSelected =
          selectedDate && isSameDay(dayDate, parseISO(selectedDate));
        const dayKey = format(dayDate, "yyyy-MM-dd");

        const dayEvents = events
          .filter((event) => isSameDay(parseISO(event.date), dayDate))
          .filter((event) => filterType === "all" || event.type === filterType);

        days.push(
          <Motion.div
            key={dayDate.toISOString()}
            data-date={dayKey}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className={`
            w-11 h-11 p-1 border rounded-lg transition-all duration-200
            flex flex-col items-center justify-center
            ${!isCurrentMonth ? "bg-slate-50/30 opacity-50" : "bg-white"}
            ${isToday ? "ring-1 ring-violet-400" : ""}
            ${
              isSelected
                ? "bg-violet-100 border-2 border-violet-500 shadow-sm"
                : "border-slate-200"
            }
            hover:bg-slate-50 hover:border-slate-300 cursor-pointer
            relative
          `}
            onClick={() => {
              dispatch(setSelectedDate(dayKey));
              if (isMobile) {
                setShowDateSummary(true);
              }
            }}
          >
            {/* Day number */}
            <span
              className={`
              text-xs font-semibold
              ${!isCurrentMonth ? "text-slate-400" : "text-slate-800"}
              ${isToday ? "text-violet-700" : ""}
              ${isSelected ? "text-violet-800 font-bold" : ""}
            `}
            >
              {formattedDay}
            </span>

            {/* Event indicators as dots - lebih kecil untuk ruang lebih */}
            <div className="flex flex-wrap justify-center gap-0.5 mt-0.5">
              {dayEvents.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="w-1 h-1 rounded-full"
                  style={{ backgroundColor: event.color }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingEvent(event);
                    setEventForm({
                      date: event.date,
                      title: event.title,
                      type: event.type,
                      description: event.description || "",
                      time: event.time || "",
                      impact: event.impact || "none",
                      instrument: event.instrument || "",
                      strategy: event.strategy || "",
                      sentiment: event.sentiment || "neutral",
                      color: event.color || "#8b5cf6",
                      isCompleted: event.isCompleted || false,
                    });
                    setShowEventModal(true);
                  }}
                />
              ))}
              {dayEvents.length > 3 && (
                <div className="text-[7px] text-slate-500">
                  +{dayEvents.length - 3}
                </div>
              )}
            </div>

            {/* High impact indicator - lebih kecil */}
            {dayEvents.some((e) => e.impact === "high") && (
              <div
                className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 border border-white"
                title="High impact event"
              />
            )}
          </Motion.div>
        );
        day = addDays(day, 1);
      }

      rows.push(
        <div key={day.toISOString()} className="grid grid-cols-7 gap-1.5">
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div className="space-y-1.5" ref={monthGridRef}>
        <div className="grid grid-cols-7 gap-1.5 mb-2">{dayHeaders}</div>
        <div className="space-y-1.5 min-w-[320px]">{rows}</div>
      </div>
    );
  };

  // Generate calendar grid for desktop
  const renderDesktopMonthView = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    // Day headers
    const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
      (dayName) => (
        <div
          key={dayName}
          className="text-center font-bold text-slate-700 py-2 text-sm"
        >
          {dayName}
        </div>
      )
    );

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dayDate = day;
        const formattedDay = format(dayDate, "d");
        const isCurrentMonth = isSameMonth(dayDate, currentMonth);
        const isToday = isTodayFn(dayDate);
        const isSelected =
          selectedDate && isSameDay(dayDate, parseISO(selectedDate));
        const dayKey = format(dayDate, "yyyy-MM-dd");

        const dayEvents = events
          .filter((event) => isSameDay(parseISO(event.date), dayDate))
          .filter((event) => filterType === "all" || event.type === filterType);

        days.push(
          <Motion.div
            key={dayDate.toISOString()}
            data-date={dayKey}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className={`
              min-h-32 p-2 border border-slate-200 rounded-xl transition-all duration-200
              ${!isCurrentMonth ? "bg-slate-50/50" : "bg-white"}
              ${isToday ? "ring-2 ring-violet-500 ring-offset-2" : ""}
              ${isSelected ? "bg-violet-50 border-violet-300" : ""}
              hover:bg-slate-50 hover:border-slate-300 cursor-pointer
              flex flex-col
            `}
            onClick={() => {
              dispatch(setSelectedDate(dayKey));
            }}
          >
            {/* Day header */}
            <div className="flex justify-between items-center mb-1">
              <span
                className={`
                text-sm font-semibold
                ${!isCurrentMonth ? "text-slate-400" : "text-slate-800"}
                ${isToday ? "text-violet-700" : ""}
              `}
              >
                {formattedDay}
              </span>

              {/* Event count badge */}
              {dayEvents.length > 0 && (
                <span className="text-xs bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full">
                  {dayEvents.length}
                </span>
              )}

              {/* Quick add button */}
              <Motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickAdd(dayKey);
                }}
                className="text-slate-400 hover:text-violet-600 hover:bg-violet-100 p-1 rounded-lg"
              >
                <Plus className="w-3 h-3" />
              </Motion.button>
            </div>

            {/* Day events */}
            <div className="flex-1 space-y-1">
              {/* Event indicators */}
              {dayEvents.slice(0, 2).map((event) => (
                <div
                  key={event.id}
                  className="text-xs truncate px-1 py-0.5 rounded flex items-center gap-1"
                  style={{
                    backgroundColor: `${event.color}20`,
                    color: event.color,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingEvent(event);
                    setEventForm({
                      date: event.date,
                      title: event.title,
                      type: event.type,
                      description: event.description || "",
                      time: event.time || "",
                      impact: event.impact || "none",
                      instrument: event.instrument || "",
                      strategy: event.strategy || "",
                      sentiment: event.sentiment || "neutral",
                      color: event.color || "#8b5cf6",
                      isCompleted: event.isCompleted || false,
                    });
                    setShowEventModal(true);
                  }}
                >
                  {eventTypes[event.type]?.icon}
                  <span className="truncate">{event.title}</span>
                  {event.isCompleted && (
                    <CheckCircle className="w-2 h-2 ml-auto" />
                  )}
                </div>
              ))}

              {/* More events indicator */}
              {dayEvents.length > 2 && (
                <div className="text-xs text-slate-500 px-1">
                  +{dayEvents.length - 2} more
                </div>
              )}

              {/* High impact indicator */}
              {dayEvents.some((e) => e.impact === "high") && (
                <div className="text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-2 h-2" />
                  <span>High Impact</span>
                </div>
              )}
            </div>
          </Motion.div>
        );
        day = addDays(day, 1);
      }

      rows.push(
        <div key={day.toISOString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div className="space-y-1">
        <div className="grid grid-cols-7 gap-1">{dayHeaders}</div>
        {rows}
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const weekStart = startOfWeekFn(currentMonth);

    let day = weekStart;

    const dayHeaders = [];
    const dayColumns = [];

    for (let i = 0; i < 7; i++) {
      const dayDate = day;
      const isToday = isTodayFn(dayDate);
      const isSelected =
        selectedDate && isSameDay(dayDate, parseISO(selectedDate));
      const dayEvents = events
        .filter((event) => isSameDay(parseISO(event.date), dayDate))
        .filter((event) => filterType === "all" || event.type === filterType);

      dayHeaders.push(
        <div
          key={`header-${i}`}
          className={`
          text-center font-bold py-3 border-b min-w-[120px]
          ${isToday ? "text-violet-700 bg-violet-50" : "text-slate-700"}
          ${isSelected ? "border-violet-300" : "border-slate-200"}
        `}
        >
          <div className="text-sm">{format(dayDate, "EEE")}</div>
          <div
            className={`
            text-lg ${
              isToday ? "text-violet-800 font-extrabold" : "text-slate-800"
            }
          `}
          >
            {format(dayDate, "d")}
          </div>
        </div>
      );

      dayColumns.push(
        <div
          key={`column-${i}`}
          className={`
          min-h-96 border-r min-w-[120px]
          ${
            isSelected
              ? "border-violet-300 bg-violet-50/30"
              : "border-slate-200"
          }
          ${i === 6 ? "border-r-0" : ""}
        `}
        >
          <div className="p-2 space-y-2">
            {dayEvents.map((event) => (
              <Motion.div
                key={event.id}
                whileHover={{ x: 5 }}
                className={`
                  p-2 rounded-lg text-sm cursor-pointer border
                  ${event.isCompleted ? "opacity-75" : ""}
                `}
                style={{
                  backgroundColor: `${event.color}15`,
                  borderColor: `${event.color}30`,
                  color: event.color,
                }}
                onClick={() => {
                  setEditingEvent(event);
                  setEventForm({
                    date: event.date,
                    title: event.title,
                    type: event.type,
                    description: event.description || "",
                    time: event.time || "",
                    impact: event.impact || "none",
                    instrument: event.instrument || "",
                    strategy: event.strategy || "",
                    sentiment: event.sentiment || "neutral",
                    color: event.color || "#8b5cf6",
                    isCompleted: event.isCompleted || false,
                  });
                  setShowEventModal(true);
                }}
              >
                <div className="font-medium truncate">{event.title}</div>
                {event.time && (
                  <div className="text-xs opacity-75 flex items-center gap-1">
                    <Clock className="w-2 h-2" />
                    {event.time}
                  </div>
                )}
                {event.impact === "high" && (
                  <div className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-2 h-2" />
                    High Impact
                  </div>
                )}
              </Motion.div>
            ))}

            {/* Add event button */}
            <Motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                handleQuickAdd(format(dayDate, "yyyy-MM-dd"));
              }}
              className="w-full py-2 text-slate-500 hover:text-violet-600 hover:bg-violet-50 
                         rounded-lg border border-dashed border-slate-300 text-sm flex items-center justify-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Add Event
            </Motion.button>
          </div>
        </div>
      );

      day = addDays(day, 1);
    }

    return (
      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 min-w-[840px]">{dayHeaders}</div>
        <div className="grid grid-cols-7 min-h-[600px] min-w-[840px]">
          {dayColumns}
        </div>
      </div>
    );
  };

  // Render day view
  const renderDayView = () => {
    const dayDate = parseISO(selectedDate || format(new Date(), "yyyy-MM-dd"));
    const dayEvents = dateEvents.filter(
      (event) => filterType === "all" || event.type === filterType
    );

    // Group events by hour
    const eventsByHour = {};
    dayEvents.forEach((event) => {
      const time = event.time || "00:00";
      const hour = time.split(":")[0];
      if (!eventsByHour[hour]) {
        eventsByHour[hour] = [];
      }
      eventsByHour[hour].push(event);
    });

    // Sort hours
    const hours = Object.keys(eventsByHour).sort();

    return (
      <div className="space-y-4 max-h-[700px] overflow-y-auto">
        {hours.length > 0 ? (
          hours.map((hour) => (
            <div
              key={hour}
              className="bg-white/80 rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-12 h-8 flex items-center justify-center bg-violet-100 text-violet-700 font-bold rounded-lg">
                  {hour}:00
                </div>
                <div className="text-sm text-slate-500">
                  {eventsByHour[hour].length}{" "}
                  {eventsByHour[hour].length === 1 ? "event" : "events"}
                </div>
              </div>

              <div className="space-y-3">
                {eventsByHour[hour].map((event) => (
                  <Motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ x: 5 }}
                    className={`p-3 rounded-lg border cursor-pointer ${
                      event.isCompleted ? "opacity-75" : ""
                    }`}
                    style={{
                      backgroundColor: `${event.color}15`,
                      borderColor: `${event.color}30`,
                      color: event.color,
                    }}
                    onClick={() => {
                      setEditingEvent(event);
                      setEventForm({
                        date: event.date,
                        title: event.title,
                        type: event.type,
                        description: event.description || "",
                        time: event.time || "",
                        impact: event.impact || "none",
                        instrument: event.instrument || "",
                        strategy: event.strategy || "",
                        sentiment: event.sentiment || "neutral",
                        color: event.color || "#8b5cf6",
                        isCompleted: event.isCompleted || false,
                      });
                      setShowEventModal(true);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="text-sm font-medium"
                            style={{ color: event.color }}
                          >
                            {event.time || "All day"}
                          </div>
                          {eventTypes[event.type]?.icon}
                        </div>
                        <div className="font-bold text-slate-800 text-sm">
                          {event.title}
                        </div>
                        {event.description && (
                          <div className="text-slate-600 text-xs mt-1 line-clamp-2">
                            {event.description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {event.isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 opacity-50 shrink-0" />
                        )}
                      </div>
                    </div>
                  </Motion.div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600 font-medium">
              No events scheduled for this day
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Add events to see them here
            </p>
          </div>
        )}
      </div>
    );
  };

  // Handle event form submission
  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setIsSavingEvent(true);
    setFormErrors({});

    try {
      if (editingEvent) {
        await dispatch(
          updateCalendarEvent({
            id: editingEvent.id,
            eventData: eventForm,
          })
        ).unwrap();

        setLocalMessage("Event updated successfully");
      } else {
        const result = await dispatch(createCalendarEvent(eventForm)).unwrap();
        setLocalMessage("Event created successfully");

        // Update total event count setelah berhasil create
        if (!editingEvent && result.currentEventCount) {
          setTotalEventCount(result.currentEventCount);
        }
      }

      setTimeout(() => setLocalMessage(""), 3000);
      setShowEventModal(false);
      setEditingEvent(null);
      setEventForm({
        date: new Date().toISOString().split("T")[0],
        title: "",
        type: "journal_entry",
        description: "",
        time: "",
        impact: "none",
        instrument: "",
        strategy: "",
        sentiment: "neutral",
        color: "#8b5cf6",
        isCompleted: false,
      });
      setFormErrors({});

      // Refresh total event count
      await fetchTotalEventCount();
    } catch (error) {
      console.error("Error saving event:", error);

      // Tangani error validasi dari backend
      if (error.payload?.fieldErrors) {
        setFormErrors(error.payload.fieldErrors);
        setLocalMessage("Please fix the validation errors");
      }
      // Tangani error limit event
      else if (error.message && error.message.includes("Free plan limited")) {
        setShowUpgradeModal(true);
        setLocalMessage("Free plan limited to 10 calendar events");
      } else if (error.payload && error.payload.includes("Free plan limited")) {
        setShowUpgradeModal(true);
        setLocalMessage("Free plan limited to 10 calendar events");
      } else {
        setLocalMessage(
          "Failed to save event: " + (error.message || "Unknown error")
        );
      }

      setTimeout(() => setLocalMessage(""), 5000);
    } finally {
      setIsSavingEvent(false);
    }
  };

  // Handle event deletion
  const handleDeleteEvent = async (eventId) => {
    const result = await Swal.fire({
      title: "Delete Event?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#8b5cf6",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
      background: "#fff",
      color: "#1f2937",
      customClass: {
        popup: "rounded-3xl shadow-2xl",
        title: "text-xl font-bold text-violet-900",
        confirmButton: "rounded-xl font-semibold px-6 py-3",
        cancelButton: "rounded-xl font-semibold px-6 py-3",
      },
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteCalendarEvent(eventId)).unwrap();
        setLocalMessage("Event deleted successfully");

        // Kurangi total event count
        setTotalEventCount((prev) => Math.max(0, prev - 1));

        setTimeout(() => setLocalMessage(""), 3000);
      } catch (error) {
        console.error("Error deleting event:", error);
        setLocalMessage("Failed to delete event");
        setTimeout(() => setLocalMessage(""), 5000);
      }
    }
  };

  // Toggle event completion
  const handleToggleCompletion = async (eventId) => {
    try {
      await dispatch(toggleEventCompletion(eventId)).unwrap();
    } catch (error) {
      console.error("Error toggling completion:", error);
    }
  };

  return (
    <div className="space-y-4 min-h-screen" ref={calendarContainerRef}>
      {/* Header */}
      <Motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
      >
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-violet-600" />
            Calendar Events
          </h1>
          <p className="text-sm sm:text-sm md:text-base text-slate-600 mt-0.5 font-light">
            Plan and track your events and activities
          </p>
        </div>
      </Motion.div>

      {/* Message Display */}
      {localMessage && (
        <Motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-xl border text-xs sm:text-sm font-medium ${
            localMessage.includes("limited")
              ? "bg-amber-100 text-amber-700 border-amber-300"
              : localMessage.includes("Failed") || localMessage.includes("fix")
              ? "bg-rose-100 text-rose-700 border-rose-300"
              : "bg-emerald-100 text-emerald-700 border-emerald-300"
          }`}
        >
          {localMessage}
        </Motion.div>
      )}

      {/* Event Limit Banner untuk Free Users */}
      {subscription?.plan === "free" && (
        <Motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 sm:p-4 rounded-xl border ${
            totalEventCount >= 10
              ? "bg-linear-to-r from-red-100 to-red-100 border-2 border-red-300 rounded-3xl p-5 shadow-sm"
              : totalEventCount >= 8
              ? "bg-amber-100 border-amber-300"
              : "bg-violet-100 border-violet-300"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Icon */}
            <div
              className={`shrink-0 p-2 rounded-lg ${
                totalEventCount >= 10
                  ? "bg-rose-200 text-rose-700"
                  : totalEventCount >= 8
                  ? "bg-amber-200 text-amber-700"
                  : "bg-violet-200 text-violet-700"
              }`}
            >
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

            {/* Text Content */}
            <div className="flex-1">
              <p
                className={`text-sm sm:text-base font-bold mb-1 ${
                  totalEventCount >= 10
                    ? "text-rose-800"
                    : totalEventCount >= 8
                    ? "text-amber-800"
                    : "text-violet-800"
                }`}
              >
                {totalEventCount}/10 events used
              </p>
              <p
                className={`text-xs sm:text-sm ${
                  totalEventCount >= 10
                    ? "text-rose-700"
                    : totalEventCount >= 8
                    ? "text-amber-700"
                    : "text-violet-700"
                }`}
              >
                {totalEventCount >= 10
                  ? "Limit reached. Upgrade to Pro for unlimited events."
                  : totalEventCount >= 8
                  ? "Almost full. Upgrade to Pro for unlimited events."
                  : "Free plan limit. Upgrade to Pro for unlimited events."}
              </p>
            </div>

            {/* Upgrade Button */}
            <Motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUpgradeModal(true)}
              className={`w-full sm:w-auto text-white px-6 py-3 rounded-xl transition-all duration-200 text-sm font-medium shadow-sm flex items-center justify-center gap-2 ${
                totalEventCount >= 10
                  ? "bg-linear-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700"
                  : totalEventCount >= 8
                  ? "bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                  : "bg-linear-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Upgrade Now</span>
            </Motion.button>
          </div>
        </Motion.div>
      )}

      {/* Calendar Controls */}
      <CalendarControls
        viewMode={viewMode}
        setViewMode={setViewMode}
        filterType={filterType}
        setFilterType={setFilterType}
        currentMonth={currentMonth}
        selectedDate={selectedDate}
        isMobile={isMobile}
        showFilterPanel={showFilterPanel}
        setShowFilterPanel={setShowFilterPanel}
        handlePrev={handlePrev}
        handleNext={handleNext}
        setCurrentMonth={setCurrentMonth}
        dispatch={dispatch}
        setEventForm={setEventForm}
        setEditingEvent={setEditingEvent}
        setShowEventModal={setShowEventModal}
        dateStats={dateStats}
        canAddEvent={canAddEvent}
        handleAddEventClick={handleAddEventClick}
        totalEventCount={totalEventCount}
      />

      {/* Calendar View */}
      <Motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100"
      >
        <div className="mt-4 overflow-x-auto">
          <div className="min-w-[320px] sm:min-w-[640px] md:min-w-full">
            {viewMode === "month" && (
              <div className={isMobile ? "pb-4" : ""}>
                {isMobile ? renderMobileMonthView() : renderDesktopMonthView()}
              </div>
            )}
            {viewMode === "week" && renderWeekView()}
            {viewMode === "day" && renderDayView()}
          </div>
        </div>
      </Motion.div>

      {/* Mobile Layout - Stacked view */}
      {isMobile ? (
        <div className="space-y-4">
          <MobileDateSummary
            selectedDate={selectedDate}
            showDateSummary={showDateSummary}
            setShowDateSummary={setShowDateSummary}
            canAddEvent={canAddEvent}
            handleAddEventClick={handleAddEventClick}
          />
          <MobileEventsList
            filteredDateEvents={filteredDateEvents}
            isLoading={isLoading}
            handleToggleCompletion={handleToggleCompletion}
            handleDeleteEvent={handleDeleteEvent}
            setEventForm={setEventForm}
            setEditingEvent={setEditingEvent}
            setShowEventModal={setShowEventModal}
          />
        </div>
      ) : (
        /* Desktop Layout - Full width event list */
        <Motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-100"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-violet-600" />
              {selectedDate && isSameDay(parseISO(selectedDate), new Date())
                ? "Events Today"
                : selectedDate
                ? `Events for ${format(parseISO(selectedDate), "MMMM d, yyyy")}`
                : "Events for Selected Date"}
              <span className="text-sm font-normal text-slate-500 ml-2">
                {filteredDateEvents.length}{" "}
                {filteredDateEvents.length === 1 ? "event" : "events"}
              </span>
            </h3>

            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-600">
                <span className="font-medium">{dateStats.completedCount}</span>{" "}
                of <span className="font-medium">{dateStats.eventCount}</span>{" "}
                completed
              </div>

              <Motion.button
                whileHover={{
                  scale: canAddEvent ? 1.02 : 1,
                  y: canAddEvent ? -2 : 0,
                }}
                whileTap={{ scale: canAddEvent ? 0.98 : 1 }}
                onClick={handleAddEventClick}
                disabled={!canAddEvent}
                className={`py-2 px-4 rounded-xl transition-all duration-200 font-medium shadow-sm flex items-center justify-center gap-2 ${
                  canAddEvent
                    ? "bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white hover:shadow-md"
                    : "bg-slate-300 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Plus className="w-4 h-4" />
                {canAddEvent ? "Add Event" : "Limit Reached"}
              </Motion.button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
            </div>
          ) : filteredDateEvents.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredDateEvents.map((event) => (
                <Motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ y: -5 }}
                  className={`p-4 rounded-xl border transition-all duration-200 ${
                    event.isCompleted ? "opacity-75" : ""
                  }`}
                  style={{
                    backgroundColor: `${event.color}10`,
                    borderColor: `${event.color}30`,
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: event.color }}
                        />
                        <span
                          className="text-sm font-medium px-2 py-1 rounded"
                          style={{
                            backgroundColor: `${event.color}20`,
                            color: event.color,
                          }}
                        >
                          {eventTypes[event.type]?.label}
                        </span>
                        {event.time && (
                          <span className="text-sm text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {event.time}
                          </span>
                        )}
                        {event.impact === "high" && (
                          <span className="text-xs text-rose-600 bg-rose-100 px-2 py-1 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            High Impact
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-slate-800 mb-1">
                        {event.title}
                      </h4>
                      {event.description && (
                        <p className="text-slate-600 text-sm mb-2">
                          {event.description}
                        </p>
                      )}

                      {(event.instrument || event.strategy) && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {event.instrument && (
                            <span className="text-xs bg-zinc-200 text-zinc-700 px-2 py-1 rounded">
                              {event.instrument}
                            </span>
                          )}
                          {event.strategy && (
                            <span className="text-xs bg-zinc-200 text-zinc-700 px-2 py-1 rounded">
                              {event.strategy}
                            </span>
                          )}
                          {event.sentiment && event.sentiment !== "neutral" && (
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                event.sentiment === "bullish"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              {event.sentiment === "bullish"
                                ? "Bullish"
                                : "Bearish"}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleToggleCompletion(event.id)}
                        className={`p-2 rounded-lg ${
                          event.isCompleted
                            ? "text-emerald-600 hover:bg-emerald-50"
                            : "text-slate-400 hover:bg-slate-100"
                        }`}
                      >
                        {event.isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setEditingEvent(event);
                          setEventForm({
                            date: event.date,
                            title: event.title,
                            type: event.type,
                            description: event.description || "",
                            time: event.time || "",
                            impact: event.impact || "none",
                            instrument: event.instrument || "",
                            strategy: event.strategy || "",
                            sentiment: event.sentiment || "neutral",
                            color: event.color || "#8b5cf6",
                            isCompleted: event.isCompleted || false,
                          });
                          setShowEventModal(true);
                        }}
                        className="p-2 rounded-lg text-violet-600 hover:bg-violet-50"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-2 rounded-lg text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600 font-medium">
                No events for this date
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Click on a date to add events
              </p>
              <Motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddEventClick}
                disabled={!canAddEvent}
                className={`mt-4 px-6 py-3 rounded-xl transition-all shadow-sm font-medium flex items-center gap-2 mx-auto ${
                  canAddEvent
                    ? "bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                    : "bg-slate-300 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Plus className="w-5 h-5" />
                Add First Event
              </Motion.button>
            </div>
          )}
        </Motion.div>
      )}

      {/* Event Types Legend */}
      <Motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100"
      >
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" />
            Event Types
          </h3>
          {subscription?.plan === "free" && (
            <div className="text-xs sm:text-sm text-slate-600 font-medium">
              {totalEventCount}/10 events used
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
          {Object.entries(eventTypes).map(([key, config]) => (
            <div
              key={key}
              className="flex items-center gap-2 p-2 sm:p-3 bg-slate-50 rounded-xl"
            >
              <div
                className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-xs sm:text-sm font-medium text-slate-700">
                {config.label}
              </span>
            </div>
          ))}
        </div>
      </Motion.div>

      {/* Upgrade Modal untuk Event Limit */}
      <AnimatePresence>
        {showUpgradeModal && (
          <UpgradeRequiredModal
            setShowUpgradeModal={setShowUpgradeModal}
            featureKey="unlimited_calendar_events"
          />
        )}
      </AnimatePresence>

      {/* Calendar Event Modal (NEW - dengan validasi) */}
      <CalendarEventModal
        showModal={showEventModal}
        setShowModal={setShowEventModal}
        eventForm={eventForm}
        setEventForm={setEventForm}
        editingEvent={editingEvent}
        setEditingEvent={setEditingEvent}
        handleEventSubmit={handleEventSubmit}
        isLoading={isSavingEvent}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
      />
    </div>
  );
};

export default Layout;
