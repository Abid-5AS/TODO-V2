// src/features/stats/components/KeyStatsCards.jsx
// Displays a grid of key statistic cards for task overview

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  BarChart2,
  CheckCircle2,
  Clock,
  PieChart as PieChartIcon,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { cardVariants } from '../constants/statsConstants';

const MotionCard = motion.create(Card);

const KeyStatsCards = ({ statsData }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
      {/* Total Tasks */}
      <MotionCard
        variants={cardVariants}
        custom={0}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className="overflow-visible bg-blue-100/30 dark:bg-blue-900/20 backdrop-blur-xl border border-border/50 shadow-sm h-full flex flex-col"
      >
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
            <span>Total Tasks</span>
            <BarChart2 className="h-3 w-3 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-3 px-3 flex-grow flex items-end">
          <p className="text-2xl font-bold">{statsData.total}</p>
        </CardContent>
      </MotionCard>
      {/* Completed */}
      <MotionCard
        variants={cardVariants}
        custom={1}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className="overflow-visible bg-blue-100/30 dark:bg-blue-900/20 backdrop-blur-xl border border-border/50 shadow-sm h-full flex flex-col"
      >
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
            <span>Completed</span>
            <CheckCircle2 className="h-3 w-3 text-green-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-3 px-3 flex-grow flex items-end">
          <p className="text-2xl font-bold">{statsData.completed}</p>
        </CardContent>
      </MotionCard>
      {/* Pending */}
      <MotionCard
        variants={cardVariants}
        custom={2}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className="overflow-visible bg-blue-100/30 dark:bg-blue-900/20 backdrop-blur-xl border border-border/50 shadow-sm h-full flex flex-col"
      >
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
            <span>Pending</span>
            <Clock className="h-3 w-3 text-yellow-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-3 px-3 flex-grow flex items-end">
          <p className="text-2xl font-bold">{statsData.pending}</p>
        </CardContent>
      </MotionCard>
      {/* Completion Rate */}
      <MotionCard
        variants={cardVariants}
        custom={3}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className="overflow-visible bg-blue-100/30 dark:bg-blue-900/20 backdrop-blur-xl border border-border/50 shadow-sm h-full flex flex-col"
      >
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
            <span>Completion Rate</span>
            <PieChartIcon className="h-3 w-3 text-purple-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-3 px-3 flex-grow flex items-end">
          <p className="text-2xl font-bold">{statsData.completionRate}%</p>
        </CardContent>
      </MotionCard>
      {/* Busiest Project */}
      <MotionCard
        variants={cardVariants}
        custom={4}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className="overflow-visible bg-blue-100/30 dark:bg-blue-900/20 backdrop-blur-xl border border-border/50 shadow-sm h-full flex flex-col"
      >
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
            <span>Busiest Project</span>
            <TrendingUp className="h-3 w-3 text-blue-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-3 px-3 flex-grow flex items-end">
          <p
            className="text-xl font-bold truncate"
            title={statsData.mostActiveProject}
          >
            {statsData.mostActiveProject}
          </p>
        </CardContent>
      </MotionCard>
      {/* Status Breakdown */}
      <MotionCard
        variants={cardVariants}
        custom={5}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className="overflow-visible bg-blue-100/30 dark:bg-blue-900/20 backdrop-blur-xl border border-border/50 shadow-sm h-full flex flex-col"
      >
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
            <span>Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-3 px-3 flex-grow flex flex-col justify-end">
          <div className="flex w-full h-2 rounded-full overflow-hidden bg-muted mb-1">
            <div
              className="bg-green-500"
              style={{ width: `${statsData.completionRate}%` }}
            ></div>
            <div
              className="bg-blue-500"
              style={{
                width: `${
                  statsData.total > 0
                    ? (statsData.doing / statsData.total) * 100
                    : 0
                }%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{statsData.completed} Done</span>
            <span>{statsData.doing} Doing</span>
            <span>{statsData.todo} Todo</span>
          </div>
        </CardContent>
      </MotionCard>
    </div>
  );
};

export default KeyStatsCards; 