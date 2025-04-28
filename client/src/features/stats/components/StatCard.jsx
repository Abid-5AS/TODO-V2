import React from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";

// Animation variants for cards
export const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
      delay: i * 0.05, // Stagger
    },
  }),
  hover: {
    scale: 1.02,
    y: -2,
    boxShadow:
      "0 10px 20px -5px rgba(0, 0, 0, 0.1), 0 5px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: { type: "spring", stiffness: 350, damping: 15 },
  },
};

// Changed from motion(Card) to motion.create(Card) to fix deprecation warning
const MotionCard = motion.create(Card);

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  color = 'text-primary', 
  bgColor = 'bg-primary/5',
  index = 0,
  loading = false
}) => {
  return (
    <MotionCard
      className="w-full overflow-hidden"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      custom={index}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          {Icon && (
            <div className={`p-2 rounded-full ${bgColor}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
          )}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
        ) : (
          <div className="text-3xl font-bold">{value}</div>
        )}
      </CardContent>
    </MotionCard>
  );
};

export default StatCard; 