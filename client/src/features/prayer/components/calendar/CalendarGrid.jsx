import React from 'react';
import CalendarDayCell from './CalendarDayCell'; // Import the new cell component

const CalendarGrid = ({ 
  calendarDays, 
  calendarData, 
  detailedCalendarData, 
  formatDateKey,
  currentDate,
  isDarkMode
}) => {
  return (
    <div>
      {/* Day headings */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          // day can be null for prefix/suffix days
          const dateKey = day ? formatDateKey(day) : `empty-${index}`;
          const prayerCount = day ? (calendarData[formatDateKey(day)] || 0) : 0;
          const detailedDataForDay = day ? (detailedCalendarData[formatDateKey(day)] || null) : null;
          const isCurrentMonth = day ? day.getMonth() === currentDate.getMonth() : false;
          const isCurrentDay = day ? (
            day.getDate() === new Date().getDate() && 
            day.getMonth() === new Date().getMonth() && 
            day.getFullYear() === new Date().getFullYear()
          ) : false;

          return (
            <CalendarDayCell
              key={dateKey} // Use dateKey or index for key
              day={day} 
              prayerCount={prayerCount}
              detailedDataForDay={detailedDataForDay}
              isCurrentMonth={isCurrentMonth}
              isCurrentDay={isCurrentDay}
              isDarkMode={isDarkMode}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid; 