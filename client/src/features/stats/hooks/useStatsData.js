// src/features/stats/hooks/useStatsData.js
// Hook that calculates and provides various task statistics

import { useMemo } from 'react';
import { 
  priorityColors, 
  defaultChartColor, 
  projectChartColors 
} from '../constants/statsConstants';

export const useStatsData = (tasks = []) => {
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
        color: "rgb(239, 68, 68)",
        iconClass: "bg-red-500/10",
        textClass: "text-red-500",
      },
      {
        name: "Due Today",
        count: dueTodayTasks,
        color: "rgb(249, 115, 22)",
        iconClass: "bg-orange-500/10",
        textClass: "text-orange-500",
      },
      {
        name: "Due Tomorrow",
        count: dueTomorrowTasks,
        color: "rgb(234, 179, 8)",
        iconClass: "bg-yellow-500/10",
        textClass: "text-yellow-500",
      },
      {
        name: "Upcoming",
        count: upcomingTasks,
        color: "rgb(59, 130, 246)",
        iconClass: "bg-blue-500/10",
        textClass: "text-blue-500",
      },
      {
        name: "No Due Date",
        count: noDueDateTasks,
        color: "rgb(107, 114, 128)",
        iconClass: "bg-gray-500/10",
        textClass: "text-gray-500",
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
    };
  }, [tasks]);

  // Chart configurations
  const priorityChartConfig = useMemo(() => {
    const config = { count: { label: "Tasks" } };
    statsData.priorityDistributionChartData.forEach((item) => {
      config[item.priority] = { label: item.priority, color: item.fill };
    });
    return config;
  }, [statsData.priorityDistributionChartData]);

  const projectChartConfig = useMemo(() => {
    const config = { tasks: { label: "No. of Tasks" } };
    statsData.tasksPerProjectChartData.forEach((item) => {
      config[item.name] = { label: item.name, color: item.fill };
    });
    return config;
  }, [statsData.tasksPerProjectChartData]);

  const totalTasksByPriority = useMemo(() => {
    return statsData.priorityDistributionChartData.reduce(
      (acc, curr) => acc + curr.count,
      0
    );
  }, [statsData.priorityDistributionChartData]);

  return {
    statsData,
    priorityChartConfig,
    projectChartConfig,
    totalTasksByPriority
  };
}; 