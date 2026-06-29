import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterDropdown } from './FilterDropdown.jsx';

describe('FilterDropdown', () => {
  it('renders the label, the "any" option, and each provided option', () => {
    render(
      <FilterDropdown
        label="Author"
        anyLabel="Any author"
        options={['James Clear', 'Cal Newport']}
        value=""
        onChange={vi.fn()}
      />,
    );

    const select = screen.getByLabelText(/author/i);
    const optionTexts = within(select).getAllByRole('option').map((o) => o.textContent);
    expect(optionTexts).toEqual(['Any author', 'James Clear', 'Cal Newport']);
  });

  it('calls onChange with the selected value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FilterDropdown
        label="Status"
        anyLabel="Any"
        options={['Read', 'Unread']}
        value=""
        onChange={onChange}
      />,
    );

    await user.selectOptions(screen.getByLabelText(/status/i), 'Read');
    expect(onChange).toHaveBeenCalledWith('Read');
  });

  it('marks the label as active when value is non-default', () => {
    render(
      <FilterDropdown
        label="Genre"
        anyLabel="Any genre"
        options={['Self Help', 'Tech']}
        value="Tech"
        onChange={vi.fn()}
      />,
    );
    // Active label gets a leading bullet so the indicator isn't color-only.
    expect(screen.getByText(/^•\s*genre$/i)).toBeInTheDocument();
  });
});
