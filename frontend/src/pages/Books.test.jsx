import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Books from './Books.jsx';
import { ToastProvider } from '../components/ToastProvider.jsx';
import { server } from '../test/setup.js';
import { failDelete, okBooks } from '../test/handlers.js';

const sample = (overrides = []) => [
  {
    id: 1,
    book_name: 'Atomic Habits',
    author: 'James Clear',
    genre: 'Self Help',
    status: 'Read',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    book_name: 'Deep Work',
    author: 'Cal Newport',
    genre: 'Self Help',
    status: 'Unread',
    created_at: '2026-01-02T00:00:00Z',
  },
  ...overrides,
];

function renderBooks() {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <Books />
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe('Books page', () => {
  it('renders a card per book', async () => {
    server.use(okBooks(sample()));
    renderBooks();
    const list = await screen.findByRole('list', { name: /books on the shelf/i });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Atomic Habits')).toBeInTheDocument();
    expect(screen.getByText('Deep Work')).toBeInTheDocument();
  });

  it('shows the empty state when there are no books', async () => {
    server.use(okBooks([]));
    renderBooks();
    expect(await screen.findByText(/catalogue your first volume/i)).toBeInTheDocument();
    expect(
      screen.getAllByRole('link', { name: /catalogue a new volume/i }).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('renders a <script> payload as literal text, not script', async () => {
    server.use(
      okBooks([
        {
          id: 99,
          book_name: "<script>window.__pwned=true</script>",
          author: 'Mallory',
          genre: 'Mischief',
          status: 'Unread',
          created_at: '2026-01-03T00:00:00Z',
        },
      ]),
    );
    renderBooks();
    expect(
      await screen.findByText("<script>window.__pwned=true</script>"),
    ).toBeInTheDocument();
    expect(window.__pwned).toBeUndefined();
  });

  it('confirms then removes a card on successful delete', async () => {
    const user = userEvent.setup();
    server.use(okBooks(sample()));
    renderBooks();

    await screen.findByText('Atomic Habits');
    const deleteButtons = screen.getAllByRole('button', { name: /^delete$/i });
    await user.click(deleteButtons[0]);

    // Modal is open with the target book name in the description
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/atomic habits/i)).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: /^remove$/i }));

    await waitFor(() => {
      expect(screen.queryByText('Atomic Habits')).not.toBeInTheDocument();
    });
    // Card for the other book is still there
    expect(screen.getByText('Deep Work')).toBeInTheDocument();
    // Success toast announced
    expect(await screen.findByText(/removed/i)).toBeInTheDocument();
  });

  it('keeps the card and shows an error toast when delete fails', async () => {
    const user = userEvent.setup();
    server.use(okBooks(sample()), failDelete('Database unavailable'));
    renderBooks();

    await screen.findByText('Atomic Habits');
    const deleteButtons = screen.getAllByRole('button', { name: /^delete$/i });
    await user.click(deleteButtons[0]);

    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /^remove$/i }));

    // Toast surfaces the API detail
    expect(await screen.findByText(/database unavailable/i)).toBeInTheDocument();
    // Card remains
    expect(screen.getByText('Atomic Habits')).toBeInTheDocument();
  });

  it('modal ESC dismisses without deleting', async () => {
    const user = userEvent.setup();
    server.use(okBooks(sample()));
    renderBooks();

    await screen.findByText('Atomic Habits');
    await user.click(screen.getAllByRole('button', { name: /^delete$/i })[0]);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Atomic Habits')).toBeInTheDocument();
  });
});
