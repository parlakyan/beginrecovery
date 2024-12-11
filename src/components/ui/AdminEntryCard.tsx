import React from 'react';
import { Edit2, Trash2, Image as ImageIcon } from 'lucide-react';

interface AdminEntryCardProps {
  id: string;
  name: string;
  description: string;
  logo?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function AdminEntryCard({
  id,
  name,
  description,
  logo,
  onEdit,
  onDelete
}: AdminEntryCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(id)}
            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(id)}
            className="p-1 text-gray-500 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="aspect-[3/2] rounded-lg overflow-hidden bg-gray-100">
        {logo ? (
          <img
            src={logo}
            alt={name}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
}
