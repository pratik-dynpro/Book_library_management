import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

export async function getBooks(params) {
  const clean = {};
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== '' && v !== undefined && v !== null) clean[k] = v;
    }
  }
  const { data } = await api.get('/books', { params: clean });
  return data;
}

export async function deleteBook(id) {
  await api.delete(`/books/${id}`);
}

export async function createBook(values) {
  const { data } = await api.post('/books', values);
  return data;
}

export async function getBook(id) {
  const { data } = await api.get(`/books/${id}`);
  return data;
}

export async function updateBook(id, values) {
  const { data } = await api.put(`/books/${id}`, values);
  return data;
}

/**
 * Map FastAPI 422 payload → { field: 'message' } shape used by BookForm.
 * `detail` is an array of { loc, msg, ... } items; loc's last segment is the field name.
 */
export function mapFastApiErrors(detail) {
  if (!Array.isArray(detail)) return {};
  const out = {};
  for (const item of detail) {
    const loc = Array.isArray(item?.loc) ? item.loc : [];
    const field = loc[loc.length - 1];
    if (typeof field === 'string' && typeof item?.msg === 'string') {
      out[field] = item.msg;
    }
  }
  return out;
}
