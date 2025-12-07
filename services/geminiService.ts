import { 
  GoogleGenAI, 
  FunctionDeclaration, 
  Type, 
  GenerateContentResponse,
  Content,
  Chat,
  Part
} from "@google/genai";
import { Tenant, Property, PropertySearchFilter, DebugLog } from '../types';
import { searchTokkoProperties } from './tokkoService';

// -- Function Definitions (Schema for Gemini) --

const searchPropertiesDecl: FunctionDeclaration = {
  name: 'search_properties',
  description: 'Search for properties in the real estate database based on user criteria. Returns a list of property objects.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: { type: Type.STRING, description: 'The neighborhood or city (e.g. Palermo, Recoleta).' },
      maxPrice: { type: Type.NUMBER, description: 'The maximum budget of the user in USD.' },
      minBedrooms: { type: Type.NUMBER, description: 'Minimum number of bedrooms required.' },
      operationType: { type: Type.STRING, description: 'Either "rent" or "sale".' }
    },
    required: ['operationType']
  }
};

const sendSchedulingLinkDecl: FunctionDeclaration = {
  name: 'send_scheduling_link',
  description: 'Generates a calendar link for the user to book a visit for a specific property.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      propertyId: { type: Type.NUMBER, description: 'The ID of the property they want to visit.' }
    },
    required: ['propertyId']
  }
};

// -- Service Logic --

export class AgentService {
  private genAI: GoogleGenAI;
  private chatSession: Chat | undefined;
  private tenant: Tenant;
  
  constructor(tenant: Tenant) {
    this.tenant = tenant;
    // CRITICAL: process.env.API_KEY is populated by the build system/environment
    this.genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private generateSystemPrompt(): string {
    const { name, agent, integrations } = this.tenant;
    
    return `
    ROLE: You are ${agent.name}, an expert Real Estate Agent for "${name}".
    TONE: ${agent.tone}. 
    CONTEXT: ${agent.customInstructions}

    INTEGRATIONS STATUS:
    - Tokko Broker: ${integrations.tokkoApiKey ? 'CONNECTED' : 'DISCONNECTED'}
    - GoHighLevel: ${integrations.ghlLocationId ? 'CONNECTED' : 'DISCONNECTED'}

    INSTRUCTIONS:
    1. Short, conversational SMS style responses.
    2. Ask qualifying questions (Location, Budget, Beds, Rent/Buy).
    3. CALL 'search_properties' when you have enough criteria.
    4. IF properties are found: Show them and ask if they want to visit.
    5. IF NO properties are found (or API error): Apologize and ask for broader criteria.
    6. CALL 'send_scheduling_link' if the user expresses clear intent to visit.
    `;
  }

  public async startChat(initialHistory: Content[] = []) {
    this.chatSession = this.genAI.chats.create({
      model: this.tenant.agent.model || 'gemini-2.5-flash',
      config: {
        systemInstruction: this.generateSystemPrompt(),
        temperature: this.tenant.agent.temperature || 0.7,
        tools: [{
          functionDeclarations: [searchPropertiesDecl, sendSchedulingLinkDecl]
        }]
      },
      history: initialHistory
    });
  }

  public async sendMessage(userMessage: string): Promise<{
    text: string;
    properties?: Property[];
    schedulingLink?: string;
    logs: DebugLog[];
  }> {
    if (!this.chatSession) await this.startChat();
    const session = this.chatSession!;
    const logs: DebugLog[] = [];

    try {
      // Send message
      let response: GenerateContentResponse = await session.sendMessage({ message: userMessage });
      
      // Check for function calls
      const toolCalls = response.candidates?.[0]?.content?.parts?.filter(p => p.functionCall);
      
      let foundProperties: Property[] | undefined;
      let schedulingLink: string | undefined;

      // Handle tool execution loop
      if (toolCalls && toolCalls.length > 0) {
        const functionResponses: Part[] = [];

        for (const call of toolCalls) {
          const fc = call.functionCall;
          if (!fc) continue;

          logs.push({
              id: Date.now().toString(),
              type: 'tool_call',
              label: `Tool Triggered: ${fc.name}`,
              payload: fc.args,
              timestamp: new Date()
          });

          if (fc.name === 'search_properties') {
            const args = fc.args as any;
            const filter: PropertySearchFilter = {
              location: args.location,
              maxPrice: args.maxPrice,
              minBedrooms: args.minBedrooms,
              operationType: args.operationType
            };
            
            logs.push({
              id: (Date.now() + 1).toString(),
              type: 'api_request',
              label: `Tokko API Request`,
              payload: { filters: filter },
              timestamp: new Date()
            });

            try {
              // EXECUTE REAL SERVICE
              foundProperties = await searchTokkoProperties(filter, this.tenant.integrations.tokkoApiKey);
              
              functionResponses.push({
                functionResponse: {
                  id: fc.id,
                  name: fc.name,
                  response: { result: foundProperties, count: foundProperties.length } 
                }
              });
            } catch (err: any) {
              // Handle API Failure gracefully so Gemini knows it failed
              logs.push({
                id: (Date.now() + 10).toString(),
                type: 'error',
                label: `Tokko API Failed`,
                payload: { error: err.message },
                timestamp: new Date()
              });
              
              functionResponses.push({
                functionResponse: {
                  id: fc.id,
                  name: fc.name,
                  response: { error: "External API unavailable", details: err.message } 
                }
              });
            }

          } else if (fc.name === 'send_scheduling_link') {
            const args = fc.args as any;
            schedulingLink = `https://calendly.com/${this.tenant.name.replace(/\s+/g, '').toLowerCase()}/visit-property-${args.propertyId}`;
            
            logs.push({
              id: (Date.now() + 2).toString(),
              type: 'api_request',
              label: `GHL Trigger Link`,
              payload: { link: schedulingLink },
              timestamp: new Date()
            });

            functionResponses.push({
              functionResponse: {
                id: fc.id,
                name: fc.name,
                response: { link: schedulingLink, status: "Link generated successfully" }
              }
            });
          }
        }

        // Send tool outputs back to model to get final text response
        if (functionResponses.length > 0) {
          response = await session.sendMessage({ message: functionResponses });
        }
      }

      return {
        text: response.text || "Sorry, I couldn't generate a text response.",
        properties: foundProperties,
        schedulingLink: schedulingLink,
        logs: logs
      };

    } catch (criticalError: any) {
      console.error("Agent Critical Failure", criticalError);
      return {
        text: "System Error: The AI Agent is temporarily unavailable.",
        logs: [...logs, {
          id: Date.now().toString(),
          type: 'error',
          label: 'Critical Agent Crash',
          payload: { message: criticalError.message },
          timestamp: new Date()
        }]
      };
    }
  }
}