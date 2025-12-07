import React from 'react';
import { Tenant } from '../types';

interface DashboardProps {
  tenants: Tenant[];
}

export const Dashboard: React.FC<DashboardProps> = ({ tenants }) => {
  const activeTenants = tenants.filter(t => t.status === 'active').length;
  
  // Mock Metrics
  const metrics = [
    { label: 'Total Messages', value: '12,450', change: '+12%', color: 'indigo' },
    { label: 'Properties Sent', value: '3,892', change: '+5.4%', color: 'indigo' },
    { label: 'Conversion Rate', value: '4.2%', change: '+0.8%', color: 'emerald' },
    { label: 'Active Sessions', value: '142', change: 'Live', color: 'rose' },
  ];

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Platform Overview</h1>
          <p className="text-slate-400">Monitoring {tenants.length} tenants and real-time AI performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((m, i) => (
          <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-2">{m.label}</p>
            <div className="flex items-end justify-between">
               <h3 className="text-3xl font-bold text-white">{m.value}</h3>
               <span className={`text-xs font-bold px-2 py-1 rounded bg-slate-700 text-${m.color}-400`}>
                  {m.change}
               </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Simple Chart Representation */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Interaction Volume</h3>
            <div className="flex items-end justify-between gap-2 h-48 px-2">
                {[40, 65, 45, 80, 55, 90, 70, 45, 60, 75, 50, 85, 95, 65, 55, 70, 60, 80, 90, 100].map((h, i) => (
                    <div key={i} className="w-full bg-indigo-600 rounded-t-sm opacity-80 hover:opacity-100 transition" style={{ height: `${h * 0.8}%` }}></div>
                ))}
            </div>
            <div className="flex justify-between mt-4 text-xs text-slate-500 border-t border-slate-700 pt-2">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>24:00</span>
            </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Live Activity</h3>
            <div className="space-y-4">
                {[
                    { text: 'Bot Sofia suggested 3 properties to +1 555...', time: '2m ago', color: 'bg-emerald-500' },
                    { text: 'New lead connected via GHL Webhook', time: '5m ago', color: 'bg-blue-500' },
                    { text: 'Tokko API Sync successful', time: '12m ago', color: 'bg-indigo-500' },
                    { text: 'Error: Rate limit reached on Tenant #3', time: '24m ago', color: 'bg-rose-500' },
                ].map((item, i) => (
                    <div key={i} className="flex gap-3 items-start">
                        <div className={`w-2 h-2 mt-1.5 rounded-full ${item.color} flex-shrink-0`}></div>
                        <div>
                            <p className="text-sm text-slate-300 leading-tight">{item.text}</p>
                            <span className="text-xs text-slate-500">{item.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700">
            <h3 className="text-lg font-bold text-white">Tenant Performance</h3>
          </div>
          <table className="w-full text-left">
              <thead className="bg-slate-900/50">
                  <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-6">Tenant</th>
                      <th className="py-3 px-6">Status</th>
                      <th className="py-3 px-6 text-right">Messages (7d)</th>
                      <th className="py-3 px-6 text-right">Props Sent</th>
                      <th className="py-3 px-6 text-right">Conv. Est.</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-700 text-sm">
                  {tenants.map((tenant) => {
                      const msgs = Math.floor(Math.random() * 500) + 50;
                      const props = Math.floor(msgs * 0.3);
                      const conv = (Math.random() * 5 + 1).toFixed(1);
                      
                      return (
                          <tr key={tenant.id} className="hover:bg-slate-700/30 transition">
                              <td className="py-4 px-6 font-medium text-slate-200">{tenant.name}</td>
                              <td className="py-4 px-6">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tenant.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                                      {tenant.status}
                                  </span>
                              </td>
                              <td className="py-4 px-6 text-right text-slate-400">{msgs}</td>
                              <td className="py-4 px-6 text-right text-slate-400">{props}</td>
                              <td className="py-4 px-6 text-right text-emerald-400">{conv}%</td>
                          </tr>
                      );
                  })}
              </tbody>
          </table>
      </div>
    </div>
  );
};