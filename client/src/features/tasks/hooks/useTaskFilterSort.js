// src/features/tasks/hooks/useTaskFilterSort.js
// Custom hook to manage task filtering and sorting logic.

import { useState, useMemo, useTransition } from "react";
import { useDebounce } from "../../../hooks/useDebounce";
import { isToday, isUpcoming, isOverdue } from "../utils/taskUtils";

// Constants can be defined here or imported if shared
const SORT_OPTIONS = [
  { value: "default", label: "Default (Status & Priority)" },
  { value: "dueDateAsc", label: "Due Date (Asc)" },
  { value: "dueDateDesc", label: "Due Date (Desc)" },
  { value: "priority", label: "Priority (High-Low)" },
  { value: "title", label: "Title (A-Z)" },
  { value: "createdAtDesc", label: "Created Date (Newest)" },
];

const FILTER_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "todo", label: "To Do" },
  { value: "doing", label: "Doing" },
  { value: "completed", label: "Completed" },
];

export const useTaskFilterSort = ({
  tasks, // Raw tasks array from useTasks
  projectContext, // Current project/view context from useTasks
  allProjects = [], // List of all projects, if needed for filtering logic
}) => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [filter, setFilter] = useState("all");
  const [isPending, startTransition] = useTransition();

  const debouncedSearch = useDebounce(search, 300);

  // --- Filtering and Sorting ---
  const filteredAndSortedTasks = useMemo(() => {
    let result = tasks; // Start with the raw tasks passed in

    // Filter by project/view context
    if (projectContext === "today") {
      result = result.filter((task) => isToday(task.dueDate));
    } else if (projectContext === "upcoming") {
      result = result.filter((task) => isUpcoming(task.dueDate));
    } else if (projectContext === "overdue") {
      result = result.filter(
        (task) => task.status !== "completed" && isOverdue(task.dueDate)
      );
    } else if (projectContext === "completed") {
      result = result.filter((task) => task.status === "completed");
    } else if (
      projectContext && // Ensure projectContext is not null/undefined
      projectContext !== "all" &&
      projectContext !== "Inbox" &&
      !allProjects.some(p => p._id === projectContext) // Check if it's a valid project ID
    ) {
       // If it's a specific project filter, ensure tasks belong to it
       // Note: This assumes fetchTasks might return tasks outside the specific project
       // If fetchTasks *always* filters correctly, this specific project check might be redundant
       result = result.filter(task => task.project === projectContext);
    } else if (projectContext === "Inbox") {
        // Filter for tasks explicitly in Inbox or without any project assigned
        result = result.filter(
            (task) => !task.project || task.project === "Inbox"
        );
    }
    // If projectContext is 'all' or a specific known project, no view-based filtering is needed here
    // as the initial fetch likely handled it.

    // Filter by status (todo, doing, completed)
    if (filter !== "all") {
      result = result.filter((task) => task.status === filter);
    }

    // Filter by search term (debounced)
    if (debouncedSearch) {
      const searchTerm = debouncedSearch.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm) ||
          (task.description &&
            task.description.toLowerCase().includes(searchTerm)) ||
          (task.labels &&
            task.labels.some((label) =>
              label.toLowerCase().includes(searchTerm)
            )) ||
          (task.subtasks &&
            task.subtasks.some((sub) =>
              sub.title.toLowerCase().includes(searchTerm)
            ))
      );
    }

    // Sort
    const sortedResult = [...result]; // Create a mutable copy for sorting
    switch (sort) {
      case "dueDateAsc":
        sortedResult.sort((a, b) =>
          a.dueDate && b.dueDate
            ? new Date(a.dueDate) - new Date(b.dueDate)
            : a.dueDate ? -1 : b.dueDate ? 1 : 0
        );
        break;
      case "dueDateDesc":
         sortedResult.sort((a, b) =>
            a.dueDate && b.dueDate
                ? new Date(b.dueDate) - new Date(a.dueDate)
                : a.dueDate ? -1 : b.dueDate ? 1 : 0
        );
        break;
      case "priority":
        const priorityMap = { High: 3, Medium: 2, Low: 1 };
        sortedResult.sort(
          (a, b) =>
            (priorityMap[b.priority] || 0) - (priorityMap[a.priority] || 0)
        );
        break;
      case "title":
        sortedResult.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "createdAtDesc":
        sortedResult.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "default":
      default:
        const statusOrder = { todo: 1, doing: 2, completed: 3 };
        const priorityOrder = { High: 1, Medium: 2, Low: 3, default: 4 }; // Use 'default' or a specific value for undefined

        sortedResult.sort((a, b) => {
          const statusDiff =
            statusOrder[a.status || "todo"] - statusOrder[b.status || "todo"];
          if (statusDiff !== 0) return statusDiff;

          const priorityDiff =
            priorityOrder[a.priority || 'default'] - priorityOrder[b.priority || 'default'];
          if (priorityDiff !== 0) return priorityDiff;

          if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate) - new Date(b.dueDate);
          } else if (a.dueDate) {
            return -1;
          } else if (b.dueDate) {
            return 1;
          }

          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        break;
    }

    return sortedResult; // Return the sorted copy
  }, [tasks, projectContext, filter, debouncedSearch, sort, allProjects]);

  return {
    filteredAndSortedTasks,
    search,
    setSearch: (value) => startTransition(() => setSearch(value)),
    sort,
    setSort: (value) => startTransition(() => setSort(value)),
    filter,
    setFilter: (value) => startTransition(() => setFilter(value)),
    isPending, // Expose pending state for UI feedback
    SORT_OPTIONS,
    FILTER_OPTIONS,
  };
};

export default useTaskFilterSort; 