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
  AlertCircle // Added Alert icon
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
    boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.1), 0 5px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: { type: "spring", stiffness: 350, damping: 15 },
  },
};

// Colors for priority chart
const priorityColors = {
  High: "#e11d48",    // Red
  Medium: "#f59e0b",  // Amber
  Low: "#3b82f6",     // Blue
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
    `[StatsPage] Rendering - Loading: ${loading}, Error: ${!!error}, Tasks Count: ${tasks?.length ?? "N/A"}`
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
    const completedTasks = tasks.filter((t) => t.status === 'completed');
    const doingTasks = tasks.filter((t) => t.status === 'doing');
    const todoTasks = tasks.filter((t) => t.status === 'todo');
    const completed = completedTasks.length;
    const doing = doingTasks.length;
    const todo = todoTasks.length;
    const pending = doing + todo;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const priorityCounts = tasks.reduce((acc, task) => {
      const priority = task.priority || "Medium";
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {});

    const priorityDistributionChartData = Object.entries(priorityCounts).map(([name, value]) => ({
      priority: name,
      count: value,
      fill: priorityColors[name] || defaultChartColor,
    }));

    const projectCounts = tasks.reduce((acc, task) => {
      const projectName = task.project || "Inbox";
      acc[projectName] = (acc[projectName] || 0) + 1;
      return acc;
    }, {});

    const tasksPerProjectChartData = Object.entries(projectCounts)
        .map(([name, taskCount], index) => ({ 
            name,
            tasks: taskCount,
            fill: projectChartColors[index % projectChartColors.length] // Cycle through colors
        }))
        .sort((a, b) => b.tasks - a.tasks); // Sort for display

    const mostActiveProject = tasksPerProjectChartData.length > 0 ? tasksPerProjectChartData[0].name : "None";

    // Due Date Analysis
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const dayAfterTomorrow = new Date(tomorrow); dayAfterTomorrow.setDate(tomorrow.getDate() + 1);

    const overdueTasks = tasks.filter(t => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < today).length;
    const dueTodayTasks = tasks.filter(t => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) >= today && new Date(t.dueDate) < tomorrow).length;
    const dueTomorrowTasks = tasks.filter(t => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) >= tomorrow && new Date(t.dueDate) < dayAfterTomorrow).length;
    const upcomingTasks = tasks.filter(t => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) >= dayAfterTomorrow).length;
    const noDueDateTasks = tasks.filter(t => t.status !== 'completed' && !t.dueDate).length;

    const dueDateAnalysis = [
        { name: "Overdue", count: overdueTasks, color: "rgb(239, 68, 68)", iconClass: "bg-red-500/10", textClass: "text-red-500" },
        { name: "Due Today", count: dueTodayTasks, color: "rgb(249, 115, 22)", iconClass: "bg-orange-500/10", textClass: "text-orange-500" },
        { name: "Due Tomorrow", count: dueTomorrowTasks, color: "rgb(234, 179, 8)", iconClass: "bg-yellow-500/10", textClass: "text-yellow-500" },
        { name: "Upcoming", count: upcomingTasks, color: "rgb(59, 130, 246)", iconClass: "bg-blue-500/10", textClass: "text-blue-500" },
        { name: "No Due Date", count: noDueDateTasks, color: "rgb(107, 114, 128)", iconClass: "bg-gray-500/10", textClass: "text-gray-500" },
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
    statsData.tasksPerProjectChartData.forEach(item => {
        config[item.name] = { label: item.name, color: item.fill };
    });
    return config;
  }, [statsData.tasksPerProjectChartData]);

  const totalTasksByPriority = useMemo(() => {
    return statsData.priorityDistributionChartData.reduce((acc, curr) => acc + curr.count, 0);
  }, [statsData.priorityDistributionChartData]);

  // Loading and Error states
  if (loading) {
    return (
      <div className="py-6 md:py-8 px-4 space-y-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Task Statistics</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
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
          <AlertCircle className="inline-block h-5 w-5 mr-2" />Error loading statistics: {error}
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
    <div className="py-6 md:py-8 px-4 space-y-8 overflow-visible">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500">
        Task Statistics
      </h1>

      {/* Key Stats Cards */} 
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Example Stat Card: Total Tasks */} 
          <MotionCard variants={cardVariants} custom={0} initial="hidden" animate="visible" whileHover="hover" className="overflow-visible bg-card/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-border/50 shadow-sm h-full flex flex-col">
              <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      <span>Total Tasks</span>
                      <BarChart2 className="h-4 w-4 text-muted-foreground" />
                  </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex-grow flex items-end">
                  <p className="text-3xl font-bold">{statsData.total}</p>
              </CardContent>
          </MotionCard>
          {/* Example Stat Card: Completed */}
          <MotionCard variants={cardVariants} custom={1} initial="hidden" animate="visible" whileHover="hover" className="overflow-visible bg-card/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-border/50 shadow-sm h-full flex flex-col">
              <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      <span>Completed</span>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex-grow flex items-end">
                  <p className="text-3xl font-bold">{statsData.completed}</p>
              </CardContent>
          </MotionCard>
          {/* Example Stat Card: Pending */}
          <MotionCard variants={cardVariants} custom={2} initial="hidden" animate="visible" whileHover="hover" className="overflow-visible bg-card/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-border/50 shadow-sm h-full flex flex-col">
              <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      <span>Pending (Todo + Doing)</span>
                      <Clock className="h-4 w-4 text-yellow-500" />
                  </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex-grow flex items-end">
                  <p className="text-3xl font-bold">{statsData.pending}</p>
              </CardContent>
          </MotionCard>
           {/* Example Stat Card: Completion Rate */}
           <MotionCard variants={cardVariants} custom={3} initial="hidden" animate="visible" whileHover="hover" className="overflow-visible bg-card/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-border/50 shadow-sm h-full flex flex-col">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                        <span>Completion Rate</span>
                        <PieChartIcon className="h-4 w-4 text-purple-500" />
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 flex-grow flex items-end">
                    <p className="text-3xl font-bold">{statsData.completionRate}%</p>
                </CardContent>
            </MotionCard>
            {/* Example Stat Card: Most Active Project */}
            <MotionCard variants={cardVariants} custom={4} initial="hidden" animate="visible" whileHover="hover" className="overflow-visible bg-card/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-border/50 shadow-sm h-full flex flex-col">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                        <span>Busiest Project</span>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 flex-grow flex items-end">
                    <p className="text-2xl font-bold truncate" title={statsData.mostActiveProject}>{statsData.mostActiveProject}</p>
                </CardContent>
            </MotionCard>
            {/* Example Stat Card: Task Status Distribution Bar */}
             <MotionCard variants={cardVariants} custom={5} initial="hidden" animate="visible" whileHover="hover" className="overflow-visible bg-card/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-border/50 shadow-sm h-full flex flex-col">
                 <CardHeader className="pb-2">
                     <CardTitle className="text-sm font-medium text-muted-foreground">
                         Status Breakdown
                     </CardTitle>
                 </CardHeader>
                 <CardContent className="pt-2 flex-grow flex flex-col justify-end">
                     <div className="flex w-full h-2 rounded-full overflow-hidden bg-muted mb-1">
                         <div className="bg-green-500" style={{ width: `${statsData.completionRate}%` }}></div>
                         <div className="bg-blue-500" style={{ width: `${statsData.total > 0 ? (statsData.doing / statsData.total) * 100 : 0}%` }}></div>
                         {/* Todo fills the rest */}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto">
        {/* Priority Pie Chart */}
        <MotionCard
          className="overflow-visible flex flex-col bg-card/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-border/50 shadow-sm h-auto"
          variants={cardVariants} custom={6} initial="hidden" animate="visible" whileHover="hover"
        >
          <CardHeader className="items-center pb-0">
            <CardTitle>Tasks by Priority</CardTitle>
            <CardDescription>Distribution across priorities</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={priorityChartConfig} className="mx-auto aspect-square max-h-[300px]">
              <RechartsPieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel indicator="dot" />} />
                <Pie data={statsData.priorityDistributionChartData} dataKey="count" nameKey="priority" innerRadius={60} outerRadius={100} strokeWidth={2} stroke="hsl(var(--background))">
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                            <tspan x={viewBox.cx} y={viewBox.cy - 10} className="fill-foreground text-3xl font-bold">{totalTasksByPriority.toLocaleString()}</tspan>
                            <tspan x={viewBox.cx} y={viewBox.cy + 10} className="fill-muted-foreground text-xs">Tasks</tspan>
                          </text>
                        );
                      }
                    }}
                  />
                   {statsData.priorityDistributionChartData.map((entry) => (
                      <Cell key={`cell-${entry.priority}`} fill={entry.fill} />
                  ))}
                </Pie>
              </RechartsPieChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm pt-4">
            <div className="flex items-center gap-2 font-medium leading-none">
               Priority breakdown for all tasks.
            </div>
            {/* Optional: Add Legend */}
             <div className="flex items-center gap-x-4 gap-y-1 flex-wrap justify-center text-xs text-muted-foreground">
               {statsData.priorityDistributionChartData.map(item => (
                   <div key={item.priority} className="flex items-center gap-1.5">
                       <span className="w-2 h-2 rounded-full" style={{backgroundColor: item.fill }}></span>
                       {item.priority} ({item.count})
                   </div>
               ))}
             </div>
          </CardFooter>
        </MotionCard>
        
        {/* Tasks per Project Bar Chart */}
        <MotionCard
          variants={cardVariants} custom={7} initial="hidden" animate="visible" whileHover="hover"
          className="overflow-visible flex flex-col bg-card/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-border/50 shadow-sm h-auto"
        >
          <CardHeader>
            <CardTitle>Tasks per Project</CardTitle>
            <CardDescription>Top projects by task count</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={projectChartConfig} className="max-h-[300px]">
              <BarChart accessibilityLayer data={statsData.tasksPerProjectChartData.slice(0, 7)} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={10} width={80} className="text-xs"/>
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" nameKey="name" labelKey="tasks" />} />
                <Bar dataKey="tasks" layout="vertical" radius={4} barSize={20}> 
                   {statsData.tasksPerProjectChartData.slice(0, 7).map((entry) => (
                       <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                   ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm pt-4">
            <div className="leading-none text-muted-foreground">
              Showing top {Math.min(7, statsData.tasksPerProjectChartData.length)} projects.
            </div>
          </CardFooter>
        </MotionCard>
      </div>

      {/* Due Date Analysis Card */}
      <div>
        <MotionCard
          variants={cardVariants} custom={8} initial="hidden" animate="visible" whileHover="hover"
          className="overflow-visible bg-card/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-border/50 shadow-sm"
        >
          <CardHeader>
            <CardTitle>Due Date Analysis</CardTitle>
            <CardDescription>Breakdown of pending tasks by deadline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {statsData.dueDateAnalysis.map((category) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  transition={{ delay: 0.1 + statsData.dueDateAnalysis.indexOf(category) * 0.05 }}
                  className="flex flex-col items-center p-4 rounded-lg bg-muted/30 border text-center space-y-1"
                >
                   <div className={`p-2 rounded-full ${category.iconClass} mb-1`}>
                       <Clock className={`h-4 w-4 ${category.textClass}`} />
                   </div>
                   <span className="text-xs font-medium text-muted-foreground">{category.name}</span>
                   <span className={`text-xl font-bold ${category.textClass}`}>{category.count}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              Status of tasks that are not yet completed.
            </div>
          </CardFooter>
        </MotionCard>
      </div>

    </div>
  );
};

export default StatsPage;
