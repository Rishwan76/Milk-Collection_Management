import { inr, num, showDate } from '../utils/format.js';

export default function EntriesTable({ items, onEdit, onDelete }) {
  if (!items.length) return <p className="empty">No records found.</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th><th>Quantity (L)</th><th>Fat %</th><th>SNF %</th><th>Rate</th><th>Total Amount</th>
            {onEdit && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r._id}>
              <td>{showDate(r.collectionDate)}</td>
              <td>{num(r.quantity)}</td>
              <td>{num(r.fat)}</td>
              <td>{num(r.snf)}</td>
              <td>{inr(r.rate)}</td>
              <td>{inr(r.totalAmount)}</td>
              {onEdit && (
                <td className="actions">
                  <button className="btn" onClick={() => onEdit(r)}>Edit</button>
                  <button className="btn danger" onClick={() => onDelete(r)}>Delete</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
