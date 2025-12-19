
import React from 'react';
import { SystemMetrics } from '../types';

interface MetricsDashboardProps {
  metrics: SystemMetrics;
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ metrics }) => {
  return (
    <section className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Edge Intelligence Engine</h2>
          <p className="text-gray-500">Real-time performance metrics on NVIDIA Jetson Orin Nano target.</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            LOCAL INFRASTRUCTURE ACTIVE
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="VRAM Usage" 
          value={`${metrics.vram.toFixed(1)} GB`} 
          subValue="of 4 GB" 
          progress={(metrics.vram / 4) * 100} 
          color="bg-blue-600"
        />
        <MetricCard 
          label="System RAM" 
          value={`${metrics.ram.toFixed(1)} GB`} 
          subValue="of 8 GB" 
          progress={(metrics.ram / 8) * 100} 
          color="bg-purple-600"
        />
        <MetricCard 
          label="Turn Latency" 
          value={`${metrics.latency} ms`} 
          subValue="Real-time target: <800ms" 
          progress={(metrics.latency / 1000) * 100} 
          color="bg-orange-500"
        />
        <MetricCard 
          label="CPU Load" 
          value={`${metrics.cpu}%`} 
          subValue="6-core ARM Cortex-A78AE" 
          progress={metrics.cpu} 
          color="bg-emerald-500"
        />
      </div>
    </section>
  );
};

const MetricCard: React.FC<{ 
  label: string; 
  value: string; 
  subValue: string; 
  progress: number; 
  color: string;
}> = ({ label, value, subValue, progress, color }) => (
  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex flex-col h-full">
      <span className="text-sm font-medium text-gray-400 mb-1">{label}</span>
      <span className="text-3xl font-bold text-gray-900 mb-2">{value}</span>
      <span className="text-xs text-gray-500 mb-6">{subValue}</span>
      <div className="mt-auto">
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} transition-all duration-1000 ease-out`} 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  </div>
);

export default MetricsDashboard;
