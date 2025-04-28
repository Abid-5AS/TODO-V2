// src/features/stats/components/ProjectBarChart.jsx
// Displays a bar chart showing task distribution by project

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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  Tooltip as RechartsTooltip,
} from "recharts";
import { ChartContainer } from "../../../components/ui/chart";
import { motion } from "framer-motion";
import { cardVariants } from '../constants/statsConstants';

const MotionCard = motion.create(Card);

const ProjectBarChart = ({ 
  data, 
  projectChartConfig, 
  index = 7 
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
          Tasks per Project
        </CardTitle>
        <CardDescription className="text-xs">
          Top projects by task count
        </CardDescription>
      </CardHeader>
      <CardContent className="px-1 py-0">
        <ChartContainer
          className="h-[300px] w-full"
          config={projectChartConfig}
        >
          <BarChart
            data={data}
            layout="vertical"
            barCategoryGap={8}
            barGap={2}
            margin={{ top: 5, right: 25, left: 30, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={true}
              vertical={false}
              opacity={0.3}
            />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              width={80}
              tick={{ fontSize: 12 }}
            />
            <RechartsTooltip
              cursor={{ fill: "var(--muted)", opacity: 0.2 }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-popover border border-border text-popover-foreground rounded-md shadow-md p-2 text-xs">
                      <p className="font-medium">
                        {payload[0].payload.name}
                      </p>
                      <p>{payload[0].value} tasks</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="tasks" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="pt-0 pb-2 px-4">
        <div className="text-xs text-muted-foreground">
          Showing top {data.length} projects.
        </div>
      </CardFooter>
    </MotionCard>
  );
};

export default ProjectBarChart; 