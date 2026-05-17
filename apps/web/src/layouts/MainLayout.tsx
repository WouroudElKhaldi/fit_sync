import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto pt-20 px-8 pb-12 w-full max-w-[var(--max-width-content)] mx-auto scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
