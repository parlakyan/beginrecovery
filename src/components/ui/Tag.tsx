import { X } from 'lucide-react';

interface TagProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

export default function Tag({ variant = 'primary', children, className = '', onClose }: TagProps) {
  const variantClasses = {
    primary: 'bg-blue-50 text-blue-600',
    secondary: 'bg-gray-50 text-gray-700'
  };

  return (
    <span 
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
      {onClose && (
        <button
          onClick={onClose}
          className="ml-1 p-0.5 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
