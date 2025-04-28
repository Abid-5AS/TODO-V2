// src/features/stats/components/PriorityPieChart.jsx
// Displays a pie chart showing task distribution by priority

import React from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../components/ui/chart";
import { motion } from "framer-motion";
import { cardVariants } from '../constants/statsConstants';

const MotionCard = motion.create(Card);

const PriorityPieChart = ({ 
  data, 
  totalTasksByPriority, 
  priorityChartConfig, 
  totalTasks,
  index = 6 
}) => {
  return (
    <MotionCard
      className="overflow-visible bg-blue-100/30 dark:bg-blue-900/20 backdrop-blur-xl border border-border/50 shadow-sm h-auto"
      variants={cardVariants}
      custom={index}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-base font-medium">
          Tasks by Priority
        </CardTitle>
        <CardDescription className="text-xs">
          Distribution across priorities
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 py-0">
        <ChartContainer
          className="h-[300px] w-full"
          config={priorityChartConfig}
        >
          <RechartsPieChart
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <Pie
              data={data}
              dataKey="count"
              nameKey="priority"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={3}
              isAnimationActive={true}
              label={({ priority, count }) =>
                `${priority}: ${count} (${Math.round(
                  (count / totalTasksByPriority) * 100
                )}%)`
              }
              labelLine={false}
            >
              {data.map(
                (entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                )
              )}
              {/* Center text showing total tasks */}
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-lg font-bold text-foreground"
              >
                {totalTasks}
                <tspan
                  x="50%"
                  y="58%"
                  className="text-xs text-muted-foreground"
                >
                  Tasks
                </tspan>
              </text>
            </Pie>
            <ChartTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <ChartTooltipContent
                      className="text-xs p-2"
                      payload={payload}
                      active={active}
                      nameKey="priority"
                      labelKey="count"
                      formatter={(value, name, entry) => (
                        <div className="flex justify-between items-center w-full">
                          <span>{name}</span>
                          <span className="font-medium">
                            {value} tasks (
                            {Math.round(
                              (value / totalTasksByPriority) * 100
                            )}
                            %)
                          </span>
                        </div>
                      )}
                    />
                  );
                }
                return null;
              }}
            />
          </RechartsPieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="pt-0 pb-2 px-4">
        <div className="text-xs text-muted-foreground">
          Priority breakdown for all tasks.
        </div>
      </CardFooter>
    </MotionCard>
  );
};

export default PriorityPieChart; 