// src/features/tasks/components/TaskDisplay.jsx
// Displays the non-editable view of a task.

import React from "react";
import { Card, CardContent } from "../../../components/ui/card"; // Corrected path
import { Badge } from "../../../components/ui/badge"; // Corrected path
import { Button } from "../../../components/ui/button"; // Corrected path
import { AccordionTrigger } from "../../../components/ui/accordion"; // Keep trigger separate
import { getPriorityVariant } from "../../../lib/utils"; // Corrected path
import { Check, CircleDashed, CircleDotDashed, ChevronDown, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

const TaskDisplay = ({ task, onToggleComplete, onEdit, onDelete, isAccordionOpen, hasSubtasks }) => {
  const status = task.status || "todo"; // Default to todo

  // Determine background based on status
  const cardBgClass = status === "completed"
      ? "bg-muted/30 dark:bg-muted/20"
      : "bg-card/80 dark:bg-card/70 backdrop-blur-sm";

  // Determine text color based on status
  const titleClass = status === "completed"
      ? "line-through text-muted-foreground/80 dark:text-muted-foreground/70"
      : "text-foreground dark:text-foreground";

  const descriptionClass = status === "completed"
      ? "text-muted-foreground/70 dark:text-muted-foreground/60"
      : "text-muted-foreground dark:text-muted-foreground";

  return (
    <Card
      className={`border-none shadow-none rounded-none ${cardBgClass} transition-colors duration-300`}
      // Removed hover:shadow-md from here, parent TaskItem handles hover
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          {/* Status toggle button */}
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full p-0 flex-shrink-0 mt-px hover:bg-muted/50 dark:hover:bg-muted/30"
              onClick={onToggleComplete}
              aria-label={status === "todo" ? "Mark as doing" : status === "doing" ? "Mark as completed" : "Mark as todo"}
            >
              {status === "todo" && <CircleDashed className="h-4 w-4 text-muted-foreground" />}
              {status === "doing" && <CircleDotDashed className="h-4 w-4 text-blue-500 animate-spin-slow" />}
              {status === "completed" && <Check className="h-4 w-4 text-green-500" />}
            </Button>
          </motion.div>
          
          {/* Task Title, Description, Meta */}
          <div className="flex-1 min-w-0">
            <h3
              id={`task-title-${task._id}`}
              className={`font-medium text-sm ${titleClass} transition-colors duration-300 break-words pr-16`} // Allow wrapping, add padding for buttons
            >
              {task.title}
            </h3>
            {task.description && (
              <p className={`text-xs mt-1 line-clamp-2 ${descriptionClass} transition-colors duration-300 break-words`}>
                {task.description}
              </p>
            )}
            
            {/* Meta Info (Badges, Due Date) */} 
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-xs">
              {task.priority && (
                <Badge
                  variant={getPriorityVariant(task.priority)}
                  className="text-[10px] px-1.5 py-0 h-5 leading-tight"
                >
                  {task.priority}
                </Badge>
              )}
              
              {task.dueDate && (
                <span className="text-muted-foreground dark:text-muted-foreground text-[11px] flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
              
              {task.project && task.project !== 'Inbox' && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-5 leading-tight bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                >
                  #{task.project}
                </Badge>
              )}
              
              {task.labels && task.labels.length > 0 && (
                  task.labels.slice(0, 3).map((label, index) => ( // Limit displayed labels
                    <Badge key={index} variant="outline" className="text-[10px] px-1.5 py-0 h-5 leading-tight">
                      {label}
                    </Badge>
                  ))
              )}
              {task.labels && task.labels.length > 3 && (
                 <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 leading-tight">...</Badge>
              )}
            </div>
          </div>
          
          {/* Action Buttons & Subtask Indicator */} 
          <div className="absolute top-2 right-2 flex items-center gap-0.5">
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="icon" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground" onClick={onEdit}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="icon" className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500" onClick={onDelete}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </motion.div>
            {/* Subtasks indicator - Conditionally render AccordionTrigger */} 
            {hasSubtasks && (
               <AccordionTrigger 
                 className="p-1 hover:bg-muted/50 dark:hover:bg-muted/30 rounded h-6 w-6 ml-1 data-[state=open]:rotate-180 transition-transform duration-200"
                 aria-label={isAccordionOpen ? "Collapse subtasks" : "Expand subtasks"}
               > 
                 {/* Chevron managed by AccordionTrigger itself */} 
               </AccordionTrigger>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskDisplay;
