import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from './SearchBar.jsx';

describe('SearchBar', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces 250ms before calling onChange with the latest typed value', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} />);

    const input = screen.getByRole('searchbox');
    // fireEvent.change is synchronous and bypasses userEvent's pointer/timer machinery,
    // which deadlocks under vi.useFakeTimers.
    fireEvent.change(input, { target: { value: 'a' } });
    fireEvent.change(input, { target: { value: 'at' } });
    fireEvent.change(input, { target: { value: 'ato' } });

    expect(onChange).not.toHaveBeenCalled();

    vi.advanceTimersByTime(249);
    expect(onChange).not.toHaveBeenCalled();

    vi.advanceTimersByTime(2);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('ato');
  });

  it('shows a clear button when the input is non-empty and clears immediately on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchBar value="atomic" onChange={onChange} />);

    const clearBtn = screen.getByRole('button', { name: /clear search/i });
    expect(clearBtn).toBeInTheDocument();

    await user.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('hides the clear button when the input is empty', () => {
    render(<SearchBar value="" onChange={() => {}} />);
    expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument();
  });
});
