const moment = require("moment-timezone");
const { REQUIRED_PRAYERS } = require("../constants");

exports.getStartOfDayUTC = (dateString) => {
  return moment.utc(dateString, "YYYY-MM-DD").startOf("day").toDate();
};

exports.normalizePrayerName = (name) => {
  const lowerCaseName = name ? name.toLowerCase() : "";
  for (const prayer of REQUIRED_PRAYERS) {
      if (lowerCaseName === prayer.toLowerCase()) {
          return prayer;
      }
  }
  return name; // Return original if not recognized
};

const hasAllFivePrayers = (dayData) => {
    if (!dayData || !dayData.prayers) return false;
    // Use count based on unique prayers from aggregation
    return dayData.count >= REQUIRED_PRAYERS.length;

    // // Alternate check: Ensure all required prayer names are present
    // const uniquePrayers = new Set(dayData.prayers.map(p => p.toLowerCase()));
    // const requiredSet = new Set(REQUIRED_PRAYERS.map(p => p.toLowerCase()));
    // for (const prayer of requiredSet) {
    //   if (!uniquePrayers.has(prayer)) return false;
    // }
    // return true;
  };

exports.calculateStreaksAndStats = (dailyCounts) => {
    let currentStreak = 0;
    let longestStreak = 0;
    let tempCurrentStreak = 0;
    let previousDate = null;
    let totalPrayersLogged = 0;
    let daysWithAllPrayers = 0;
    let totalDaysLogged = dailyCounts.length;
    const prayerCounts = REQUIRED_PRAYERS.reduce((acc, p) => ({ ...acc, [p]: 0 }), {});

    const dateEntries = new Map();
    dailyCounts.forEach((day) => {
        dateEntries.set(day.date, {
            count: day.count, // Count of unique completed prayers
            prayers: day.prayers, // Array of unique completed prayers
        });
        totalPrayersLogged += day.count;

        // Count individual prayers
        day.prayers.forEach(prayer => {
            if (prayerCounts.hasOwnProperty(prayer)) {
                prayerCounts[prayer]++;
            }
        });
    });

    const sortedDates = Array.from(dateEntries.keys()).sort();

    for (const dateStr of sortedDates) {
        const dayData = dateEntries.get(dateStr);
        const isCompletedDay = hasAllFivePrayers(dayData);

        if (isCompletedDay) {
            daysWithAllPrayers++;
            if (previousDate === null) {
                tempCurrentStreak = 1;
            } else {
                const currentDate = moment.utc(dateStr, "YYYY-MM-DD");
                const prevDate = moment.utc(previousDate, "YYYY-MM-DD");
                if (currentDate.diff(prevDate, "days") === 1) {
                    tempCurrentStreak++;
                } else {
                    tempCurrentStreak = 1;
                }
            }
            longestStreak = Math.max(longestStreak, tempCurrentStreak);
            previousDate = dateStr;
        } else {
            tempCurrentStreak = 0;
            // Don't reset previousDate here, allow streak to resume later
        }
    }

    // Final check for current streak
    const now = moment.utc();
    const todayStr = now.format("YYYY-MM-DD");
    const yesterdayStr = now.subtract(1, "days").format("YYYY-MM-DD"); // Corrected: subtract from 'now'
    
    // Get data for today and yesterday if they exist
    const todayData = dateEntries.get(todayStr);
    const yesterdayData = dateEntries.get(yesterdayStr);

    const isTodayComplete = todayData ? hasAllFivePrayers(todayData) : false;
    const isYesterdayComplete = yesterdayData ? hasAllFivePrayers(yesterdayData) : false;
    
    // Determine the correct current streak value at the *end* of the loop
    const finalTempStreakValue = tempCurrentStreak; 

    if (isTodayComplete) {
        // If today is complete, the streak calculated by the loop (finalTempStreakValue) is correct.
        currentStreak = finalTempStreakValue;
    } else if (isYesterdayComplete) {
        // If today is NOT complete, but yesterday WAS complete,
        // the current streak is the value the streak had *after processing yesterday*.
        // We need to recalculate or store this value. Let's recalculate for simplicity.
        
        // Recalculate streak up to yesterday
        let streakUpToYesterday = 0;
        let prevDateStr = null;
        for (const dateStr of sortedDates) {
            if (dateStr > yesterdayStr) break; // Stop after yesterday
            
            const dayData = dateEntries.get(dateStr);
            const isCompleted = hasAllFivePrayers(dayData);
            
            if (isCompleted) {
                if (prevDateStr === null) {
                    streakUpToYesterday = 1;
                } else {
                    const currentDt = moment.utc(dateStr, "YYYY-MM-DD");
                    const prevDt = moment.utc(prevDateStr, "YYYY-MM-DD");
                    if (currentDt.diff(prevDt, "days") === 1) {
                        streakUpToYesterday++;
                    } else {
                        streakUpToYesterday = 1; // Gap in streak
                    }
                }
                prevDateStr = dateStr;
            } else {
                streakUpToYesterday = 0; // Streak broken before yesterday
                prevDateStr = dateStr; // Still update prevDateStr to check for gaps
            }
        }
        
        // Only assign if the last day processed WAS yesterday and it was complete
        if (prevDateStr === yesterdayStr && isYesterdayComplete) {
             currentStreak = streakUpToYesterday;
        } else {
             currentStreak = 0; // Streak was already broken before yesterday
        }

    } else {
        // If today is not complete AND yesterday was not complete, the streak is 0.
        currentStreak = 0;
    }

    // Ensure longestStreak captured the value correctly
    // longestStreak = Math.max(longestStreak, currentStreak); // Re-evaluate if needed

    const perfectDayPercentage = totalDaysLogged > 0
        ? Math.round((daysWithAllPrayers / totalDaysLogged) * 100)
        : 0;

    return {
        currentStreak,
        longestStreak,
        totalPrayersLogged,
        totalDaysLogged,
        daysWithAllPrayers,
        perfectDayPercentage,
        prayerCompletionStats: prayerCounts,
    };
};

module.exports.hasAllFivePrayers = hasAllFivePrayers; // Export if needed elsewhere 