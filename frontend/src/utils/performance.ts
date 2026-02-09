/**
 * Utilitários de Performance e Otimização
 */

/**
 * Debounce - Atrasa execução de função até que não seja mais chamada
 * Útil para: inputs de busca, resize, scroll
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle - Limita execução de função a uma vez por período
 * Útil para: scroll events, mouse move
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Lazy Load de imagens
 */
export const lazyLoadImage = (imageUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(imageUrl);
    img.onerror = reject;
    img.src = imageUrl;
  });
};

/**
 * Compressão de imagens antes do upload
 */
export const compressImage = (
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calcular novas dimensões mantendo proporção
        if (width > height) {
          if (width > maxWidth) {
            height = height * (maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = width * (maxHeight / height);
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Falha ao comprimir imagem'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Paginação helper
 */
export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
}

export interface PaginationResult {
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalPages: number;
  currentPage: number;
}

export const calculatePagination = ({
  page,
  limit,
  total = 0,
}: PaginationParams): PaginationResult => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    totalPages,
    currentPage: page,
  };
};

/**
 * Formatação de dados grandes (KB, MB, GB)
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Retry de requisições com backoff exponencial
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (maxRetries <= 0) throw error;
    
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryWithBackoff(fn, maxRetries - 1, delay * 2);
  }
};

/**
 * Batch de requisições (agrupar múltiplas chamadas)
 */
export class BatchManager<T> {
  private queue: Array<{
    id: string;
    resolve: (value: T) => void;
    reject: (error: any) => void;
  }> = [];
  
  private timeout: NodeJS.Timeout | null = null;
  private batchDelay: number;
  
  constructor(
    private fetcher: (ids: string[]) => Promise<Map<string, T>>,
    batchDelay: number = 50
  ) {
    this.batchDelay = batchDelay;
  }
  
  fetch(id: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ id, resolve, reject });
      
      if (this.timeout) clearTimeout(this.timeout);
      
      this.timeout = setTimeout(() => {
        this.flush();
      }, this.batchDelay);
    });
  }
  
  private async flush() {
    if (this.queue.length === 0) return;
    
    const batch = [...this.queue];
    this.queue = [];
    
    const ids = batch.map((item) => item.id);
    
    try {
      const results = await this.fetcher(ids);
      
      batch.forEach((item) => {
        const result = results.get(item.id);
        if (result) {
          item.resolve(result);
        } else {
          item.reject(new Error(`Item ${item.id} não encontrado`));
        }
      });
    } catch (error) {
      batch.forEach((item) => item.reject(error));
    }
  }
}

/**
 * Memória de valor anterior (útil para comparações)
 */
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = React.useRef<T>();
  
  React.useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
};

/**
 * Hook para detectar visibilidade da página (pausar operações quando oculto)
 */
export const usePageVisibility = (): boolean => {
  const [isVisible, setIsVisible] = React.useState(!document.hidden);
  
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  return isVisible;
};

/**
 * Hook para detectar conexão online/offline
 */
export const useOnlineStatus = (): boolean => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
};

import React from 'react';
