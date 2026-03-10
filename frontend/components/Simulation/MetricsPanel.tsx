import React from 'react';
import { useStore } from '@/store/systemStore';

export default function MetricsPanel() {
    const isSimulating = useStore((state) => state.isSimulating);
    const simStats = useStore((state) => state.simStats);

    if (!isSimulating) return null;

    return (
        <div className="fixed top-20 right-6 w-64 bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-2xl p-4 z-50">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Live Metrics</h3>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Total Requests</span>
                    <span className="text-sm font-medium text-blue-600">{simStats.totalRequests}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Completed</span>
                    <span className="text-sm font-medium text-emerald-600">{simStats.completedRequests}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Error Rate</span>
                    <span className="text-sm font-medium text-rose-600">0.0%</span>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Total Throughput</div>
                    <div className="text-xl font-bold text-slate-900">
                        {simStats.totalRequests > 0 ? (simStats.completedRequests / simStats.totalRequests * 10).toFixed(1) : "0.0"}
                        <span className="text-xs font-normal text-slate-400 ml-1">avg/s</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
