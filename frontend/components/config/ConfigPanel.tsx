"use client";
import React from 'react';
import { useStore } from '@/store/systemStore';
import { Settings2, Trash2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ConfigPanel = () => {
    const { nodes, selectedNodeId, updateNodeConfig, deleteNode, componentRegistry } = useStore();

    const selectedNode = nodes.find((n) => n.id === selectedNodeId);
    const componentDef = selectedNode ? componentRegistry[selectedNode.data.type as string] : null;

    if (!selectedNode || !componentDef) {
        return null;
    }

    const handleConfigChange = (name: string, value: any) => {
        updateNodeConfig(selectedNode.id, { [name]: value });
    };

    return (
        <div className="w-80 border-l bg-slate-50 flex flex-col h-full overflow-hidden shadow-2xl z-10">
            <div className="p-4 border-b bg-white flex items-center justify-between">
                <h2 className="font-bold text-slate-800 tracking-tight flex items-center gap-2">
                    <Settings2 size={18} className="text-blue-500" />
                    {componentDef.label} Properties
                </h2>
                <button
                    onClick={() => deleteNode(selectedNode.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete component"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                    <p className="text-[11px] text-blue-600 leading-relaxed font-medium">
                        {componentDef.description}
                    </p>
                </div>

                <div className="space-y-4 pt-2">
                    {componentDef.config_schema.map((field: any) => (
                        <div key={field.name} className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    {field.label}
                                </label>
                                {field.unit && (
                                    <span className="text-[10px] font-medium text-slate-400">
                                        {field.unit}
                                    </span>
                                )}
                            </div>

                            {field.type === 'number' && (
                                <input
                                    type="number"
                                    value={(selectedNode.data.config as any)[field.name]}
                                    onChange={(e) => handleConfigChange(field.name, Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm"
                                />
                            )}

                            {field.type === 'string' && (
                                <input
                                    type="text"
                                    value={(selectedNode.data.config as any)[field.name]}
                                    onChange={(e) => handleConfigChange(field.name, e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm"
                                />
                            )}

                            {field.type === 'select' && (
                                <select
                                    value={(selectedNode.data.config as any)[field.name]}
                                    onChange={(e) => handleConfigChange(field.name, e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-no-repeat bg-[right_8px_center]"
                                >
                                    {field.options?.map((opt: string) => (
                                        <option key={opt} value={opt}>
                                            {opt.replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4 border-t bg-slate-50/50 mt-auto">
                <div className="text-[10px] text-slate-400 text-center font-medium">
                    Node ID: <code className="bg-slate-100 px-1 py-0.5 rounded">{selectedNode.id}</code>
                </div>
            </div>
        </div>
    );
};
