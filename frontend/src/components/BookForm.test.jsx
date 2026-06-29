import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookForm } from './BookForm.jsx';

function renderForm(props = {}) {
  return render(<BookForm onSubmit={vi.fn().mockResolvedValue(undefined)} {...props} />);
}

describe('BookForm', () => {
  it('renders all four fields', () => {
    renderForm();
    expect(screen.getByLabelText(/book name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/author/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/genre/i)).toBeInTheDocument();
    // status is a fieldset with two radios
    expect(screen.getByRole('radio', { name: /^read$/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^unread$/i })).toBeInTheDocument();
  });

  it('shows inline errors when required fields are empty and does not call onSubmit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderForm({ onSubmit });

    await user.click(screen.getByRole('button', { name: /save/i }));

    // One inline error per empty required field
    expect(screen.getAllByText(/this field is required/i).length).toBeGreaterThanOrEqual(3);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with trimmed values when valid', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderForm({ onSubmit });

    await user.type(screen.getByLabelText(/book name/i), '  Atomic Habits  ');
    await user.type(screen.getByLabelText(/author/i), 'James Clear');
    await user.type(screen.getByLabelText(/genre/i), 'Self Help');
    await user.click(screen.getByRole('radio', { name: /^read$/i }));

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      book_name: 'Atomic Habits',
      author: 'James Clear',
      genre: 'Self Help',
      status: 'Read',
    });
  });

  it('disables the submit button while loading and rejects double submits', () => {
    const onSubmit = vi.fn();
    renderForm({
      onSubmit,
      loading: true,
      initialValues: { book_name: 'x', author: 'y', genre: 'z', status: 'Read' },
    });
    const submit = screen.getByRole('button', { name: /save/i });
    expect(submit).toBeDisabled();
    // The submit handler in BookForm short-circuits when loading is true; verify by
    // firing the form's submit event directly (userEvent on a disabled button hangs in jsdom).
    const form = submit.closest('form');
    form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('renders server errors per field', () => {
    renderForm({
      serverErrors: { book_name: 'String should have at most 255 characters' },
    });
    expect(
      screen.getByText(/string should have at most 255 characters/i),
    ).toBeInTheDocument();
    // aria-invalid wired on the input
    expect(screen.getByLabelText(/book name/i)).toHaveAttribute('aria-invalid', 'true');
  });

});
