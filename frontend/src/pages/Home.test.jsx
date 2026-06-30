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

// The stats block is the section that contains the "Library at a glance" heading.
const statsRegion = () => {
  const heading = screen.getByRole('heading', { name: /library at a glance/i });
  const region = heading.closest('section');
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
    const ctas = screen.getAllByRole('link', { name: /catalogue a new volume/i });
    expect(ctas.length).toBeGreaterThanOrEqual(1);
  });

  it('shows zero stats and the empty-chart hint when no books exist', async () => {
    server.use(okBooks([]));
    renderHome();
    await waitFor(() => {
      const s = statsRegion();
      const zeros = s.getAllByText(/^(0|0%)$/);
      expect(zeros.length).toBeGreaterThanOrEqual(3);
    });
    expect(
      screen.getByText(/add a book and mark it read to start seeing your reading patterns/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/NaN/i)).toBeNull();
  });

  it('reflects the mocked /books response in the stats block + bar chart', async () => {
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
      // Each metric column has a number + a label. Scope by label.
      const volumesCol = s.getByText(/^volumes$/i).parentElement;
      const readCol = s.getByText(/^read$/i).parentElement;
      const genresCol = s.getByText(/^genres$/i).parentElement;
      expect(within(volumesCol).getByText('3')).toBeInTheDocument();
      expect(within(readCol).getByText('67%')).toBeInTheDocument();
      expect(within(genresCol).getByText('2')).toBeInTheDocument();
    });

    // Bar chart: Self Help (2 reads) appears as a labeled row.
    const chart = screen.getByRole('list', { name: /reads by genre/i });
    expect(within(chart).getByText(/self help/i)).toBeInTheDocument();
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
