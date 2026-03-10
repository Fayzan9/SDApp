import React from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from '@xyflow/react';
import { useStore } from '@/store/systemStore';

export default function PacketEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
}: EdgeProps) {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetPosition,
        targetX,
        targetY,
    });

    const isSimulating = useStore((state) => state.isSimulating);
    const simEvents = useStore((state) => state.simEvents);

    // Filter events for this specific edge
    const sourceNodeId = useStore(s => s.edges.find(e => e.id === id)?.source);
    const targetNodeId = useStore(s => s.edges.find(e => e.id === id)?.target);

    const activePackets = simEvents.filter(ev =>
        ev.event_type === 'REQUEST_MOVED' &&
        ev.source_id === sourceNodeId &&
        ev.target_id === targetNodeId
    ).slice(-3); // Only show last 3 for performance

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            {isSimulating && (
                <EdgeLabelRenderer>
                    {activePackets.map((pkt, i) => (
                        <div
                            key={`${pkt.data.request_id}-${i}`}
                            style={{
                                position: 'absolute',
                                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                                pointerEvents: 'none',
                            }}
                        >
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50" />
                        </div>
                    ))}
                </EdgeLabelRenderer>
            )}
        </>
    );
}
