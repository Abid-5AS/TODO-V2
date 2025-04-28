// src/features/stats/pages/StatsPage.jsx
// Displays various statistics related to tasks.

import React from "react";
import { useOutletContext } from "react-router-dom";
import { useTitle } from "../../../hooks/useTitle";
import { useTasks } from "../../tasks/hooks/useTasks";
import { useStatsData } from "../hooks/useStatsData";
import {
  KeyStatsCards,
  PriorityPieChart,
  ProjectBarChart,
  DueDateAnalysis,
  StatsLoading,
  StatsError,
  StatsEmpty,
} from "../components";

const StatsPage = () => {
  useTitle("Stats - Task Tree");
  const { allProjects = [] } = useOutletContext() || {};
  // Fetch *all* tasks for statistics purposes, regardless of current view
  const { tasks, loading, error } = useTasks("all", allProjects);

  console.log(
    `[StatsPage] Rendering - Loading: ${loading}, Error: ${!!error}, Tasks Count: ${
      tasks?.length ?? "N/A"
    }`
  );

  // Use the hook to calculate all stats data
  const { statsData, priorityChartConfig, projectChartConfig, totalTasksByPriority } = useStatsData(tasks);

  // Loading state
  if (loading) {
    return <StatsLoading />;
  }

  // Error state
  if (error) {
    return <StatsError error={error} />;
  }

  // Empty state
  if (!tasks || tasks.length === 0) {
    return <StatsEmpty />;
  }

  return (
    <div className="py-6 md:py-8 px-4 space-y-8 relative bg-theme">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/60">
        Task Statistics
      </h1>

      {/* Key Stats Cards */}
      <KeyStatsCards statsData={statsData} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-auto mb-4">
        {/* Priority Pie Chart */}
        <PriorityPieChart 
          data={statsData.priorityDistributionChartData}
          totalTasksByPriority={totalTasksByPriority}
          priorityChartConfig={priorityChartConfig}
          totalTasks={statsData.total}
        />

        {/* Project Bar Chart */}
        <ProjectBarChart 
          data={statsData.tasksPerProjectChartData}
          projectChartConfig={projectChartConfig}
        />
      </div>

      {/* Due Date Analysis Section */}
      <DueDateAnalysis 
        dueDateAnalysis={statsData.dueDateAnalysis}
      />
    </div>
  );
};

export default StatsPage; 