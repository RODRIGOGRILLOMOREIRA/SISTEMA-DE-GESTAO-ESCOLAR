import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './RateLimitWarning.css';

interface RateLimitWarningProps {
  remainingRequests?: number;
  resetTime?: number;
  show: boolean;
  onClose: () => void;
}

const RateLimitWarning = ({ remainingRequests = 0, resetTime = 0, show, onClose }: RateLimitWarningProps) => {
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (!resetTime || !show) return;

    const updateCountdown = () => {
      const now = Date.now();
      const diff = resetTime - now;

      if (diff <= 0) {
        setCountdown('0s');
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      if (minutes > 0) {
        setCountdown(`${minutes}m ${seconds}s`);
      } else {
        setCountdown(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [resetTime, show]);

  if (!show) return null;

  const percentage = (remainingRequests / 100) * 100; // Assumindo limite de 100 req/15min
  const isWarning = percentage < 30;
  const isDanger = percentage < 10;

  return (
    <div className={`rate-limit-warning ${isWarning ? 'warning' : ''} ${isDanger ? 'danger' : ''}`}>
      <div className="warning-content">
        <AlertTriangle size={20} />
        <div className="warning-text">
          <strong>Limite de Requisições:</strong>
          {isDanger ? (
            <span> Você está próximo do limite! Restam apenas <strong>{remainingRequests}</strong> requisições.</span>
          ) : (
            <span> Restam <strong>{remainingRequests}</strong> requisições. Reset em <strong>{countdown}</strong>.</span>
          )}
        </div>
      </div>
      <button className="close-btn" onClick={onClose} aria-label="Fechar">
        <X size={18} />
      </button>
    </div>
  );
};

export default RateLimitWarning;
