import React, { useState } from 'react';
import { DataItem } from '../types';
import { Button } from './Button';
import { IconPicker } from './IconPicker';
import { Save, X, Link as LinkIcon, Download, Hash } from 'lucide-react';

interface DataFormProps {
  initialData?: DataItem | null;
  onSave: (data: Omit<DataItem, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export const DataForm: React.FC<DataFormProps> = ({ initialData, onSave, onCancel }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [icon, setIcon] = useState(initialData?.icon || '');
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [downloadUrl, setDownloadUrl] = useState(initialData?.downloadUrl || '');
  const [visitUrl, setVisitUrl] = useState(initialData?.visitUrl || '');
  const [tagsString, setTagsString] = useState(initialData?.tags.join(', ') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // We only save the metadata here. Blocks are managed independently in DetailView.
    onSave({
      icon: icon || undefined,
      title,
      content: "", // Legacy
      summary,
      downloadUrl: downloadUrl || undefined,
      visitUrl: visitUrl || undefined,
      tags: tagsString.split(',').map(t => t.trim()).filter(Boolean),
    });
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">
          {initialData ? 'Editar Entrada' : 'Crear Nueva Entrada'}
        </h2>
        <Button variant="ghost" onClick={onCancel} className="text-gray-500 hover:text-white">
          <X size={24} />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* MAIN INFO CARD */}
        <div className="bg-surface p-8 rounded-2xl border border-white/5 shadow-xl space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Título</label>
            <div className="flex gap-4 items-start">
              <IconPicker
                selectedIcon={icon}
                onSelect={setIcon}
              />
              <input
                required
                type="text"
                className="w-full bg-background border border-white/10 rounded-lg p-4 text-white text-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Apuntes de React..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Resumen / Descripción Principal</label>
            <textarea
              required
              rows={4}
              className="w-full bg-background border border-white/10 rounded-lg p-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-y"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Descripción principal de la tarjeta..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-background/30 rounded-xl border border-white/5">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                <Download size={16} /> Enlace de Descarga
              </label>
              <input
                type="url"
                className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none text-sm placeholder-gray-600"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                <LinkIcon size={16} /> Enlace de Visita
              </label>
              <input
                type="url"
                className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none text-sm placeholder-gray-600"
                value={visitUrl}
                onChange={(e) => setVisitUrl(e.target.value)}
                placeholder="https://mi-sitio-web.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Etiquetas</label>
            <div className="relative">
              <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                className="w-full bg-background border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-primary outline-none"
                value={tagsString}
                onChange={(e) => setTagsString(e.target.value)}
                placeholder="etiqueta1, etiqueta2..."
              />
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-4 pt-6 border-t border-white/5 sticky bottom-0 bg-[#121212] py-6 z-10">
          <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" className="flex-1 py-3 text-lg shadow-[0_0_20px_rgba(187,134,252,0.2)]">
            <Save size={20} /> Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  );
};