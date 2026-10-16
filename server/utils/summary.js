const MilkEntry = require('../models/MilkEntry');
const { round2 } = require('./validateEntry');

async function summarize(match) {
  const [row] = await MilkEntry.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalQuantity: { $sum: '$quantity' },
        totalAmount: { $sum: '$totalAmount' },
        count: { $sum: 1 },
        sumQtyFat: { $sum: { $multiply: ['$quantity', '$fat'] } },
        sumQtySnf: { $sum: { $multiply: ['$quantity', '$snf'] } }
      }
    }
  ]);

  if (!row) {
    return { totalQuantity: 0, totalAmount: 0, count: 0, weightedAvgFat: 0, weightedAvgSnf: 0 };
  }
  const q = row.totalQuantity;
  return {
    totalQuantity: round2(q),
    totalAmount: round2(row.totalAmount),
    count: row.count,
    weightedAvgFat: q > 0 ? round2(row.sumQtyFat / q) : 0,
    weightedAvgSnf: q > 0 ? round2(row.sumQtySnf / q) : 0
  };
}

module.exports = summarize;
