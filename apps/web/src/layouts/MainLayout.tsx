import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { SidebarProvider, useSidebar } from '../context/SidebarContext';

const LayoutInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOpen } = useSidebar();

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      <Sidebar />
      <div
        className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${
          isOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        <Header />
        <main className="flex-1 overflow-y-auto pt-20 px-8 pb-12 w-full max-w-[var(--max-width-content)] mx-auto scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
};

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <LayoutInner>{children}</LayoutInner>
    </SidebarProvider>
  );
};

export default MainLayout;
