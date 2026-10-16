const mongoose = require('mongoose');

const nonNegative = (label) => ({
  type: Number,
  required: [true, `${label} is required`],
  min: [0, `${label} cannot be negative`]
});

const milkEntrySchema = new mongoose.Schema(
  {
    collectionDate: { type: Date, required: [true, 'Collection date is required'], index: true },
    quantity: nonNegative('Quantity'),
    fat: nonNegative('Fat'),
    snf: nonNegative('SNF'),
    rate: nonNegative('Rate'),
    totalAmount: nonNegative('Total amount')
  },
  { timestamps: true, collection: 'milkEntries' }
);

module.exports = mongoose.model('MilkEntry', milkEntrySchema);
