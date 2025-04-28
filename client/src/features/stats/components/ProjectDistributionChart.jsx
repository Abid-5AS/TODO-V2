import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { motion } from 'framer-motion';
import { cardVariants } from './StatCard';

const MotionCard = motion.create(Card);

// A component for custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 shadow-md rounded-md border">
        <p className="font-semibold">{label}</p>
        <p className="text-sm opacity-80">{payload[0].value} tasks</p>
      </div>
    );
  }
  return null;
};

const ProjectDistributionChart = ({ data = [], loading = false, index = 0 }) => {
  // Slice to show top 5 projects only for better visualization
  const displayedData = data.slice(0, 5);

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
        <CardTitle className="text-lg">Tasks by Project</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="w-full h-[220px] bg-gray-200 animate-pulse rounded" />
        ) : data.length === 0 ? (
          <div className="w-full h-[220px] flex items-center justify-center">
            <p className="text-gray-500">No tasks available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={displayedData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                // Handle long project names
                tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 9)}...` : value}
              />
              <YAxis allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="tasks" fill="#8884d8" radius={[4, 4, 0, 0]}>
                {displayedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </MotionCard>
  );
};

export default ProjectDistributionChart; 