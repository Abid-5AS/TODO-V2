import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { motion } from 'framer-motion';
import { cardVariants } from './StatCard';

// Use motion.create instead of motion
const MotionCard = motion.create(Card);

// A component for custom tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 shadow-md rounded-md border">
        <p className="font-semibold">{data.name}: {data.count} tasks</p>
        <p className="text-sm opacity-80">
          {Math.round((data.count / data.total) * 100)}% of pending tasks
        </p>
      </div>
    );
  }
  return null;
};

const DueDateDistributionChart = ({ data = [], loading = false, index = 0 }) => {
  // Remove items with zero count for cleaner chart
  const filteredData = data.filter(item => item.count > 0);
  
  // Calculate total for percentages
  const total = filteredData.reduce((sum, item) => sum + item.count, 0);
  
  // Add total to each item for tooltip percentage calculation
  const dataWithTotal = filteredData.map(item => ({
    ...item,
    total
  }));

  return (
    <MotionCard
      className="w-full h-[300px] overflow-hidden"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      custom={index}
    >
      <CardHeader>
        <CardTitle className="text-lg">Tasks by Due Date</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="w-full h-[220px] bg-gray-200 animate-pulse rounded" />
        ) : filteredData.length === 0 ? (
          <div className="w-full h-[220px] flex items-center justify-center">
            <p className="text-gray-500">No tasks with due dates</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={dataWithTotal}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={50}
                label={({ name, count }) => `${name}: ${count}`}
              >
                {dataWithTotal.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </MotionCard>
  );
};

export default DueDateDistributionChart; 