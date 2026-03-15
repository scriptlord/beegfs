import { NavLink, Outlet } from 'react-router-dom';
import styles from './Layout.module.css';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/nodes', label: 'Storage Nodes' },
  { to: '/events', label: 'Events' },
  { to: '/jobs', label: 'Jobs' },
  { to: '/settings', label: 'Settings' },
  { to: '/architecture', label: 'Architecture' },
];

export default function Layout() {
  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <h1>BeeGFS</h1>
          <span>Cluster Manager</span>
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
