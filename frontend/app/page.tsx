"use client";
import { LibraryPanel } from '@/components/library/LibraryPanel';
import { Canvas } from '@/components/canvas/Canvas';
import { ConfigPanel } from '@/components/config/ConfigPanel';
import { useStore } from '@/store/systemStore';
import { persistence } from '@/lib/persistence';
import { useState, useEffect } from 'react';
import { Save, Trash2, FolderOpen, PencilLine, Play, Square, Activity } from 'lucide-react';
import MetricsPanel from '@/components/Simulation/MetricsPanel';

export default function Home() {
  const {
    systemName,
    setSystemName,
    saveDesign,
    clearCanvas,
    loadDesign,
    isSimulating,
    startSimulation,
    stopSimulation,
    fetchComponents,
    selectedNodeId
  } = useStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [savedDesigns, setSavedDesigns] = useState<any[]>([]);
  const [showLoadMenu, setShowLoadMenu] = useState(false);

  useEffect(() => {
    setSavedDesigns(persistence.getAll());
    fetchComponents();
  }, []);

  const handleSave = () => {
    saveDesign();
    setSavedDesigns(persistence.getAll());
  };

  const handleLoad = (id: string) => {
    loadDesign(id);
    setShowLoadMenu(false);
  };

  return (
    <main className="flex flex-col h-screen w-screen overflow-hidden text-slate-900 bg-white">
      {/* Top Navigation */}
      <header className="h-14 border-b flex items-center justify-between px-6 bg-white z-20 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full border-2 border-white" />
            </div>
            <h1 className="font-bold text-xl tracking-tight">System<span className="text-blue-600">Flow</span></h1>
          </div>

          <div className="h-6 w-[1px] bg-slate-200" />

          <div className="flex items-center gap-2">
            {isEditingName ? (
              <input
                autoFocus
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                className="text-sm font-semibold text-slate-700 bg-slate-50 px-2 py-1 rounded border border-blue-200 outline-none"
              />
            ) : (
              <div
                onClick={() => setIsEditingName(true)}
                className="group flex items-center gap-2 cursor-pointer"
              >
                <span className="text-sm font-semibold text-slate-700">{systemName}</span>
                <PencilLine size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowLoadMenu(!showLoadMenu)}
              className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all flex items-center gap-2"
            >
              <FolderOpen size={16} />
              Open
            </button>

            {showLoadMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2">
                <div className="px-3 py-1 mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                    Saved Architectures
                  </span>
                </div>
                {savedDesigns.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-slate-400 italic">No saved designs Yet</div>
                ) : (
                  savedDesigns.map((design) => (
                    <button
                      key={design.id}
                      onClick={() => handleLoad(design.id)}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex flex-col"
                    >
                      <span className="font-medium">{design.name}</span>
                      <span className="text-[10px] text-slate-400">
                        Updated {new Date(design.updatedAt).toLocaleDateString()}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <button
            onClick={clearCanvas}
            className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all flex items-center gap-2"
          >
            <Trash2 size={16} />
            Clear
          </button>

          <div className="h-6 w-[1px] bg-slate-200 mx-1" />

          {isSimulating ? (
            <button
              onClick={stopSimulation}
              className="px-4 py-1.5 text-sm font-medium bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all flex items-center gap-2 active:scale-95 border border-red-200"
            >
              <Square size={16} fill="currentColor" />
              Stop Simulation
            </button>
          ) : (
            <button
              onClick={startSimulation}
              className="px-4 py-1.5 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shadow-md flex items-center gap-2 active:scale-95"
            >
              <Play size={16} fill="currentColor" />
              Run Simulation
            </button>
          )}

          <div className="h-6 w-[1px] bg-slate-200 mx-1" />

          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md flex items-center gap-2 active:scale-95"
          >
            <Save size={16} />
            Save Design
          </button>
        </div>
      </header>

      {/* Main Builder Area */}
      <div className="flex flex-1 overflow-hidden relative">
        <LibraryPanel />
        <Canvas />
        {selectedNodeId && <ConfigPanel />}
        <MetricsPanel />
      </div>
    </main>
  );
}
