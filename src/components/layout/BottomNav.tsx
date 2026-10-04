import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, CreditCard, FileCheck2, AlertTriangle, MessageSquare, User } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Accueil', icon: Home },
  { path: '/payments', label: 'Loyer', icon: CreditCard },
  { path: '/receipts', label: 'Quittances', icon: FileCheck2 },
  { path: '/chat', label: 'Tchat', icon: MessageSquare },
  { path: '/incidents', label: 'Incidents', icon: AlertTriangle },
  { path: '/profile', label: 'Profil', icon: User },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="nav-item-icon">
              <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} color={isActive ? '#013E37' : '#64748B'} />
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 10,
                    border: '1.5px solid rgba(5, 150, 105, 0.35)',
                    background: 'rgba(1, 62, 55, 0.08)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </div>
            <span style={{ color: isActive ? '#013E37' : '#64748B', fontWeight: isActive ? 700 : 500 }}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
