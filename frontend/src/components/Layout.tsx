import React from 'react';
import FilterSidebar from './FilterSidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-gray-800">
        <div className="p-4">
          <h1 className="text-white text-2xl font-bold">Onebox</h1>
        </div>
        <FilterSidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}