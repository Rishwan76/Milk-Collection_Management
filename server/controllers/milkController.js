const MilkEntry = require('../models/MilkEntry');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { validateEntry } = require('../utils/validateEntry');
const { parseDateOnly } = require('../utils/dates');

const createEntry = asyncHandler(async (req, res) => {
  const data = validateEntry(req.body);
  const entry = await MilkEntry.create(data);
  res.status(201).json({ success: true, data: entry });
});

const getEntries = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const filter = {};

  if (req.query.startDate || req.query.endDate) {
    filter.collectionDate = {};
    if (req.query.startDate) filter.collectionDate.$gte = parseDateOnly(req.query.startDate, 'Start date');
    if (req.query.endDate) filter.collectionDate.$lte = parseDateOnly(req.query.endDate, 'End date');
  }

  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  if (search) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(search)) {
      filter.collectionDate = parseDateOnly(search, 'Search date');
    } else if (Number.isFinite(Number(search))) {
      const n = Number(search);
      filter.$or = ['quantity', 'fat', 'snf', 'rate', 'totalAmount'].map((f) => ({ [f]: n }));
    }
  }

  const [items, total] = await Promise.all([
    MilkEntry.find(filter)
      .sort({ collectionDate: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    MilkEntry.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) }
  });
});

const getEntry = asyncHandler(async (req, res) => {
  const entry = await MilkEntry.findById(req.params.id);
  if (!entry) throw new AppError('Entry not found', 404);
  res.json({ success: true, data: entry });
});

const updateEntry = asyncHandler(async (req, res) => {
  const data = validateEntry(req.body);
  const entry = await MilkEntry.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true
  });
  if (!entry) throw new AppError('Entry not found', 404);
  res.json({ success: true, data: entry });
});

const deleteEntry = asyncHandler(async (req, res) => {
  const entry = await MilkEntry.findByIdAndDelete(req.params.id);
  if (!entry) throw new AppError('Entry not found', 404);
  res.json({ success: true, message: 'Entry deleted' });
});

module.exports = { createEntry, getEntries, getEntry, updateEntry, deleteEntry };
