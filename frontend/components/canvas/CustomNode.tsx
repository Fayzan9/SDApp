"use client";
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { useStore } from '@/store/systemStore';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

export const CustomNode = memo(({ id, data, selected }: NodeProps) => {
    const { componentRegistry, isSimulating, offlineNodes, terminateNode, resurrectNode } = useStore();
    const componentDef = componentRegistry[data.type as string];
    const isOffline = offlineNodes.includes(id);
    const Icon = componentDef ? (LucideIcons as any)[componentDef.icon] || LucideIcons.Box : null;

    const handleKill = (e: React.MouseEvent) => {
        e.stopPropagation();
        terminateNode(id);
    };

    const handleRevive = (e: React.MouseEvent) => {
        e.stopPropagation();
        resurrectNode(id);
    };

    return (
        <div
            className={cn(
                "group flex flex-col items-center gap-2 p-3 rounded-xl border-2 bg-white transition-all min-w-[120px] relative",
                selected ? "border-blue-500 shadow-lg ring-4 ring-blue-50" : "border-slate-200 hover:border-slate-300 shadow-sm",
                isOffline && "border-rose-600 bg-rose-50 grayscale-0 shadow-[0_0_20px_rgba(225,29,72,0.2)] ring-4 ring-rose-500/20"
            )}
        >
            {/* Input Handle */}
            {componentDef?.ports.inputs > 0 && (
                <Handle
                    type="target"
                    position={Position.Left}
                    className={cn(
                        "w-3.5 h-3.5 border-2 border-white bg-blue-500 !-left-2 transition-colors",
                        isOffline && "bg-rose-600"
                    )}
                />
            )}

            {/* Chaos Overlay & Revive Action */}
            {isOffline && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-rose-600/5 rounded-xl pointer-events-none overflow-hidden">
                    <LucideIcons.Skull className="text-rose-600/10 w-24 h-24 absolute -bottom-4 -right-4 -rotate-12 translate-x-4 translate-y-4" />
                    <div className="w-full h-full border-2 border-rose-500/20 rounded-xl" />
                    
                    {/* Revive Button Overlay (Clickable) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-rose-900/0 hover:bg-rose-900/5 transition-all group/revive">
                        <button
                            onClick={handleRevive}
                            className="w-10 h-10 bg-rose-600 text-white rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/revive:opacity-100 translate-y-2 group-hover/revive:translate-y-0"
                            title="Resurrect Node"
                        >
                            <LucideIcons.Power size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Kill Action (Floating) */}
            {isSimulating && !isOffline && (
                <button
                    onClick={handleKill}
                    className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-slate-200 rounded-full shadow-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 hover:shadow-rose-100 transition-all z-20 group/kill active:scale-90"
                    title="Terminate Node (Chaos)"
                >
                    <LucideIcons.Skull size={16} className="group-hover/kill:scale-110 transition-transform" />
                </button>
            )}

            {/* Node Content */}
            <div className={cn(
                "w-14 h-14 flex items-center justify-center rounded-xl shadow-inner relative z-0 transition-colors",
                selected ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-400 group-hover:text-slate-600",
                isOffline && "bg-rose-600 text-white shadow-rose-200"
            )}>
                {Icon && <Icon size={28} />}
                
                {isOffline && (
                    <div className="absolute -top-1 -right-1 bg-white text-rose-600 p-1 rounded-full shadow-sm ring-2 ring-rose-600">
                        <LucideIcons.Skull size={10} fill="currentColor" />
                    </div>
                )}
            </div>

            <div className="flex flex-col items-center relative z-20">
                <span className={cn(
                    "text-[13px] font-bold text-slate-800 tracking-tight leading-none text-center transition-colors",
                    isOffline && "text-rose-700"
                )}>
                    {data.label as string}
                </span>
                <span className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter mt-1">
                    {componentDef?.category}
                </span>
                
                {isOffline && (
                    <div className="mt-2 flex items-center gap-1 bg-rose-600 px-2 py-0.5 rounded-full shadow-sm">
                        <LucideIcons.AlertCircle size={8} className="text-white" />
                        <span className="text-[8px] font-black text-white uppercase tracking-widest">
                            Offline
                        </span>
                    </div>
                )}
            </div>

            {/* Output Handle */}
            {componentDef?.ports.outputs > 0 && (
                <Handle
                    type="source"
                    position={Position.Right}
                    className={cn(
                        "w-3 h-3 border-2 border-white bg-blue-500 !-right-1.5",
                        isOffline && "bg-rose-400"
                    )}
                />
            )}
        </div>
    );
});

CustomNode.displayName = 'CustomNode';
