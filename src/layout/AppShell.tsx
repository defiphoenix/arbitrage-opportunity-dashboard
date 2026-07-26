import React from 'react';

interface AppShellProps {
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ sidebar, topbar, children }) => {
  return (
    <div className="min-h-screen bg-[#0A0B0D] text-[#E8EAED] antialiased selection:bg-[#9D6FFF] selection:text-white flex">
      {sidebar}
      <div className="flex-1 flex flex-col min-w-0">
        {topbar}
        <main className="flex-1 px-6 pt-[22px] pb-10">
          {children}
        </main>
      </div>
    </div>
  );
};
