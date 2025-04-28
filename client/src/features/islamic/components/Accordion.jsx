import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

const Accordion = ({ title, icon, children, defaultOpen = false, className = "" }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className={`glass-card rounded-lg shadow-md overflow-hidden ${className}`}>
      <div 
        className="flex justify-between items-center p-4 cursor-pointer bg-gradient-to-r from-slate-50/80 to-slate-100/80 dark:from-slate-800/80 dark:to-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          {icon}
          <h2 className="text-lg font-semibold ml-2 text-slate-800 dark:text-white">{title}</h2>
        </div>
        {isOpen ? 
          <ChevronUp className="h-5 w-5 text-slate-500 dark:text-slate-400" /> : 
          <ChevronDown className="h-5 w-5 text-slate-500 dark:text-slate-400" />
        }
      </div>
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="p-4">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default Accordion; 