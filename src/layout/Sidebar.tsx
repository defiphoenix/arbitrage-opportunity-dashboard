import React from 'react';
import {
  LayoutGrid,
  Activity,
  Terminal,
  Code2,
  Send,
} from 'lucide-react';
import { ConnectionStatus, Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  oppCount: number;
  status: ConnectionStatus;
  latencyMs: number;
  onOpenDocs: () => void;
  onOpenTester: () => void;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  page?: Page;
  action?: 'docs' | 'tester';
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  oppCount,
  status,
  latencyMs,
  onOpenDocs,
  onOpenTester,
}) => {
  const groups: { label: string; items: NavItem[] }[] = [
    {
      label: 'Monitor',
      items: [
        { label: 'Overview', icon: <LayoutGrid className="w-[15px] h-[15px]" />, page: 'overview' },
        { label: 'Live feed', icon: <Activity className="w-[15px] h-[15px]" />, page: 'feed', badge: oppCount },
        { label: 'Telemetry', icon: <Terminal className="w-[15px] h-[15px]" />, page: 'telemetry' },
      ],
    },
    {
      label: 'Integration',
      items: [
        { label: 'API spec', icon: <Code2 className="w-[15px] h-[15px]" />, action: 'docs' },
      //  { label: 'Inject event', icon: <Send className="w-[15px] h-[15px]" />, action: 'tester' },
      ],
    },
  ];

  const handleClick = (item: NavItem) => {
    if (item.page) onNavigate(item.page);
    else if (item.action === 'docs') onOpenDocs();
    else if (item.action === 'tester') onOpenTester();
  };

  const isConnected = status === 'connected';

  return (
    <aside className="w-[216px] flex-shrink-0 bg-[#111318] border-r border-[#1E2128] flex flex-col px-3 py-[18px] min-h-screen sticky top-0 max-h-screen">

      {/* Brand */}
      <div className="flex items-center gap-[9px] px-2 pb-5">
        <div className="w-[22px] h-[22px] rounded-md bg-gradient-to-br from-[#22D67C] to-[#9D6FFF] flex-shrink-0" />
        <div>
          <div className="font-mono font-bold text-[13px] text-[#E8EAED] tracking-wide">ARB.CORE</div>
          <div className="font-mono text-[10px] text-[#5B616E]">solana_feed</div>
        </div>
      </div>

      {/* Nav Groups */}
      {groups.map((group) => (
        <div key={group.label} className="mt-3.5">
          <div className="text-[10px] text-[#5B616E] uppercase tracking-[0.08em] px-2 pb-1.5 font-semibold">
            {group.label}
          </div>
          {group.items.map((item) => {
            const active = item.page !== undefined && item.page === currentPage;
            return (
              <button
                key={item.label}
                onClick={() => handleClick(item)}
                className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-[7px] text-[12.5px] font-medium transition-colors ${
                  active
                    ? 'bg-[#15171D] text-[#E8EAED] border border-[#1E2128] [&_svg]:text-[#22D67C]'
                    : 'text-[#9AA0AC] hover:text-[#E8EAED] [&_svg]:opacity-80'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto font-mono text-[9.5px] bg-[#1E2128] text-[#9AA0AC] px-1.5 py-px rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}

      {/* Footer: Feed Status Card */}
      <div className="mt-auto pt-3.5 border-t border-[#191B21]">
        <div className="bg-[#15171D] border border-[#1E2128] rounded-[10px] p-[11px]">
          <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[#E8EAED]">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isConnected
                  ? 'bg-[#22D67C] shadow-[0_0_6px_#22D67C]'
                  : 'bg-[#F0465C] animate-pulse'
              }`}
            />
            Feed status
          </div>
          <div className="font-mono text-[10.5px] text-[#5B616E] mt-0.5 leading-relaxed uppercase">
            {status}{isConnected ? ` · ${latencyMs}ms` : ''}
          </div>
          <div className="font-mono text-[10.5px] text-[#5B616E] leading-relaxed">
            Buffered events: {oppCount}
          </div>
        </div>
      </div>

    </aside>
  );
};
