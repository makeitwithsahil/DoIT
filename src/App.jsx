import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiCheckCircle, FiStar, FiClock,
  FiTrash2, FiEdit2, FiZap, FiTrash, FiSun, FiMoon,
  FiRotateCcw, FiCalendar, FiX,
  FiGithub, FiTwitter, FiInfo, FiShield, FiHeart,
  FiChevronLeft, FiChevronRight, FiDownload, FiUpload
} from 'react-icons/fi';

// Constants & Helpers
const MOTIVATIONAL_QUOTES = [
  "Small steps compound into big achievements",
  "Done is better than perfect",
  "You're one task closer to your goals",
  "Progress, not perfection",
  "Every task completed builds momentum"
];

const CELEBRATIONS = [
  "Great job! 🎉",
  "You're crushing it! 💪",
  "Task conquered! ⭐",
  "Productivity unlocked! 🔓",
  "Another win! 🚀"
];

// Image Modal Slider Images
const SLIDER_IMAGES = [
  {
    src: "/step-1.jpg",
    title: "Install App",
    description: "Click on three dot in the top right corner."
  },
  {
    src: "/step-2.jpg",
    title: "Install App",
    description: "Click on Add to Home Screen Button."
  },
  {
    src: "/step-3.jpg",
    title: "Install App",
    description: "Click on Install Button"
  }
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/80 dark:text-blue-100' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/80 dark:text-yellow-100' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-800 dark:bg-red-900/80 dark:text-red-100' }
];

const COLORS = {
  light: {
    primary: 'bg-indigo-600 hover:bg-indigo-700',
    secondary: 'bg-slate-100 hover:bg-slate-200',
    text: 'text-slate-900',
    muted: 'text-slate-500',
    background: 'bg-slate-50',
    card: 'bg-white',
    border: 'border-slate-200',
    footer: 'bg-white/90',
    input: 'bg-white text-slate-900 placeholder-slate-400'
  },
  dark: {
    primary: 'bg-indigo-500 hover:bg-indigo-600',
    secondary: 'bg-slate-800 hover:bg-slate-700',
    text: 'text-slate-50',
    muted: 'text-slate-300',
    background: 'bg-slate-950',
    card: 'bg-slate-900',
    border: 'border-slate-700',
    footer: 'bg-slate-900/90',
    input: 'bg-slate-800 text-slate-100 placeholder-slate-500'
  }
};

const genId = () => Math.random().toString(36).slice(2, 11);

const getRandomItem = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) return "";
  return arr[Math.floor(Math.random() * arr.length)];
};

const formatDateTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (taskDate.getTime() === today.getTime()) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (taskDate.getTime() === tomorrow.getTime()) {
    return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

const calculateStreak = (streak) => {
  const today = new Date();
  const lastDate = streak.lastDate ? new Date(streak.lastDate) : null;
  const isConsecutive =
    lastDate &&
    today.setHours(0, 0, 0, 0) - lastDate.setHours(0, 0, 0, 0) ===
    24 * 60 * 60 * 1000;

  return {
    current: isConsecutive ? streak.current + 1 : 1,
    lastDate: Date.now(),
  };
};

// Image Modal Slider Component
const ImageModalSlider = React.memo(function ImageModalSlider({ onClose, colors }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % SLIDER_IMAGES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + SLIDER_IMAGES.length) % SLIDER_IMAGES.length);
  }, []);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 150);
  }, [onClose]);

  // Auto-advance slides every 6 seconds
  useEffect(() => {
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          prevSlide();
          break;
        case 'ArrowRight':
          nextSlide();
          break;
        case 'Escape':
          handleClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [nextSlide, prevSlide, handleClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isClosing ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: isClosing ? 0.8 : 1, opacity: isClosing ? 0 : 1, y: isClosing ? 50 : 0 }}
        transition={{ duration: 0.4, type: "spring", damping: 25 }}
        className={`relative w-full max-w-md mx-auto ${colors.card} rounded-2xl overflow-hidden shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/30 transition-all duration-200"
          aria-label="Close modal"
        >
          <FiX size={20} />
        </button>

        {/* Image Container */}
        <div className="relative aspect-[3/4]">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide}
              src={SLIDER_IMAGES[currentSlide].src}
              alt={SLIDER_IMAGES[currentSlide].title}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              loading="lazy"
            />
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/30 transition-all duration-200 hover:scale-110"
            aria-label="Previous image"
          >
            <FiChevronLeft size={20} />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/30 transition-all duration-200 hover:scale-110"
            aria-label="Next image"
          >
            <FiChevronRight size={20} />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {SLIDER_IMAGES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide
                    ? 'bg-white w-6'
                    : 'bg-white/50 hover:bg-white/70'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-center"
            >
              <h3 className={`text-xl font-bold ${colors.text} mb-3`}>
                {SLIDER_IMAGES[currentSlide].title}
              </h3>
              <p className={`${colors.muted} text-sm leading-relaxed mb-6`}>
                {SLIDER_IMAGES[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Action Button */}
          <motion.button
            onClick={handleClose}
            className={`w-full py-3 px-6 rounded-xl ${colors.primary} text-white font-medium hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2`}
            whileTap={{ scale: 0.98 }}
          >
            <span>Get Started</span>
            <FiChevronRight size={16} />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
});

// Hook for managing visit count and modal display
const useVisitModal = () => {
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkVisitCount = () => {
      try {
        let visitData = { count: 0, lastVisit: null };

        if (typeof Storage !== 'undefined' && localStorage) {
          const saved = localStorage.getItem('doit-visits');
          if (saved) {
            visitData = JSON.parse(saved);
          }
        }

        const now = Date.now();
        const oneDayAgo = now - (24 * 60 * 60 * 1000);

        if (visitData.lastVisit && visitData.lastVisit < oneDayAgo) {
          visitData.count = 0;
        }

        visitData.count += 1;
        visitData.lastVisit = now;

        const shouldShow = visitData.count === 1 || visitData.count % 5 === 0;

        if (typeof Storage !== 'undefined' && localStorage) {
          try {
            localStorage.setItem('doit-visits', JSON.stringify(visitData));
          } catch (e) {
            console.warn('localStorage not available:', e);
          }
        }

        setShouldShowModal(shouldShow);
      } catch (error) {
        console.warn('Failed to check visit count:', error);
        setShouldShowModal(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to ensure smooth loading
    const timer = setTimeout(checkVisitCount, 500);
    return () => clearTimeout(timer);
  }, []);

  const closeModal = useCallback(() => {
    setShouldShowModal(false);
  }, []);

  return { shouldShowModal, closeModal, isLoading };
};

// PWA Install Component
// Enhanced PWA Install Component with install tracking
const PWAInstallPrompt = React.memo(function PWAInstallPrompt({ colors }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Don't show prompt if already running as PWA
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    if (window.navigator && window.navigator.standalone === true) {
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Check if user has previously dismissed or installed
      try {
        const pwaStatus = localStorage.getItem('doit-pwa-status');
        if (pwaStatus !== 'dismissed' && pwaStatus !== 'installed') {
          setShowPrompt(true);
        }
      } catch {
        setShowPrompt(true);
      }
    };

    // Listen for successful installation
    const installHandler = () => {
      try {
        localStorage.setItem('doit-pwa-status', 'installed');
        localStorage.setItem('doit-pwa-install-time', Date.now().toString());
      } catch (e) {
        console.warn('Could not save PWA install status:', e);
      }
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installHandler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      try {
        localStorage.setItem('doit-pwa-status', 'installed');
        localStorage.setItem('doit-pwa-install-time', Date.now().toString());
      } catch (e) {
        console.warn('Could not save PWA install status:', e);
      }
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  }, [deferredPrompt]);

  const dismissPrompt = useCallback(() => {
    try {
      localStorage.setItem('doit-pwa-status', 'dismissed');
      localStorage.setItem('doit-pwa-dismiss-time', Date.now().toString());
    } catch (e) {
      console.warn('Could not save PWA dismiss status:', e);
    }
    setShowPrompt(false);
    setDeferredPrompt(null);
  }, []);

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50"
      >
        <div className={`${colors.card} rounded-xl border ${colors.border} shadow-2xl p-4`}>
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
              <FiDownload className="text-indigo-600 dark:text-indigo-400" size={20} />
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${colors.text} mb-1`}>Install DoIT</h3>
              <p className={`text-sm ${colors.muted} mb-3`}>
                Add DoIT to your home screen for quick access and a better experience!
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleInstall}
                  className={`px-3 py-2 rounded-lg ${colors.primary} text-white text-sm font-medium hover:opacity-90 transition-opacity`}
                >
                  Install
                </button>
                <button
                  onClick={dismissPrompt}
                  className={`px-3 py-2 rounded-lg ${colors.secondary} ${colors.text} text-sm hover:opacity-80 transition-opacity`}
                >
                  Not now
                </button>
              </div>
            </div>
            <button
              onClick={dismissPrompt}
              className={`${colors.muted} hover:${colors.text} transition-colors`}
            >
              <FiX size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

// Custom Date Picker Component
const CustomDatePicker = React.memo(function CustomDatePicker({
  selectedDate,
  onDateSelect,
  onClose,
  colors,
  className = ""
}) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = selectedDate || new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [selectedTime, setSelectedTime] = useState(() => {
    if (selectedDate) {
      return {
        hour: selectedDate.getHours(),
        minute: selectedDate.getMinutes()
      };
    }
    const now = new Date();
    return {
      hour: now.getHours(),
      minute: Math.ceil(now.getMinutes() / 15) * 15
    };
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = useCallback((date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }, []);

  const getFirstDayOfMonth = useCallback((date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  }, []);

  const navigateMonth = useCallback((direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  }, []);

  const handleDateClick = useCallback((day) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
      selectedTime.hour,
      selectedTime.minute
    );
    onDateSelect(newDate);
  }, [currentMonth, selectedTime, onDateSelect]);

  const handleTimeChange = useCallback((type, value) => {
    setSelectedTime(prev => ({
      ...prev,
      [type]: parseInt(value)
    }));
  }, []);

  const handleQuickSelect = useCallback((days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(selectedTime.hour, selectedTime.minute, 0, 0);
    onDateSelect(date);
  }, [selectedTime, onDateSelect]);

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const today = new Date();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-10" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = selectedDate &&
        date.toDateString() === new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).toDateString();
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());

      days.push(
        <button
          key={day}
          onClick={() => !isPast && handleDateClick(day)}
          disabled={isPast}
          className={`
            w-10 h-10 rounded-full text-sm font-medium transition-all duration-200
            ${isSelected
              ? 'bg-indigo-600 text-white shadow-md scale-105'
              : isToday
                ? `ring-2 ring-indigo-500 ${colors.text}`
                : isPast
                  ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                  : `${colors.text} hover:bg-indigo-100 dark:hover:bg-slate-700 hover:scale-105`
            }
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  }, [currentMonth, selectedDate, colors.text, getDaysInMonth, getFirstDayOfMonth, handleDateClick]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ duration: 0.15 }}
      className={`${colors.card} rounded-xl border ${colors.border} shadow-2xl ${className} overflow-hidden`}
    >
      {/* Quick Select */}
      <div className={`p-4 border-b ${colors.border}`}>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Today', days: 0 },
            { label: 'Tomorrow', days: 1 },
            { label: 'Next Week', days: 7 }
          ].map(({ label, days }) => (
            <button
              key={label}
              onClick={() => handleQuickSelect(days)}
              className={`px-3 py-1.5 text-sm rounded-lg ${colors.secondary} ${colors.text} hover:opacity-80 transition-opacity`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Header */}
      <div className={`flex items-center justify-between p-4 border-b ${colors.border}`}>
        <button
          onClick={() => navigateMonth(-1)}
          className={`p-2 rounded-lg ${colors.secondary} ${colors.text} hover:opacity-80 transition-opacity`}
        >
          <FiChevronLeft size={18} />
        </button>
        <h3 className={`font-semibold ${colors.text}`}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={() => navigateMonth(1)}
          className={`p-2 rounded-lg ${colors.secondary} ${colors.text} hover:opacity-80 transition-opacity`}
        >
          <FiChevronRight size={18} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className={`text-center text-xs font-medium ${colors.muted} py-2`}>
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays}
        </div>
      </div>

      {/* Time Selection */}
      <div className={`p-4 border-t ${colors.border}`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <label className={`block text-sm font-medium ${colors.muted} mb-1`}>Hour</label>
            <select
              value={selectedTime.hour}
              onChange={(e) => handleTimeChange('hour', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg ${colors.input} border ${colors.border} focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {i.toString().padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className={`block text-sm font-medium ${colors.muted} mb-1`}>Minute</label>
            <select
              value={selectedTime.minute}
              onChange={(e) => handleTimeChange('minute', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg ${colors.input} border ${colors.border} focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
            >
              {[0, 15, 30, 45].map(minute => (
                <option key={minute} value={minute}>
                  :{minute.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => onDateSelect(null)}
            className={`px-4 py-2 text-sm rounded-lg ${colors.secondary} ${colors.text} hover:opacity-80 transition-opacity`}
          >
            Clear Date
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className={`px-4 py-2 text-sm rounded-lg ${colors.secondary} ${colors.text} hover:opacity-80 transition-opacity`}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (selectedDate) {
                  const newDate = new Date(selectedDate);
                  newDate.setHours(selectedTime.hour, selectedTime.minute, 0, 0);
                  onDateSelect(newDate);
                } else {
                  const today = new Date();
                  today.setHours(selectedTime.hour, selectedTime.minute, 0, 0);
                  onDateSelect(today);
                }
              }}
              className={`px-4 py-2 text-sm rounded-lg ${colors.primary} text-white hover:opacity-90 transition-opacity`}
            >
              Set Date
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

// Task Input Component
const TaskInput = React.memo(function TaskInput({
  addTask,
  inputRef,
  isProcessing,
  selectedDate,
  setShowDatePicker,
  showDatePicker,
  setSelectedDate,
  colors
}) {
  const [input, setInput] = useState('');
  const datePickerRef = useRef(null);
  const dateButtonRef = useRef(null);

  const handleAddTask = useCallback(() => {
    if (!input.trim() || isProcessing) return;
    addTask(input, selectedDate);
    setInput('');
    setSelectedDate(null);
    setShowDatePicker(false);
  }, [input, isProcessing, addTask, selectedDate, setSelectedDate, setShowDatePicker]);

  const handleDateSelect = useCallback((date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  }, [setSelectedDate, setShowDatePicker]);

  // Close date picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (datePickerRef.current &&
        !datePickerRef.current.contains(event.target) &&
        !dateButtonRef.current?.contains(event.target)) {
        setShowDatePicker(false);
      }
    }

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDatePicker, setShowDatePicker]);

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            placeholder="What needs to be done?"
            className={`w-full px-4 py-3 pr-12 rounded-xl ${colors.input} border ${colors.border} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
            aria-label="Add a task"
            disabled={isProcessing}
          />
          <button
            ref={dateButtonRef}
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${selectedDate
              ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/50'
              : `${colors.muted} hover:bg-slate-100 dark:hover:bg-slate-700`
              }`}
            aria-label="Select due date"
          >
            <FiCalendar size={18} />
          </button>
        </div>

        <motion.button
          onClick={handleAddTask}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-3 rounded-xl ${colors.primary} text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label="Add task"
          disabled={isProcessing || !input.trim()}
        >
          {isProcessing ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <FiPlus size={20} />
          )}
        </motion.button>
      </div>

      {/* Selected date preview */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-2 flex items-center gap-2 text-sm ${colors.muted}`}
        >
          <FiClock size={14} />
          <span>Due: {formatDateTime(selectedDate.getTime())}</span>
          <button
            onClick={() => {
              setSelectedDate(null);
              setShowDatePicker(false);
            }}
            className="text-red-500 hover:text-red-600 ml-1"
          >
            <FiX size={14} />
          </button>
        </motion.div>
      )}

      {/* Date Picker */}
      <AnimatePresence>
        {showDatePicker && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50">
            <div ref={datePickerRef}>
              <CustomDatePicker
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                onClose={() => setShowDatePicker(false)}
                colors={colors}
                className="w-full max-w-md mx-auto"
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
});

// Task Item Component
const TaskItem = React.memo(function TaskItem({
  task, onToggleComplete, onDelete, onEdit, isProcessing, colors
}) {
  const isOverdue = task.dueDate && !task.completed && task.dueDate < Date.now();
  const priority = PRIORITY_OPTIONS.find(p => p.value === task.priority);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.15 } }}
      exit={{ opacity: 0, y: 6, transition: { duration: 0.1 } }}
      className={`p-4 rounded-xl flex items-start gap-3 border transition-all hover:shadow-md ${task.completed
        ? 'bg-emerald-50/60 dark:bg-emerald-900/30 border-emerald-100/60 dark:border-emerald-800/40'
        : `${colors.card} ${colors.border}`
        }`}
    >
      <motion.button
        whileTap={{ scale: 0.9 }}
        aria-label={task.completed ? 'Mark as active' : 'Mark as completed'}
        onClick={() => onToggleComplete(task.id)}
        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${task.completed
          ? 'bg-emerald-500 text-white shadow-md'
          : `border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30`
          }`}
        disabled={isProcessing}
      >
        {task.completed && <FiCheckCircle size={14} />}
      </motion.button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className={`text-sm leading-relaxed break-words ${task.completed
            ? `${colors.text} line-through opacity-70`
            : colors.text
            }`}>
            {task.text}
          </p>
          {task.priority && (
            <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap flex items-center gap-1 ${priority.color}`}>
              <FiStar size={10} /> {priority.label}
            </span>
          )}
        </div>

        {task.dueDate && (
          <div className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-500 dark:text-red-400' : colors.muted
            }`}>
            <FiClock size={12} />
            <span>
              {formatDateTime(task.dueDate)}
              {isOverdue && ' (Overdue)'}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-1 opacity-100 sm:group-hover:opacity-100 transition-opacity">
        <motion.button
          whileTap={{ scale: 0.9 }}
          aria-label="Edit task"
          onClick={() => onEdit(task)}
          className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-200 transition-colors"
          disabled={isProcessing}
        >
          <FiEdit2 size={14} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          aria-label="Delete task"
          onClick={() => onDelete(task.id)}
          className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-200 transition-colors"
          disabled={isProcessing}
        >
          <FiTrash size={16} />
        </motion.button>
      </div>
    </motion.li>
  );
});

const ModalBackdrop = React.memo(function ModalBackdrop({ children, onClose }) {
  const backdropRef = useRef(null);

  const handleClickOutside = useCallback((event) => {
    if (backdropRef.current === event.target) {
      onClose();
    }
  }, [onClose]);

  const handleEsc = useCallback((event) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [handleClickOutside, handleEsc]);

  return (
    <motion.div
      ref={backdropRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      {children}
    </motion.div>
  );
});

// Main DoIT Component
export default function DoIT() {
  const inputRef = useRef(null);

  // Visit modal hook
  const { shouldShowModal, closeModal: closeVisitModal, isLoading } = useVisitModal();

  // Simplified modal state
  const [modal, setModal] = useState(null);

  // State with better initialization
  const [tasks, setTasks] = useState(() => {
    try {
      if (typeof Storage !== 'undefined' && localStorage) {
        const saved = localStorage.getItem('doit-tasks');
        return saved ? JSON.parse(saved) : [];
      }
      return [];
    } catch { return []; }
  });

  const [filter, setFilter] = useState(() => {
    try {
      if (typeof Storage !== 'undefined' && sessionStorage) {
        const saved = sessionStorage.getItem('doit-filter');
        return saved || 'active';
      }
      return 'active';
    } catch { return 'active'; }
  });

  const [theme, setTheme] = useState(() => {
    try {
      if (typeof Storage !== 'undefined' && localStorage) {
        const saved = localStorage.getItem('doit-theme');
        return saved || 'light';
      }
      return 'light';
    } catch { return 'light'; }
  });

  const [quote] = useState(() => getRandomItem(MOTIVATIONAL_QUOTES));
  const [toasts, setToasts] = useState([]);
  const [meta, setMeta] = useState(() => {
    try {
      if (typeof Storage !== 'undefined' && localStorage) {
        const saved = localStorage.getItem('doit-meta');
        return saved ? JSON.parse(saved) : {
          points: 0,
          streak: { current: 0, lastDate: null },
          theme: 'light',
          version: 2
        };
      }
      return { points: 0, streak: { current: 0, lastDate: null }, theme: 'light', version: 2 };
    } catch {
      return { points: 0, streak: { current: 0, lastDate: null }, theme: 'light', version: 2 };
    }
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const colors = useMemo(() => COLORS[theme], [theme]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        switch (filter) {
          case 'active': return !task.completed;
          case 'completed': return task.completed;
          default: return true;
        }
      })
      .sort((a, b) => {
        if (a.dueDate && b.dueDate) return a.dueDate - b.dueDate;
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return b.createdAt - a.createdAt;
      });
  }, [tasks, filter]);

  // Optimized stats calculation
  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    return {
      total,
      completed,
      active: total - completed,
      completionRate: total ? Math.round((completed / total) * 100) : 0
    };
  }, [tasks]);

  // Simplified modal handlers
  const openModal = useCallback((type, data = null) => {
    setModal({ type, data });
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  // Optimized persistence effects
  useEffect(() => {
    if (typeof Storage !== 'undefined' && localStorage) {
      try {
        localStorage.setItem('doit-tasks', JSON.stringify(tasks));
      } catch (e) {
        console.warn('Failed to save tasks:', e);
      }
    }
  }, [tasks]);

  useEffect(() => {
    if (typeof Storage !== 'undefined' && sessionStorage) {
      try {
        sessionStorage.setItem('doit-filter', filter);
      } catch (e) {
        console.warn('Failed to save filter:', e);
      }
    }
  }, [filter]);

  useEffect(() => {
    if (typeof Storage !== 'undefined' && localStorage) {
      try {
        localStorage.setItem('doit-theme', theme);
        localStorage.setItem('doit-meta', JSON.stringify({ ...meta, theme }));
      } catch (e) {
        console.warn('Failed to save theme/meta:', e);
      }
    }
  }, [theme, meta]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Optimized handlers
  const addTask = useCallback((inputValue, selectedDateValue) => {
    if (!inputValue.trim() || isProcessing) return;

    setIsProcessing(true);

    const newTask = {
      id: genId(),
      text: inputValue.trim().slice(0, 500),
      completed: false,
      createdAt: Date.now(),
      priority: 'medium',
      dueDate: selectedDateValue ? selectedDateValue.getTime() : null
    };

    setTasks(prev => [newTask, ...prev]);
    showToast("Task added successfully!");
    setIsProcessing(false);
  }, [isProcessing]);

  const toggleComplete = useCallback((id) => {
    const task = tasks.find(x => x.id === id);
    if (!task || isProcessing) return;

    setIsProcessing(true);

    setTasks(prev =>
      prev.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );

    if (!task.completed) {
      const pointsEarned = task.priority === 'high' ? 30 : task.priority === 'medium' ? 15 : 10;
      const newStreak = calculateStreak(meta.streak);
      setMeta(p => ({ ...p, points: p.points + pointsEarned, streak: newStreak }));
      showToast(getRandomItem(CELEBRATIONS));
    }

    setIsProcessing(false);
  }, [tasks, meta.streak, isProcessing]);

  const deleteTask = useCallback((id) => {
    const task = tasks.find(t => t.id === id);
    openModal('deleteTask', { id, task });
  }, [tasks, openModal]);

  const confirmDelete = useCallback(() => {
    if (!modal?.data?.id || isProcessing) return;

    setIsProcessing(true);
    setTasks(prev => prev.filter(task => task.id !== modal.data.id));
    showToast("Task deleted successfully");
    closeModal();
    setIsProcessing(false);
  }, [modal?.data, closeModal, isProcessing]);

  const clearCompleted = useCallback(() => {
    if (isProcessing) return;
    setIsProcessing(true);
    setTasks(prev => prev.filter(t => !t.completed));
    showToast("Completed tasks cleared");
    closeModal();
    setIsProcessing(false);
  }, [closeModal, isProcessing]);

  const clearAll = useCallback(() => {
    if (isProcessing) return;
    setIsProcessing(true);
    setTasks([]);
    showToast("All tasks cleared");
    closeModal();
    setIsProcessing(false);
  }, [closeModal, isProcessing]);

  const showToast = useCallback((message) => {
    const id = genId();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const updateTask = useCallback((updatedTask) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
    closeModal();
    showToast("Task updated successfully!");
    setIsProcessing(false);
  }, [closeModal, isProcessing]);

  // Export/Import functions
  const exportData = useCallback(() => {
    const data = { tasks, meta, version: 2 };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `doit-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Data exported successfully!");
  }, [tasks, meta, showToast]);

  const importData = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.tasks && data.meta) {
          setTasks(data.tasks);
          setMeta(data.meta);
          showToast("Data imported successfully!");
        } else {
          showToast("Invalid data format");
        }
      } catch (error) {
        showToast("Error importing data");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, [showToast]);

  // Edit Modal Component
  const EditModal = useCallback(() => {
    const [text, setText] = useState(modal?.data?.text || '');
    const [priority, setPriority] = useState(modal?.data?.priority || 'medium');
    const [dueDate, setDueDate] = useState(modal?.data?.dueDate ? new Date(modal.data.dueDate) : null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!text.trim() || isProcessing) return;
      updateTask({
        ...modal.data,
        text: text.trim().slice(0, 500),
        priority,
        dueDate: dueDate ? dueDate.getTime() : null
      });
    };

    return (
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        transition={{ duration: 0.15 }}
        className={`${colors.card} rounded-xl border ${colors.border} shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto`}
        role="dialog"
        aria-modal="true"
      >
        <div className={`p-4 border-b ${colors.border} flex justify-between items-center`}>
          <h3 className={`text-lg font-semibold ${colors.text}`}>Edit Task</h3>
          <button
            onClick={closeModal}
            className={`p-2 rounded-lg ${colors.muted} hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors`}
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className={`block text-sm font-medium ${colors.text} mb-2`}>Task Description</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${colors.border} ${colors.input} focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none`}
              rows={3}
              maxLength={500}
              autoFocus
            />
            <div className={`text-xs ${colors.muted} mt-1`}>
              {text.length}/500 characters
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${colors.text} mb-2`}>Priority</label>
            <div className="flex gap-2 flex-wrap">
              {PRIORITY_OPTIONS.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPriority(option.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${option.color} ${priority === option.value
                    ? 'ring-2 ring-indigo-500 scale-105'
                    : 'opacity-70 hover:opacity-100'
                    }`}
                >
                  <FiStar size={12} className="inline mr-1" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <label className={`block text-sm font-medium ${colors.text} mb-2`}>Due Date</label>
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`w-full px-3 py-3 rounded-lg border ${colors.border} ${colors.input} text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors`}
            >
              <span className={dueDate ? colors.text : colors.muted}>
                {dueDate ? formatDateTime(dueDate.getTime()) : 'No due date set'}
              </span>
              <FiCalendar className={colors.muted} />
            </button>

            <AnimatePresence>
              {showDatePicker && (
                <div className="absolute top-full left-0 right-0 mt-2 z-10">
                  <CustomDatePicker
                    selectedDate={dueDate}
                    onDateSelect={(date) => {
                      setDueDate(date);
                      setShowDatePicker(false);
                    }}
                    onClose={() => setShowDatePicker(false)}
                    colors={colors}
                  />
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className={`px-4 py-2 rounded-lg ${colors.secondary} ${colors.text} hover:opacity-80 transition-opacity`}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg ${colors.primary} text-white hover:opacity-90 transition-opacity disabled:opacity-50`}
              disabled={isProcessing || !text.trim()}
            >
              {isProcessing ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    );
  }, [modal, colors, closeModal, updateTask, isProcessing]);

  // Delete Confirmation Modal
  const DeleteTaskModal = useCallback(() => {
    const task = modal?.data?.task;
    if (!task) return null;

    return (
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        transition={{ duration: 0.15 }}
        className={`${colors.card} rounded-xl border ${colors.border} shadow-2xl w-full max-w-md p-6`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <FiTrash2 className="text-red-600 dark:text-red-400" size={20} />
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${colors.text} mb-2`}>Delete Task</h3>
            <p className={`${colors.muted} mb-4`}>
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className={`p-3 rounded-lg bg-slate-50 dark:bg-slate-400 border ${colors.border} mb-4`}>
              <p className={`text-sm ${colors.text} font-medium`}>"{task.text}"</p>
              {task.dueDate && (
                <p className={`text-xs ${colors.muted} mt-1`}>
                  Due: {formatDateTime(task.dueDate)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={closeModal}
            className={`px-4 py-2 rounded-lg ${colors.secondary} ${colors.text} hover:opacity-80 transition-opacity`}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
            disabled={isProcessing}
          >
            {isProcessing ? 'Deleting...' : 'Delete Task'}
          </button>
        </div>
      </motion.div>
    );
  }, [modal, colors, closeModal, confirmDelete, isProcessing]);

  const ClearAllModal = useCallback(() => (
    <motion.div
      initial={{ scale: 0.95, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.95, y: 20 }}
      transition={{ duration: 0.15 }}
      className={`${colors.card} rounded-xl border ${colors.border} shadow-2xl w-full max-w-md p-6`}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
          <FiTrash2 className="text-red-600 dark:text-red-400" size={20} />
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${colors.text} mb-2`}>Clear All Tasks</h3>
          <p className={`${colors.muted} mb-4`}>
            Are you sure you want to delete all tasks? This action cannot be undone.
          </p>
          <p className={`text-sm ${colors.muted} italic`}>
            You'll lose all {tasks.length} tasks currently in your list.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={closeModal}
          className={`px-4 py-2 rounded-lg ${colors.secondary} ${colors.text} hover:opacity-80 transition-opacity`}
        >
          Cancel
        </button>
        <button
          onClick={clearAll}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
        >
          Clear All
        </button>
      </div>
    </motion.div>
  ), [colors, tasks.length, closeModal, clearAll]);

  const ClearCompletedModal = useCallback(() => {
    const completedCount = tasks.filter(t => t.completed).length;

    return (
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        transition={{ duration: 0.15 }}
        className={`${colors.card} rounded-xl border ${colors.border} shadow-2xl w-full max-w-md p-6`}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
            <FiRotateCcw className="text-orange-600 dark:text-orange-400" size={20} />
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${colors.text} mb-2`}>Clear Completed Tasks</h3>
            <p className={`${colors.muted} mb-4`}>
              Are you sure you want to delete all completed tasks? This action cannot be undone.
            </p>
            <p className={`text-sm ${colors.muted} italic`}>
              {completedCount > 0
                ? `You'll remove ${completedCount} completed task${completedCount === 1 ? '' : 's'}`
                : 'No completed tasks to remove'}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={closeModal}
            className={`px-4 py-2 rounded-lg ${colors.secondary} ${colors.text} hover:opacity-80 transition-opacity`}
          >
            Cancel
          </button>
          <button
            onClick={clearCompleted}
            className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors"
            disabled={completedCount === 0}
          >
            Clear Completed
          </button>
        </div>
      </motion.div>
    );
  }, [tasks, colors, closeModal, clearCompleted]);

  // Footer Modal Component
  const FooterModal = useCallback(() => {
    const modalContent = useMemo(() => {
      switch (modal?.type) {
        case 'privacy':
          return (
            <>
              <h3 className={`text-lg font-semibold ${colors.text} mb-4`}>Privacy Policy</h3>
              <div className={`text-sm ${colors.muted} space-y-3`}>
                <p><strong>Your privacy matters.</strong> DoIT is designed with privacy as a core principle:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>All data is stored locally in your browser</li>
                  <li>No tracking or analytics are used</li>
                  <li>No data is sent to any servers</li>
                  <li>Your tasks never leave your device</li>
                </ul>
                <p>You can export your data anytime. To remove all data, clear this app's storage.</p>
              </div>
            </>
          );
        case 'about':
          return (
            <>
              <h3 className={`text-lg font-semibold ${colors.text} mb-4`}>About DoIT</h3>
              <div className={`text-sm ${colors.muted} space-y-3`}>
                <p><strong>DoIT</strong> is a minimalist, privacy-focused task manager designed to keep you productive without distractions.</p>
                <p className="font-medium mt-3">Key Features:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Local storage (your data stays private)</li>
                  <li>Dark/light mode with system preference</li>
                  <li>Task priorities and due dates</li>
                  <li>Progress tracking and streaks</li>
                  <li>Responsive design for all devices</li>
                  <li>Keyboard-friendly interface</li>
                  <li>Smooth animations and transitions</li>
                  <li>PWA support for mobile installation</li>
                </ul>
                <p className="mt-3">Built with React and modern web technologies.</p>
              </div>
            </>
          );
        case 'version':
          return (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl ${colors.primary} flex items-center justify-center`}>
                  <FiCheckCircle className="text-white text-xl" />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${colors.text}`}>DoIT Task Manager</h3>
                  <p className={`text-sm ${colors.muted}`}>Version 2.0.0</p>
                </div>
              </div>
              <div className={`text-sm ${colors.text} space-y-2`}>
                <div className="flex justify-between">
                  <span>Build Date:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Tasks:</span>
                  <span>{tasks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Points Earned:</span>
                  <span>{meta.points || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Streak:</span>
                  <span>{meta.streak?.current || 0} days</span>
                </div>
              </div>
              <div className={`mt-4 pt-4 border-t ${colors.border} text-center`}>
                <p className={`text-xs ${colors.muted}`}>
                  Made with <FiHeart className="inline text-red-500 mx-1" /> by <a style={{ textDecoration: 'underline' }} href="https://sahilmaurya.vercel.app" target='_blank'>Sahil Maurya</a>
                </p>
              </div>
            </>
          );
        default:
          return null;
      }
    }, [modal?.type, colors, tasks, meta]);

    return (
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        transition={{ duration: 0.15 }}
        className={`${colors.card} rounded-xl border ${colors.border} shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto`}
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6">
          <div className="flex justify-end mb-4">
            <button
              onClick={closeModal}
              className={`p-2 rounded-lg ${colors.muted} hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors`}
            >
              <FiX size={20} />
            </button>
          </div>
          {modalContent}
          <div className="flex justify-end mt-6">
            <button
              onClick={closeModal}
              className={`px-4 py-2 rounded-lg ${colors.primary} text-white hover:opacity-90 transition-opacity`}
            >
              Got it
            </button>
          </div>
        </div>
      </motion.div>
    );
  }, [modal?.type, colors, tasks, meta, closeModal]);

  const renderModalContent = useCallback(() => {
    if (!modal) return null;

    switch (modal.type) {
      case 'editTask':
        return <EditModal />;
      case 'deleteTask':
        return <DeleteTaskModal />;
      case 'clearAll':
        return <ClearAllModal />;
      case 'clearCompleted':
        return <ClearCompletedModal />;
      case 'privacy':
      case 'about':
      case 'version':
        return <FooterModal />;
      default:
        return null;
    }
  }, [modal, EditModal, DeleteTaskModal, ClearAllModal, ClearCompletedModal, FooterModal]);

  return (
    <div className={`min-h-screen ${colors.background} transition-colors duration-300`}>
      {/* Loading Screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`fixed inset-0 ${colors.background} z-50 flex items-center justify-center`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" />
              <p className={`text-sm ${colors.muted}`}>Loading DoIT...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visit Modal - Only show on mobile and tablet */}
      <AnimatePresence>
        {shouldShowModal && !isLoading && (
          <div className="block lg:hidden">
            <ImageModalSlider onClose={closeVisitModal} colors={colors} />
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto p-4 md:p-6 pb-4 pt-4 relative">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-bold tracking-tight ${colors.text} mb-1`}>DoIT</h1>
            <p className={`${colors.muted} text-sm`}>{quote}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const newTheme = theme === 'light' ? 'dark' : 'light';
                setTheme(newTheme);
                setMeta(prev => ({ ...prev, theme: newTheme }));
              }}
              className={`p-3 rounded-xl ${colors.card} border ${colors.border} hover:scale-105 transition-all shadow-sm`}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <FiMoon className={colors.muted} size={20} />
              ) : (
                <FiSun className="text-amber-400" size={20} />
              )}
            </button>

            <button
              onClick={() => openModal('clearCompleted')}
              className={`px-4 py-3 rounded-xl ${colors.card} border ${colors.border} text-sm font-medium hover:scale-105 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${colors.text}`}
              disabled={isProcessing || !tasks.some(t => t.completed)}
            >
              <div className="flex items-center gap-2">
                <FiRotateCcw size={16} />
                <span className="hidden sm:inline">Clear Completed</span>
              </div>
            </button>
            <button
              onClick={() => openModal('clearAll')}
              className={`px-4 py-3 rounded-xl ${colors.card} border ${colors.border} text-sm font-medium hover:scale-105 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${colors.text}`}
              disabled={isProcessing || tasks.length === 0}
            >
              <div className="flex items-center gap-2">
                <FiTrash2 size={16} />
                <span className="hidden sm:inline">Clear All</span>
              </div>
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Tasks', value: stats.total, icon: FiCalendar },
            { label: 'Completed', value: stats.completed, icon: FiCheckCircle },
            { label: 'Progress', value: `${stats.completionRate}%`, icon: FiZap }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.1 } }}
              className={`${colors.card} p-4 rounded-xl border ${colors.border} shadow-sm hover:shadow-md transition-all`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-xs font-medium ${colors.muted} mb-1`}>{stat.label}</div>
                  <div className={`text-2xl font-bold ${colors.text}`}>{stat.value}</div>
                </div>
                <div className={`p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30`}>
                  <stat.icon className="text-indigo-600 dark:text-indigo-400" size={20} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Task Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
          className="mb-8"
        >
          <TaskInput
            addTask={addTask}
            inputRef={inputRef}
            isProcessing={isProcessing}
            selectedDate={selectedDate}
            setShowDatePicker={setShowDatePicker}
            showDatePicker={showDatePicker}
            setSelectedDate={setSelectedDate}
            colors={colors}
          />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
          className="flex gap-2 mb-6 overflow-x-auto pb-2"
        >
          {['all', 'active', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap border transition-all ${filter === f
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                : `${colors.card} ${colors.text} ${colors.border} hover:scale-105 hover:shadow-sm`
                }`}
              disabled={isProcessing}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Task List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
          className="space-y-3 mb-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredTasks.length > 0 ? (
              <ul className="space-y-3 group">
                {filteredTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
                    className="group/item"
                  >
                    <TaskItem
                      task={task}
                      onToggleComplete={toggleComplete}
                      onDelete={deleteTask}
                      onEdit={(task) => openModal('editTask', task)}
                      isProcessing={isProcessing}
                      colors={colors}
                    />
                  </motion.div>
                ))}
              </ul>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-12 text-center ${colors.card} rounded-xl border ${colors.border} shadow-sm`}
              >
                <div className="mb-4">
                  <FiCheckCircle className={`mx-auto ${colors.muted} mb-3`} size={48} />
                  <h3 className={`text-lg font-medium ${colors.text} mb-2`}>
                    {filter === 'completed' ? 'No completed tasks yet' : 'Ready to be productive?'}
                  </h3>
                  <p className={`${colors.muted}`}>
                    {filter === 'completed'
                      ? 'Complete some tasks to see them here!'
                      : 'Add your first task to get started on your journey!'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.6 } }}
          className={`${colors.card} rounded-xl border ${colors.border} p-6 shadow-sm mb-8`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${colors.text}`}>Your Progress</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FiZap className="text-amber-500" size={16} />
                <span className={`text-sm font-medium ${colors.text}`}>
                  {meta.points || 0} points
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FiStar className="text-indigo-600" size={16} />
                <span className={`text-sm font-medium ${colors.text}`}>
                  {meta.streak?.current || 0} day streak
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {stats.total > 0 && (
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2">
              <motion.div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${stats.completionRate}%` }}
                transition={{ duration: 0.5, delay: 0.7 }}
              />
            </div>
          )}

          <p className={`text-sm ${colors.muted}`}>
            {stats.total === 0
              ? "Add your first task to start tracking progress!"
              : `${stats.completed} of ${stats.total} tasks completed (${stats.completionRate}%)`
            }
          </p>
        </motion.div>

        {/* Export/Import Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.7 } }}
          className="flex justify-center gap-3 mb-8"
        >
          <button
            onClick={exportData}
            className={`px-4 py-2 rounded-lg ${colors.secondary} ${colors.text} hover:opacity-80 transition-opacity flex items-center gap-2 text-sm`}
            disabled={isProcessing}
          >
            <FiDownload size={16} />
            <span>Export Data</span>
          </button>

          <label className={`px-4 py-2 rounded-lg ${colors.secondary} ${colors.text} hover:opacity-80 transition-opacity flex items-center gap-2 text-sm cursor-pointer`}>
            <FiUpload size={16} />
            <span>Import Data</span>
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
              disabled={isProcessing}
            />
          </label>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.8 } }}
          className={`text-center py-6 ${colors.footer} backdrop-blur-sm rounded-xl border ${colors.border} shadow-sm`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => openModal('about')}
                className={`flex items-center gap-2 text-sm ${colors.muted} hover:${colors.text} transition-colors`}
              >
                <FiInfo size={16} />
                <span>About</span>
              </button>
              <button
                onClick={() => openModal('privacy')}
                className={`flex items-center gap-2 text-sm ${colors.muted} hover:${colors.text} transition-colors`}
              >
                <FiShield size={16} />
                <span>Privacy</span>
              </button>
              <button
                onClick={() => openModal('version')}
                className={`flex items-center gap-2 text-sm ${colors.muted} hover:${colors.text} transition-colors`}
              >
                <FiCheckCircle size={16} />
                <span>v2.0.0</span>
              </button>
            </div>
            <span className="sm:-ml-10"><p className={`text-xs ${colors.muted}`}>
              Made with <FiHeart className="inline text-red-500 mx-1" /> by <a style={{ textDecoration: 'underline' }} href="https://sahilmaurya.vercel.app" target='_blank'>Sahil Maurya</a>
            </p></span>

            <div className="flex items-center gap-4">
              <a
                href="https://github.com/makeitwithsahil/DoIT"
                target="_blank"
                rel="noopener noreferrer"
                className={`${colors.muted} hover:${colors.text} transition-colors`}
                aria-label="GitHub"
              >
                <FiGithub size={20} />
              </a>
              <a
                href="https://x.com/makeitwithsahil"
                target="_blank"
                rel="noopener noreferrer"
                className={`${colors.muted} hover:${colors.text} transition-colors`}
                aria-label="Twitter"
              >
                <FiTwitter size={20} />
              </a>
            </div>
          </div>
        </motion.footer>
      </div>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt colors={colors} />

      {/* Modals - FIXED to prevent double rendering */}
      <AnimatePresence>
        {modal && (
          <ModalBackdrop onClose={closeModal}>
            {renderModalContent()}
          </ModalBackdrop>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="fixed bottom-4 right-4 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg z-50 font-medium text-sm max-w-sm"
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}