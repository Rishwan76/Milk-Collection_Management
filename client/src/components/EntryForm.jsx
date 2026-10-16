import { useEffect, useState } from 'react';
import { inr, todayISO } from '../utils/format.js';

const empty = () => ({ collectionDate: todayISO(), quantity: '', fat: '', snf: '', rate: '', totalAmount: '' });

const labels = { collectionDate: 'Collection date', quantity: 'Quantity', fat: 'Fat', snf: 'SNF', rate: 'Rate', totalAmount: 'Total amount' };

function validate(v) {
  const errors = {};
  if (!v.collectionDate) errors.collectionDate = 'Collection date is required';
  for (const k of ['quantity', 'fat', 'snf', 'rate', 'totalAmount']) {
    if (v[k] === '') errors[k] = `${labels[k]} is required`;
    else if (!Number.isFinite(Number(v[k]))) errors[k] = `${labels[k]} must be a number`;
    else if (Number(v[k]) < 0) errors[k] = `${labels[k]} cannot be negative`;
  }
  return errors;
}

export default function EntryForm({ initial, submitting, onSubmit, onCancel }) {
  const [values, setValues] = useState(empty());
  const [errors, setErrors] = useState({});
  const [amountTouched, setAmountTouched] = useState(false);

  useEffect(() => {
    if (initial) {
      setValues({
        collectionDate: String(initial.collectionDate).slice(0, 10),
        quantity: String(initial.quantity),
        fat: String(initial.fat),
        snf: String(initial.snf),
        rate: String(initial.rate),
        totalAmount: String(initial.totalAmount)
      });
      setAmountTouched(true);
    }
  }, [initial]);

  const change = (name, value) => {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      if ((name === 'quantity' || name === 'rate') && !amountTouched) {
        const q = Number(next.quantity);
        const r = Number(next.rate);
        next.totalAmount = next.quantity !== '' && next.rate !== '' && q >= 0 && r >= 0 ? (q * r).toFixed(2) : '';
      }
      return next;
    });
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const clear = () => {
    setValues(empty());
    setErrors({});
    setAmountTouched(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    const ok = await onSubmit({
      collectionDate: values.collectionDate,
      quantity: Number(values.quantity),
      fat: Number(values.fat),
      snf: Number(values.snf),
      rate: Number(values.rate),
      totalAmount: Number(values.totalAmount)
    });
    if (ok && !initial) clear();
  };

  const field = (name, label, props = {}) => (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        value={values[name]}
        onChange={(e) => change(name, e.target.value)}
        {...props}
      />
      {errors[name] && <span className="field-error">{errors[name]}</span>}
    </div>
  );

  const num = { type: 'number', step: 'any', min: '0', inputMode: 'decimal' };

  return (
    <form className="card form" onSubmit={submit} noValidate>
      {field('collectionDate', 'Collection Date', { type: 'date' })}
      {field('quantity', 'Quantity (litres)', num)}
      {field('fat', 'Fat (%)', num)}
      {field('snf', 'SNF (%)', num)}
      {field('rate', 'Rate (₹ per litre)', num)}
      <div className="field">
        <label htmlFor="totalAmount">Total Amount (₹)</label>
        <input
          id="totalAmount"
          {...num}
          value={values.totalAmount}
          onChange={(e) => {
            setAmountTouched(true);
            change('totalAmount', e.target.value);
          }}
        />
        {errors.totalAmount && <span className="field-error">{errors.totalAmount}</span>}
        {values.totalAmount !== '' && Number(values.totalAmount) >= 0 && <span className="hint">{inr(values.totalAmount)}</span>}
      </div>
      <div className="form-actions">
        <button className="btn primary" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : initial ? 'Update' : 'Save'}
        </button>
        <button className="btn" type="button" onClick={clear} disabled={submitting}>Clear</button>
        <button className="btn" type="button" onClick={onCancel} disabled={submitting}>Cancel</button>
      </div>
    </form>
  );
}
