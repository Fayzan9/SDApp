"use client";
import React, { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useStore } from '@/store/systemStore';

export default function ContextMenu({
    id,
    type = 'node',
    top,
    left,
    right,
    bottom,
    onClick,
    ...props
}: {
    id: string;
    type?: 'node' | 'edge';
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
    onClick?: () => void;
} & React.HTMLAttributes<HTMLDivElement>) {
    const { copyNode, deleteNode, deleteEdge } = useStore();

    const onCopyClick = useCallback(() => {
        if (type === 'node') copyNode(id);
        onClick?.();
    }, [id, type, copyNode, onClick]);

    const onDeleteClick = useCallback(() => {
        if (type === 'node') deleteNode(id);
        if (type === 'edge') deleteEdge(id);
        onClick?.();
    }, [id, type, deleteNode, deleteEdge, onClick]);

    return (
        <div
            style={{ top, left, right, bottom }}
            className="absolute z-50 bg-white border border-slate-200 rounded-lg shadow-xl py-1 min-w-[120px]"
            {...props}
        >
            {type === 'node' && (
                <>
                    <button
                        onClick={onCopyClick}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                    >
                        <span className="flex-1">Copy</span>
                        <span className="text-[10px] text-slate-400">Ctrl+C</span>
                    </button>
                    <div className="h-[1px] bg-slate-100 my-1" />
                </>
            )}
            <button
                onClick={onDeleteClick}
                className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
                <span className="flex-1">Delete</span>
                <span className="text-[10px] text-red-400 italic">Del</span>
            </button>
        </div>
    );
}
