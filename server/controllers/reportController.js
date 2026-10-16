const MilkEntry = require('../models/MilkEntry');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const summarize = require('../utils/summary');
const { parseDateOnly, todayString } = require('../utils/dates');

const getDashboardSummary = asyncHandler(async (req, res) => {
  const today = todayString();
  const summary = await summarize({ collectionDate: parseDateOnly(today) });
  res.json({ success: true, data: { date: today, ...summary } });
});

const getDateRangeReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) throw new AppError('startDate and endDate are required', 400);

  const start = parseDateOnly(startDate, 'Start date');
  const end = parseDateOnly(endDate, 'End date');
  if (start > end) throw new AppError('Start date cannot be after end date', 400);

  const match = { collectionDate: { $gte: start, $lte: end } };
  const [records, summary] = await Promise.all([
    MilkEntry.find(match).sort({ collectionDate: 1, createdAt: 1 }).lean(),
    summarize(match)
  ]);

  res.json({ success: true, data: { startDate, endDate, records, summary } });
});

module.exports = { getDashboardSummary, getDateRangeReport };
