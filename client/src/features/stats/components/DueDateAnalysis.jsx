// src/features/stats/components/DueDateAnalysis.jsx
// Displays a breakdown of tasks by their due date categories

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";
import { cardVariants } from '../constants/statsConstants';

const MotionCard = motion.create(Card);

const DueDateAnalysis = ({ dueDateAnalysis, index = 8 }) => {
  return (
    <MotionCard
      variants={cardVariants}
      custom={index}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="overflow-visible bg-blue-100/30 dark:bg-blue-900/20 backdrop-blur-xl border border-border/50 shadow-sm mb-2"
    >
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-base font-medium">
          Due Date Analysis
        </CardTitle>
        <CardDescription className="text-xs">
          Breakdown of pending tasks by deadline
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {dueDateAnalysis.map((category) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay:
                  0.1 + dueDateAnalysis.indexOf(category) * 0.05,
              }}
              className="flex flex-col items-center p-2 rounded-lg bg-blue-100/20 dark:bg-blue-900/10 border border-border/50 text-center space-y-1"
            >
              <div className={`p-1.5 rounded-full ${category.iconClass}`}>
                <Clock className={`h-3.5 w-3.5 ${category.textClass}`} />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {category.name}
              </span>
              <span className={`text-xl font-bold ${category.textClass}`}>
                {category.count}
              </span>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </MotionCard>
  );
};

export default DueDateAnalysis; 