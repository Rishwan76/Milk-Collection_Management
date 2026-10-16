const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

module.exports = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new AppError('Invalid record ID', 400));
  }
  next();
};
