const PrayerLog = require('../models/PrayerLog');
const mongoose = require('mongoose');
const moment = require('moment-timezone'); // Use moment-timezone for reliable date handling

// Helper to get the start of the day in UTC for consistent storage
const getStartOfDayUTC = (dateString) => {
  // Assume dateString is YYYY-MM-DD
  // Convert to UTC start of that day to avoid timezone issues in DB queries
  return moment.utc(dateString, 'YYYY-MM-DD').startOf('day').toDate();
};

// Helper to normalize prayer names (optional, if input might vary)
const normalizePrayerName = (name) => {
  const lowerCaseName = name.toLowerCase();
  if (lowerCaseName === 'fajr') return 'Fajr';
  if (lowerCaseName === 'dhuhr') return 'Dhuhr';
  if (lowerCaseName === 'asr') return 'Asr';
  if (lowerCaseName === 'maghrib') return 'Maghrib';
  if (lowerCaseName === 'isha') return 'Isha';
  return name; // Return original if not recognized
};

// 1. Log or Update a Prayer Status
exports.logOrUpdatePrayer = async (req, res) => {
  try {
    // !!! IMPORTANT: Get user_id from authenticated session/token
    // const user_id = req.user._id; // Example: Assuming req.user is populated by auth middleware
    const user_id = req.user?.id || req.user?._id; // Adjust based on your auth setup
    if (!user_id) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { prayer_date: dateString, prayer_name: rawPrayerName, status } = req.body;

    if (!dateString || !rawPrayerName) {
      return res.status(400).json({ success: false, message: 'Missing prayer_date or prayer_name' });
    }

    const prayer_date = getStartOfDayUTC(dateString);
    const prayer_name = normalizePrayerName(rawPrayerName);
    
    // Make status validation case-insensitive
    const validStatuses = ['completed', 'missed', 'excused'];
    // Normalize the status string to lowercase for comparison
    const normalizedStatus = status ? status.toLowerCase() : '';
    
    // Use the capitalized status for DB storage if valid, otherwise default to "Completed"
    const finalStatus = normalizedStatus && validStatuses.includes(normalizedStatus) 
        ? normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1) 
        : 'Completed';
    
    console.log(`[prayerLogController] Processing status: input=${status}, normalized=${normalizedStatus}, final=${finalStatus}`);

    const logData = {
      user_id,
      prayer_date,
      prayer_name,
      status: finalStatus,
      updated_at: Date.now(), // Manually set update time
    };

    // Use findOneAndUpdate with upsert: create if not exists, update if exists
    const updatedLog = await PrayerLog.findOneAndUpdate(
      { user_id, prayer_date, prayer_name }, // Find criteria
      { $set: { status: finalStatus, updated_at: Date.now() }, $setOnInsert: { user_id, prayer_date, prayer_name, created_at: Date.now() } }, // Update specific fields, set others on insert
      { new: true, upsert: true, runValidators: true } // Options: return updated doc, create if not found, run schema validation
    );

    res.status(200).json({ success: true, data: updatedLog });

  } catch (error) {
    console.error('Error logging prayer:', error);
    // Handle potential duplicate key error if upsert fails unexpectedly (though it shouldn't with correct usage)
    if (error.code === 11000) {
        return res.status(409).json({ success: false, message: 'Conflict: Prayer log entry might already exist (concurrent update issue).' });
    }
    res.status(500).json({ success: false, message: 'Server error logging prayer', error: error.message });
  }
};

// 2. Get Prayer Logs for a Specific Day
exports.getDailyLogs = async (req, res) => {
  try {
    // const user_id = req.user._id; // Get from auth
    const user_id = req.user?.id || req.user?._id;
     if (!user_id) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const { date: dateString } = req.query;

    if (!dateString) {
      return res.status(400).json({ success: false, message: 'Missing date query parameter' });
    }

    const prayer_date = getStartOfDayUTC(dateString);

    const logs = await PrayerLog.find({
      user_id,
      prayer_date,
    }).select('prayer_name status'); // Select only needed fields

    // Format for easier frontend use (map prayer names to status)
    const dailyStatus = {
        Fajr: null,
        Dhuhr: null,
        Asr: null,
        Maghrib: null,
        Isha: null
    };
    logs.forEach(log => {
        if (dailyStatus.hasOwnProperty(log.prayer_name)) {
            dailyStatus[log.prayer_name] = log.status;
        }
    });

    res.status(200).json({ success: true, data: dailyStatus });

  } catch (error) {
    console.error('Error fetching daily logs:', error);
    res.status(500).json({ success: false, message: 'Server error fetching daily logs', error: error.message });
  }
};

// 3. Get Monthly Calendar Data (Counts per day)
exports.getMonthlyCalendarData = async (req, res) => {
  try {
    // const user_id = req.user._id; // Get from auth
    const user_id = req.user?.id || req.user?._id;
    if (!user_id) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { month: monthString } = req.query; // Expecting YYYY-MM format

    if (!monthString || !/^[0-9]{4}-[0-9]{2}$/.test(monthString)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing month query parameter (YYYY-MM)' });
    }

    const startOfMonth = moment.utc(monthString, 'YYYY-MM').startOf('month').toDate();
    const endOfMonth = moment.utc(monthString, 'YYYY-MM').endOf('month').toDate();

    // First, get total counts per day (for backward compatibility)
    const countResults = await PrayerLog.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(user_id), // Ensure user_id is ObjectId
          prayer_date: { $gte: startOfMonth, $lte: endOfMonth },
          status: 'Completed', // Only count completed prayers for the calendar heatmap
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$prayer_date', timezone: 'UTC' } }, // Group by date string (YYYY-MM-DD)
          count: { $sum: 1 }, // Count prayers per day
        },
      },
      {
        $project: {
          _id: 0, // Remove the default _id field
          date: '$_id',
          count: 1,
        },
      },
       {
         $sort: { date: 1 } // Sort by date ascending
       }
    ]);

    // Now, get detailed prayer type information per day
    const detailedResults = await PrayerLog.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(user_id),
          prayer_date: { $gte: startOfMonth, $lte: endOfMonth },
          status: 'Completed',
        },
      },
      {
        $group: {
          _id: { 
            date: { $dateToString: { format: '%Y-%m-%d', date: '$prayer_date', timezone: 'UTC' } },
            prayer: '$prayer_name'
          },
          count: { $sum: 1 },
        }
      },
      {
        $group: {
          _id: '$_id.date',
          prayers: { 
            $push: { 
              prayer: '$_id.prayer', 
              count: '$count' 
            } 
          }
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          prayers: 1
        }
      },
      {
        $sort: { date: 1 }
      }
    ]);

    // Convert array result to a map { 'YYYY-MM-DD': count }
    const calendarData = countResults.reduce((acc, day) => {
      acc[day.date] = day.count;
      return acc;
    }, {});

    // Create detailed prayer map
    const detailedData = detailedResults.reduce((acc, day) => {
      // Convert prayer array to object for easier access
      const prayerObj = {};
      day.prayers.forEach(p => {
        prayerObj[p.prayer] = p.count;
      });
      
      acc[day.date] = prayerObj;
      return acc;
    }, {});

    res.status(200).json({ 
      success: true, 
      data: calendarData,
      detailedData: detailedData
    });

  } catch (error) {
    console.error('Error fetching monthly calendar data:', error);
    res.status(500).json({ success: false, message: 'Server error fetching calendar data', error: error.message });
  }
};

// 4. Get Prayer Statistics (Streaks, Completion Rate)
exports.getPrayerStats = async (req, res) => {
  try {
    // const user_id = req.user._id; // Get from auth
    const user_id = req.user?.id || req.user?._id;
    if (!user_id) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Get today's and yesterday's date strings for comparison
    const now = moment.utc();
    const todayStr = now.format('YYYY-MM-DD');
    const yesterdayStr = moment.utc().subtract(1, 'days').format('YYYY-MM-DD');
    
    // Calculate current hour in UTC to determine if we're early in the day
    const currentHourUTC = now.hour();
    const isEarlyInDay = currentHourUTC < 12; // Before noon UTC

    // Fetch all 'Completed' logs for the user, grouped by date, sorted
    const dailyCounts = await PrayerLog.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(user_id),
          status: 'Completed',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$prayer_date', timezone: 'UTC' } },
          count: { $sum: 1 },
          prayers: { $push: "$prayer_name" },
        },
      },
      {
        $sort: { _id: 1 }, // Sort by date ASC ('YYYY-MM-DD')
      },
      {
          $project: {
              _id: 0,
              date: '$_id',
              count: 1,
              prayers: 1,
          }
      }
    ]);

    // Calculate streaks and total
    let currentStreak = 0;
    let longestStreak = 0;
    let tempCurrentStreak = 0;
    let previousDate = null;
    let totalPrayersLogged = 0; // Note: This only counts prayers with 'Completed' status, not 'Missed' ones
    let daysWithAllPrayers = 0;
    let totalDaysLogged = 0;
    let fajrCount = 0;
    let dhuhrCount = 0;
    let asrCount = 0;
    let maghribCount = 0;
    let ishaCount = 0;

    // Check if we have entries for all days
    const dateEntries = new Map();
    dailyCounts.forEach(day => {
      dateEntries.set(day.date, {
        count: day.count,
        prayers: day.prayers,
      });
      // Increment the total prayers logged by the count of completed prayers for this day
      // 'Missed' prayers do not contribute to this count as we only fetched 'Completed' prayers in the aggregation above
      totalPrayersLogged += day.count; 
      totalDaysLogged++;
      
      // Count prayer types
      if (day.prayers) {
        day.prayers.forEach(prayer => {
          const prayerLower = prayer.toLowerCase();
          if (prayerLower === 'fajr') fajrCount++;
          else if (prayerLower === 'dhuhr') dhuhrCount++;
          else if (prayerLower === 'asr') asrCount++;
          else if (prayerLower === 'maghrib') maghribCount++;
          else if (prayerLower === 'isha') ishaCount++;
        });
      }
    });

    // Process dates in ascending order
    const sortedDates = Array.from(dateEntries.keys()).sort();
    
    // Check if all 5 prayers are completed
    const hasAllFivePrayers = (date) => {
      const entry = dateEntries.get(date);
      if (!entry) return false;
      
      // Simple count check
      if (entry.count >= 5) return true;
      
      // For more accuracy, we could check that all 5 prayer names are present
      // This handles duplicate entries for the same prayer
      const prayers = entry.prayers || [];
      const uniquePrayers = new Set(prayers.map(p => p.toLowerCase()));
      const requiredPrayers = new Set(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']);
      
      // Check if all required prayers are in the uniquePrayers set
      for (const prayer of requiredPrayers) {
        if (!uniquePrayers.has(prayer)) return false;
      }
      
      return true;
    };
    
    for (let i = 0; i < sortedDates.length; i++) {
      const dateStr = sortedDates[i];
      
      // Consider a day complete only if all 5 prayers are logged
      const isCompletedDay = hasAllFivePrayers(dateStr);
      
      if (isCompletedDay) {
        daysWithAllPrayers++;
      }
      
      if (!isCompletedDay) {
        // Reset streak on incomplete days
        tempCurrentStreak = 0;
        continue;
      }
      
      if (previousDate === null) {
        // First completed day
        tempCurrentStreak = 1;
      } else {
        // Check if this date is consecutive with the previous one
        const currentDate = moment.utc(dateStr, 'YYYY-MM-DD');
        const prevDate = moment.utc(previousDate, 'YYYY-MM-DD');
        
        if (currentDate.diff(prevDate, 'days') === 1) {
          // Consecutive day
          tempCurrentStreak++;
        } else {
          // Non-consecutive day, reset streak
          tempCurrentStreak = 1;
        }
      }
      
      // Update longest streak if current temporary streak is longer
      if (tempCurrentStreak > longestStreak) {
        longestStreak = tempCurrentStreak;
      }
      
      // Update previous date
      previousDate = dateStr;
    }
    
    // Determine current streak based on the final temp streak
    
    // If last logged day was yesterday or today, current streak is temp streak
    const lastLoggedDate = sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null;
    
    if (lastLoggedDate === todayStr && hasAllFivePrayers(todayStr)) {
      // Today is logged with all 5 prayers
      currentStreak = tempCurrentStreak;
    } 
    else if (lastLoggedDate === yesterdayStr && hasAllFivePrayers(yesterdayStr)) {
      // Yesterday is the last logged day with all 5 prayers
      // If it's early in the day, don't break the streak yet
      if (isEarlyInDay) {
        // It's early, so give them the benefit of the doubt
        currentStreak = tempCurrentStreak;
      } else {
        // Get partial data for today
        const todayEntry = dateEntries.get(todayStr);
        const todayCount = todayEntry ? todayEntry.count : 0;
        
        // If they've logged any prayers today, maintain streak
        // This allows for partial completion while the day is still in progress
        if (todayCount > 0) {
          currentStreak = tempCurrentStreak;
        } else {
          // No activity today and it's late in the day - streak may be at risk
          currentStreak = tempCurrentStreak;
        }
      }
    } 
    else if (lastLoggedDate && moment.utc(lastLoggedDate, 'YYYY-MM-DD').isBefore(moment.utc(yesterdayStr, 'YYYY-MM-DD'))) {
      // Last logged day is before yesterday, streak is broken
      currentStreak = 0;
    }
    
    // Calculate completion rates and percentages
    const perfectDayPercentage = totalDaysLogged > 0 
      ? Math.round((daysWithAllPrayers / totalDaysLogged) * 100) 
      : 0;
      
    // Calculate per-prayer completion rates
    const prayerCompletionStats = {
      Fajr: fajrCount,
      Dhuhr: dhuhrCount,
      Asr: asrCount,
      Maghrib: maghribCount,
      Isha: ishaCount
    };
    
    res.status(200).json({
      success: true,
      data: {
        currentStreak,
        longestStreak,
        totalPrayersLogged,
        totalDaysLogged,
        daysWithAllPrayers,
        perfectDayPercentage,
        prayerCompletionStats
      },
    });
  } catch (error) {
    console.error('Error calculating prayer stats:', error);
    res.status(500).json({ success: false, message: 'Server error calculating prayer stats', error: error.message });
  }
}; 