import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AddBook from './AddBook.jsx';
import { ToastProvider } from '../components/ToastProvider.jsx';
import { server } from '../test/setup.js';
import { create422, create500, okCreate } from '../test/handlers.js';

function renderAddBook() {
  return render(
    <MemoryRouter initialEntries={['/add']}>
      <ToastProvider>
        <Routes>
          <Route path="/add" element={<AddBook />} />
          <Route
            path="/books"
            element={<div data-testid="books-page">Books page</div>}
          />
        </Routes>
      </ToastProvider>
    </MemoryRouter>,
  );
}

async function fillForm(user, overrides = {}) {
  const v = {
    book_name: 'Atomic Habits',
    author: 'James Clear',
    genre: 'Self Help',
    status: 'Read',
    ...overrides,
  };
  await user.type(screen.getByLabelText(/book name/i), v.book_name);
  await user.type(screen.getByLabelText(/author/i), v.author);
  await user.type(screen.getByLabelText(/genre/i), v.genre);
  await user.click(screen.getByRole('radio', { name: new RegExp(`^${v.status}$`, 'i') }));
}

describe('AddBook page', () => {
  it('navigates to /books and shows a success toast on 201', async () => {
    const user = userEvent.setup();
    server.use(okCreate());
    renderAddBook();

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(screen.getByTestId('books-page')).toBeInTheDocument();
    });
    expect(await screen.findByText(/added/i)).toBeInTheDocument();
  });

  it('renders per-field errors when the API returns 422', async () => {
    const user = userEvent.setup();
    server.use(
      create422([
        {
          loc: ['body', 'book_name'],
          msg: 'String should have at most 255 characters',
          type: 'string_too_long',
        },
      ]),
    );
    renderAddBook();

    await fillForm(user, { book_name: 'x'.repeat(50) });
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    expect(
      await screen.findByText(/string should have at most 255 characters/i),
    ).toBeInTheDocument();
    // Still on /add — no navigation to /books.
    expect(screen.queryByTestId('books-page')).not.toBeInTheDocument();
    // The aria-invalid is wired on the offending input.
    expect(screen.getByLabelText(/book name/i)).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows an error toast for non-422 failures and keeps the user on the form', async () => {
    const user = userEvent.setup();
    server.use(create500('Server exploded'));
    renderAddBook();

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    expect(await screen.findByText(/server exploded/i)).toBeInTheDocument();
    expect(screen.queryByTestId('books-page')).not.toBeInTheDocument();
  });
});
