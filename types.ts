
export interface SystemMetrics {
  vram: number;
  ram: number;
  latency: number;
  cpu: number;
  temperature: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum AgentPersona {
  YULETIDE_CORE = 'YULETIDE_CORE',
  AGENT_SANTA = 'AGENT_SANTA'
}

export interface PersonaConfig {
  name: string;
  description: string;
  systemInstruction: string;
  accentColor: string;
}
