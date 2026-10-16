import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EntryForm from '../components/EntryForm.jsx';
import { Loading, ErrorBox } from '../components/Status.jsx';
import { useToast } from '../components/Toast.jsx';
import { createEntry, getEntry, getErrorMessage, updateEntry } from '../services/api.js';

export default function AddEntry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useToast();
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getEntry(id)
      .then(setInitial)
      .catch((e) => setLoadError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [id]);

  const save = async (data) => {
    setSubmitting(true);
    try {
      if (id) {
        await updateEntry(id, data);
        notify('Entry updated');
        navigate('/entries');
      } else {
        await createEntry(data);
        notify('Entry saved');
      }
      return true;
    } catch (e) {
      notify(getErrorMessage(e), 'error');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (loadError) return <ErrorBox message={loadError} />;

  return (
    <>
      <h2>{id ? 'Edit Milk Entry' : 'Add Milk Entry'}</h2>
      <EntryForm initial={initial} submitting={submitting} onSubmit={save} onCancel={() => navigate(-1)} />
    </>
  );
}
