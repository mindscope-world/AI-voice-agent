
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { AgentPersona, SystemMetrics } from '../types';
import { PERSONAS } from '../constants';
import AudioVisualizer from './AudioVisualizer';

interface TranscriptItem {
  id: string;
  role: 'user' | 'model';
  text: string;
  isComplete: boolean;
  timestamp: number;
}

interface LiveAgentProps {
  persona: AgentPersona;
  onPersonaChange: (persona: AgentPersona) => void;
  metrics: SystemMetrics;
}

// Utility functions for audio encoding/decoding
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function resample(data: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate) return data;
  const ratio = fromRate / toRate;
  const newLength = Math.round(data.length / ratio);
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    result[i] = data[Math.min(Math.round(i * ratio), data.length - 1)];
  }
  return result;
}

function createBlob(data: Float32Array): any {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const LiveAgent: React.FC<LiveAgentProps> = ({ persona, onPersonaChange, metrics }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const personaConfig = PERSONAS[persona];

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [transcript]);

  const stopSession = () => {
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }

    sessionRef.current = null;
    setIsActive(false);
    setIsConnecting(false);
    nextStartTimeRef.current = 0;
  };

  const startSession = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      audioContextRef.current = audioCtx;
      outputAudioContextRef.current = outputCtx;

      await audioCtx.resume();
      await outputCtx.resume();
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { 
              prebuiltVoiceConfig: { 
                voiceName: persona === AgentPersona.AGENT_SANTA ? 'Puck' : 'Zephyr' 
              } 
            },
          },
          systemInstruction: personaConfig.systemInstruction,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            
            const source = audioCtx.createMediaStreamSource(stream);
            const scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;
            
            const inputSampleRate = audioCtx.sampleRate;
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const resampledData = resample(inputData, inputSampleRate, 16000);
              const pcmBlob = createBlob(resampledData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.onended = () => {
                sourcesRef.current.delete(source);
              };
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              updateTranscript('model', text);
            } else if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              updateTranscript('user', text);
            }

            if (message.serverContent?.turnComplete) {
              setTranscript(prev => {
                if (prev.length === 0) return prev;
                const last = prev[prev.length - 1];
                return [...prev.slice(0, -1), { ...last, isComplete: true }];
              });
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Session error:', e);
            setError('Connection error. Please check your microphone and try again.');
            stopSession();
          },
          onclose: (e) => {
            console.log('Session closed:', e);
            stopSession();
          }
        }
      });

      sessionRef.current = await sessionPromise;

    } catch (err: any) {
      console.error('Failed to start session:', err);
      setError(err.message || 'Microphone access denied or connection failed.');
      setIsConnecting(false);
    }
  };

  const updateTranscript = (role: 'user' | 'model', text: string) => {
    setTranscript(prev => {
      if (prev.length > 0) {
        const last = prev[prev.length - 1];
        if (last.role === role && !last.isComplete) {
          return [...prev.slice(0, -1), { ...last, text: last.text + text }];
        }
      }
      return [...prev, { 
        id: Math.random().toString(36).substr(2, 9),
        role, 
        text, 
        isComplete: false,
        timestamp: Date.now()
      }];
    });
  };

  const handleToggle = () => {
    if (isActive) stopSession();
    else startSession();
  };

  const clearTranscript = () => {
    setTranscript([]);
  };

  return (
    <div className="bg-white rounded-[3rem] p-6 lg:p-12 shadow-sm border border-gray-100 min-h-[600px] flex flex-col items-center relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-64 h-64 blur-3xl rounded-full transition-colors duration-1000 -mr-32 -mt-32 ${isActive ? 'bg-blue-100/30' : 'bg-gray-100/30'}`}></div>
      
      {/* Dynamic Header Controls */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 z-10 mb-8">
        <div className="flex bg-gray-100/50 p-1.5 rounded-full border border-gray-200/50 backdrop-blur-sm">
          <button 
            onClick={() => onPersonaChange(AgentPersona.YULETIDE_CORE)}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${persona === AgentPersona.YULETIDE_CORE ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            YULETIDE CORE
          </button>
          <button 
            onClick={() => onPersonaChange(AgentPersona.AGENT_SANTA)}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${persona === AgentPersona.AGENT_SANTA ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            AGENT SANTA
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          {isActive && (
            <div className="flex items-center gap-3 px-4 py-2 bg-blue-50/50 rounded-full border border-blue-100">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold text-blue-600 tracking-wider">LATENCY: {metrics.latency}MS</span>
            </div>
          )}
          {transcript.length > 0 && (
            <button 
              onClick={clearTranscript}
              className="group flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all border border-transparent hover:border-red-100"
              title="Clear transcription history"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center space-y-6 w-full max-w-2xl flex-grow overflow-hidden">
        {/* Core Microphone Visualization */}
        <div className="relative group cursor-pointer" onClick={handleToggle}>
          <div className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-700 ${isActive ? 'scale-110 shadow-2xl shadow-blue-100' : 'scale-100 shadow-md'}`} 
               style={{ backgroundColor: personaConfig.accentColor }}>
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner overflow-hidden relative">
              {isConnecting ? (
                <div className="w-8 h-8 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
              ) : isActive ? (
                <div className="w-8 h-8 bg-gray-900 rounded-lg animate-pulse-fast"></div>
              ) : (
                <svg className={`w-10 h-10 transition-colors ${persona === AgentPersona.AGENT_SANTA ? 'text-red-500' : 'text-blue-600'} fill-current`} viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              )}
            </div>
            {isActive && (
              <div className="absolute inset-0 border-4 rounded-full border-white/20 animate-ping-slow"></div>
            )}
          </div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">
              {isActive ? "Stop" : "Start"} Interaction
            </span>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-medium border border-red-100 animate-shake w-full text-center">
            {error}
          </div>
        )}

        {/* Enhanced Transcription Display */}
        <div className="w-full flex-grow flex flex-col min-h-0 bg-gray-50/70 rounded-[2.5rem] p-6 lg:p-8 relative border border-gray-100 shadow-inner">
          {isActive && <AudioVisualizer active={isActive} />}
          
          <div 
            ref={scrollRef}
            className="flex-grow overflow-y-auto space-y-8 custom-scrollbar pr-4 mt-6 pb-4"
          >
            {transcript.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                <div className="w-16 h-16 bg-gray-200/50 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-bold uppercase tracking-widest text-gray-500">Secure Edge Bridge</p>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto italic">Tap the module above to initiate voice dialogue. No data will leave the local environment.</p>
                </div>
              </div>
            ) : (
              transcript.map((item, i) => (
                <div 
                  key={item.id} 
                  className={`flex gap-4 ${item.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar/Role Indicators */}
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-[10px] shadow-sm transition-transform hover:scale-105 ${
                    item.role === 'user' ? 'bg-slate-700' : 'bg-gray-800'
                  }`} style={item.role === 'model' ? { backgroundColor: personaConfig.accentColor } : {}}>
                    {item.role === 'user' ? 'USR' : 'SYS'}
                  </div>

                  <div className={`flex flex-col max-w-[85%] ${item.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`text-[9px] font-black mb-1.5 tracking-tighter uppercase ${item.role === 'user' ? 'text-slate-500 mr-1' : 'text-gray-400 ml-1'}`}>
                      {item.role === 'user' ? 'LOCAL TERMINAL' : personaConfig.name}
                    </div>
                    <div className={`rounded-3xl px-6 py-4 text-sm leading-relaxed shadow-sm transition-all duration-300 ${
                      item.role === 'user' 
                        ? 'bg-slate-800 text-slate-100 rounded-tr-none border border-slate-700' 
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm border-l-4'
                      } ${!item.isComplete ? 'ring-2 ring-opacity-20 ' + (item.role === 'user' ? 'ring-slate-400' : 'ring-gray-300') : ''}`}
                      style={item.role === 'model' ? { borderLeftColor: personaConfig.accentColor } : {}}
                    >
                      <StreamingText text={item.text} isComplete={item.isComplete} role={item.role} />
                    </div>
                    <div className="mt-1.5 px-2 text-[8px] text-gray-300 font-mono flex items-center gap-1.5">
                      <svg className="w-2 h-2 opacity-50" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3"/></svg>
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.3; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .animate-ping-slow {
          animation: ping-slow 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes pulse-fast {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .animate-pulse-fast {
          animation: pulse-fast 0.8s ease-in-out infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

interface StreamingTextProps {
  text: string;
  isComplete: boolean;
  role: 'user' | 'model';
}

const StreamingText: React.FC<StreamingTextProps> = ({ text, isComplete, role }) => {
  const words = useMemo(() => text.trim().split(/\s+/), [text]);
  
  if (isComplete || words.length === 0) {
    return <span>{text}</span>;
  }

  const recentThreshold = Math.min(words.length, 3);
  const historicWords = words.slice(0, words.length - recentThreshold);
  const currentWords = words.slice(words.length - recentThreshold);

  return (
    <span>
      <span className="opacity-70">{historicWords.join(' ')}</span>
      {historicWords.length > 0 && ' '}
      <span className={`inline-block font-bold relative ${role === 'user' ? 'text-blue-100' : 'text-blue-600'}`}>
        {currentWords.join(' ')}
        <span className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-current opacity-30 animate-pulse"></span>
      </span>
    </span>
  );
};

export default LiveAgent;
