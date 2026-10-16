import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/entries/new', label: 'Add Milk Entry' },
  { to: '/entries', label: 'All Entries', end: true },
  { to: '/reports', label: 'Reports' }
];

export default function Layout() {
  return (
    <div className="app">
      <aside className="sidebar">
        <h1 className="brand">Milk Collection</h1>
        <nav>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
