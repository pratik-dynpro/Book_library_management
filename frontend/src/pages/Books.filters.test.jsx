import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import Books from './Books.jsx';
import { ToastProvider } from '../components/ToastProvider.jsx';
import { server } from '../test/setup.js';

const API = 'http://localhost:8000';

const FIXTURE = [
  { id: 1, book_name: 'Atomic Habits', author: 'James Clear', genre: 'Self Help', status: 'Read', created_at: '2026-01-01T00:00:00Z' },
  { id: 2, book_name: 'Deep Work', author: 'Cal Newport', genre: 'Productivity', status: 'Unread', created_at: '2026-01-02T00:00:00Z' },
  { id: 3, book_name: 'The Pragmatic Programmer', author: 'Andy Hunt', genre: 'Tech', status: 'Read', created_at: '2026-01-03T00:00:00Z' },
];

function makeCapturingHandler(books) {
  const calls = [];
  const handler = http.get(`${API}/books`, ({ request }) => {
    const url = new URL(request.url);
    calls.push(Object.fromEntries(url.searchParams));
    return HttpResponse.json(books);
  });
  return { handler, calls };
}

function renderBooks(initialEntries = ['/books']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <ToastProvider>
        <Books />
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe('Books filter UI', () => {
  it('renders a sticky filter bar containing a search input and 3 dropdowns (AC1)', async () => {
    const { handler } = makeCapturingHandler(FIXTURE);
    server.use(handler);
    renderBooks();

    await screen.findByText('Atomic Habits');

    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByLabelText(/author/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/genre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
  });

  it('populates Author and Genre dropdowns from the result-set, sorted; Status is fixed (AC4)', async () => {
    const { handler } = makeCapturingHandler(FIXTURE);
    server.use(handler);
    renderBooks();

    await screen.findByText('Atomic Habits');

    const authorSelect = screen.getByLabelText(/author/i);
    expect(within(authorSelect).getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Any author',
      'Andy Hunt',
      'Cal Newport',
      'James Clear',
    ]);

    const genreSelect = screen.getByLabelText(/genre/i);
    expect(within(genreSelect).getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Any genre',
      'Productivity',
      'Self Help',
      'Tech',
    ]);

    const statusSelect = screen.getByLabelText(/status/i);
    expect(within(statusSelect).getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Any',
      'Read',
      'Unread',
    ]);
  });

  it('changing a dropdown updates URL params and refetches with the new param (AC3)', async () => {
    const user = userEvent.setup();
    const { handler, calls } = makeCapturingHandler(FIXTURE);
    server.use(handler);
    renderBooks();

    await screen.findByText('Atomic Habits');
    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual({});

    await user.selectOptions(screen.getByLabelText(/status/i), 'Read');

    await waitFor(() => expect(calls.length).toBeGreaterThan(1));
    expect(calls[calls.length - 1]).toEqual({ status: 'Read' });
  });

  it('composes search + dropdown params into one request (AC2 + AC3)', async () => {
    const user = userEvent.setup();
    const { handler, calls } = makeCapturingHandler(FIXTURE);
    server.use(handler);
    renderBooks();

    await screen.findByText('Atomic Habits');

    await user.selectOptions(screen.getByLabelText(/status/i), 'Read');
    await waitFor(() => expect(calls[calls.length - 1]).toEqual({ status: 'Read' }));

    await user.type(screen.getByRole('searchbox'), 'ato');
    // 250ms debounce, then refetch
    await waitFor(
      () => expect(calls[calls.length - 1]).toEqual({ status: 'Read', search: 'ato' }),
      { timeout: 1500 },
    );
  });

  it('reads initial filters from the URL on mount and preserves them in the controls (AC6)', async () => {
    const { handler, calls } = makeCapturingHandler(FIXTURE);
    server.use(handler);
    renderBooks(['/books?search=ato&status=Read']);

    await screen.findByText('Atomic Habits');

    expect(calls[0]).toEqual({ search: 'ato', status: 'Read' });
    expect(screen.getByRole('searchbox')).toHaveValue('ato');
    expect(screen.getByLabelText(/status/i)).toHaveValue('Read');
  });

  it('clearing the search box re-fetches without the search param (AC5)', async () => {
    const user = userEvent.setup();
    const { handler, calls } = makeCapturingHandler(FIXTURE);
    server.use(handler);
    renderBooks(['/books?search=ato']);

    await screen.findByText('Atomic Habits');
    expect(calls[0]).toEqual({ search: 'ato' });

    await user.click(screen.getByRole('button', { name: /clear search/i }));

    await waitFor(() => expect(calls[calls.length - 1]).toEqual({}));
  });
});
