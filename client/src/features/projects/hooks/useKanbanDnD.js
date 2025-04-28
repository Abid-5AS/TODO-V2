import { useState, useMemo, useCallback } from 'react';
import { 
    PointerSensor, 
    useSensor, 
    useSensors 
} from '@dnd-kit/core';
import { findColumnForTask } from '../helpers/kanbanHelpers';
import { KANBAN_COLUMN_IDS } from '../constants/kanbanConstants';

export const useKanbanDnD = (groupedTasks, handleTaskMove) => {
  const [activeId, setActiveId] = useState(null); // ID of the task being dragged

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
    // Find the task from any of the columns using constant keys
    for (const columnId of KANBAN_COLUMN_IDS) {
        const task = groupedTasks[columnId]?.find((t) => t._id === activeId);
        if (task) return task;
    }
    return null;
  }, [activeId, groupedTasks]);

  // Handle drag start
  const handleDragStart = useCallback((event) => {
    console.log("[Dnd] Drag Start:", event.active.id);
    setActiveId(event.active.id);
  }, []); // No dependencies needed for setActiveId

  // Handle drag end
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    setActiveId(null); // Clear active drag ID
    console.log("[Dnd] Drag End:", { activeId: active.id, overId: over?.id });

    if (!over || !active || active.id === over.id) {
      console.log("[Dnd] No drop target or dropped on self.");
      return; // No action needed
    }

    const activeTaskId = active.id;
    const overId = over.id; 

    // Find the source column using the helper
    const sourceColumnId = findColumnForTask(activeTaskId, groupedTasks);
    if (!sourceColumnId) {
      console.error(`[Dnd] Could not find source column for task: ${activeTaskId}`);
      return;
    }

    let targetColumnId = null;
    // Check if dropped directly onto a column using constants
    if (KANBAN_COLUMN_IDS.includes(overId)) {
      targetColumnId = overId;
      console.log(`[Dnd] Dropped task ${activeTaskId} directly onto column ${targetColumnId}`);
    } else {
      // Dropped onto another task, find that task's column using helper
      targetColumnId = findColumnForTask(overId, groupedTasks);
      console.log(`[Dnd] Dropped task ${activeTaskId} onto task ${overId} in column ${targetColumnId}`);
    }

    if (!targetColumnId) {
      console.error(`[Dnd] Could not determine target column for drop target: ${overId}.`);
      return; // Exit if target column is unknown
    }

    // --- Handle Moving Between Columns ---
    if (sourceColumnId !== targetColumnId) {
      // Find the original task data (we get this from activeTask memoized above)
      const draggedTask = activeTask;
       if (!draggedTask) {
         // Re-find just in case memo hasn't updated (shouldn't happen often)
         console.warn('[Dnd] Refinding active task in handleDragEnd');
         let foundTask = null;
         for (const colId of KANBAN_COLUMN_IDS) {
             const task = groupedTasks[colId]?.find(t => t._id === activeTaskId);
             if (task) {
                 foundTask = task;
                 break;
             }
         }
         if (!foundTask) {
           console.error(`[Dnd] Could not find dragged task data for ID: ${activeTaskId}`);
           return;
         }
         // Use the refound task status for comparison
         if (foundTask.status !== targetColumnId) {
             console.log(`[Dnd] Moving task ${activeTaskId} from ${sourceColumnId} to ${targetColumnId}`);
             handleTaskMove(activeTaskId, targetColumnId);
         } else {
             console.log(`[Dnd] Task ${activeTaskId} already in target column ${targetColumnId}. No status change needed.`);
         }
       } else {
         // Use the memoized activeTask status
         if (draggedTask.status !== targetColumnId) {
           console.log(`[Dnd] Moving task ${activeTaskId} from ${sourceColumnId} to ${targetColumnId} (using memoized activeTask)`);
           handleTaskMove(activeTaskId, targetColumnId);
         } else {
           console.log(`[Dnd] Task ${activeTaskId} already in target column ${targetColumnId}. No status change needed (using memoized activeTask).`);
         }
       }
    } else {
      // --- Sorting Within the Same Column (Currently Disabled) ---
      console.log(`[Dnd] Sorting within column ${sourceColumnId} (client-side sorting disabled). Task ${activeTaskId} over ${overId}.`);
    }
  }, [groupedTasks, handleTaskMove, activeTask]); // Added activeTask dependency

  return {
    activeId,
    activeTask,
    sensors,
    handleDragStart,
    handleDragEnd,
  };
}; 