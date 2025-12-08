import React from 'react';
import { DataItem } from '../types';
import { Download, ExternalLink } from 'lucide-react';
import { getIconComponent } from './IconPicker';

interface CardProps {
  item: DataItem;
  onClick: (item: DataItem) => void;
  viewMode: 'normal' | 'code';
}

export const Card: React.FC<CardProps> = ({ item, onClick, viewMode }) => {
  console.log('[Card] Rendering item:', item.title, 'Icon:', item.icon);
  const Icon = getIconComponent(item.icon);
  return (
    <div
      onClick={() => onClick(item)}
      className="group bg-surface border border-white/5 hover:border-primary/30 rounded-xl p-3 sm:p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col h-full min-h-[200px]"
    >
      <div className="mb-2 flex-grow flex flex-col">
        <div className="flex items-start gap-2">
          {Icon && (
            <div className="text-primary shrink-0">
              <Icon size={20} className="sm:w-6 sm:h-6" />
            </div>
          )}
          <h3
            className={`text-base sm:text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors line-clamp-2 ${viewMode === 'code' ? 'font-mono' : ''} [&>p]:m-0 [&>p]:inline`}
            dangerouslySetInnerHTML={{ __html: item.title }}
          />
        </div>
        <div
          className={`text-zinc-400 text-[11px] sm:text-xs leading-normal flex-grow ${viewMode === 'code' ? 'font-mono' : ''} [&>p]:m-0 [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:p-0 [&_img]:m-0 [&_img]:rounded-none [&_figure]:p-0 [&_figure]:m-0 [&_figure]:bg-transparent overflow-hidden`}
          dangerouslySetInnerHTML={{ __html: item.summary }}
          style={{
            display: '-webkit-box',
            WebkitLineClamp: (item.visitUrl || item.downloadUrl) ? 4 : 7,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        />
      </div>



      {/* Buttons Section */}
      {/* Buttons Section */}
      {(item.visitUrl || item.downloadUrl) && (
        <div className="mt-auto flex gap-2 sm:gap-3 pt-2 flex-wrap">
          {item.visitUrl && (
            <a
              href={item.visitUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`flex-1 bg-transparent border border-[#bb86fc] text-[#bb86fc] font-medium py-1.5 px-3 sm:py-2.5 sm:px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#bb86fc] hover:text-[#121212] transition-all text-xs sm:text-sm shadow-[0_0_5px_rgba(187,134,252,0.2)] ${!item.downloadUrl ? 'w-full' : 'min-w-[100px]'}`}
            >
              <ExternalLink size={14} className="sm:w-4 sm:h-4" strokeWidth={2.5} />
              Visitar
            </a>
          )}

          {item.downloadUrl && (
            <a
              href={item.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`flex-1 bg-transparent border border-[#bb86fc] text-[#bb86fc] font-medium py-1.5 px-3 sm:py-2.5 sm:px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#bb86fc] hover:text-[#121212] transition-all text-xs sm:text-sm shadow-[0_0_5px_rgba(187,134,252,0.2)] ${!item.visitUrl ? 'w-full' : 'min-w-[100px]'}`}
            >
              <Download size={14} className="sm:w-4 sm:h-4" strokeWidth={2.5} />
              Descargar
            </a>
          )}
        </div>
      )}
    </div>
  );
};