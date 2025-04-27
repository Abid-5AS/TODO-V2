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
    const validStatus = ['Completed', 'Missed', 'Excused'];
    const finalStatus = status && validStatus.includes(status) ? status : 'Completed';

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

    const results = await PrayerLog.aggregate([
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

    // Convert array result to a map { 'YYYY-MM-DD': count }
    const calendarData = results.reduce((acc, day) => {
      acc[day.date] = day.count;
      return acc;
    }, {});

    res.status(200).json({ success: true, data: calendarData });

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
        },
      },
      {
        $sort: { _id: 1 }, // Sort by date ASC ('YYYY-MM-DD')
      },
      {
          $project: {
              _id: 0,
              date: '$_id',
              count: 1
          }
      }
    ]);

    // Calculate streaks and total
    let currentStreak = 0;
    let longestStreak = 0;
    let tempCurrentStreak = 0;
    let previousDate = null;
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
    let totalPrayersLogged = 0;

    // Get today's date string (UTC) for comparison
    const todayStr = moment.utc().format('YYYY-MM-DD');

    dailyCounts.forEach((day) => {
      totalPrayersLogged += day.count;

      if (day.count >= 5) { // Consider a day as part of a streak if 5 prayers are completed
        const currentDate = moment.utc(day.date, 'YYYY-MM-DD');
        
        if (previousDate && currentDate.diff(previousDate, 'days') === 1) {
          // Consecutive day
          tempCurrentStreak++;
        } else {
          // Streak broken or first day of potential streak
          tempCurrentStreak = 1;
        }

        if (tempCurrentStreak > longestStreak) {
          longestStreak = tempCurrentStreak;
        }
        previousDate = currentDate;

        // Check if this potential streak includes today
        if (day.date === todayStr) {
          currentStreak = tempCurrentStreak;
        } else {
            // If the last day in the loop wasn't today, check if yesterday was the end of the streak
             const yesterdayStr = moment.utc().subtract(1, 'days').format('YYYY-MM-DD');
             if(day.date === yesterdayStr) {
                 currentStreak = tempCurrentStreak;
             } else {
                 // If the loop finishes and the last day wasn't today or yesterday, the current streak is 0
                 // unless the last iteration updated it.
                 // We need to check if the very *last* day processed was yesterday to confirm the streak.
                 if (dailyCounts.indexOf(day) === dailyCounts.length - 1 && day.date !== todayStr) {
                    // If the last logged day isn't today, the current streak running up *to* today is 0
                    // unless the last day *was* yesterday.
                    if (day.date !== yesterdayStr) {
                        currentStreak = 0;
                    }
                 }
             }
        }

      } else {
        // Day with < 5 prayers breaks the streak
        tempCurrentStreak = 0;
        previousDate = moment.utc(day.date, 'YYYY-MM-DD'); // Still update previousDate
        // If today breaks the streak, currentStreak becomes 0
        if (day.date === todayStr) {
            currentStreak = 0;
        }
      }
    });

    // Final check: if the loop ended, and the last day wasn't today, the current streak is 0
    // (unless it was yesterday, handled above)
    if (dailyCounts.length > 0 && dailyCounts[dailyCounts.length - 1].date !== todayStr && currentStreak !== 0) {
       const lastDate = moment.utc(dailyCounts[dailyCounts.length - 1].date, 'YYYY-MM-DD');
       if (moment.utc().diff(lastDate, 'days') > 1) {
            currentStreak = 0;
       }
    }
    // If there are no logs at all, current streak is 0
    if (dailyCounts.length === 0) {
        currentStreak = 0;
    }


    // Note: Completion Rate calculation is complex. What's the denominator?
    // Option 1: Total days since first log? Might be inaccurate if user skipped days.
    // Option 2: Total prayers possible since first log (days * 5)? Better but assumes consistent usage.
    // Let's omit completion rate for now unless a clear definition is provided.

    res.status(200).json({
      success: true,
      data: {
        currentStreak,
        longestStreak,
        totalPrayersLogged,
        // completionRate: /* Add logic if defined */
      },
    });

  } catch (error) {
    console.error('Error fetching prayer stats:', error);
    res.status(500).json({ success: false, message: 'Server error fetching prayer stats', error: error.message });
  }
}; 