import React from 'react';

export const Blueprint: React.FC = () => {
  return (
    <div className="glass-panel p-8 rounded-2xl h-full overflow-y-auto">
      <h2 className="text-3xl font-extrabold text-white mb-8 tracking-tight">System Architecture & Engineering</h2>
      
      <p className="mb-8 text-lg text-slate-400 font-light leading-relaxed">
        Transition strategy from Prototype v1 to <span className="text-indigo-400 font-medium">Production Release v2</span>. Addressing scalability, multi-tenancy, and security requirements.
      </p>

      <div className="space-y-8">
        
        {/* Section 1 */}
        <div className="bg-indigo-900/10 p-6 rounded-xl border border-indigo-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>
          <h3 className="text-xl font-bold text-indigo-400 mb-3">1. The "Middleman" Server (Crucial)</h3>
          <p className="text-sm text-indigo-200 mb-4 leading-relaxed">
            Direct GHL Webhook connections to browser-side clients are insecure. We require a serverless middleware (AWS Lambda/Vercel Edge Functions).
          </p>
          <ul className="list-disc ml-5 space-y-2 text-sm text-indigo-300">
            <li><strong>Webhook Endpoint:</strong> Receives `POST` from GHL (Inbound SMS).</li>
            <li><strong>Router:</strong> Maps `LocationID` -> Tenant Config (DB Lookup).</li>
            <li><strong>Gemini Worker:</strong> Hydrates history, calls LLM, executes tools.</li>
            <li><strong>Response Handler:</strong> Dispatches final reply via GHL API.</li>
          </ul>
        </div>

        {/* Section 2 - Questions */}
        <div>
          <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-2">Technical Decisions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="p-6 border border-orange-500/20 bg-orange-900/10 rounded-xl hover:bg-orange-900/20 transition-colors">
              <h4 className="font-bold text-orange-400 mb-2">Q1: Tokko Authentication Strategy</h4>
              <p className="text-sm text-slate-400">
                Does Tokko allow querying *all* listings via a single Master Key, or do we need to store a separate API Key for every single Tenant/Broker in our database?
              </p>
            </div>

            <div className="p-6 border border-blue-500/20 bg-blue-900/10 rounded-xl hover:bg-blue-900/20 transition-colors">
              <h4 className="font-bold text-blue-400 mb-2">Q2: Context Window Management</h4>
              <p className="text-sm text-slate-400">
                GHL webhooks send the latest message. Do you want to fetch the last 10 messages from GHL API every time to give Gemini context, or store the chat history in our own Redis/Postgres cache?
              </p>
            </div>

            <div className="p-6 border border-purple-500/20 bg-purple-900/10 rounded-xl hover:bg-purple-900/20 transition-colors">
              <h4 className="font-bold text-purple-400 mb-2">Q3: Search Heuristics</h4>
              <p className="text-sm text-slate-400">
                Real estate data is unstructured. We should implement vector search (embeddings) for listings instead of strict keyword matching to improve relevance (e.g., "sunny apartment" vs "south facing").
              </p>
            </div>

            <div className="p-6 border border-emerald-500/20 bg-emerald-900/10 rounded-xl hover:bg-emerald-900/20 transition-colors">
              <h4 className="font-bold text-emerald-400 mb-2">Q4: Human Handoff Protocol</h4>
              <p className="text-sm text-slate-400">
                Define the trigger for human intervention. Sentiment analysis score less than 0.3? Or specific keywords like "speak to a person"? This should tag the GHL contact immediately.
              </p>
            </div>

          </div>
        </div>

        {/* Section 3 - Workflow Diagram */}
        <div>
            <h3 className="text-xl font-bold text-white mb-4">Data Flow Topology</h3>
            <div className="font-mono text-xs bg-black/50 text-emerald-400 p-6 rounded-xl border border-slate-800 overflow-x-auto shadow-inner">
{`USER (SMS) 
  -> Twilio/GHL 
    -> GHL Webhook (POST /api/inbound-sms)
      -> MIDDLEWARE SERVER (Node.js)
         1. Verify Tenant (via LocationID)
         2. Load Tenant Config (Tokko Key, Agent Prompt)
         3. Fetch Chat History (DB or GHL API)
         4. Call Google Gemini API (with Tools)
            -> If Tool "search_properties":
               -> Call Tokko API (GET /property)
               -> Return JSON to Gemini
            -> If Tool "schedule":
               -> Generate Link
         5. Receive Final Text Response
         6. Call GHL API (POST /conversations/messages) to reply
  -> USER (Receives SMS)`}
            </div>
        </div>

      </div>
    </div>
  );
};