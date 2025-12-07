import React, { useState, useEffect, useMemo } from 'react';
import { DataItem, ViewState } from './types';
import { Card } from './components/Card';
import { DataForm } from './components/DataForm';
import { DetailView } from './components/DetailView';
import { Button } from './components/Button';
import { Plus, Search, Layers, Loader2, WifiOff, Settings, Code, Type } from 'lucide-react';
import { subscribeToItems, addItem, updateItem, deleteItem } from './services/firebase';
import { subscribeToStyleConfig } from './services/codeStyleService';

const App: React.FC = () => {
  const [items, setItems] = useState<DataItem[]>([]);
  const [view, setView] = useState<ViewState>('LIST');
  const [viewMode, setViewMode] = useState<'normal' | 'code'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('viewMode') as 'normal' | 'code') || 'normal';
    }
    return 'normal';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DataItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to apply code style dynamically to DOM
  const applyCodeStyleToDOM = (config: any) => {
    const rgbaMatch = config.bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    let bgColorWithOpacity = config.bgColor;

    if (rgbaMatch) {
      const [_, r, g, b] = rgbaMatch;
      bgColorWithOpacity = `rgba(${r}, ${g}, ${b}, ${config.opacity / 100})`;
    }

    const widthValue = config.width === 'auto' ? 0 : parseFloat(config.width) || 0;
    const heightValue = config.height === 'auto' ? 0 : parseFloat(config.height) || 0;

    const existingStyle = document.getElementById('dynamic-code-style');
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'dynamic-code-style';
    style.innerHTML = `
      :not(pre) > code {
        background-color: ${bgColorWithOpacity} !important;
        color: ${config.textColor} !important;
        font-size: ${config.fontSize} !important;
        border-radius: ${config.borderRadius} !important;
        padding: 0px 2px !important;
        ${config.width !== 'auto' && widthValue > 0 ? `min-width: ${config.width} !important;` : ''}
        ${config.height !== 'auto' && heightValue > 0 ? `min-height: ${config.height} !important;` : ''}

        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;

        vertical-align: middle !important;
        border: none !important;
        font-family: 'Consolas', monospace !important;
        line-height: 1 !important;
        margin: 0 1px !important;
      }

      button code, a code, .btn code {
        background: transparent !important;
        padding: 0 !important;
        color: inherit !important;
        border: none !important;
      }

      code::before, code::after {
        content: "" !important;
        display: none !important;
      }
    `;

    document.head.appendChild(style);
  };

  // Subscribe to style config changes from cloud
  useEffect(() => {
    const unsubscribe = subscribeToStyleConfig((config) => {
      applyCodeStyleToDOM(config.code);
    });
    return () => unsubscribe();
  }, [applyCodeStyleToDOM]);

  // Persist viewMode to localStorage
  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  // Subscribe to Firestore updates
  useEffect(() => {
    const unsubscribe = subscribeToItems((newItems) => {
      setItems(newItems);
      setLoading(false);
      setError(null);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const filteredItems = useMemo(() => {
    const lowerQ = searchQuery.toLowerCase();
    return items.filter(item =>
      item.title.toLowerCase().includes(lowerQ) ||
      item.tags.some(t => t.toLowerCase().includes(lowerQ)) ||
      item.summary.toLowerCase().includes(lowerQ)
    );
  }, [items, searchQuery]);

  const handleCreate = async (data: Omit<DataItem, 'id' | 'createdAt'>) => {
    try {
      await addItem(data);
      setView('LIST');
    } catch (e) {
      alert("Error al guardar en la nube.");
    }
  };

  const handleUpdate = async (data: Omit<DataItem, 'id' | 'createdAt'>) => {
    if (!selectedItem) return;
    try {
      await updateItem(selectedItem.id, data);

      // Update local selected item to reflect changes immediately in UI if still in Detail view
      setSelectedItem(prev => prev ? { ...prev, ...data } : null);
      // We do NOT switch view here automatically to allow inline edits in DetailView
    } catch (e) {
      alert("Error al actualizar.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id);
      setView('LIST');
      setSelectedItem(null);
    } catch (e) {
      alert("Error al eliminar.");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-white p-4 text-center">
        <WifiOff size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error de Conexión</h2>
        <p className="text-gray-400 max-w-md">{error}</p>
        <p className="text-sm text-gray-500 mt-4">Por favor verifica tu conexión a internet o la configuración de Firebase.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans text-gray-200 selection:bg-primary selection:text-background pb-20">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="w-full max-w-[95%] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => { setView('LIST'); setSearchQuery(''); }}
            >
              <div className="p-2 bg-surface rounded-lg group-hover:bg-primary/20 transition-colors">
                <Layers className="text-primary" size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                CodeBy<span className="text-primary">Dante</span>
              </span>
            </div>

            {view === 'LIST' && (
              <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Buscar en CodeByDante..."
                  className="w-full bg-surface border border-white/5 focus:border-primary rounded-full py-2.5 pl-10 pr-4 outline-none text-sm transition-all shadow-inner bg-opacity-50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="relative">
                <Button
                  variant="secondary"
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="bg-surface border border-white/5 hover:bg-surfaceHover"
                >
                  <Settings size={20} />
                </Button>

                {isSettingsOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsSettingsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-surface border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-1">
                        <button
                          onClick={() => {
                            setViewMode('normal');
                            setIsSettingsOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${viewMode === 'normal'
                            ? 'bg-primary/10 text-primary'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                          <Type size={16} />
                          Modo Normal
                        </button>
                        <button
                          onClick={() => {
                            setViewMode('code');
                            setIsSettingsOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${viewMode === 'code'
                            ? 'bg-primary/10 text-primary'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                          <Code size={16} />
                          Modo Código
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Button onClick={() => { setSelectedItem(null); setView('CREATE'); }}>
                <Plus size={20} /> <span className="hidden sm:inline">Nueva Entrada</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Search Bar */}
      {view === 'LIST' && (
        <div className="md:hidden px-4 py-4 bg-background border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full bg-surface border border-white/5 focus:border-primary rounded-lg py-3 pl-10 pr-4 outline-none text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="w-full max-w-[95%] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary mb-4" size={40} />
            <p className="text-gray-500">Sincronizando con CodeByDante Cloud...</p>
          </div>
        ) : (
          <>
            {view === 'LIST' && (
              <>
                {filteredItems.length === 0 ? (
                  <div className="text-center py-20 opacity-50">
                    <div className="inline-block p-6 rounded-full bg-surface mb-4">
                      <Search size={48} className="text-gray-600" />
                    </div>
                    <h3 className="text-xl font-medium">No se encontraron elementos</h3>
                    <p className="text-gray-500 mt-2">El repositorio está vacío o no hay coincidencias.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filteredItems.map(item => (
                      <Card
                        key={item.id}
                        item={item}
                        viewMode={viewMode}
                        onClick={(i) => { setSelectedItem(i); setView('DETAIL'); }}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {view === 'CREATE' && (
              <DataForm
                onSave={handleCreate}
                onCancel={() => setView('LIST')}
              />
            )}

            {view === 'EDIT' && selectedItem && (
              <DataForm
                initialData={selectedItem}
                onSave={(data) => {
                  handleUpdate(data);
                  setView('DETAIL'); // Explicitly go back to detail after full edit
                }}
                onCancel={() => setView('DETAIL')}
              />
            )}

            {view === 'DETAIL' && selectedItem && (
              <DetailView
                item={selectedItem}
                onBack={() => setView('LIST')}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            )}
          </>
        )}

      </main>
    </div>
  );
};

export default App;