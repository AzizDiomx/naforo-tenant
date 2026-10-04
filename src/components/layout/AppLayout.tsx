import React from 'react';
import BottomNav from './BottomNav';
import TopHeader from './TopHeader';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-container">
      <TopHeader />
      <main style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
