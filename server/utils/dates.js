const AppError = require('./AppError');

function parseDateOnly(value, label = 'Date') {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new AppError(`${label} must be in YYYY-MM-DD format`, 400);
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new AppError(`${label} is not a valid date`, 400);
  }
  return date;
}

function todayString() {
  const tz = process.env.APP_TIMEZONE || 'Asia/Kolkata';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

function toDateString(date) {
  return new Date(date).toISOString().slice(0, 10);
}

module.exports = { parseDateOnly, todayString, toDateString };
