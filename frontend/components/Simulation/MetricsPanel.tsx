import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/systemStore';
import { Activity, Clock, Zap, AlertTriangle, CheckCircle, GripHorizontal } from 'lucide-react';

export default function MetricsPanel() {
    const isSimulating = useStore((state) => state.isSimulating);
    const simStats = useStore((state) => state.simStats);
    
    // Position state
    const [position, setPosition] = useState({ x: 24, y: 24 }); // Offset from bottom-right
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        // Calculate offset from the bottom-right corner where it's initially fixed
        const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            
            // Convert viewport coordinates to right/bottom offsets
            const newX = window.innerWidth - e.clientX + (dragOffset.current.x - 320); // 320 is panel width
            const newY = window.innerHeight - e.clientY + (dragOffset.current.y - 450); // Rough estimate height
            
            // Prevent dragging off screen
            const constrainedX = Math.max(10, Math.min(window.innerWidth - 330, window.innerWidth - (e.clientX - dragOffset.current.x + 320)));
            const constrainedY = Math.max(10, Math.min(window.innerHeight - 100, window.innerHeight - (e.clientY - dragOffset.current.y + 400)));

            setPosition({
                x: window.innerWidth - (e.clientX - dragOffset.current.x) - 320,
                y: window.innerHeight - (e.clientY - dragOffset.current.y) - 400
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    if (!isSimulating) return null;

    const errorRate = simStats.totalRequests > 0 
        ? ((simStats.failedRequests / simStats.totalRequests) * 100).toFixed(1) 
        : "0.0";

    const successRate = simStats.totalRequests > 0 
        ? ((simStats.completedRequests / simStats.totalRequests) * 100).toFixed(0) 
        : "100";

    return (
        <div 
            style={{ 
                bottom: `${position.y}px`, 
                right: `${position.x}px`,
                transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            className="fixed w-80 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-5 z-50 text-white overflow-hidden pointer-events-auto select-none"
        >
            {/* Drag Handle Overlay */}
            <div 
                onMouseDown={handleMouseDown}
                className="absolute top-0 left-0 right-0 h-6 cursor-grab active:cursor-grabbing flex items-center justify-center group z-10"
            >
                <div className="w-8 h-1 bg-slate-700 rounded-full group-hover:bg-slate-500 transition-colors" />
            </div>

            {/* Background Accent */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
            
            <div className="relative mt-2">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <h3 className="text-sm font-bold tracking-tight uppercase text-slate-300">System Telemetry</h3>
                    </div>
                    <Activity className="w-4 h-4 text-slate-500" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Throughput */}
                    <div className="bg-slate-800/50 rounded-xl p-3 border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-3 h-3 text-amber-400" />
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Throughput</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-mono font-bold">{simStats.throughput}</span>
                            <span className="text-[10px] text-slate-500">req/s</span>
                        </div>
                    </div>

                    {/* Success Rate */}
                    <div className="bg-slate-800/50 rounded-xl p-3 border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Success</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-mono font-bold">{successRate}</span>
                            <span className="text-[10px] text-slate-500">%</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 space-y-3">
                    {/* P50 Latency */}
                    <div className="flex justify-between items-center group">
                        <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-xs text-slate-400">P50 Latency</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-blue-100">{simStats.p50Latency}ms</span>
                    </div>

                    {/* P99 Latency */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-xs text-slate-400">P99 Latency</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-indigo-100">{simStats.p99Latency}ms</span>
                    </div>

                    {/* Errors */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                            <span className="text-xs text-slate-400">Errors</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-rose-100">
                            {simStats.failedRequests} <span className="text-[10px] text-slate-500">({errorRate}%)</span>
                        </span>
                    </div>

                    {/* Cache Hit Rate */}
                    <div className="pt-2">
                        <div className="flex justify-between items-center mb-1.5">
                            <div className="flex items-center gap-2">
                                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-xs text-slate-400">Cache Hit Rate</span>
                            </div>
                            <span className="text-xs font-mono font-bold text-emerald-100">
                                {simStats.cacheHits + simStats.cacheMisses > 0 
                                    ? ((simStats.cacheHits / (simStats.cacheHits + simStats.cacheMisses)) * 100).toFixed(1)
                                    : "0.0"}%
                            </span>
                        </div>
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-emerald-500 transition-all duration-500"
                                style={{ 
                                    width: `${simStats.cacheHits + simStats.cacheMisses > 0 
                                        ? (simStats.cacheHits / (simStats.cacheHits + simStats.cacheMisses)) * 100
                                        : 0}%` 
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Total Processed</div>
                            <div className="text-xl font-black tracking-tighter text-white">
                                {simStats.completedRequests.toLocaleString()}
                            </div>
                        </div>
                        <div className="text-[10px] text-slate-600 font-mono italic">
                            LIVE_SIM
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
