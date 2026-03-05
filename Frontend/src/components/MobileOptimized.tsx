import React from 'react';

interface MobileOptimizedProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileContainer: React.FC<MobileOptimizedProps> = ({ children, className = '' }) => {
  return (
    <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
};

export const MobileGrid: React.FC<MobileOptimizedProps> = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 ${className}`}>
      {children}
    </div>
  );
};

export const MobileCard: React.FC<MobileOptimizedProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow ${className}`}>
      {children}
    </div>
  );
};

export const MobileButton: React.FC<MobileOptimizedProps & { onClick?: () => void; variant?: 'primary' | 'secondary' }> = ({ 
  children, 
  className = '', 
  onClick,
  variant = 'primary'
}) => {
  const baseClasses = 'w-full sm:w-auto px-4 py-3 sm:py-2 rounded-lg font-semibold transition-all duration-200 active:scale-95 touch-manipulation';
  const variantClasses = variant === 'primary' 
    ? 'bg-gradient-to-r from-green-600 to-orange-500 text-white hover:from-green-700 hover:to-orange-600'
    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-green-600';
  
  return (
    <button 
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {children}
    </button>
  );
};

export const MobileModal: React.FC<MobileOptimizedProps & { isOpen: boolean; onClose: () => void; title?: string }> = ({ 
  children, 
  isOpen,
  onClose,
  title,
  className = '' 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        <div className={`relative bg-white w-full sm:max-w-lg sm:rounded-lg rounded-t-xl shadow-xl transform transition-all ${className}`}>
          {title && (
            <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
          )}
          <div className="px-4 py-4 sm:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export const MobileStack: React.FC<MobileOptimizedProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      {children}
    </div>
  );
};

export const MobileRow: React.FC<MobileOptimizedProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${className}`}>
      {children}
    </div>
  );
};
