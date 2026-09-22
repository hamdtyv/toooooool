
import React from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, className = '' }) => {
  return (
    <div className={`relative group inline-flex items-center justify-center z-20 ${className}`}>
      {children || <Info size={16} className="text-gray-500 hover:text-white transition-colors cursor-help" />}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 md:w-64 p-3 bg-[#1f1f1f]/95 backdrop-blur-md border border-white/10 text-xs text-gray-200 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform translate-y-2 group-hover:translate-y-0 text-center leading-relaxed z-50">
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1f1f1f]/95"></div>
      </div>
    </div>
  );
};

export default Tooltip;
