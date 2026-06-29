import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookForm } from '../components/BookForm.jsx';
import { FormSkeleton } from '../components/FormSkeleton.jsx';
import { useToast } from '../components/ToastProvider.jsx';
import { getBook, mapFastApiErrors, updateBook } from '../services/api.js';

export default function EditBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [initialValues, setInitialValues] = useState(null);
  const [loadingBook, setLoadingBook] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const book = await getBook(id);
        if (cancelled) return;
        setInitialValues({
          book_name: book.book_name,
          author: book.author,
          genre: book.genre,
          status: book.status,
        });
      } catch (err) {
        if (cancelled) return;
        const status = err?.response?.status;
        toast.error(
          status === 404 ? "Couldn’t find that book." : "Couldn’t load that book.",
        );
        navigate('/books');
      } finally {
        if (!cancelled) setLoadingBook(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, navigate, toast]);

  async function handleUpdate(values) {
    setSaving(true);
    setServerErrors({});
    try {
      const book = await updateBook(id, values);
      toast.success(`Updated “${book.book_name}”.`);
      navigate('/books');
    } catch (err) {
      if (err?.response?.status === 422) {
        setServerErrors(mapFastApiErrors(err.response.data?.detail));
      } else {
        const detail = err?.response?.data?.detail;
        toast.error(
          typeof detail === 'string' ? detail : "Couldn’t update the book. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="container-page py-12">
      <header className="mb-8">
        <p className="eyebrow">Revise</p>
        <h1 className="mt-3 font-display text-display-2 text-ink">Edit volume</h1>
        <p className="mt-2 max-w-prose text-body text-ink/70">
          Adjust the details, then save the changes back to your shelf.
        </p>
      </header>

      {loadingBook || !initialValues ? (
        <FormSkeleton />
      ) : (
        <BookForm
          initialValues={initialValues}
          onSubmit={handleUpdate}
          submitLabel={saving ? 'Updating…' : 'Update'}
          loading={saving}
          serverErrors={serverErrors}
          onCancel={() => navigate('/books')}
        />
      )}
    </section>
  );
}
