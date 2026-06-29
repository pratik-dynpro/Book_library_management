import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import EditBook from './EditBook.jsx';
import { ToastProvider } from '../components/ToastProvider.jsx';
import { server } from '../test/setup.js';
import {
  notFoundBook,
  okGetBook,
  okUpdate,
  slowGetBook,
  update422,
} from '../test/handlers.js';

const SAMPLE = {
  id: 7,
  book_name: 'Atomic Habits',
  author: 'James Clear',
  genre: 'Self Help',
  status: 'Read',
  created_at: '2026-06-23T12:00:00Z',
};

function renderEditBook(id = 7) {
  return render(
    <MemoryRouter initialEntries={[`/edit/${id}`]}>
      <ToastProvider>
        <Routes>
          <Route path="/edit/:id" element={<EditBook />} />
          <Route
            path="/books"
            element={<div data-testid="books-page">Books page</div>}
          />
        </Routes>
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe('EditBook page', () => {
  it('prefills the form from GET /books/:id', async () => {
    server.use(okGetBook(SAMPLE));
    renderEditBook(7);

    expect(
      await screen.findByDisplayValue('Atomic Habits'),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('James Clear')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Self Help')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^read$/i })).toBeChecked();
    // submit label is "Update", not "Save"
    expect(screen.getByRole('button', { name: /^update$/i })).toBeInTheDocument();
  });

  it('shows a skeleton while the GET is in flight, then swaps to the form', async () => {
    server.use(slowGetBook(SAMPLE, 80));
    renderEditBook(7);

    // Skeleton is mounted immediately with role=status + aria-busy
    const skeleton = screen.getByRole('status', { name: /loading book/i });
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
    // Form is not yet present
    expect(screen.queryByRole('button', { name: /^update$/i })).not.toBeInTheDocument();

    // After the GET resolves, the form appears and skeleton is gone
    expect(
      await screen.findByDisplayValue('Atomic Habits'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('status', { name: /loading book/i })).not.toBeInTheDocument();
  });

  it('redirects to /books with an error toast on 404', async () => {
    server.use(notFoundBook('Book not found'));
    renderEditBook(999999);

    await waitFor(() => {
      expect(screen.getByTestId('books-page')).toBeInTheDocument();
    });
    expect(
      await screen.findByText(/couldn’t find that book|book not found/i),
    ).toBeInTheDocument();
  });

  it('navigates to /books and shows a success toast on PUT 200', async () => {
    const user = userEvent.setup();
    server.use(okGetBook(SAMPLE), okUpdate());
    renderEditBook(7);

    const bookName = await screen.findByDisplayValue('Atomic Habits');
    await user.clear(bookName);
    await user.type(bookName, 'Atomic Habits (revised)');
    await user.click(screen.getByRole('button', { name: /^update$/i }));

    await waitFor(() => {
      expect(screen.getByTestId('books-page')).toBeInTheDocument();
    });
    expect(await screen.findByText(/updated/i)).toBeInTheDocument();
  });

  it('renders per-field server errors when PUT returns 422', async () => {
    const user = userEvent.setup();
    server.use(
      okGetBook(SAMPLE),
      update422([
        {
          loc: ['body', 'book_name'],
          msg: 'String should have at most 255 characters',
          type: 'string_too_long',
        },
      ]),
    );
    renderEditBook(7);

    await screen.findByDisplayValue('Atomic Habits');
    await user.click(screen.getByRole('button', { name: /^update$/i }));

    expect(
      await screen.findByText(/string should have at most 255 characters/i),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('books-page')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/book name/i)).toHaveAttribute('aria-invalid', 'true');
  });
});
