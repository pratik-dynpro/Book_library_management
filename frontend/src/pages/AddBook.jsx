import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookForm } from '../components/BookForm.jsx';
import { useToast } from '../components/ToastProvider.jsx';
import { createBook, mapFastApiErrors } from '../services/api.js';

export default function AddBook() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  async function handleSubmit(values) {
    setLoading(true);
    setServerErrors({});
    try {
      const book = await createBook(values);
      toast.success(`Added “${book.book_name}” to the shelf.`);
      navigate('/books');
    } catch (err) {
      if (err?.response?.status === 422) {
        setServerErrors(mapFastApiErrors(err.response.data?.detail));
      } else {
        const detail = err?.response?.data?.detail;
        toast.error(
          typeof detail === 'string' ? detail : "Couldn't add the book. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container-page py-12">
      <header className="mb-8">
        <p className="eyebrow">Catalogue</p>
        <h1 className="mt-3 font-display text-display-2 text-ink">Add a volume</h1>
        <p className="mt-2 max-w-prose text-body text-ink/70">
          Four fields, then it&apos;s on your shelf.
        </p>
      </header>

      <BookForm
        onSubmit={handleSubmit}
        submitLabel={loading ? 'Saving…' : 'Save'}
        loading={loading}
        serverErrors={serverErrors}
        onCancel={() => navigate('/books')}
      />
    </section>
  );
}
