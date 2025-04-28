// src/features/projects/components/ProjectKanbanBoard.jsx
// Renders a Kanban board view for tasks within a specific project.

import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useOutletContext } from "react-router-dom";
import { useTasks } from "../../tasks/hooks/useTasks"; // Corrected path
import KanbanColumn from "./KanbanColumn";
import KanbanTaskCard from "./KanbanTaskCard";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { Skeleton } from "../../../components/ui/skeleton"; // Corrected path
import { motion } from "framer-motion";

// Helper function to find column ID for a given task ID using the memoized groupedTasks
const findColumnForTask = (taskId, groupedTasks) => {
  if (groupedTasks.todo?.some((task) => task._id === taskId)) return "todo";
  if (groupedTasks.doing?.some((task) => task._id === taskId)) return "doing";
  if (groupedTasks.completed?.some((task) => task._id === taskId))
    return "completed";
  return null;
};

const ProjectKanbanBoard = ({
  selectedProject,
  allProjects = [],
  onTaskCountChange,
}) => {
  // Use useTasks hook to fetch and manage tasks for the *selectedProject*
  const { tasks, loading, error, updateTask } = useTasks(
    selectedProject,
    allProjects
  );
  const { user } = useOutletContext() || {}; // Get user from layout if needed
  const [activeId, setActiveId] = useState(null); // ID of the task being dragged
  const lastUpdateRef = useRef(null); // Ref for debouncing updates

  // Group tasks by status ('todo', 'doing', 'completed')
  const groupedTasks = useMemo(() => {
    const tasksArray = Array.isArray(tasks) ? tasks : [];
    // console.log(`[ProjectKanbanBoard/useMemo] Grouping ${tasksArray.length} tasks for project: ${selectedProject}`);
    const grouped = {
      todo: tasksArray.filter((task) => task.status === "todo"),
      doing: tasksArray.filter((task) => task.status === "doing"),
      completed: tasksArray.filter((task) => task.status === "completed"),
    };
    // console.log(`[ProjectKanbanBoard/useMemo] Grouped: todo=${grouped.todo.length}, doing=${grouped.doing.length}, completed=${grouped.completed.length}`);
    return grouped;
  }, [tasks]); // Dependency is only the tasks array from the hook

  // Report task count changes
  useEffect(() => {
    if (onTaskCountChange) {
      const totalCount =
        (groupedTasks.todo?.length || 0) +
        (groupedTasks.doing?.length || 0) +
        (groupedTasks.completed?.length || 0);
      onTaskCountChange(totalCount);
    }
  }, [groupedTasks, onTaskCountChange]);

  // Debounced task move function
  const handleTaskMove = useCallback(
    (taskId, targetColumnId) => {
      // TargetColumnId is already 'todo', 'doing', or 'completed'
      const targetStatusApi = targetColumnId;

      const now = Date.now();
      if (
        lastUpdateRef.current &&
        lastUpdateRef.current.taskId === taskId &&
        lastUpdateRef.current.status === targetStatusApi &&
        now - lastUpdateRef.current.time < 500 // 500ms debounce window
      ) {
        console.log(
          `[ProjectKanbanBoard] Debounced duplicate update for task ${taskId}`
        );
        return;
      }
      lastUpdateRef.current = { taskId, status: targetStatusApi, time: now };

      console.log(
        `[ProjectKanbanBoard/handleTaskMove] Calling updateTask for ${taskId} with status: ${targetStatusApi}`
      );
      // updateTask handles the optimistic update and API call
      updateTask(taskId, { status: targetStatusApi });
    },
    [updateTask]
  );

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10, // Min distance before drag begins
      },
    })
  );

  // Find the task object being dragged
  const activeTask = useMemo(() => {
    if (!activeId) return null;
    // Find the task from any of the columns
    return (
      groupedTasks.todo?.find((t) => t._id === activeId) ||
      groupedTasks.doing?.find((t) => t._id === activeId) ||
      groupedTasks.completed?.find((t) => t._id === activeId) ||
      null
    );
  }, [activeId, groupedTasks]);

  // Handle drag start
  const handleDragStart = (event) => {
    console.log("[Dnd] Drag Start:", event.active.id);
    setActiveId(event.active.id);
  };

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null); // Clear active drag ID
    console.log("[Dnd] Drag End:", { activeId: active.id, overId: over?.id });

    if (!over || !active || active.id === over.id) {
      console.log("[Dnd] No drop target or dropped on self.");
      return; // No action needed
    }

    const activeTaskId = active.id;
    const overId = over.id; // This could be a column ID ('todo', 'doing', 'completed') or another task ID

    // Find the source column of the dragged task
    const sourceColumnId = findColumnForTask(activeTaskId, groupedTasks);
    if (!sourceColumnId) {
      console.error(
        `[Dnd] Could not find source column for task: ${activeTaskId}`
      );
      return;
    }

    let targetColumnId = null;
    // Check if dropped directly onto a column
    if (["todo", "doing", "completed"].includes(overId)) {
      targetColumnId = overId;
      console.log(
        `[Dnd] Dropped task ${activeTaskId} directly onto column ${targetColumnId}`
      );
    } else {
      // Dropped onto another task, find that task's column
      targetColumnId = findColumnForTask(overId, groupedTasks);
      console.log(
        `[Dnd] Dropped task ${activeTaskId} onto task ${overId} in column ${targetColumnId}`
      );
    }

    if (!targetColumnId) {
      console.error(
        `[Dnd] Could not determine target column for drop target: ${overId}.`
      );
      return; // Exit if target column is unknown
    }

    // --- Handle Moving Between Columns ---
    if (sourceColumnId !== targetColumnId) {
      // Find the original task data (needed to check current status)
      const draggedTask = activeTask;
      if (!draggedTask) {
        console.error(
          `[Dnd] Could not find dragged task data for ID: ${activeTaskId}`
        );
        return;
      }

      // Determine the target API status (which is the target column ID itself)
      const targetStatusApi = targetColumnId;

      // Call move only if status is actually changing
      if (draggedTask.status !== targetStatusApi) {
        console.log(
          `[Dnd] Moving task ${activeTaskId} from ${sourceColumnId} to ${targetColumnId}`
        );
        handleTaskMove(activeTaskId, targetColumnId); // Pass the target COLUMN ID ('todo', 'doing', 'completed')
      } else {
        console.log(
          `[Dnd] Task ${activeTaskId} already in target column ${targetColumnId}. No status change needed.`
        );
        // Handle potential reordering within the same column if dropped on a task (currently disabled)
      }
    } else {
      // --- Sorting Within the Same Column (Currently Disabled) ---
      // Re-ordering logic would go here if needed.
      // It would involve optimistically updating the 'tasks' state using arrayMove
      // and potentially calling a backend endpoint if order needs persistence.
      console.log(
        `[Dnd] Sorting within column ${sourceColumnId} (client-side sorting disabled). Task ${activeTaskId} over ${overId}.`
      );
    }
  };

  // Render loading state
  if (loading && tasks.length === 0) {
    return (
      <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4 px-2 h-full">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-full md:min-w-[250px] lg:min-w-[300px] flex-shrink-0 md:flex-1 p-3 md:p-4 rounded-xl space-y-3"
          >
            <Skeleton className="h-6 w-1/2 mx-auto mb-3" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-6 text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        Error loading board: {error}
      </div>
    );
  }

  // Render empty state
  if (!loading && tasks.length === 0) {
    return (
      <div className="text-center p-8 mt-6 text-muted-foreground bg-white/50 dark:bg-zinc-800/40 backdrop-blur-md rounded-xl shadow-md mx-auto max-w-md transition-all duration-300">
        <span className="text-zinc-700 dark:text-zinc-300 font-medium">
          No tasks in project yet.
        </span>
        <p className="mt-2 text-sm">
          Add a task to this project to see it on the Kanban board.
        </p>
      </div>
    );
  }

  // Main render: Kanban board with 3 columns (todo, doing, completed)
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Main board container */}
      <motion.div
        className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4 px-2 h-full kanban-scrollbar dark:kanban-scrollbar-dark"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* To Do Column */}
        <KanbanColumn id="todo" title="To Do" tasks={groupedTasks.todo || []} />

        {/* Doing Column */}
        <KanbanColumn
          id="doing"
          title="Doing"
          tasks={groupedTasks.doing || []}
        />

        {/* Completed Column */}
        <KanbanColumn
          id="completed"
          title="Completed"
          tasks={groupedTasks.completed || []}
        />

        {/* Drag overlay for the currently dragged task */}
        <DragOverlay adjustScale={false}>
          {activeId && activeTask ? (
            <KanbanTaskCard task={activeTask} overlay={true} />
          ) : null}
        </DragOverlay>
      </motion.div>
    </DndContext>
  );
};

export default ProjectKanbanBoard;
