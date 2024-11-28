interface TagProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  className?: string;
}

export default function Tag({ variant = 'primary', children, className = '' }: TagProps) {
  const variantClasses = {
    primary: 'bg-blue-50 text-blue-600',
    secondary: 'bg-teal-50 text-teal-700'
  };

  return (
    <span 
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
