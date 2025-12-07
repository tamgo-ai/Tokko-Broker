import React from 'react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  onBook: (id: number) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onBook }) => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden flex flex-col w-60 flex-shrink-0 snap-center shadow-lg hover:border-indigo-500/50 transition-all">
      <div className="h-32 bg-slate-700 relative">
        <img 
          src={property.imageUrl} 
          alt={property.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
             <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-sm ${property.type === 'rent' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}`}>
                {property.type.toUpperCase()}
            </span>
        </div>
      </div>
      
      <div className="p-3 flex-1 flex flex-col">
        <div className="mb-2">
             <h3 className="font-bold text-sm text-slate-100 line-clamp-1 mb-0.5">{property.title}</h3>
             <p className="text-xs text-slate-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {property.location}
             </p>
        </div>
        
        <p className="text-base font-bold text-white mb-3">
            {property.currency} {property.price.toLocaleString()}
        </p>

        <div className="flex gap-2 text-xs text-slate-400 mb-3 bg-slate-900/50 p-1.5 rounded border border-slate-700/50">
            <span className="flex items-center gap-1">🛏️ {property.bedrooms}</span>
            <span className="w-px bg-slate-700"></span>
            <span className="flex items-center gap-1">🚿 {property.bathrooms}</span>
        </div>

        <div className="mt-auto flex gap-2">
            <a 
                href={property.link} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 text-center bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold py-2 rounded-lg transition"
            >
                Details
            </a>
            <button 
                onClick={() => onBook(property.id)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2 rounded-lg transition"
            >
                Book Visit
            </button>
        </div>
      </div>
    </div>
  );
};