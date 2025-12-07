import React from 'react';
import { DataItem } from '../types';
import { Download, ExternalLink } from 'lucide-react';

interface CardProps {
  item: DataItem;
  onClick: (item: DataItem) => void;
  viewMode: 'normal' | 'code';
}

export const Card: React.FC<CardProps> = ({ item, onClick, viewMode }) => {
  return (
    <div
      onClick={() => onClick(item)}
      className="group bg-surface border border-white/5 hover:border-primary/30 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col h-full min-h-[220px]"
    >
      <div className="mb-4 flex-grow flex flex-col">
        <h3
          className={`text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors line-clamp-3 ${viewMode === 'code' ? 'font-mono' : ''} [&>p]:m-0 [&>p]:inline`}
          dangerouslySetInnerHTML={{ __html: item.title }}
        />
        <div
          className={`text-zinc-400 text-xs leading-relaxed flex-grow line-clamp-4 ${viewMode === 'code' ? 'font-mono' : ''} [&>p]:m-0`}
          dangerouslySetInnerHTML={{ __html: item.summary }}
        />
      </div>



      {/* Buttons Section */}
      {/* Buttons Section */}
      {(item.visitUrl || item.downloadUrl) && (
        <div className="mt-auto flex gap-3 pt-2">
          {item.visitUrl && (
            <a
              href={item.visitUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`flex-1 bg-transparent border border-[#bb86fc] text-[#bb86fc] font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#bb86fc] hover:text-[#121212] transition-all text-sm shadow-[0_0_5px_rgba(187,134,252,0.2)] ${!item.downloadUrl ? 'w-full' : ''}`}
            >
              <ExternalLink size={16} strokeWidth={2.5} />
              Visitar
            </a>
          )}

          {item.downloadUrl && (
            <a
              href={item.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`flex-1 bg-transparent border border-[#bb86fc] text-[#bb86fc] font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#bb86fc] hover:text-[#121212] transition-all text-sm shadow-[0_0_5px_rgba(187,134,252,0.2)] ${!item.visitUrl ? 'w-full' : ''}`}
            >
              <Download size={16} strokeWidth={2.5} />
              Descargar
            </a>
          )}
        </div>
      )}
    </div>
  );
};