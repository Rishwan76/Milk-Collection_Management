import { useState } from 'react';
import EntriesTable from '../components/EntriesTable.jsx';
import StatCard from '../components/StatCard.jsx';
import { Loading, ErrorBox } from '../components/Status.jsx';
import { useToast } from '../components/Toast.jsx';
import { downloadExport, getErrorMessage, getRangeReport } from '../services/api.js';
import { inr, num, showDate, todayISO } from '../utils/format.js';

export default function Reports() {
  const notify = useToast();
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(todayISO());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apply = async () => {
    if (!startDate || !endDate) return setError('Select both dates');
    if (startDate > endDate) return setError('Start date cannot be after end date');
    setLoading(true);
    setError('');
    try {
      setReport(await getRangeReport({ startDate, endDate }));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStartDate(todayISO());
    setEndDate(todayISO());
    setReport(null);
    setError('');
  };

  const exportAs = async (type) => {
    try {
      await downloadExport(type, { startDate: report.startDate, endDate: report.endDate });
    } catch (e) {
      notify('Export failed', 'error');
    }
  };

  const s = report?.summary;

  return (
    <>
      <h2 className="no-print">Reports</h2>
      <div className="card filters no-print">
        <div className="field">
          <label htmlFor="start">Start Date</label>
          <input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="end">End Date</label>
          <input id="end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <button className="btn primary" onClick={apply} disabled={loading}>Apply Filter</button>
        <button className="btn" onClick={reset}>Reset Filter</button>
      </div>

      {loading && <Loading />}
      {error && <ErrorBox message={error} />}

      {report && !loading && (
        <div className="print-area">
          <h3 className="print-title">Milk Collection Report: {showDate(report.startDate)} to {showDate(report.endDate)}</h3>
          <div className="stats">
            <StatCard label="Total quantity (L)" value={num(s.totalQuantity)} />
            <StatCard label="Total amount" value={inr(s.totalAmount)} />
            <StatCard label="Entries" value={s.count} />
            <StatCard label="Weighted avg fat %" value={num(s.weightedAvgFat)} />
            <StatCard label="Weighted avg SNF %" value={num(s.weightedAvgSnf)} />
          </div>
          <div className="export-bar no-print">
            <button className="btn" onClick={() => exportAs('excel')}>Export Excel</button>
            <button className="btn" onClick={() => exportAs('csv')}>Export CSV</button>
            <button className="btn" onClick={() => exportAs('pdf')}>Export PDF</button>
            <button className="btn" onClick={() => window.print()}>Print Report</button>
          </div>
          <EntriesTable items={report.records} />
        </div>
      )}
    </>
  );
}
