"use client";
import React, { useCallback, useMemo } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    BackgroundVariant,
    Panel,
    useReactFlow,
    ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '@/store/systemStore';
import { CustomNode } from './CustomNode';
import PacketEdge from '@/components/Simulation/PacketEdge';
import ContextMenu from './ContextMenu';
import { useState, useRef } from 'react';

const nodeTypes = {
    custom: CustomNode,
};

const edgeTypes = {
    default: PacketEdge,
    packet: PacketEdge,
};

const CanvasInner = () => {
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addNode,
        selectNode,
        copyNode,
        pasteNode,
        onReconnect
    } = useStore();

    const { screenToFlowPosition } = useReactFlow();
    const [menu, setMenu] = useState<{ id: string; type: 'node' | 'edge'; top?: number; left?: number; right?: number; bottom?: number } | null>(null);
    const ref = useRef<HTMLDivElement>(null);

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

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            // Center the node on the drop point (assuming ~120x120 node size)
            const centeredPosition = {
                x: position.x - 60,
                y: position.y - 60,
            };

            addNode(type, centeredPosition);
        },
        [addNode, screenToFlowPosition]
    );

    const mousePos = useRef({ x: 0, y: 0 });
    const onMouseMove = useCallback((event: React.MouseEvent) => {
        mousePos.current = { x: event.clientX, y: event.clientY };
    }, []);

    const handlePaste = useCallback((event: KeyboardEvent) => {
        const isCtrl = event.ctrlKey || event.metaKey;
        if (isCtrl && event.key === 'v') {
            const position = screenToFlowPosition(mousePos.current);
            // Center paste position
            const centeredPosition = {
                x: position.x - 60,
                y: position.y - 60,
            };
            pasteNode(centeredPosition);
        }
        if (isCtrl && event.key === 'c') {
            const selectedNode = nodes.find(n => n.selected);
            if (selectedNode) {
                copyNode(selectedNode.id);
            }
        }
    }, [screenToFlowPosition, pasteNode, nodes, copyNode]);

    React.useEffect(() => {
        window.addEventListener('keydown', handlePaste);
        return () => window.removeEventListener('keydown', handlePaste);
    }, [handlePaste]);

    const onNodeClick = useCallback((_: any, node: any) => {
        selectNode(node.id);
    }, [selectNode]);

    const onNodeContextMenu = useCallback(
        (event: React.MouseEvent, node: any) => {
            event.preventDefault();

            if (!ref.current) return;
            const pane = ref.current.getBoundingClientRect();

            setMenu({
                id: node.id,
                type: 'node',
                top: event.clientY < pane.y + pane.height - 200 ? event.clientY - pane.y : undefined,
                left: event.clientX < pane.x + pane.width - 200 ? event.clientX - pane.x : undefined,
                right: event.clientX >= pane.x + pane.width - 200 ? pane.x + pane.width - event.clientX : undefined,
                bottom: event.clientY >= pane.y + pane.height - 200 ? pane.y + pane.height - event.clientY : undefined,
            });
        },
        [setMenu]
    );

    const onEdgeContextMenu = useCallback(
        (event: React.MouseEvent, edge: any) => {
            event.preventDefault();

            if (!ref.current) return;
            const pane = ref.current.getBoundingClientRect();

            setMenu({
                id: edge.id,
                type: 'edge',
                top: event.clientY < pane.y + pane.height - 200 ? event.clientY - pane.y : undefined,
                left: event.clientX < pane.x + pane.width - 200 ? event.clientX - pane.x : undefined,
                right: event.clientX >= pane.x + pane.width - 200 ? pane.x + pane.width - event.clientX : undefined,
                bottom: event.clientY >= pane.y + pane.height - 200 ? pane.y + pane.height - event.clientY : undefined,
            });
        },
        [setMenu]
    );

    const onPaneClick = useCallback(() => {
        selectNode(null);
        setMenu(null);
    }, [selectNode]);

    return (
        <div ref={ref} className="flex-1 relative h-full bg-slate-50" onMouseMove={onMouseMove}>
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
                onNodeContextMenu={onNodeContextMenu}
                onEdgeContextMenu={onEdgeContextMenu}
                onReconnect={onReconnect}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                edgesReconnectable={true}
                defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
                minZoom={0.2}
                maxZoom={2}
            >
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
                <Controls className="bg-white border-slate-200 shadow-sm" />

                <Panel position="top-left" className="bg-white/80 backdrop-blur-sm p-2 rounded-lg border border-slate-200 shadow-sm">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                        Canvas
                    </div>
                </Panel>
                {menu && <ContextMenu onClick={() => setMenu(null)} {...menu} />}
            </ReactFlow>
        </div>
    );
};

export const Canvas = () => (
    <ReactFlowProvider>
        <CanvasInner />
    </ReactFlowProvider>
);
