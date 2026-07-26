import React from 'react';

interface PageHeadProps {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}

export const PageHead: React.FC<PageHeadProps> = ({ title, subtitle, actions }) => {
  return (
    <div className="flex items-baseline justify-between mb-[18px]">
      <div>
        <h2 className="text-lg font-bold text-[#E8EAED]">{title}</h2>
        <p className="text-xs text-[#5B616E] mt-[3px]">{subtitle}</p>
      </div>
      {actions}
    </div>
  );
};
