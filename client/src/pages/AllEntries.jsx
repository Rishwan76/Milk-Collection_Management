import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EntriesTable from '../components/EntriesTable.jsx';
import Pagination from '../components/Pagination.jsx';
import { Loading, ErrorBox } from '../components/Status.jsx';
import { useToast } from '../components/Toast.jsx';
import { deleteEntry, getEntries, getErrorMessage } from '../services/api.js';

export default function AllEntries() {
  const navigate = useNavigate();
  const notify = useToast();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getEntries({ page, limit: 10, search: search || undefined });
      setItems(res.data);
      setPagination(res.pagination);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [page, search]);

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

  return (
    <>
      <h2>All Entries</h2>
      <input
        className="search"
        placeholder="Search by date (YYYY-MM-DD) or any value"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />
      {loading ? <Loading /> : error ? <ErrorBox message={error} onRetry={load} /> : (
        <>
          <EntriesTable items={items} onEdit={(r) => navigate(`/entries/${r._id}/edit`)} onDelete={remove} />
          <Pagination pagination={pagination} onChange={setPage} />
        </>
      )}
    </>
  );
}
