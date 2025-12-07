import { Tenant, Property } from './types';

export const MOCK_TENANTS: Tenant[] = [
  {
    id: 't_01',
    name: "Elite Properties Buenos Aires",
    status: 'active',
    integrations: {
      tokkoApiKey: "tk_live_882374",
      ghlLocationId: "loc_BA_992",
      ghlAccessToken: "ghl_pat_123456"
    },
    agent: {
      name: "Sofia",
      tone: "Luxurious",
      model: "gemini-2.5-flash",
      temperature: 0.4,
      customInstructions: "Focus on high-net-worth individuals. Always mention 'exclusive amenities' and 'privacy'."
    },
    createdAt: "2023-10-15"
  },
  {
    id: 't_02',
    name: "Urban Living Realty",
    status: 'active',
    integrations: {
      tokkoApiKey: "tk_live_112233",
      ghlLocationId: "loc_CABA_55",
      ghlAccessToken: "ghl_pat_987654"
    },
    agent: {
      name: "Mateo",
      tone: "Friendly",
      model: "gemini-2.5-flash",
      temperature: 0.8,
      customInstructions: "You are helpful and quick. Focus on rentals for students and young professionals."
    },
    createdAt: "2023-11-02"
  }
];

export const MOCK_PROPERTIES: Property[] = [
  {
    id: 101,
    title: "Modern Loft in Palermo Soho",
    price: 1200,
    currency: "USD",
    location: "Palermo",
    bedrooms: 1,
    bathrooms: 1,
    imageUrl: "https://picsum.photos/400/300?random=1",
    link: "https://tokkobroker.com/p/101",
    type: "rent"
  },
  {
    id: 102,
    title: "Classic Family Home Recoleta",
    price: 450000,
    currency: "USD",
    location: "Recoleta",
    bedrooms: 3,
    bathrooms: 2,
    imageUrl: "https://picsum.photos/400/300?random=2",
    link: "https://tokkobroker.com/p/102",
    type: "sale"
  },
  {
    id: 103,
    title: "Sunny Apartment Belgrano",
    price: 900,
    currency: "USD",
    location: "Belgrano",
    bedrooms: 2,
    bathrooms: 1,
    imageUrl: "https://picsum.photos/400/300?random=3",
    link: "https://tokkobroker.com/p/103",
    type: "rent"
  },
  {
    id: 104,
    title: "Luxury Penthouse Puerto Madero",
    price: 850000,
    currency: "USD",
    location: "Puerto Madero",
    bedrooms: 4,
    bathrooms: 4,
    imageUrl: "https://picsum.photos/400/300?random=4",
    link: "https://tokkobroker.com/p/104",
    type: "sale"
  },
  {
    id: 105,
    title: "Cozy Studio San Telmo",
    price: 600,
    currency: "USD",
    location: "San Telmo",
    bedrooms: 0,
    bathrooms: 1,
    imageUrl: "https://picsum.photos/400/300?random=5",
    link: "https://tokkobroker.com/p/105",
    type: "rent"
  }
];