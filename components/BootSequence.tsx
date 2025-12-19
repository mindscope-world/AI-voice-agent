
import React, { useState, useEffect } from 'react';

interface BootSequenceProps {
  onComplete: () => void;
}

const BOOT_LOGS = [
  "INITIALIZING YULETIDE CORE...",
  "CONNECTING TO NVIDIA JETSON ORIN NANO...",
  "VERIFYING AMPERE ARCHITECTURE... OK (1024 CORES)",
  "ALLOCATING VRAM: 1.2GB/4GB... RESERVED",
  "LOADING ASR MODULE: WHISPER-TINY (FP16)... OK",
  "LOADING REASONING ENGINE: LFM2-700M... OK",
  "CALIBRATING NEUPHONIC TTS... READY",
  "ESTABLISHING SECURE EDGE BRIDGE...",
  "PRIVACY PROTOCOLS: ACTIVE",
  "SYSTEM STATUS: NOMINAL",
  "LAUNCHING INTERFACE..."
];

const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < BOOT_LOGS.length) {
        setLogs(prev => [...prev, BOOT_LOGS[logIndex]]);
        logIndex++;
        setProgress((logIndex / BOOT_LOGS.length) * 100);
      } else {
        clearInterval(logInterval);
        setTimeout(onComplete, 800);
      }
    }, 150);

    return () => clearInterval(logInterval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900 flex flex-col items-center justify-center p-8 text-blue-400 font-mono">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-xl">Y</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-wider text-white">YULETIDE_OS v2.5.0</h2>
            <p className="text-xs opacity-50 uppercase tracking-[0.3em]">SECURE EDGE INTELLIGENCE PLATFORM</p>
          </div>
        </div>

        {/* Terminal Window */}
        <div className="bg-black/50 border border-blue-900/50 rounded-2xl p-6 h-[400px] overflow-hidden flex flex-col-reverse shadow-2xl shadow-blue-900/20">
          <div className="space-y-1">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="opacity-30">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                <span className={i === logs.length - 1 ? "text-white font-bold" : ""}>
                  {log}
                  {i === logs.length - 1 && <span className="inline-block w-2 h-4 bg-blue-400 ml-2 animate-pulse align-middle"></span>}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-4">
          <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
            <span>Kernel Initialization</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden border border-gray-700">
            <div 
              className="h-full bg-blue-500 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="pt-8 flex justify-between items-center opacity-30 text-[10px] uppercase tracking-widest">
          <div className="flex gap-6">
            <span>LOCAL_MODE: ON</span>
            <span>ENCRYPTION: AES-256</span>
          </div>
          <span>PROJECT_YULETIDE_STABLE_BUILD</span>
        </div>
      </div>

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
    </div>
  );
};

export default BootSequence;
