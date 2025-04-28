import React from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import { cardVariants } from '../constants/statsConstants';

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