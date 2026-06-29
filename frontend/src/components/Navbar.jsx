import { NavLink } from 'react-router-dom';

const linkBase =
  'relative inline-flex h-9 items-center px-1 text-small font-medium text-ink/70 transition-colors hover:text-ink';
const active = 'text-ink after:absolute after:inset-x-0 after:-bottom-1 after:h-[2px] after:bg-binding';

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-page/85 backdrop-blur supports-[backdrop-filter]:bg-page/70">
      <nav className="container-page flex h-14 items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 font-display text-h3 text-ink">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5 text-binding"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="4" y="3" width="6" height="18" rx="0.5" />
            <rect x="11" y="3" width="3" height="18" rx="0.5" />
            <path d="M15 4l4 -1 2 17 -4 1z" />
          </svg>
          <span className="leading-none">My Library</span>
        </NavLink>
        <ul className="flex items-center gap-7">
          <li>
            <NavLink to="/" end className={({ isActive }) => `${linkBase} ${isActive ? active : ''}`}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/books" className={({ isActive }) => `${linkBase} ${isActive ? active : ''}`}>
              Shelf
            </NavLink>
          </li>
          <li>
            <NavLink to="/add" className={({ isActive }) => `${linkBase} ${isActive ? active : ''}`}>
              Add a volume
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}
