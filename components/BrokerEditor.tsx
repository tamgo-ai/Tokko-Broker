import React, { useState } from 'react';
import { Tenant } from '../types';

interface BrokerEditorProps {
  tenant: Tenant;
  onSave: (tenant: Tenant) => void;
  onCancel: () => void;
}

export const BrokerEditor: React.FC<BrokerEditorProps> = ({ tenant, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Tenant>({
      ...tenant,
      agent: {
          ...tenant.agent,
          temperature: tenant.agent.temperature || 0.7
      }
  });
  const [activeTab, setActiveTab] = useState<'general' | 'integrations' | 'agent'>('general');
  
  // Visibility states for sensitive fields
  const [showTokkoKey, setShowTokkoKey] = useState(false);
  const [showGhlKey, setShowGhlKey] = useState(false);

  const updateField = (section: keyof Tenant, field: string, value: any) => {
    if (section === 'integrations' || section === 'agent') {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    } else {
        setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const EyeIcon = ({ visible }: { visible: boolean }) => (
    visible ? (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
                {tenant.id ? `Edit ${tenant.name}` : 'New Broker Setup'}
            </h2>
            <p className="text-slate-400 text-sm mt-1">Configure connectivity and AI behavior.</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={onCancel}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition"
            >
                Cancel
            </button>
            <button 
                onClick={() => onSave(formData)}
                className="px-6 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20 font-medium"
            >
                Save Configuration
            </button>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-700/50 bg-slate-900/30">
            {['general', 'integrations', 'agent'].map((tab) => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 py-4 text-sm font-medium border-b-2 transition capitalize ${activeTab === tab ? 'border-indigo-500 text-indigo-400 bg-slate-800/30' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* Content */}
        <div className="p-8">
            {activeTab === 'general' && (
                <div className="space-y-6 max-w-lg">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Broker / Company Name</label>
                        <input 
                            value={formData.name}
                            onChange={(e) => updateField('name' as any, 'name', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition"
                            placeholder="e.g. Century 21 Downtown"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Status</label>
                        <select 
                            value={formData.status}
                            onChange={(e) => updateField('status' as any, 'status', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition appearance-none"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending Setup</option>
                        </select>
                    </div>
                </div>
            )}

            {activeTab === 'integrations' && (
                <div className="space-y-8">
                    <p className="text-sm text-slate-400 mb-4 bg-slate-800/30 p-4 rounded-lg border border-slate-700">
                        <span className="text-white font-bold">Security Note:</span> API Keys are encrypted at rest. For this demo environment, toggle visibility to verify your input.
                    </p>

                    <div className="bg-orange-900/10 border border-orange-500/20 p-6 rounded-xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-10">
                            <svg className="w-24 h-24 text-orange-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"/></svg>
                        </div>
                        <h3 className="font-bold text-orange-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide relative z-10">
                            Tokko Broker API
                        </h3>
                        <div className="relative z-10">
                            <label className="block text-xs font-medium text-slate-400 mb-1">API Key (Private)</label>
                            <div className="relative">
                                <input 
                                    type={showTokkoKey ? "text" : "password"}
                                    value={formData.integrations.tokkoApiKey}
                                    onChange={(e) => updateField('integrations', 'tokkoApiKey', e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg pl-4 pr-10 py-3 text-sm font-mono text-orange-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none"
                                    placeholder="tk_xxxxxxxx"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowTokkoKey(!showTokkoKey)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-orange-400 transition-colors"
                                >
                                    <EyeIcon visible={showTokkoKey} />
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-emerald-500">
                                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                                </svg>
                                Credentials stored securely
                            </p>
                        </div>
                    </div>

                    <div className="bg-blue-900/10 border border-blue-500/20 p-6 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <svg className="w-24 h-24 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
                        </div>
                        <h3 className="font-bold text-blue-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide relative z-10">
                            GoHighLevel API
                        </h3>
                        <div className="space-y-4 relative z-10">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Location ID</label>
                                <input 
                                    value={formData.integrations.ghlLocationId}
                                    onChange={(e) => updateField('integrations', 'ghlLocationId', e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg px-4 py-3 text-sm font-mono text-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none"
                                    placeholder="xxxxxxxx-xxxx-xxxx"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Access Token (Private)</label>
                                <div className="relative">
                                    <input 
                                        type={showGhlKey ? "text" : "password"}
                                        value={formData.integrations.ghlAccessToken}
                                        onChange={(e) => updateField('integrations', 'ghlAccessToken', e.target.value)}
                                        className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg pl-4 pr-10 py-3 text-sm font-mono text-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none"
                                        placeholder="ghl_pat_xxxxxxxx"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowGhlKey(!showGhlKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400 transition-colors"
                                    >
                                        <EyeIcon visible={showGhlKey} />
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-emerald-500">
                                        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                                    </svg>
                                    Credentials stored securely
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'agent' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Agent Name</label>
                            <input 
                                value={formData.agent.name}
                                onChange={(e) => updateField('agent', 'name', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Model Version</label>
                            <select 
                                value={formData.agent.model}
                                onChange={(e) => updateField('agent', 'model', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none"
                            >
                                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fastest)</option>
                                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Reasoning)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                         <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Tone</label>
                            <select 
                                value={formData.agent.tone}
                                onChange={(e) => updateField('agent', 'tone', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none"
                            >
                                <option value="Professional">Professional & Formal</option>
                                <option value="Friendly">Friendly & Casual</option>
                                <option value="Energetic">Energetic & Sales-driven</option>
                                <option value="Luxurious">Luxurious & Exclusive</option>
                            </select>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Creativity (Temperature)</label>
                                <span className="text-xs text-indigo-400 font-mono">{formData.agent.temperature || 0.7}</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.1"
                                value={formData.agent.temperature || 0.7}
                                onChange={(e) => updateField('agent', 'temperature', parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                            <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                                <span>Precise</span>
                                <span>Creative</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Knowledge Base / System Prompt</label>
                        <textarea 
                            value={formData.agent.customInstructions}
                            onChange={(e) => updateField('agent', 'customInstructions', e.target.value)}
                            rows={8}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-300 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none leading-relaxed"
                            placeholder="Describe specific rules, neighborhoods to focus on, or things the agent should avoid..."
                        />
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};