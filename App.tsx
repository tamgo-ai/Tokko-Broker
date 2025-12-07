import React, { useState } from 'react';
import { Tenant } from './types';
import { MOCK_TENANTS } from './constants';
import { BrokerList } from './components/BrokerList';
import { BrokerEditor } from './components/BrokerEditor';
import { ChatInterface } from './components/ChatInterface';
import { Blueprint } from './components/Blueprint';
import { Dashboard } from './components/Dashboard';

type ViewState = 'dashboard' | 'brokers' | 'editor' | 'simulator' | 'blueprint';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [tenants, setTenants] = useState<Tenant[]>(MOCK_TENANTS);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  // -- Actions --

  const handleEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setCurrentView('editor');
  };

  const handleSimulate = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setCurrentView('simulator');
  };

  const handleAddBroker = () => {
    const newTenant: Tenant = {
        id: `t_${Date.now()}`,
        name: "New Brokerage",
        status: 'pending',
        integrations: { tokkoApiKey: '', ghlLocationId: '', ghlAccessToken: '' },
        agent: { 
            name: "Agent", 
            tone: "Professional", 
            model: "gemini-2.5-flash", 
            temperature: 0.7,
            customInstructions: "" 
        },
        createdAt: new Date().toISOString()
    };
    setSelectedTenant(newTenant);
    setCurrentView('editor');
  };

  const handleDeleteTenant = (id: string) => {
      if(window.confirm('Are you sure you want to delete this broker tenant?')) {
          setTenants(prev => prev.filter(t => t.id !== id));
      }
  };

  const handleSaveTenant = (updatedTenant: Tenant) => {
    setTenants(prev => {
        const exists = prev.find(t => t.id === updatedTenant.id);
        if (exists) {
            return prev.map(t => t.id === updatedTenant.id ? updatedTenant : t);
        }
        return [...prev, updatedTenant];
    });
    setCurrentView('brokers');
    setSelectedTenant(null);
  };

  const NavItem = ({ view, icon, label }: { view: ViewState, icon: React.ReactNode, label: string }) => (
    <button 
        onClick={() => setCurrentView(view)}
        className={`w-full flex items-center gap-3 px-4 py-2.5 mb-1 rounded-lg transition-colors text-sm font-medium ${currentView === view 
            ? 'bg-indigo-600 text-white shadow-md' 
            : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
    >
        {icon}
        {label}
    </button>
  );

  return (
    <div className="flex h-screen w-full font-sans bg-slate-900">
      
      {/* Professional Sidebar */}
      <div className="w-64 flex flex-col flex-shrink-0 bg-slate-950 border-r border-slate-800">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold mr-3">
              AI
            </div>
            <span className="text-white font-bold tracking-tight text-lg">BrokerHub</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <div className="px-2 mb-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Analytics</p>
            </div>
            <NavItem 
                view="dashboard" 
                label="Dashboard" 
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>}
            />
            
            <div className="px-2 mb-2 mt-6">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Management</p>
            </div>
            <NavItem 
                view="brokers" 
                label="Brokers" 
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>}
            />
            <NavItem 
                view="blueprint" 
                label="Architecture" 
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>}
            />
        </nav>

        <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700"></div>
                <div>
                    <p className="text-sm font-medium text-white">Admin User</p>
                    <p className="text-xs text-slate-500">System Administrator</p>
                </div>
            </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 overflow-hidden flex flex-col bg-slate-900">
        
        {currentView === 'dashboard' && <Dashboard tenants={tenants} />}

        {currentView === 'brokers' && (
            <div className="h-full overflow-y-auto">
                <BrokerList 
                    tenants={tenants} 
                    onSelect={handleEdit} 
                    onSimulate={handleSimulate}
                    onAdd={handleAddBroker}
                    onDelete={handleDeleteTenant}
                />
            </div>
        )}

        {currentView === 'editor' && selectedTenant && (
            <div className="h-full overflow-y-auto">
                <BrokerEditor 
                    tenant={selectedTenant} 
                    onSave={handleSaveTenant}
                    onCancel={() => setCurrentView('brokers')}
                />
            </div>
        )}

        {currentView === 'simulator' && selectedTenant && (
            <div className="h-full flex flex-col bg-slate-950">
                <div className="h-16 border-b border-slate-800 flex items-center px-6 justify-between flex-shrink-0 bg-slate-900">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setCurrentView('brokers')} className="text-slate-400 hover:text-white transition">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                        </button>
                        <div>
                            <h2 className="text-lg font-bold text-white">Simulator</h2>
                            <p className="text-xs text-indigo-400">{selectedTenant.name}</p>
                        </div>
                    </div>
                </div>
                <div className="flex-1 p-6 overflow-hidden relative">
                    <div className="max-w-4xl mx-auto h-full">
                        <ChatInterface tenant={selectedTenant} />
                    </div>
                </div>
            </div>
        )}

        {currentView === 'blueprint' && (
             <div className="h-full overflow-y-auto p-8">
                <Blueprint />
             </div>
        )}
      </div>
    </div>
  );
}