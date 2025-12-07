import { Content } from "@google/genai";
import { Message, Sender } from "../types";

/**
 * ------------------------------------------------------------------
 * SERVER-SIDE READY SERVICE - GoHighLevel (LeadConnector)
 * ------------------------------------------------------------------
 * Documentation: https://highlevel.stoplight.io/docs/integrations/
 */

const GHL_API_VERSION = '2021-07-28';
const BASE_URL = 'https://services.leadconnectorhq.com';

export const fetchGHLConversationHistory = async (
  locationId: string, 
  accessToken: string
): Promise<{ uiMessages: Message[], aiHistory: Content[] }> => {

  // --- 1. VALIDATION ---
  if (!accessToken || !locationId) {
    console.warn("GHLService: Missing credentials. Returning mock data.");
    return getMockGHLData();
  }

  // --- 2. EXECUTION ---
  try {
    console.log(`[GHLService] Fetching history for Location: ${locationId}`);
    
    // We fetch the most recent conversations
    const searchUrl = `${BASE_URL}/conversations/search?locationId=${locationId}&limit=5&sort=desc`;
    
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Version': GHL_API_VERSION,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
       const errorText = await response.text();
       throw new Error(`GHL API Error [${response.status}]: ${errorText}`);
    }

    const data = await response.json();
    const uiMessages: Message[] = [];
    const aiHistory: Content[] = [];

    // --- 3. DATA PARSING ---
    if (data.conversations && Array.isArray(data.conversations)) {
       // Reverse to get chronological order (Oldest -> Newest) for the Chat Interface
       const recentConvos = data.conversations.reverse();

       for (const conv of recentConvos) {
         if (conv.lastMessage) {
           const isUser = conv.lastMessage.direction === 'inbound';
           const textBody = conv.lastMessage.body || "[Media/Template Message]";
           
           uiMessages.push({
             id: conv.id, // Ideally, messageId, but convId works for summary
             text: textBody,
             sender: isUser ? Sender.USER : Sender.BOT,
             timestamp: new Date(conv.lastMessage.dateAdded || Date.now())
           });

           aiHistory.push({
             role: isUser ? 'user' : 'model',
             parts: [{ text: textBody }]
           });
         }
       }
    }

    return { uiMessages, aiHistory };

  } catch (error: any) {
    console.error("CRITICAL GHL ERROR:", error.message);
    // If it's a CORS error, we inform the developer
    if (error.message.includes('Failed to fetch')) {
        console.warn("CORS BLOCK: GoHighLevel API does not support browser-direct calls. You MUST use a server proxy.");
    }
    // Return empty state or throw depending on strictness level
    return { uiMessages: [], aiHistory: [] };
  }
};

// Helper for dev mode / fallback
const getMockGHLData = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    uiMessages: [{
        id: 'mock_1',
        text: 'This is a simulated GHL history (No API Key provided).',
        sender: Sender.SYSTEM,
        timestamp: new Date()
    }],
    aiHistory: []
  };
};