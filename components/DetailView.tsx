import React, { useState, useRef, useEffect } from 'react';
import { DataItem, ContentBlock } from '../types';
import { Button } from './Button';
import { TipTapEditor } from './TipTapEditor';
import { BlockEditorModal } from './BlockEditorModal';
import { ArrowLeft, Download, ExternalLink, Trash2, Edit2, Plus, Save, X, Check } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';
import { Editor } from '@tiptap/react';

interface DetailViewProps {
  item: DataItem;
  onBack: () => void;
  onUpdate: (data: Omit<DataItem, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
}

export const DetailView: React.FC<DetailViewProps> = ({ item, onBack, onUpdate, onDelete }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedItem, setEditedItem] = useState<DataItem>(item);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);



  const [showEditTab, setShowEditTab] = useState(true);
  const [blockEditor, setBlockEditor] = useState<{
    isOpen: boolean;
    type: 'quote' | 'code';
  }>({
    isOpen: false,
    type: 'quote'
  });

  const activeEditorRef = useRef<Editor | null>(null);
  const summaryTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [pendingModalOpen, setPendingModalOpen] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { }
  });

  // Auto-resize summary textarea
  useEffect(() => {
    if (summaryTextareaRef.current) {
      summaryTextareaRef.current.style.height = 'auto';
      summaryTextareaRef.current.style.height = summaryTextareaRef.current.scrollHeight + 'px';
    }
  }, [editedItem.summary, showEditTab, isEditMode]);

  // Effect to open modal once editor is ready if pending
  useEffect(() => {
    if (pendingModalOpen && activeEditorRef.current && editingBlockId) {
      setBlockEditor(prev => ({ ...prev, isOpen: true }));
      setPendingModalOpen(false);
    }
  }, [pendingModalOpen, editingBlockId, activeEditorRef.current]);

  const handleSaveChanges = () => {
    onUpdate({
      title: editedItem.title,
      summary: editedItem.summary,
      content: editedItem.content || '',
      tags: editedItem.tags,
      blocks: editedItem.blocks,
      visitUrl: editedItem.visitUrl,
      downloadUrl: editedItem.downloadUrl
    });
    setIsEditMode(false);
  };

  const handleCancelEdit = () => {
    setEditedItem(item);
    setIsEditMode(false);
    setEditingBlockId(null);
    setEditingBlockId(null);
  };

  const handleAddBlockImmediately = () => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type: 'markdown',
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
          }
        ]
      }
    };

    setEditedItem(prev => ({
      ...prev,
      blocks: [...(prev.blocks || []), newBlock]
    }));

    setEditingBlockId(newBlock.id);
  };

  const handleBlockUpdate = (blockId: string, content: any) => {
    setEditedItem(prev => ({
      ...prev,
      blocks: prev.blocks?.map(b => b.id === blockId ? { ...b, content } : b) || []
    }));
  };

  const handleDeleteBlock = (blockId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Bloque',
      message: '¿Estás seguro de que quieres eliminar este bloque de contenido? Esta acción no se puede deshacer.',
      onConfirm: () => {
        setEditedItem(prev => ({
          ...prev,
          blocks: prev.blocks?.filter(b => b.id !== blockId) || []
        }));
      }
    });
  };

  const handleBlockDoubleClick = (type: 'code' | 'quote', index: number, blockId: string) => {
    // Switch to edit mode for this block
    const block = editedItem.blocks?.find(b => b.id === blockId);
    if (block) {
      setEditingBlockId(blockId);
      setBlockEditor({ isOpen: false, type }); // Will open in effect
      setPendingModalOpen(true);
    }
  };

  if (isEditMode) {
    return (
      <div className="max-w-5xl mx-auto animate-fade-in pb-20">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleCancelEdit}
            className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors text-sm font-medium"
          >
            <ArrowLeft size={18} /> Cancelar
          </button>
          <Button onClick={handleSaveChanges}>
            <Save size={18} /> Guardar Cambios
          </Button>
        </div>



        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setShowEditTab(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${showEditTab
              ? 'bg-primary text-background'
              : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
              }`}
          >
            Edit
          </button>
          <button
            onClick={() => setShowEditTab(false)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${!showEditTab
              ? 'bg-primary text-background'
              : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
              }`}
          >
            Preview
          </button>
        </div>

        <div className="bg-surface rounded-2xl p-6 border border-white/5 shadow-xl space-y-6" style={{ display: showEditTab ? 'block' : 'none' }}>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Título</label>
            <input
              type="text"
              value={editedItem.title}
              onChange={(e) => setEditedItem(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              placeholder="Título de la entrada"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Resumen</label>
            <textarea
              ref={summaryTextareaRef}
              rows={1}
              value={editedItem.summary}
              onChange={(e) => setEditedItem(prev => ({ ...prev, summary: e.target.value }))}
              className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none overflow-hidden min-h-[100px]"
              placeholder="Breve descripción..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Tags</label>
            <input
              type="text"
              value={editedItem.tags.join(', ')}
              onChange={(e) => setEditedItem(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
              className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">URL Visitar</label>
              <input
                type="url"
                value={editedItem.visitUrl || ''}
                onChange={(e) => setEditedItem(prev => ({ ...prev, visitUrl: e.target.value }))}
                className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">URL Descargar</label>
              <input
                type="url"
                value={editedItem.downloadUrl || ''}
                onChange={(e) => setEditedItem(prev => ({ ...prev, downloadUrl: e.target.value }))}
                className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-400">Bloques de Contenido</label>
              <button
                onClick={handleAddBlockImmediately}
                className="flex items-center gap-2 text-primary hover:text-white transition-colors text-sm font-medium"
              >
                <Plus size={16} /> Añadir Bloque
              </button>
            </div>

            <div className="space-y-3">
              {editedItem.blocks && editedItem.blocks.map((block, index) => (
                <div key={block.id} className="bg-[#1c1c1c] rounded-lg border border-white/10 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500">Bloque {index + 1}</span>
                      {block.type === 'markdown' && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded border border-primary/30">MD</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {editingBlockId === block.id ? (
                        <button
                          onClick={() => setEditingBlockId(null)}
                          className="text-primary hover:text-white transition-colors p-1"
                          title="Terminar edición"
                        >
                          <Check size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingBlockId(block.id)}
                          className="text-gray-400 hover:text-white transition-colors p-1"
                          title="Editar bloque"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteBlock(block.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors p-1"
                        title="Eliminar bloque"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <TipTapEditor
                      content={block.content}
                      onUpdate={(content) => handleBlockUpdate(block.id, content)}
                      isEditable={editingBlockId === block.id}
                      editorRef={editingBlockId === block.id ? activeEditorRef : undefined}
                      autoFocus={editingBlockId === block.id}
                      onBlockDoubleClick={(type, idx) => handleBlockDoubleClick(type, idx, block.id)}
                    />
                  </div>
                </div>
              ))}


            </div>
          </div>
        </div>

        <div style={{ display: !showEditTab ? 'block' : 'none' }}>
          <div className="bg-surface h-fit rounded-xl p-6 border border-white/5 shadow-xl relative mb-8">
            <div className="absolute top-5 right-5 flex gap-2 z-20">
              {editedItem.visitUrl && (
                <a href={editedItem.visitUrl} target="_blank" rel="noopener noreferrer" className="pointer-events-none opacity-70">
                  <Button
                    variant="secondary"
                    className="!py-1.5 !px-3 text-xs !bg-transparent !border !border-[#bb86fc] !text-[#bb86fc] hover:!bg-transparent h-8 shadow-none"
                  >
                    <ExternalLink size={14} /> <span className="hidden sm:inline">Visitar</span>
                  </Button>
                </a>
              )}

              {editedItem.downloadUrl && (
                <a href={editedItem.downloadUrl} target="_blank" rel="noopener noreferrer" className="pointer-events-none opacity-70">
                  <Button
                    variant="secondary"
                    className="!py-1.5 !px-3 text-xs !bg-transparent !border !border-[#bb86fc] !text-[#bb86fc] hover:!bg-transparent h-8 shadow-none"
                  >
                    <Download size={14} /> <span className="hidden sm:inline">Descargar</span>
                  </Button>
                </a>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 pr-32">{editedItem.title || 'Título'}</h1>

            <p className="text-gray-300 text-base leading-relaxed whitespace-pre-wrap max-w-4xl mb-4">{editedItem.summary || 'Resumen'}</p>

            {editedItem.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-white/5">
                {editedItem.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase tracking-wide">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {editedItem.blocks && editedItem.blocks.length > 0 && (
            <div className="space-y-6 mb-8">
              {editedItem.blocks.map((block) => (
                <div key={block.id} className="bg-surface h-fit rounded-xl border border-white/5 shadow-lg overflow-hidden p-6">
                  <TipTapEditor
                    content={block.content}
                    onUpdate={() => { }}
                    isEditable={false}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <BlockEditorModal
          isOpen={blockEditor.isOpen}
          onClose={() => setBlockEditor(prev => ({ ...prev, isOpen: false }))}
          editor={activeEditorRef.current}
          type={blockEditor.type}
        />

        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
        />

      </div >



    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-20">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-gray-400 hover:text-primary transition-colors text-sm font-medium"
      >
        <ArrowLeft size={18} /> Volver al Inicio
      </button>

      <div className="bg-surface h-fit rounded-xl p-6 border border-white/5 shadow-xl relative mb-8">
        <div className="absolute top-5 right-5 flex gap-2 z-20">
          {item.visitUrl && (
            <a href={item.visitUrl} target="_blank" rel="noopener noreferrer">
              <Button
                variant="secondary"
                className="!py-1.5 !px-3 text-xs !bg-transparent !border !border-[#bb86fc] !text-[#bb86fc] hover:!bg-transparent h-8 shadow-none"
              >
                <ExternalLink size={14} /> <span className="hidden sm:inline">Visitar</span>
              </Button>
            </a>
          )}

          {item.downloadUrl && (
            <a href={item.downloadUrl} target="_blank" rel="noopener noreferrer">
              <Button
                variant="secondary"
                className="!py-1.5 !px-3 text-xs !bg-transparent !border !border-[#bb86fc] !text-[#bb86fc] hover:!bg-transparent h-8 shadow-none"
              >
                <Download size={14} /> <span className="hidden sm:inline">Descargar</span>
              </Button>
            </a>
          )}

          <Button
            variant="secondary"
            onClick={() => setIsEditMode(true)}
            className="!py-1.5 !px-3 text-xs !bg-transparent !border !border-[#bb86fc] !text-[#bb86fc] hover:!bg-transparent h-8 shadow-none"
          >
            <Edit2 size={14} /> <span className="hidden sm:inline">Editar</span>
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setConfirmDialog({
                isOpen: true,
                title: 'Eliminar Entrada',
                message: '¿Estás seguro de que deseas eliminar esta entrada permanentemente? Esta acción no se puede deshacer.',
                onConfirm: () => onDelete(item.id)
              });
            }}
            className="!py-1.5 !px-3 h-8"
          >
            <Trash2 size={14} />
          </Button>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 pr-32">{item.title}</h1>

        <p className="text-gray-300 text-base leading-relaxed whitespace-pre-wrap max-w-4xl mb-4">{item.summary}</p>

        {item.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-white/5">
            {item.tags.map((tag, idx) => (
              <span key={idx} className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase tracking-wide">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {item.blocks && item.blocks.length > 0 && (
        <div className="space-y-6 mb-8">
          {item.blocks.map((block) => (
            <div key={block.id} className="bg-surface h-fit rounded-xl border border-white/5 shadow-lg overflow-hidden p-6">
              <TipTapEditor
                content={block.content}
                onUpdate={() => { }}
                isEditable={false}
              />
            </div>
          ))}
        </div>
      )}


      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />
    </div>
  );
};