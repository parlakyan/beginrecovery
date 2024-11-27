import React from 'react';
import { AlertTriangle, AlertOctagon } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'warning' | 'danger';
}

const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'warning' 
}: ConfirmationDialogProps) => {
  if (!isOpen) return null;

  const Icon = type === 'danger' ? AlertOctagon : AlertTriangle;
  const colorClass = type === 'danger' ? 'text-red-600' : 'text-yellow-600';
  const buttonClass = type === 'danger' 
    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
    : 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center gap-4 mb-4">
          <Icon className={`w-8 h-8 ${colorClass}`} />
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-white rounded-lg ${buttonClass} focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
