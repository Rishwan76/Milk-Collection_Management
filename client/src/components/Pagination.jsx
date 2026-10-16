export default function Pagination({ pagination, onChange }) {
  if (!pagination) return null;
  const { page, totalPages, total } = pagination;
  return (
    <div className="pagination">
      <button className="btn" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button>
      <span>Page {page} of {totalPages} ({total} records)</span>
      <button className="btn" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Next</button>
    </div>
  );
}
