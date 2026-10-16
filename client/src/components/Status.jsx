export function Loading({ text = 'Loading...' }) {
  return <div className="status"><span className="spinner" /> {text}</div>;
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="status error">
      {message}
      {onRetry && <button className="btn" onClick={onRetry}>Retry</button>}
    </div>
  );
}
