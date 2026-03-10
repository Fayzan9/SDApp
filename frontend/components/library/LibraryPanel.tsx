"use client";
import React from 'react';
import { COMPONENT_REGISTRY, CATEGORIES } from '@/lib/componentRegistry';
import { cn } from '@/lib/utils';

export const LibraryPanel = () => {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="w-64 border-r bg-slate-50 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b bg-white">
                <h2 className="font-bold text-slate-800 tracking-tight">Component Library</h2>
                <p className="text-xs text-slate-500 mt-1">Drag and drop to builder</p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-6">
                {CATEGORIES.map((category) => {
                    const components = Object.values(COMPONENT_REGISTRY).filter(
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
                                    const Icon = component.icon;
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
