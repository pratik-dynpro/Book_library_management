import { Route, Routes } from 'react-router-dom';
import { Navbar } from './components/Navbar.jsx';
import { ToastProvider } from './components/ToastProvider.jsx';
import Home from './pages/Home.jsx';
import Books from './pages/Books.jsx';
import AddBook from './pages/AddBook.jsx';
import EditBook from './pages/EditBook.jsx';

export default function App() {
  return (
    <ToastProvider>
      <div className="flex min-h-dvh flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<Books />} />
            <Route path="/add" element={<AddBook />} />
            <Route path="/edit/:id" element={<EditBook />} />
          </Routes>
        </main>
        <footer className="container-page py-10">
          <div className="hairline pt-6 text-caption uppercase tracking-[0.18em] text-mute">
            A personal library · catalogued in {new Date().getFullYear()}
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
}
