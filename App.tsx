
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import LiveAgent from './components/LiveAgent';
import MetricsDashboard from './components/MetricsDashboard';
import Specs from './components/Specs';
import BootSequence from './components/BootSequence';
import { AgentPersona, SystemMetrics } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'info' | 'specs' | 'live'>('info');
  const [isBooting, setIsBooting] = useState(false);
  const [persona, setPersona] = useState<AgentPersona>(AgentPersona.YULETIDE_CORE);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    vram: 1.2,
    ram: 3.1,
    latency: 642,
    cpu: 42,
    temperature: 52
  });

  // Simulate hardware metrics fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        vram: Math.max(0.8, Math.min(1.8, prev.vram + (Math.random() - 0.5) * 0.1)),
        ram: Math.max(2.5, Math.min(3.8, prev.ram + (Math.random() - 0.5) * 0.1)),
        latency: Math.floor(Math.max(450, Math.min(950, prev.latency + (Math.random() - 0.5) * 50))),
        cpu: Math.floor(Math.max(20, Math.min(65, prev.cpu + (Math.random() - 0.5) * 5))),
        temperature: Math.floor(Math.max(45, Math.min(60, prev.temperature + (Math.random() - 0.5) * 2))),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLaunchCore = () => {
    setIsBooting(true);
  };

  const handleBootComplete = () => {
    setIsBooting(false);
    setActiveTab('live');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} onLaunch={handleLaunchCore} />
      
      {isBooting && <BootSequence onComplete={handleBootComplete} />}

      <main className="flex-grow pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {activeTab === 'info' && (
            <div className="space-y-24">
              <Hero onTryLive={handleLaunchCore} />
              <MetricsDashboard metrics={metrics} />
            </div>
          )}
          
          {activeTab === 'specs' && (
            <Specs />
          )}
          
          {activeTab === 'live' && (
            <div className="flex flex-col lg:flex-row gap-8 items-start animate-in fade-in duration-700">
               <div className="w-full lg:w-2/3">
                  <LiveAgent 
                    persona={persona} 
                    onPersonaChange={setPersona}
                    metrics={metrics}
                  />
               </div>
               <div className="w-full lg:w-1/3 space-y-6">
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-semibold mb-4">Architecture Insight</h3>
                    <p className="text-gray-500 leading-relaxed mb-6">
                      YULETIDE runs a quantized <strong>LFM2-700M</strong> LLM paired with <strong>Whisper Tiny</strong> for speech recognition. This demo utilizes <strong>Gemini 2.5</strong> for high-fidelity native audio synthesis.
                    </p>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm py-2 border-b border-gray-50">
                        <span className="text-gray-400">ASR Model</span>
                        <span className="font-medium">Whisper-Tiny (FP16)</span>
                      </div>
                      <div className="flex justify-between text-sm py-2 border-b border-gray-50">
                        <span className="text-gray-400">Reasoning</span>
                        <span className="font-medium">Liquid-LFM2-700M</span>
                      </div>
                      <div className="flex justify-between text-sm py-2">
                        <span className="text-gray-400">Synthesis</span>
                        <span className="font-medium">Gemini 2.5 Native Audio</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-200">
                    <h3 className="text-xl font-semibold mb-2">Private by Design</h3>
                    <p className="text-blue-100 text-sm leading-relaxed">
                      This interface simulates the on-device experience. In a production YULETIDE environment, no audio or text data ever transits the public internet.
                    </p>
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© 2024 Project YULETIDE Platform. Built for Edge Intelligence.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Documentation</a>
            <a href="#" className="hover:text-gray-900 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
