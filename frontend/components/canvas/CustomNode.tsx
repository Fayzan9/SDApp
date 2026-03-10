"use client";
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { COMPONENT_REGISTRY } from '@/lib/componentRegistry';
import { cn } from '@/lib/utils';

export const CustomNode = memo(({ data, selected }: NodeProps) => {
    const componentDef = COMPONENT_REGISTRY[data.type as string];
    const Icon = componentDef?.icon;

    return (
        <div
            className={cn(
                "group flex flex-col items-center gap-2 p-3 rounded-xl border-2 bg-white transition-all min-w-[120px]",
                selected ? "border-blue-500 shadow-lg ring-4 ring-blue-50" : "border-slate-200 hover:border-slate-300 shadow-sm"
            )}
        >
            {/* Input Handle */}
            {componentDef?.ports.inputs > 0 && (
                <Handle
                    type="target"
                    position={Position.Left}
                    className="w-3 h-3 border-2 border-white bg-blue-500 !-left-1.5"
                />
            )}

            {/* Node Content */}
            <div className={cn(
                "w-12 h-12 flex items-center justify-center rounded-lg shadow-inner",
                selected ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-400 group-hover:text-slate-600"
            )}>
                {Icon && <Icon size={24} />}
            </div>

            <div className="flex flex-col items-center">
                <span className="text-[13px] font-bold text-slate-800 tracking-tight leading-none text-center">
                    {data.label as string}
                </span>
                <span className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter mt-1">
                    {componentDef?.category}
                </span>
            </div>

            {/* Output Handle */}
            {componentDef?.ports.outputs > 0 && (
                <Handle
                    type="source"
                    position={Position.Right}
                    className="w-3 h-3 border-2 border-white bg-blue-500 !-right-1.5"
                />
            )}
        </div>
    );
});

CustomNode.displayName = 'CustomNode';
