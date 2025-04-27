import React from "react";
import { Moon, Star } from "lucide-react";
import { motion } from "framer-motion";

const IslamicCalendarSection = ({ islamicDate, itemVariants }) => {
  return (
    <motion.section variants={itemVariants}>
      <div className="glass-card h-full p-5 rounded-lg shadow-md border border-primary/20">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Moon size={18} className="mr-2" /> Islamic Calendar
        </h2>

        <div className="flex flex-col items-center mb-4">
          <div className="text-2xl font-bold text-primary mb-1">
            {islamicDate.date}
          </div>
          <div className="text-sm text-muted-foreground">
            {islamicDate.gregorian}
          </div>
        </div>

        <div className="bg-primary/5 p-3 rounded-lg mb-4">
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <Star size={14} className="mr-2 text-amber-500" /> Upcoming Events
          </h3>
          <div className="space-y-2">
            {islamicDate.upcomingEvents.map((event, idx) => (
              <div
                key={`${event.name}-${idx}`}
                className="flex justify-between items-center"
              >
                <span className="text-sm">{event.name}</span>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-medium">{event.date}</span>
                  <span className="text-xs text-muted-foreground">
                    {typeof event.daysLeft === "number"
                      ? `${event.daysLeft} days left`
                      : event.daysLeft}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Hijri Year */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm">Current Hijri Year</span>
            <span className="font-bold">{islamicDate.hijriYear} AH</span>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default IslamicCalendarSection;
