import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home.jsx';
import { server } from '../test/setup.js';
import { okBooks } from '../test/handlers.js';

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );
}

const statsRegion = () => {
  // The "By the numbers" heading's parent section contains the four StatCards.
  const region = screen.getByText(/by the numbers/i).parentElement;
  if (!region) throw new Error('stats region not found');
  return within(region);
};

describe('Home', () => {
  it('renders the hero', async () => {
    renderHome();
    expect(screen.getByText(/a personal library/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: /every book you own/i }),
    ).toBeInTheDocument();
    // Two CTAs across the page have this label (hero + bottom). Use getAllBy.
    const ctas = screen.getAllByRole('link', { name: /catalogue a new volume/i });
    expect(ctas.length).toBeGreaterThanOrEqual(1);
  });

  it('shows zero stats when no books exist', async () => {
    server.use(okBooks([]));
    renderHome();
    await waitFor(() => {
      const s = statsRegion();
      const zeros = s.getAllByText('0');
      expect(zeros.length).toBeGreaterThanOrEqual(4);
    });
    expect(screen.queryByText(/NaN/i)).toBeNull();
  });

  it('reflects the mocked /books response in the stats cards', async () => {
    server.use(
      okBooks([
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
          status: 'Read',
          created_at: '2026-01-02T00:00:00Z',
        },
        {
          id: 3,
          book_name: 'The Atomic Café',
          author: 'Jane Doe',
          genre: 'History',
          status: 'Unread',
          created_at: '2026-01-03T00:00:00Z',
        },
      ]),
    );

    renderHome();
    await waitFor(() => {
      const s = statsRegion();
      // total=3, read=2, unread=1, genres=2
      expect(s.getByText('3')).toBeInTheDocument(); // total — unique value
      expect(s.getByText('1')).toBeInTheDocument(); // unread — unique value
      expect(s.getAllByText('2')).toHaveLength(2); // read AND genres both = 2
    });

    // Shelf renders one spine per book.
    const shelf = await screen.findByRole('list', { name: /books on the shelf/i });
    expect(within(shelf).getAllByRole('listitem')).toHaveLength(3);
  });

  it('has no horizontal scroll at 360px', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 360 });
    window.dispatchEvent(new Event('resize'));
    renderHome();
    await waitFor(() => {
      expect(document.body.scrollWidth).toBeLessThanOrEqual(360);
    });
  });
});
