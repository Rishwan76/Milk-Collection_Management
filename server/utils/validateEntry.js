const AppError = require('./AppError');
const { parseDateOnly } = require('./dates');

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

function validateEntry(body) {
  const errors = {};
  const data = {};

  try {
    data.collectionDate = parseDateOnly(body.collectionDate, 'Collection date');
  } catch (e) {
    errors.collectionDate = e.message;
  }

  const fields = { quantity: 'Quantity', fat: 'Fat', snf: 'SNF', rate: 'Rate', totalAmount: 'Total amount' };
  for (const [key, label] of Object.entries(fields)) {
    const raw = body[key];
    if (raw === undefined || raw === null || raw === '') {
      errors[key] = `${label} is required`;
      continue;
    }
    const num = Number(raw);
    if (!Number.isFinite(num)) errors[key] = `${label} must be a number`;
    else if (num < 0) errors[key] = `${label} cannot be negative`;
    else data[key] = round2(num);
  }

  if (data.fat !== undefined && data.fat > 100) errors.fat = 'Fat cannot exceed 100';
  if (data.snf !== undefined && data.snf > 100) errors.snf = 'SNF cannot exceed 100';

  if (Object.keys(errors).length) throw new AppError('Validation failed', 400, errors);
  return data;
}

module.exports = { validateEntry, round2 };
