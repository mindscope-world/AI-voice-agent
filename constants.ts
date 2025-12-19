
import { AgentPersona, PersonaConfig } from './types';

export const PERSONAS: Record<AgentPersona, PersonaConfig> = {
  [AgentPersona.YULETIDE_CORE]: {
    name: 'YULETIDE Core',
    description: 'System-level technical intelligence assistant.',
    systemInstruction: 'You are the core intelligence of Project YULETIDE. You are helpful, technical, and precise. You explain complex edge AI concepts simply.',
    accentColor: '#3b82f6', // Blue
    voiceName: 'Zephyr'
  },
  [AgentPersona.AGENT_SANTA]: {
    name: 'Agent Santa',
    description: 'Festive persona for the holiday demo.',
    systemInstruction: 'You are Agent Santa, an advanced AI recreation of Santa Claus. You are jolly, warm, and tech-savvy. You talk about the joy of giving and the technical wonders of your North Pole workshop.',
    accentColor: '#ef4444', // Red
    voiceName: 'Puck'
  }
};

export const HARDWARE_SPECS = {
  DEVICE: 'NVIDIA Jetson Orin Nano',
  RAM_TOTAL: 8, // GB
  VRAM_TOTAL: 4, // GB
  CPU_CORES: 6,
  PRECISION: 'FP16/INT8'
};
