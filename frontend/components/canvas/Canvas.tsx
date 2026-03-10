"use client";
import React, { useCallback, useMemo } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    BackgroundVariant,
    Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '@/store/systemStore';
import { CustomNode } from './CustomNode';

const nodeTypes = {
    custom: CustomNode,
};

export const Canvas = () => {
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addNode,
        selectNode
    } = useStore();

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');

            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
                return;
            }

            // get position
            const position = {
                x: event.clientX - 264, // Subtract library width
                y: event.clientY - 56,  // Subtract header height
            };

            addNode(type, position);
        },
        [addNode]
    );

    const onNodeClick = useCallback((_: any, node: any) => {
        selectNode(node.id);
    }, [selectNode]);

    const onPaneClick = useCallback(() => {
        selectNode(null);
    }, [selectNode]);

    return (
        <div className="flex-1 relative h-full bg-slate-50">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
                <Controls className="bg-white border-slate-200 shadow-sm" />

                <Panel position="top-left" className="bg-white/80 backdrop-blur-sm p-2 rounded-lg border border-slate-200 shadow-sm">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                        Canvas
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    );
};
