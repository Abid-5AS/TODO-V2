import {
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Star,
  CheckCircle,
  X,
  Calendar,
  Clock,
  BarChart2,
  Flame,
  Award,
  Percent,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Heart,
  Filter
} from 'lucide-react';

// Icons for the five daily prayers
export const PRAYER_ICONS = {
  Fajr: Sunrise,
  Dhuhr: Sun,
  Asr: Sun,
  Maghrib: Sunset,
  Isha: Moon,
  Default: Star
};

// Icons used in statistics and analytics
export const STATS_ICONS = {
  CheckCircle,
  X,
  Calendar,
  Clock,
  BarChart: BarChart2,
  Flame,
  Award,
  Percent,
  Help: HelpCircle,
  Filter
};

// Icons used in UI navigation and controls
export const UI_ICONS = {
  ChevronLeft,
  ChevronRight,
  Loading: Loader2,
  Heart
};

// Default export for easier importing
export default {
  ...PRAYER_ICONS,
  ...STATS_ICONS,
  ...UI_ICONS
}; 