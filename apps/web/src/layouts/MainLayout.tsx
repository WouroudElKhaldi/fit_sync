import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="pt-[72px] p-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
