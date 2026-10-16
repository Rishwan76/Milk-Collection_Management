import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard.jsx';
import EntriesTable from '../components/EntriesTable.jsx';
import { Loading, ErrorBox } from '../components/Status.jsx';
import { useToast } from '../components/Toast.jsx';
import { deleteEntry, getEntries, getErrorMessage, getSummary } from '../services/api.js';
import { inr, num } from '../utils/format.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const notify = useToast();
  const [summary, setSummary] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [s, list] = await Promise.all([getSummary(), getEntries({ page: 1, limit: 5 })]);
      setSummary(s);
      setItems(list.data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (row) => {
    if (!window.confirm('Delete this record? This cannot be undone.')) return;
    try {
      await deleteEntry(row._id);
      notify('Entry deleted');
      load();
    } catch (e) {
      notify(getErrorMessage(e), 'error');
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorBox message={error} onRetry={load} />;

  return (
    <>
      <h2>Dashboard</h2>
      <div className="stats">
        <StatCard label="Quantity today (L)" value={num(summary.totalQuantity)} />
        <StatCard label="Amount today" value={inr(summary.totalAmount)} />
        <StatCard label="Records today" value={summary.count} />
        <StatCard label="Average fat %" value={num(summary.weightedAvgFat)} />
        <StatCard label="Average SNF %" value={num(summary.weightedAvgSnf)} />
      </div>
      <h3>Recent Entries</h3>
      <EntriesTable items={items} onEdit={(r) => navigate(`/entries/${r._id}/edit`)} onDelete={remove} />
    </>
  );
}
