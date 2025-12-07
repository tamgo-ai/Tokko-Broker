import React, { useState, useRef, useEffect } from 'react';
import { Message, Sender, Property, Tenant, DebugLog } from '../types';
import { AgentService } from '../services/geminiService';
import { fetchGHLConversationHistory } from '../services/ghlService';
import { PropertyCard } from './PropertyCard';

interface ChatInterfaceProps {
  tenant: Tenant;
}

const DEMO_SCENARIOS = [
  { label: "🤑 Inversor", emoji: "💼", text: "Hola, soy inversor. Busco oportunidades de compra en Puerto Madero o Recoleta. Presupuesto hasta 900k USD. ¿Qué tenés?" },
  { label: "🎓 Estudiante", emoji: "🎒", text: "Hola! Busco alquiler de un monoambiente cerca de Palermo o Belgrano. Algo económico para estudiante." },
  { label: "👨‍👩‍👧 Familia", emoji: "🏡", text: "Estamos buscando una casa familiar con mínimo 3 habitaciones y jardín. Zona norte o barrios tranquilos." },
  { label: "😡 Cliente Difícil", emoji: "😤", text: "Nadie me contesta. Necesito ver una propiedad YA MISMO o cambio de inmobiliaria." },
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ tenant }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  
  const agentRef = useRef<AgentService | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const debugEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = async () => {
        setInitializing(true);
        setErrorMsg(null);
        setMessages([]);

        try {
            agentRef.current = new AgentService(tenant);
            let initialAiHistory: any[] = [];
            
            if (tenant.integrations.ghlLocationId) {
                try {
                    const { uiMessages, aiHistory } = await fetchGHLConversationHistory(
                        tenant.integrations.ghlLocationId, 
                        tenant.integrations.ghlAccessToken
                    );
                    setMessages(uiMessages);
                    initialAiHistory = aiHistory;
                    
                    setMessages(prev => [...prev, {
                        id: 'system_divider',
                        text: `--- History Synced from GHL ---`,
                        sender: Sender.SYSTEM,
                        timestamp: new Date()
                    }]);

                } catch (ghlError) {
                    console.warn("Failed to fetch GHL history", ghlError);
                    setMessages([{
                        id: 'ghl_err',
                        text: "Connection Warning: GHL History Unavailable.",
                        sender: Sender.SYSTEM,
                        timestamp: new Date()
                    }]);
                }
            } else {
                 setMessages([{
                    id: 'init',
                    text: `System Ready. Agent ${tenant.agent.name} is active.`,
                    sender: Sender.SYSTEM,
                    timestamp: new Date()
                }]);
            }

            await agentRef.current.startChat(initialAiHistory);

        } catch (err) {
            console.error("Initialization error:", err);
            setErrorMsg("Critical: Agent Initialization Failed.");
        } finally {
            setInitializing(false);
        }
    };

    initChat();
  }, [tenant]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    debugEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const executeMessage = async (text: string) => {
    if (!text.trim() || !agentRef.current) return;

    setErrorMsg(null);
    const userMsg: Message = {
      id: Date.now().toString(),
      text: text,
      sender: Sender.USER,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await agentRef.current.sendMessage(userMsg.text);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: Sender.BOT,
        timestamp: new Date(),
        toolPayload: response.properties,
        debugLogs: response.logs 
      };

      setMessages(prev => [...prev, botMsg]);

      if (response.schedulingLink) {
        const linkMsg: Message = {
            id: (Date.now() + 2).toString(),
            text: `📅 Scheduling link sent via SMS: ${response.schedulingLink}`,
            sender: Sender.BOT,
            timestamp: new Date(),
            debugLogs: [{
                id: Date.now().toString(),
                type: 'info',
                label: 'GHL Automation Triggered',
                payload: { trigger_type: 'sms_link', url: response.schedulingLink },
                timestamp: new Date()
            }]
        };
        setMessages(prev => [...prev, linkMsg]);
      }

    } catch (error: any) {
      console.error(error);
      setErrorMsg("Error: Agent unavailable or rate limited.");
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "Error: Message delivery failed.",
        sender: Sender.SYSTEM,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => executeMessage(input);

  const handleBookRequest = (propId: number) => {
    executeMessage(`I want to schedule a visit for property #${propId}`);
  };

  return (
    <div className="flex h-full gap-4">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-900 rounded-xl shadow-xl overflow-hidden border border-slate-800 relative">
        
        {/* Header Overlay for Toggle */}
        <div className="absolute top-4 right-4 z-20">
            <button 
                onClick={() => setShowDebug(!showDebug)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${showDebug ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
            >
                {showDebug ? 'Hide Debug' : 'Show Debug'}
            </button>
        </div>

        {/* Quick Scenarios Bar */}
        <div className="absolute top-4 left-4 z-20 flex gap-2 overflow-x-auto max-w-[70%] scrollbar-hide">
             {DEMO_SCENARIOS.map((scenario, idx) => (
                <button
                    key={idx}
                    onClick={() => executeMessage(scenario.text)}
                    disabled={loading || initializing}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 backdrop-blur-sm border border-slate-700 hover:border-indigo-500 text-slate-300 text-xs font-medium rounded-lg transition whitespace-nowrap shadow-sm"
                >
                    <span>{scenario.emoji}</span>
                    {scenario.label}
                </button>
             ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 pt-16">
            
            {initializing && (
                <div className="flex justify-center py-20">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
                        <span className="text-xs text-slate-500 font-medium">Initializing Agent...</span>
                    </div>
                </div>
            )}

            {!initializing && messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === Sender.USER ? 'items-end' : 'items-start'}`}>
                
                {/* Bubble */}
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm
                ${msg.sender === Sender.USER 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : msg.sender === Sender.SYSTEM 
                        ? 'bg-transparent text-slate-500 text-center text-xs w-full mb-2 shadow-none'
                        : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
                }`}>
                {msg.text}
                </div>

                {/* Carousel */}
                {msg.toolPayload && Array.isArray(msg.toolPayload) && msg.toolPayload.length > 0 && (
                    <div className="mt-4 w-full overflow-x-auto flex pb-4 space-x-3 snap-x scrollbar-hide pl-1">
                        {msg.toolPayload.map((prop: Property) => (
                            <PropertyCard key={prop.id} property={prop} onBook={handleBookRequest} />
                        ))}
                    </div>
                )}
                
                {/* Time & Role */}
                {msg.sender !== Sender.SYSTEM && (
                    <span className={`text-[10px] mt-1.5 mx-2 font-mono opacity-50 flex items-center gap-1 ${msg.sender === Sender.USER ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {msg.sender === Sender.BOT ? tenant.agent.name : 'Lead'} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                )}
            </div>
            ))}

            {loading && (
                <div className="flex items-start animate-fade-in">
                    <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-medium">{tenant.agent.name} is typing</span>
                        <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                            <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Zone */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 z-20">
            {errorMsg && (
                <div className="mb-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded flex justify-between items-center">
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {errorMsg}
                    </span>
                    <button onClick={() => setErrorMsg(null)} className="hover:text-white">&times;</button>
                </div>
            )}
            <div className="flex items-center space-x-3 bg-slate-950 p-2 rounded-xl border border-slate-800 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                <input 
                    type="text"
                    className="flex-1 bg-transparent px-2 text-sm text-white focus:outline-none placeholder:text-slate-600"
                    placeholder="Type a message..."
                    value={input}
                    disabled={initializing}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() || loading || initializing}
                    className={`p-2 rounded-lg transition-all flex items-center justify-center ${!input.trim() || initializing ? 'bg-slate-800 text-slate-600' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 transform rotate-90">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />
                    </svg>
                </button>
            </div>
        </div>
        </div>

        {/* Debug Panel */}
        {showDebug && (
            <div className="w-80 flex flex-col bg-slate-950 border-l border-slate-800 shadow-xl z-30">
                <div className="p-4 border-b border-slate-800 bg-slate-900">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
                        Debug Log
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.flatMap(m => m.debugLogs || []).map((log) => (
                        <div key={log.id} className="relative pl-3 border-l-2 border-slate-800 hover:border-indigo-500 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-[10px] font-bold uppercase ${
                                    log.type === 'tool_call' ? 'text-purple-400' : 
                                    log.type === 'api_request' ? 'text-orange-400' : 
                                    log.type === 'error' ? 'text-red-400' : 'text-blue-400'
                                }`}>
                                    {log.type.replace('_', ' ')}
                                </span>
                                <span className="text-[9px] text-slate-600 font-mono">
                                    {log.timestamp.toLocaleTimeString([], {second:'2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                            
                            <p className="text-xs text-slate-300 font-medium mb-1 leading-tight">{log.label}</p>
                            
                            {log.payload && (
                                <div className="bg-slate-900 rounded p-2 overflow-x-auto border border-slate-800">
                                    <pre className="text-[9px] text-slate-400 font-mono leading-tight">
                                        {JSON.stringify(log.payload, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    ))}
                    <div ref={debugEndRef} />
                </div>
            </div>
        )}
    </div>
  );
};