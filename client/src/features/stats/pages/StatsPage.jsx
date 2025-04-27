// src/features/stats/pages/StatsPage.jsx
// Displays various statistics related to tasks.

import React, { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useTitle } from "../../../hooks/useTitle"; // Corrected path
import { useTasks } from "../../tasks/hooks/useTasks"; // Corrected path
import {
  TrendingUp,
  PieChart as PieChartIcon,
  Clock,
  BarChart2,
  CheckCircle2, // Added Check icon
  AlertCircle, // Added Alert icon
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  Label,
} from "recharts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card"; // Corrected path
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../components/ui/chart"; // Corrected path
import { Skeleton } from "../../../components/ui/skeleton"; // Corrected path
import { motion } from "framer-motion";

const MotionCard = motion(Card);

// Animation variants for statistics cards
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
      delay: i * 0.05, // Faster stagger
    },
  }),
  hover: {
    scale: 1.02,
    y: -2,
    boxShadow:
      "0 10px 20px -5px rgba(0, 0, 0, 0.1), 0 5px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: { type: "spring", stiffness: 350, damping: 15 },
  },
};

// Colors for priority chart
const priorityColors = {
  High: "#e11d48", // Red
  Medium: "#f59e0b", // Amber
  Low: "#3b82f6", // Blue
};
const defaultChartColor = "#8b5cf6"; // Purple - Default color

// Colors for project chart (generate dynamically later if needed)
const projectChartColors = [
  "#e11d48", // Red
  "#f59e0b", // Amber
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#ec4899", // Pink
];

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

  // Loading and Error states
  if (loading) {
    return (
      <div className="py-6 md:py-8 px-4 space-y-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
          Task Statistics
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 md:py-8 px-4 text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Task Statistics</h1>
        <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-300">
          <AlertCircle className="inline-block h-5 w-5 mr-2" />
          Error loading statistics: {error}
        </div>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="py-6 md:py-8 px-4 text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Task Statistics</h1>
        <div className="p-6 bg-muted/30 border rounded-lg text-muted-foreground">
          No tasks found. Add some tasks to generate statistics.
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 px-2 sm:py-6 sm:px-4 glass-morphism rounded-xl shadow-md mx-2 sm:mx-4 my-2">
      <motion.h1
        className="text-2xl md:text-3xl font-bold mb-4 text-center bg-gradient-to-r from-primary/90 via-purple-500/90 to-pink-500/90 bg-clip-text text-transparent animate-gradient-x"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        Task Statistics
      </motion.h1>

      {/* Key Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        {/* Total Tasks */}
        <MotionCard
          variants={cardVariants}
          custom={0}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          className="overflow-visible bg-card/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-border/50 shadow-sm h-full flex flex-col"
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
          className="overflow-visible bg-card/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-border/50 shadow-sm h-full flex flex-col"
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
          className="overflow-visible bg-card/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-border/50 shadow-sm h-full flex flex-col"
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
          className="overflow-visible bg-card/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-border/50 shadow-sm h-full flex flex-col"
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
          className="overflow-visible bg-card/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-border/50 shadow-sm h-full flex flex-col"
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
          className="overflow-visible bg-card/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-border/50 shadow-sm h-full flex flex-col"
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-auto mb-4">
        {/* Priority Pie Chart */}
        <MotionCard
          className="overflow-visible bg-card/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-border/50 shadow-sm h-auto"
          variants={cardVariants}
          custom={6}
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
              className="h-[250px] w-full"
              config={priorityChartConfig}
            >
              <RechartsPieChart
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              >
                <Pie
                  data={statsData.priorityDistributionChartData}
                  dataKey="count"
                  nameKey="priority"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={3}
                  isAnimationActive={true}
                  label={({ priority, count }) =>
                    `${priority}: ${count} (${Math.round(
                      (count / totalTasksByPriority) * 100
                    )}%)`
                  }
                  labelLine={false}
                >
                  {statsData.priorityDistributionChartData.map(
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
                    {statsData.total}
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
                      const data = payload[0].payload;
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

        {/* Project Bar Chart */}
        <MotionCard
          className="overflow-visible bg-card/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-border/50 shadow-sm h-auto"
          variants={cardVariants}
          custom={7}
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
              className="h-[250px] w-full"
              config={projectChartConfig}
            >
              <BarChart
                data={statsData.tasksPerProjectChartData}
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
                  {statsData.tasksPerProjectChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="pt-0 pb-2 px-4">
            <div className="text-xs text-muted-foreground">
              Showing top {statsData.tasksPerProjectChartData.length} projects.
            </div>
          </CardFooter>
        </MotionCard>
      </div>

      {/* Due Date Analysis Section */}
      <MotionCard
        variants={cardVariants}
        custom={8}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className="overflow-visible bg-card/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-border/50 shadow-sm mb-2"
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
            {statsData.dueDateAnalysis.map((category) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay:
                    0.1 + statsData.dueDateAnalysis.indexOf(category) * 0.05,
                }}
                className="flex flex-col items-center p-2 rounded-lg bg-muted/30 border border-border/50 text-center space-y-1"
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
    </div>
  );
};

export default StatsPage;
