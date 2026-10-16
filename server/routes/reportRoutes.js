const express = require('express');
const c = require('../controllers/reportController');
const e = require('../controllers/exportController');

const router = express.Router();

router.get('/summary', c.getDashboardSummary);
router.get('/date-range', c.getDateRangeReport);
router.get('/export/csv', e.exportCsv);
router.get('/export/excel', e.exportExcel);
router.get('/export/pdf', e.exportPdf);

module.exports = router;
