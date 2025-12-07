import React from 'react';
import { Tenant } from '../types';

interface BrokerListProps {
  tenants: Tenant[];
  onSelect: (tenant: Tenant) => void;
  onSimulate: (tenant: Tenant) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}

export const BrokerList: React.FC<BrokerListProps> = ({ tenants, onSelect, onSimulate, onAdd, onDelete }) => {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-2xl font-bold text-white">Tenant Directory</h1>
            <p className="text-slate-400 text-sm mt-1">Manage API keys, locations, and AI configurations.</p>
        </div>
        <button 
            onClick={onAdd}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Add Broker
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        {tenants.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
                <p>No brokers found. Add one to get started.</p>
            </div>
        ) : (
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-900/50 border-b border-slate-700">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tenant Name</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Integrations</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">AI Agent</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                    {tenants.map(t => (
                        <tr key={t.id} className="hover:bg-slate-700/30 transition group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-white font-bold text-xs">
                                        {t.name.charAt(0)}
                                    </div>
                                    <div>
                                        <span className="text-sm font-semibold text-white block">{t.name}</span>
                                        <span className="text-xs text-slate-500 font-mono">{t.id}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${t.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                                    {t.status}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex gap-2">
                                    <span className={`text-[10px] px-2 py-0.5 rounded border ${t.integrations.tokkoApiKey ? 'bg-slate-800 border-indigo-500/30 text-indigo-300' : 'bg-slate-800 border-slate-600 text-slate-500'}`}>
                                        Tokko
                                    </span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded border ${t.integrations.ghlLocationId ? 'bg-slate-800 border-blue-500/30 text-blue-300' : 'bg-slate-800 border-slate-600 text-slate-500'}`}>
                                        GHL
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-slate-300 font-medium">{t.agent.name}</div>
                                <div className="text-xs text-slate-500">{t.agent.model}</div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button 
                                        onClick={() => onSimulate(t)}
                                        className="text-slate-400 hover:text-white transition"
                                        title="Open Simulator"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                        </svg>
                                    </button>
                                    <button 
                                        onClick={() => onSelect(t)}
                                        className="text-slate-400 hover:text-white transition"
                                        title="Edit Configuration"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                                        </svg>
                                    </button>
                                    <button 
                                        onClick={() => onDelete(t.id)}
                                        className="text-slate-400 hover:text-rose-500 transition"
                                        title="Delete Tenant"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
      </div>
    </div>
  );
};