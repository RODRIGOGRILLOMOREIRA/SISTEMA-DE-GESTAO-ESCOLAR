import { Toaster as HotToaster } from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';

export function Toaster() {
  const { theme } = useTheme();

  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: theme === 'dark' ? '#374151' : '#ffffff',
          color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
          border: theme === 'dark' ? '1px solid #4b5563' : '1px solid #e5e7eb',
          boxShadow: theme === 'dark'
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
          duration: 3000,
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
          duration: 5000,
        },
        loading: {
          iconTheme: {
            primary: '#3b82f6',
            secondary: '#ffffff',
          },
        },
      }}
    />
  );
}
