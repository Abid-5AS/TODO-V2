const PrayerLog = require("../models/PrayerLog");
const mongoose = require("mongoose");
const moment = require("moment-timezone");
const { calculateStreaksAndStats } = require("../helpers/prayerLogHelpers");
const { REQUIRED_PRAYERS, VALID_PRAYER_LOG_STATUSES } = require("../constants");

exports.upsertPrayerLog = async (userId, prayerDate, prayerName, status) => {
  const finalStatus = status.charAt(0).toUpperCase() + status.slice(1);
  console.log(`[Service-Debug] Attempting to set status to: ${finalStatus} for ${prayerName} on ${prayerDate.toISOString()}`);

  try {
    let logEntry = await PrayerLog.findOne({
      user_id: userId,
      prayer_date: prayerDate,
      prayer_name: prayerName,
    });

    if (logEntry) {
      // Entry exists, update status
      console.log(`[Service-Debug] Found existing entry. Current status: ${logEntry.status}. Setting to: ${finalStatus}`);
      logEntry.status = finalStatus;
      logEntry.updated_at = Date.now();
    } else {
      // Entry doesn't exist, create new one
      console.log(`[Service-Debug] No existing entry found. Creating new entry with status: ${finalStatus}`);
      logEntry = new PrayerLog({
        user_id: userId,
        prayer_date: prayerDate,
        prayer_name: prayerName,
        status: finalStatus, // Set status directly
        created_at: Date.now(),
        updated_at: Date.now(),
      });
    }

    const savedLog = await logEntry.save(); // Explicit save
    console.log(`[Service-Debug] Document after save():`, JSON.stringify(savedLog));
    return savedLog;

  } catch (error) {
    console.error("[Service-Debug] Error during find/save:", error);
    throw error; // Re-throw error to be caught by controller
  }
};

exports.deletePrayerLog = async (userId, prayerDate, prayerName) => {
  return await PrayerLog.findOneAndDelete({ user_id: userId, prayer_date: prayerDate, prayer_name: prayerName });
};

exports.getLogsForDay = async (userId, prayerDate) => {
  const logs = await PrayerLog.find({
    user_id: userId,
    prayer_date: prayerDate,
  }).select("prayer_name status");

  const dailyStatus = REQUIRED_PRAYERS.reduce((acc, prayer) => {
      acc[prayer] = null;
      return acc;
  }, {});

  logs.forEach((log) => {
    if (dailyStatus.hasOwnProperty(log.prayer_name)) {
      dailyStatus[log.prayer_name] = log.status;
    }
  });
  return dailyStatus;
};

exports.getCalendarDataForMonth = async (userId, startOfMonth, endOfMonth) => {
   // Count completed prayers per day
   const countResults = await PrayerLog.aggregate([
    {
      $match: {
        user_id: new mongoose.Types.ObjectId(userId),
        prayer_date: { $gte: startOfMonth, $lte: endOfMonth },
        status: "Completed",
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$prayer_date", timezone: "UTC" } },
        count: { $sum: 1 },
      },
    },
    {
      $project: { _id: 0, date: "$_id", count: 1 },
    },
    { $sort: { date: 1 } },
  ]);

  // Get detailed prayers completed per day
  const detailedResults = await PrayerLog.aggregate([
    {
      $match: {
        user_id: new mongoose.Types.ObjectId(userId),
        prayer_date: { $gte: startOfMonth, $lte: endOfMonth },
        status: "Completed",
      },
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$prayer_date", timezone: "UTC" } },
          prayer: "$prayer_name",
        },
        count: { $sum: 1 }, // Should always be 1 if no duplicates
      },
    },
    {
      $group: {
        _id: "$_id.date",
        prayers: { $push: { prayer: "$_id.prayer" } }, // Just push the prayer name
      },
    },
    {
      $project: { _id: 0, date: "$_id", prayers: 1 },
    },
    { $sort: { date: 1 } },
  ]);

  // Format results
  const calendarData = countResults.reduce((acc, day) => {
    acc[day.date] = day.count;
    return acc;
  }, {});

  const detailedData = detailedResults.reduce((acc, day) => {
    acc[day.date] = day.prayers.reduce((prayerMap, p) => {
        prayerMap[p.prayer] = "Completed"; // <-- Return the status string
        return prayerMap;
    }, {});
    return acc;
  }, {});

  return { calendarData, detailedData };
};

exports.getUserPrayerStats = async (userId) => {
    const dailyCounts = await PrayerLog.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(userId),
          status: "Completed",
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$prayer_date", timezone: "UTC" } },
          prayers: { $addToSet: "$prayer_name" }, // Use $addToSet to get unique prayers
        },
      },
      {
        $project: {
            _id: 0,
            date: "$_id",
            prayers: 1,
            count: { $size: "$prayers" } // Calculate count based on unique prayers
        }
      },
      {
        $sort: { date: 1 },
      },
    ]);

    return calculateStreaksAndStats(dailyCounts);
}; 