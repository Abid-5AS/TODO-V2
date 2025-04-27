// src/features/tasks/components/TaskList.jsx
// Displays a list of tasks with filtering and sorting controls.

import React, { useState, useEffect } from "react";
import { useTasks } from "../hooks/useTasks";
import TaskItem from "./TaskItem";
import { Input } from "../../../components/ui/input"; // Corrected path
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"; // Corrected path
import { Skeleton } from "../../../components/ui/skeleton"; // Corrected path
import { Toaster } from "../../../components/ui/toaster"; // Corrected path
import useScrollPosition from "../../../hooks/useScrollPosition"; // Corrected path
import { motion, AnimatePresence } from "framer-motion";
import { listContainerVariants, taskItemVariants } from "../../animations"; // Corrected path
import { Search, Filter, ArrowUpWideNarrow } from 'lucide-react';

const TaskList = ({ 
  selectedProject, 
  allProjects = [], 
  projectObjects = [], // Receive full project objects if available
  onTaskMoved, 
  onTaskCountChange 
}) => {
  useScrollPosition(`taskList-${selectedProject}`); // Unique key per project/view

  const {
    tasks,
    count,
    loading,
    error,
    isPending, // from useTransition, if used inside useTasks
    search,
    setSearch,
    sort,
    setSort,
    filter,
    setFilter,
    updateProjectContext,
    updateTask, // Renamed from optimisticUpdate
    deleteTask, // Renamed from optimisticDelete
    addSubtask, // Renamed from optimisticAddSubtask
    updateSubtask, // Renamed from optimisticUpdateSubtask
    deleteSubtask, // Renamed from optimisticDeleteSubtask
    SORT_OPTIONS,
    FILTER_OPTIONS,
  } = useTasks(selectedProject, allProjects); // useTasks hook handles fetching and state management

  // Update the task hook's context when the selected project changes
  useEffect(() => {
    console.log(`[TaskList Effect] Updating project context for: ${selectedProject}`);
    updateProjectContext(selectedProject);
  }, [selectedProject, updateProjectContext]);

  // State to manage which accordion (task item details) is open
  const [openAccordions, setOpenAccordions] = useState({});

  // Restore scroll position on mount
  useEffect(() => {
    const savedPosition = sessionStorage.getItem(`scrollPosition-taskList-${selectedProject}`);
    if (savedPosition) {
      // Use timeout to allow layout to settle
      const timer = setTimeout(() => {
        window.scrollTo(0, parseInt(savedPosition, 10));
      }, 150);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject]); // Rerun when project changes to restore its specific scroll position

  // Function to toggle accordion state for a specific task
  const toggleAccordion = (taskId) => {
    setOpenAccordions((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Handlers for filter/sort controls
  const handleSearch = (e) => setSearch(e.target.value);
  const handleSort = (value) => setSort(value);
  const handleFilter = (value) => setFilter(value);

  // Report task count changes to the parent (DashboardPage)
  useEffect(() => {
    if (onTaskCountChange) {
      onTaskCountChange(count);
    }
  }, [count, onTaskCountChange]);

  // Loading skeleton renderer
  const renderLoading = () => (
    <div className="space-y-3 py-2">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
        >
          <Skeleton className="h-16 w-full rounded-lg" />
        </motion.div>
      ))}
    </div>
  );

  // Initial loading state
  if (loading && tasks.length === 0) return renderLoading();

  // Error state
  if (error) return (
    <motion.div
      className="text-center text-red-500 py-6 px-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      Error loading tasks: {error}
    </motion.div>
  );

  return (
    <motion.div
      className="space-y-4 overflow-anchor-none px-1 sm:px-0" // Removed horizontal padding for better control
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ overflow: 'visible' }}
    >
      {/* --- Controls Toolbar --- */}
      <motion.div className="sticky top-14 z-20 pt-2 -mx-1 sm:mx-0"> {/* Make toolbar sticky */} 
        <motion.div
          className="flex flex-col md:flex-row gap-3 md:items-center bg-gradient-to-r from-white/80 to-white/70 dark:from-zinc-900/70 dark:to-zinc-800/60 rounded-xl p-4 shadow-lg backdrop-blur-xl border border-gray-200/50 dark:border-zinc-700/50 transition-all duration-300"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex-grow relative">
            <Input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search tasks..."
              className="w-full pl-10 py-2 rounded-lg bg-gradient-to-r from-white/60 to-white/50 dark:from-zinc-800/60 dark:to-zinc-800/40 backdrop-blur-sm border border-zinc-300/60 dark:border-zinc-700/60 focus:ring-2 focus:ring-primary/70 text-base transition-all text-zinc-800 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
               <Search size={18} />
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={filter} onValueChange={handleFilter}>
              <SelectTrigger
                className="w-full sm:w-[160px] rounded-lg bg-gradient-to-r from-white/60 to-white/50 dark:from-zinc-800/60 dark:to-zinc-800/40 backdrop-blur-sm border border-zinc-300/60 dark:border-zinc-700/60 focus:ring-2 focus:ring-purple-500/70 text-sm flex items-center gap-2 text-zinc-800 dark:text-white justify-start"
              >
                <Filter size={16} className="text-muted-foreground"/>
                <SelectValue placeholder="Filter by..." />
              </SelectTrigger>
              <SelectContent>
                {FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={handleSort}>
              <SelectTrigger
                className="w-full sm:w-[160px] min-w-[110px] rounded-lg bg-gradient-to-r from-white/60 to-white/50 dark:from-zinc-800/60 dark:to-zinc-800/40 backdrop-blur-sm border border-zinc-300/60 dark:border-zinc-700/60 focus:ring-2 focus:ring-pink-500/70 text-sm flex items-center gap-2 text-zinc-800 dark:text-white justify-start"
              >
                <ArrowUpWideNarrow size={16} className="text-muted-foreground"/>
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      </motion.div>

      {/* --- Task List --- */} 
      {tasks.length === 0 ? (
        <motion.div
          className="text-center p-8 mt-6 text-muted-foreground bg-gradient-to-r from-white/60 to-white/50 dark:from-zinc-900/60 dark:to-zinc-800/50 backdrop-blur-xl border border-gray-200/50 dark:border-zinc-700/50 rounded-xl shadow-lg mx-auto max-w-md transition-all duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="text-zinc-700 dark:text-zinc-300 font-medium">
            No tasks found {search ? `matching "${search}"` : ''} {filter !== 'all' ? `with filter "${FILTER_OPTIONS.find(f=>f.value === filter)?.label}"` : ''}.
          </span>
        </motion.div>
      ) : (
        <motion.ul
          className="space-y-3 md:space-y-3 py-2 relative"
          style={{ overflow: 'visible' }} // Ensure space for animations/hovers
          variants={listContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout"> {/* Use popLayout for smoother transitions */} 
            {tasks.map((task) => (
              <motion.li
                key={task._id}
                variants={taskItemVariants}
                layout // Enable layout animation
                className="relative z-0" // Base z-index, TaskItem can increase on hover/drag
                style={{ overflow: 'visible' }}
              >
                <TaskItem
                  task={task}
                  onOptimisticUpdate={updateTask} // Pass renamed function
                  onOptimisticDelete={deleteTask} // Pass renamed function
                  onOptimisticAddSubtask={addSubtask} // Pass renamed function
                  onOptimisticUpdateSubtask={updateSubtask} // Pass renamed function
                  onOptimisticDeleteSubtask={deleteSubtask} // Pass renamed function
                  accordionOpen={!!openAccordions[task._id]}
                  setAccordionOpen={() => toggleAccordion(task._id)} // Pass simplified handler
                  availableProjects={allProjects} // Pass project names for edit form datalist
                  className="bg-gradient-to-r from-white/70 to-white/60 dark:from-zinc-900/60 dark:to-zinc-800/50 backdrop-blur-xl border border-gray-200/40 dark:border-zinc-700/40 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-visible"
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
      {/* Toaster should be rendered at the root level (AppProviders) */} 
      {/* <Toaster /> */} 
    </motion.div>
  );
};

export default TaskList;
