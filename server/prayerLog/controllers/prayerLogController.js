const asyncHandler = require("../../utils/asyncHandler");
const { BadRequestError, AppError } = require("../../utils/errorHandler");
const prayerLogService = require("../services/prayerLogService");
const { getStartOfDayUTC, normalizePrayerName } = require("../helpers/prayerLogHelpers");
const { VALID_PRAYER_LOG_STATUSES, ERROR_MESSAGES } = require("../constants");
const moment = require("moment-timezone"); // Keep for month validation

// 1. Log or Update a Prayer Status
exports.logOrUpdatePrayer = asyncHandler(async (req, res, next) => {
  const userId = req.user?.id || req.user?._id;
  if (!userId) {
    return res.status(401).json({ success: false, message: ERROR_MESSAGES.USER_NOT_AUTHENTICATED });
    }

  const { prayer_date: dateString, prayer_name: rawPrayerName, status } = req.body;

    if (!dateString || !rawPrayerName) {
    return res.status(400).json({ success: false, message: ERROR_MESSAGES.MISSING_PRAYER_DATE_OR_NAME });
    }

  const prayerDate = getStartOfDayUTC(dateString);
  const prayerName = normalizePrayerName(rawPrayerName);
  console.log(`[Controller-Debug] Received status from req.body: "${status}" (Type: ${typeof status})`);
  const normalizedStatus = status ? status.toLowerCase() : null;
  console.log(`[Controller-Debug] Normalized status: "${normalizedStatus}"`);

  try {
    if (normalizedStatus && VALID_PRAYER_LOG_STATUSES.includes(normalizedStatus)) {
       console.log(`[Controller] Calling upsertPrayerLog with status: ${normalizedStatus}`);
       const updatedLog = await prayerLogService.upsertPrayerLog(userId, prayerDate, prayerName, normalizedStatus);
       console.log(`[Controller] upsertPrayerLog returned:`, JSON.stringify(updatedLog));
      res.status(200).json({ success: true, data: updatedLog });
    } else {
      console.log(`[Controller-Debug] Status "${normalizedStatus}" failed validation or was null. Proceeding to delete logic.`);
      const deleteResult = await prayerLogService.deletePrayerLog(userId, prayerDate, prayerName);
      const message = deleteResult ? ERROR_MESSAGES.PRAYER_LOG_DELETE_SUCCESS : ERROR_MESSAGES.PRAYER_LOG_DELETE_NOT_FOUND;
      res.status(200).json({ success: true, message: message, data: null });
    }
  } catch (error) {
    if (error.code === 11000) {
          return res.status(409).json({ success: false, message: ERROR_MESSAGES.PRAYER_LOG_CONFLICT });
      } 
    console.error('Error in logOrUpdatePrayer controller:', error);
    next(new AppError(ERROR_MESSAGES.SERVER_ERROR_LOGGING_PRAYER, 500)); // Forward to global handler
  }
});

// 2. Get Prayer Logs for a Specific Day
exports.getDailyLogs = asyncHandler(async (req, res, next) => {
  const userId = req.user?.id || req.user?._id;
  if (!userId) {
    return res.status(401).json({ success: false, message: ERROR_MESSAGES.USER_NOT_AUTHENTICATED });
    }

    const { date: dateString } = req.query;
    if (!dateString) {
    return res.status(400).json({ success: false, message: ERROR_MESSAGES.MISSING_DATE_QUERY });
    }

  try {
      const prayerDate = getStartOfDayUTC(dateString);
      const dailyStatus = await prayerLogService.getLogsForDay(userId, prayerDate);
    res.status(200).json({ success: true, data: dailyStatus });
  } catch (error) {
      console.error('Error in getDailyLogs controller:', error);
      next(new AppError(ERROR_MESSAGES.SERVER_ERROR_FETCHING_DAILY, 500));
  }
});

// 3. Get Monthly Calendar Data (Counts per day)
exports.getMonthlyCalendarData = asyncHandler(async (req, res, next) => {
  const userId = req.user?.id || req.user?._id;
  if (!userId) {
    return res.status(401).json({ success: false, message: ERROR_MESSAGES.USER_NOT_AUTHENTICATED });
    }

  const { month: monthString } = req.query;
    if (!monthString || !/^[0-9]{4}-[0-9]{2}$/.test(monthString)) {
    return res.status(400).json({ success: false, message: ERROR_MESSAGES.INVALID_MONTH_QUERY });
    }

  try {
      const startOfMonth = moment.utc(monthString, 'YYYY-MM').startOf('month').toDate();
      const endOfMonth = moment.utc(monthString, 'YYYY-MM').endOf('month').toDate();
      const { calendarData, detailedData } = await prayerLogService.getCalendarDataForMonth(userId, startOfMonth, endOfMonth);
      res.status(200).json({ success: true, data: calendarData, detailedData: detailedData });
  } catch(error) {
      console.error('Error in getMonthlyCalendarData controller:', error);
      next(new AppError(ERROR_MESSAGES.SERVER_ERROR_FETCHING_CALENDAR, 500));
  }
});

// 4. Get Prayer Statistics (Streaks, Completion Rate)
exports.getPrayerStats = asyncHandler(async (req, res, next) => {
  const userId = req.user?.id || req.user?._id;
  if (!userId) {
    return res.status(401).json({ success: false, message: ERROR_MESSAGES.USER_NOT_AUTHENTICATED });
      }
  
  try {
      const stats = await prayerLogService.getUserPrayerStats(userId);
      res.status(200).json({ success: true, data: stats });
  } catch (error) {
      console.error('Error in getPrayerStats controller:', error);
      next(new AppError(ERROR_MESSAGES.SERVER_ERROR_CALCULATING_STATS, 500));
  }
});
