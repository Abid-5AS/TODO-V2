import React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Adjusted path

const CalendarHeader = ({ 
  currentDate, 
  handlePrevMonth, 
  handleNextMonth, 
  handleCurrentMonth 
}) => {
  return (
    <>
      {/* Calendar Header Row */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold flex items-center text-emerald-700 dark:text-emerald-400">
          <CalendarIcon size={18} className="mr-2" /> Prayer Calendar
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handlePrevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={handleCurrentMonth}
            className="h-8 text-xs px-2"
          >
            Current Month
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleNextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Month Display Row */}
      <div className="text-center mb-4">
        <div className="text-2xl font-bold">
          {format(currentDate, 'MMMM yyyy')}
        </div>
      </div>
    </>
  );
};

export default CalendarHeader; 