import { http, HttpResponse } from 'msw';

const API = 'http://localhost:8000';

export const okBooks = (books) =>
  http.get(`${API}/books`, () => HttpResponse.json(books));

export const failBooks = () =>
  http.get(`${API}/books`, () => HttpResponse.error());

export const okDelete = () =>
  http.delete(`${API}/books/:id`, () => new HttpResponse(null, { status: 204 }));

export const failDelete = (detail = 'Could not delete') =>
  http.delete(`${API}/books/:id`, () =>
    HttpResponse.json({ detail }, { status: 500 }),
  );

export const okCreate = (overrides = {}) =>
  http.post(`${API}/books`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        id: overrides.id ?? 123,
        book_name: body.book_name,
        author: body.author,
        genre: body.genre,
        status: body.status,
        created_at: '2026-06-23T12:00:00Z',
      },
      { status: 201 },
    );
  });

export const create422 = (detail) =>
  http.post(`${API}/books`, () => HttpResponse.json({ detail }, { status: 422 }));

export const create500 = (detail = 'Server exploded') =>
  http.post(`${API}/books`, () => HttpResponse.json({ detail }, { status: 500 }));

export const okGetBook = (book) =>
  http.get(`${API}/books/:id`, ({ params }) =>
    HttpResponse.json({ ...book, id: Number(params.id) || book.id }),
  );

export const slowGetBook = (book, delayMs = 200) =>
  http.get(`${API}/books/:id`, async ({ params }) => {
    await new Promise((r) => setTimeout(r, delayMs));
    return HttpResponse.json({ ...book, id: Number(params.id) || book.id });
  });

export const notFoundBook = (detail = 'Book not found') =>
  http.get(`${API}/books/:id`, () => HttpResponse.json({ detail }, { status: 404 }));

export const okUpdate = (overrides = {}) =>
  http.put(`${API}/books/:id`, async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: Number(params.id),
      book_name: body.book_name,
      author: body.author,
      genre: body.genre,
      status: body.status,
      created_at: '2026-06-23T12:00:00Z',
      ...overrides,
    });
  });

export const update422 = (detail) =>
  http.put(`${API}/books/:id`, () => HttpResponse.json({ detail }, { status: 422 }));

export const update500 = (detail = 'Server exploded') =>
  http.put(`${API}/books/:id`, () => HttpResponse.json({ detail }, { status: 500 }));

export const handlers = [okBooks([]), okDelete(), okCreate()];
