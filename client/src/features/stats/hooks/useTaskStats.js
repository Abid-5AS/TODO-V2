// src/features/stats/hooks/useTaskStats.js
// Custom hook for calculating task statistics

import { useMemo } from 'react';

// Colors for priority chart
export const priorityColors = {
  High: "#e11d48", // Red
  Medium: "#f59e0b", // Amber
  Low: "#3b82f6", // Blue
};

export const defaultChartColor = "#8b5cf6"; // Purple - Default color

// Colors for project chart (generate dynamically later if needed)
export const projectChartColors = [
  "#e11d48", // Red
  "#f59e0b", // Amber
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#ec4899", // Pink
];

export const useTaskStats = (tasks = []) => {
  const statsData = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return {
        total: 0,
        completed: 0,
        pending: 0,
        doing: 0,
        todo: 0,
        completionRate: 0,
        mostActiveProject: "None",
        priorityDistributionChartData: [],
        tasksPerProjectChartData: [],
        dueDateAnalysis: [],
        averageCompletionTime: null, // Placeholder
      };
    }
    
    const total = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "completed");
    const doingTasks = tasks.filter((t) => t.status === "doing");
    const todoTasks = tasks.filter((t) => t.status === "todo");
    const completed = completedTasks.length;
    const doing = doingTasks.length;
    const todo = todoTasks.length;
    const pending = doing + todo;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    // Calculate priority distribution
    const priorityCounts = tasks.reduce((acc, task) => {
      const priority = task.priority || "Medium";
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {});

    const priorityDistributionChartData = Object.entries(priorityCounts).map(
      ([name, value]) => ({
        priority: name,
        count: value,
        fill: priorityColors[name] || defaultChartColor,
      })
    );

    // Calculate project distribution
    const projectCounts = tasks.reduce((acc, task) => {
      const projectName = task.project || "Inbox";
      acc[projectName] = (acc[projectName] || 0) + 1;
      return acc;
    }, {});

    const tasksPerProjectChartData = Object.entries(projectCounts)
      .map(([name, taskCount], index) => ({
        name,
        tasks: taskCount,
        fill: projectChartColors[index % projectChartColors.length], // Cycle through colors
      }))
      .sort((a, b) => b.tasks - a.tasks); // Sort for display

    const mostActiveProject =
      tasksPerProjectChartData.length > 0
        ? tasksPerProjectChartData[0].name
        : "None";

    // Due Date Analysis
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(tomorrow.getDate() + 1);

    const overdueTasks = tasks.filter(
      (t) =>
        t.status !== "completed" && t.dueDate && new Date(t.dueDate) < today
    ).length;
    const dueTodayTasks = tasks.filter(
      (t) =>
        t.status !== "completed" &&
        t.dueDate &&
        new Date(t.dueDate) >= today &&
        new Date(t.dueDate) < tomorrow
    ).length;
    const dueTomorrowTasks = tasks.filter(
      (t) =>
        t.status !== "completed" &&
        t.dueDate &&
        new Date(t.dueDate) >= tomorrow &&
        new Date(t.dueDate) < dayAfterTomorrow
    ).length;
    const upcomingTasks = tasks.filter(
      (t) =>
        t.status !== "completed" &&
        t.dueDate &&
        new Date(t.dueDate) >= dayAfterTomorrow
    ).length;
    const noDueDateTasks = tasks.filter(
      (t) => t.status !== "completed" && !t.dueDate
    ).length;

    const dueDateAnalysis = [
      {
        name: "Overdue",
        count: overdueTasks,
        color: "#ef4444", // Red
      },
      {
        name: "Today",
        count: dueTodayTasks,
        color: "#f97316", // Orange
      },
      {
        name: "Tomorrow",
        count: dueTomorrowTasks,
        color: "#f59e0b", // Amber
      },
      {
        name: "Upcoming",
        count: upcomingTasks,
        color: "#3b82f6", // Blue
      },
      {
        name: "No Due Date",
        count: noDueDateTasks,
        color: "#8b5cf6", // Purple
      },
    ];

    return {
      total,
      completed,
      pending,
      doing,
      todo,
      completionRate,
      mostActiveProject,
      priorityDistributionChartData,
      tasksPerProjectChartData,
      dueDateAnalysis,
      averageCompletionTime: null, // Placeholder for future implementation
    };
  }, [tasks]);

  return statsData;
}; 