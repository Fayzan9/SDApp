"use client";
import React from 'react';
import { useStore } from '@/store/systemStore';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

export const LibraryPanel = () => {
    const { componentRegistry, categories, isRegistryLoading } = useStore();

    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    if (isRegistryLoading) {
        return (
            <div className="w-64 border-r bg-slate-50 flex flex-col h-full items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-xs text-slate-500 mt-2">Loading components...</p>
            </div>
        );
    }

    return (
        <div className="w-64 border-r bg-slate-50 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b bg-white">
                <h2 className="font-bold text-slate-800 tracking-tight">Component Library</h2>
                <p className="text-xs text-slate-500 mt-1">Drag and drop to builder</p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-6">
                {categories.map((category) => {
                    const components = Object.values(componentRegistry).filter(
                        (c) => c.category === category
                    );

                    if (components.length === 0) return null;

                    return (
                        <div key={category} className="space-y-2">
                            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                                {category}
                            </h3>
                            <div className="grid grid-cols-1 gap-1">
                                {components.map((component) => {
                                    const Icon = (LucideIcons as any)[component.icon] || LucideIcons.Box;
                                    return (
                                        <div
                                            key={component.type}
                                            className="group flex items-center gap-3 p-2 rounded-lg border border-transparent bg-white hover:border-blue-200 hover:shadow-sm cursor-grab active:cursor-grabbing transition-all"
                                            draggable
                                            onDragStart={(e) => onDragStart(e, component.type)}
                                        >
                                            <div className="w-9 h-9 flex items-center justify-center rounded-md bg-slate-50 group-hover:bg-blue-50 text-slate-600 group-hover:text-blue-600 transition-colors">
                                                <Icon size={18} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-700">{component.label}</span>
                                                {/* <span className="text-[10px] text-slate-400 truncate w-32">{component.description}</span> */}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
