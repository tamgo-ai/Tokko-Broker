import { MOCK_PROPERTIES } from '../constants';
import { Property, PropertySearchFilter } from '../types';

/**
 * ------------------------------------------------------------------
 * SERVER-SIDE READY SERVICE
 * ------------------------------------------------------------------
 * This code is designed to be isomorphic. It can run in the browser
 * (with CORS caveats) or in a Node.js environment (AWS Lambda/Express).
 * 
 * TOKKO API DOCS: https://www.tokkobroker.com/api/v1/property/
 */

export const searchTokkoProperties = async (
  filters: PropertySearchFilter,
  apiKey?: string
): Promise<Property[]> => {
  
  // --- 1. VALIDATION ---
  // In a real server environment, we fail fast if no key is present.
  if (!apiKey || apiKey.trim() === '') {
    console.warn("TokkoService: No API Key provided. Returning empty set (or mock for dev).");
    return getMockProperties(filters); // Only strictly for dev fallback
  }

  // --- 2. QUERY CONSTRUCTION ---
  try {
    const searchData = {
      current_localization_id: 0,
      price_from: 0,
      price_to: filters.maxPrice || 999999999,
      operation_types: filters.operationType === 'rent' ? [2] : [1], // 1=Sale, 2=Rent
      property_types: [1, 2, 3], // 1=Apartment, 2=House, 3=Land/Office
      filters: filters.location ? [{ "field": "location", "value": filters.location }] : [],
      with_custom_tags: []
    };

    const params = new URLSearchParams({
      key: apiKey,
      lang: 'es',
      format: 'json',
      limit: '10', // Increased limit for better AI selection
      offset: '0',
      data: JSON.stringify(searchData)
    });

    const url = `https://www.tokkobroker.com/api/v1/property/search?${params.toString()}`;

    console.log(`[TokkoService] Requesting: ${url}`);

    // --- 3. EXECUTION ---
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'User-Agent': 'BrokerAI-Bot/1.0' // Good practice for server-side
      }
    });

    // --- 4. ERROR HANDLING ---
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Tokko API Error [${response.status}]: ${errorText}`);
    }

    const data = await response.json();

    // --- 5. DATA NORMALIZATION ---
    // Safely map external API data to our internal domain model
    if (!data.objects) return [];

    return data.objects.map((p: any) => ({
      id: p.id,
      title: p.publication_title || p.address || 'Propiedad sin título',
      price: p.operations[0]?.prices?.[0]?.price || 0,
      currency: p.operations[0]?.prices?.[0]?.currency || 'USD',
      location: p.location?.name || 'Ubicación desconocida',
      bedrooms: p.suite_amount || p.room_amount || 0,
      bathrooms: p.bathroom_amount || 0,
      imageUrl: p.photos?.[0]?.image || 'https://via.placeholder.com/400x300?text=No+Image',
      link: p.producer?.web_url || `https://www.tokkobroker.com/p/${p.id}`,
      type: filters.operationType || 'sale'
    }));

  } catch (error: any) {
    console.error("CRITICAL TOKKO ERROR:", error.message);
    
    // In production, we might want to throw this to the Agent so it can say "I'm having trouble connecting".
    // For this UI demo, we will check if it's a CORS error and warn the user.
    if (error.message.includes('Failed to fetch')) {
       console.error("CORS ERROR DETECTED: Use a backend proxy or a CORS plugin.");
    }
    throw error; // Re-throw to be handled by the AgentService
  }
};

// Helper for dev mode only
const getMockProperties = (filters: PropertySearchFilter): Property[] => {
  return MOCK_PROPERTIES.filter((p) => {
    let match = true;
    if (filters.location && !p.location.toLowerCase().includes(filters.location.toLowerCase())) match = false;
    if (filters.maxPrice && p.price > filters.maxPrice) match = false;
    if (filters.minBedrooms && p.bedrooms < filters.minBedrooms) match = false;
    if (filters.operationType) {
        const reqType = filters.operationType.toLowerCase();
        const propType = p.type.toLowerCase();
        if (reqType !== propType && reqType !== 'both') match = false;
    }
    return match;
  }).slice(0, 5);
}