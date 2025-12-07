export enum Sender {
  USER = 'USER',
  BOT = 'BOT',
  SYSTEM = 'SYSTEM'
}

export interface DebugLog {
  id: string;
  type: 'info' | 'tool_call' | 'api_request' | 'error';
  label: string;
  payload: any;
  timestamp: Date;
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  toolPayload?: any;
  debugLogs?: DebugLog[]; // Linked logs for this interaction
}

export interface AgentConfig {
  name: string;
  tone: 'Professional' | 'Friendly' | 'Energetic' | 'Luxurious';
  model: 'gemini-2.5-flash' | 'gemini-2.5-pro';
  temperature: number; // New: Creativity control
  customInstructions: string;
}

export interface Tenant {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  integrations: {
    tokkoApiKey: string;
    ghlLocationId: string;
    ghlAccessToken: string; 
  };
  agent: AgentConfig;
  createdAt: string;
}

export interface Property {
  id: number;
  title: string;
  price: number;
  currency: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  imageUrl: string;
  link: string;
  type: 'sale' | 'rent';
}

export interface PropertySearchFilter {
  location?: string;
  maxPrice?: number;
  minBedrooms?: number;
  operationType?: string; 
}