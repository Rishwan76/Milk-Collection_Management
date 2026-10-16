const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const MilkEntry = require('../models/MilkEntry');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const summarize = require('../utils/summary');
const { parseDateOnly, toDateString } = require('../utils/dates');

async function loadReport(query) {
  const { startDate, endDate } = query;
  if (!startDate || !endDate) throw new AppError('startDate and endDate are required', 400);
  const start = parseDateOnly(startDate, 'Start date');
  const end = parseDateOnly(endDate, 'End date');
  if (start > end) throw new AppError('Start date cannot be after end date', 400);
  const match = { collectionDate: { $gte: start, $lte: end } };
  const [records, summary] = await Promise.all([
    MilkEntry.find(match).sort({ collectionDate: 1, createdAt: 1 }).lean(),
    summarize(match)
  ]);
  return { startDate, endDate, records, summary };
}

const header = ['Date', 'Quantity (L)', 'Fat %', 'SNF %', 'Rate (Rs/L)', 'Total Amount (Rs)'];
const rowOf = (r) => [toDateString(r.collectionDate), r.quantity, r.fat, r.snf, r.rate, r.totalAmount];
const summaryRows = (s) => [
  ['Total Quantity (L)', s.totalQuantity],
  ['Total Amount (Rs)', s.totalAmount],
  ['Number of Entries', s.count],
  ['Weighted Avg Fat %', s.weightedAvgFat],
  ['Weighted Avg SNF %', s.weightedAvgSnf]
];

const exportCsv = asyncHandler(async (req, res) => {
  const { startDate, endDate, records, summary } = await loadReport(req.query);
  const lines = [header, ...records.map(rowOf), [], ['Summary'], ...summaryRows(summary)];
  const csv = lines.map((l) => l.join(',')).join('\r\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="milk-report-${startDate}-to-${endDate}.csv"`);
  res.send('\uFEFF' + csv);
});

const exportExcel = asyncHandler(async (req, res) => {
  const { startDate, endDate, records, summary } = await loadReport(req.query);
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Milk Report');
  ws.addRow([`Milk Collection Report: ${startDate} to ${endDate}`]).font = { bold: true, size: 13 };
  ws.addRow([]);
  ws.addRow(header).font = { bold: true };
  records.forEach((r) => ws.addRow(rowOf(r)));
  ws.addRow([]);
  ws.addRow(['Summary']).font = { bold: true };
  summaryRows(summary).forEach((r) => ws.addRow(r));
  ws.columns.forEach((c) => (c.width = 22));
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="milk-report-${startDate}-to-${endDate}.xlsx"`);
  await wb.xlsx.write(res);
  res.end();
});

const exportPdf = asyncHandler(async (req, res) => {
  const { startDate, endDate, records, summary } = await loadReport(req.query);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="milk-report-${startDate}-to-${endDate}.pdf"`);
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  doc.pipe(res);
  doc.fontSize(16).text('Milk Collection Report', { align: 'center' });
  doc.fontSize(10).text(`${startDate} to ${endDate}`, { align: 'center' }).moveDown();

  const xs = [40, 115, 195, 255, 315, 400];
  const drawRow = (cells, bold) => {
    if (doc.y > 760) doc.addPage();
    const y = doc.y;
    doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9);
    cells.forEach((c, i) => doc.text(String(c), xs[i], y, { width: 75 }));
    doc.y = y + 16;
  };
  drawRow(header, true);
  records.forEach((r) => drawRow(rowOf(r), false));
  doc.moveDown().x = 40;
  doc.font('Helvetica-Bold').fontSize(11).text('Summary', 40);
  doc.font('Helvetica').fontSize(10);
  summaryRows(summary).forEach(([k, v]) => doc.text(`${k}: ${v}`, 40));
  doc.end();
});

module.exports = { exportCsv, exportExcel, exportPdf };
