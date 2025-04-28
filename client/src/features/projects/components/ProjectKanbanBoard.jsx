// src/features/projects/components/ProjectKanbanBoard.jsx
// Renders a Kanban board view for tasks within a specific project.

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  DndContext,
  DragOverlay,
  // PointerSensor,
  // useSensor,
  // useSensors,
} from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
// import { useParams } from 'react-router-dom';
import _ from 'lodash';

// Hooks
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { useKanbanDnD } from '../hooks/useKanbanDnD'; // Import the new hook

// Components
import KanbanColumn from './KanbanColumn';
import KanbanTaskCard from './KanbanTaskCard';
import { Skeleton } from '@/components/ui/skeleton';
// import { toast } from 'sonner';

// Constants & Helpers
import {
  COLUMN_TODO,
  COLUMN_DOING,
  COLUMN_COMPLETED,
  KANBAN_COLUMN_IDS,
  KANBAN_COLUMN_NAMES,
} from '../constants/kanbanConstants';
// import { findColumnForTask } from '../helpers/kanbanHelpers'; // No longer needed here

const ProjectKanbanBoard = ({ projectId }) => {
  // Get updateTask directly from useTasks along with other values
  const { 
    tasks = [], 
    isLoading, 
    error, 
    updateTask // Get updateTask from useTasks
  } = useTasks(projectId);
  
  // Debounce task move to prevent rapid API calls during drag
  const debouncedUpdateTask = useMemo(
    () =>
      _.debounce((taskId, newStatus) => {
        console.log(`Debounced update: Task ${taskId} to ${newStatus}`);
        // Use updateTask directly from useTasks
        updateTask(taskId, { status: newStatus }, {
          // Callbacks are handled within useTasks, no need to override here usually
          // onSuccess: () => { ... }, 
          // onError: (err) => { ... },
        });
      }, 500), 
    [updateTask] // Dependency is updateTask from useTasks
  );

  // Group tasks by status using constants
  const groupedTasks = useMemo(() => {
    const groups = {
      [COLUMN_TODO]: [],
      [COLUMN_DOING]: [],
      [COLUMN_COMPLETED]: [],
    };
    tasks.forEach((task) => {
      if (groups[task.status]) {
        groups[task.status].push(task);
      } else {
        console.warn(`Task ${task._id} has unknown status: ${task.status}`);
        // Optionally place tasks with unknown status in a default column (e.g., TODO)
        // groups[COLUMN_TODO].push(task);
      }
    });
    return groups;
  }, [tasks]);

  // --- Use the custom DnD hook ---
  const { 
    activeId, 
    activeTask, 
    sensors, 
    handleDragStart, 
    handleDragEnd 
  } = useKanbanDnD(groupedTasks, debouncedUpdateTask);
  // --- End DnD Hook Usage ---

  // Memoize task IDs for SortableContext
  const taskIds = useMemo(() => tasks.map((task) => task._id), [tasks]);

  if (isLoading) {
    return (
      <div className="flex gap-4 p-4">
        {KANBAN_COLUMN_IDS.map((columnId) => (
          <div key={columnId} className="flex-1">
            <Skeleton className="h-8 w-32 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error loading tasks: {error.message}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors} // Use sensors from the hook
      onDragStart={handleDragStart} // Use handler from the hook
      onDragEnd={handleDragEnd} // Use handler from the hook
      // onDragOver={handleDragOver} // Add if implementing more complex interactions
    >
      <div className="flex gap-4 p-4 overflow-x-auto">
        {/* Use KANBAN_COLUMN_IDS for consistent ordering */} 
        <SortableContext items={taskIds}> {/* Provide all task IDs */} 
          {KANBAN_COLUMN_IDS.map((columnId) => (
            <KanbanColumn
              key={columnId}
              id={columnId} // Use constant ID
              title={KANBAN_COLUMN_NAMES[columnId] || columnId} // Use name from map
              tasks={groupedTasks[columnId] || []} // Pass tasks for this column
            />
          ))}
        </SortableContext>
      </div>

      {/* Drag Overlay: Renders the dragged task visually */} 
      {createPortal(
        <DragOverlay>
          {activeId && activeTask ? (
            <KanbanTaskCard task={activeTask} isDragging />
          ) : null}
        </DragOverlay>,
        document.body // Append overlay to body to avoid clipping issues
      )}
    </DndContext>
  );
};

ProjectKanbanBoard.propTypes = {
  projectId: PropTypes.string.isRequired,
};

export default ProjectKanbanBoard;
