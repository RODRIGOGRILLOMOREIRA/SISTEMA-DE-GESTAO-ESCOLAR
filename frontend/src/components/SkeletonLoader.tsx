/**
 * Componente de Skeleton Loader para melhor UX
 * Mostra placeholders enquanto o conteúdo carrega
 */

import './SkeletonLoader.css'

interface SkeletonLoaderProps {
  type?: 'text' | 'card' | 'table' | 'list' | 'circle' | 'image'
  count?: number
  height?: number | string
  width?: number | string
  className?: string
}

export const SkeletonLoader = ({ 
  type = 'text', 
  count = 1,
  height,
  width,
  className = ''
}: SkeletonLoaderProps) => {
  
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`skeleton skeleton-card ${className}`}>
            <div className="skeleton skeleton-image" style={{ height: 120 }} />
            <div className="skeleton-card-body">
              <div className="skeleton skeleton-text" style={{ width: '60%' }} />
              <div className="skeleton skeleton-text" style={{ width: '80%' }} />
              <div className="skeleton skeleton-text" style={{ width: '40%' }} />
            </div>
          </div>
        )
      
      case 'table':
        return (
          <div className={`skeleton-table ${className}`}>
            <div className="skeleton-table-header">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton skeleton-text" />
              ))}
            </div>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="skeleton-table-row">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="skeleton skeleton-text" />
                ))}
              </div>
            ))}
          </div>
        )
      
      case 'list':
        return (
          <div className={`skeleton-list ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="skeleton-list-item">
                <div className="skeleton skeleton-circle" style={{ width: 40, height: 40 }} />
                <div className="skeleton-list-content">
                  <div className="skeleton skeleton-text" style={{ width: '70%' }} />
                  <div className="skeleton skeleton-text" style={{ width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        )
      
      case 'circle':
        return (
          <div 
            className={`skeleton skeleton-circle ${className}`}
            style={{ 
              width: width || 60, 
              height: height || 60 
            }}
          />
        )
      
      case 'image':
        return (
          <div 
            className={`skeleton skeleton-image ${className}`}
            style={{ 
              width: width || '100%', 
              height: height || 200 
            }}
          />
        )
      
      case 'text':
      default:
        return (
          <div 
            className={`skeleton skeleton-text ${className}`}
            style={{ 
              width: width || '100%', 
              height: height || 20 
            }}
          />
        )
    }
  }

  if (type === 'text' && count > 1) {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div 
            key={i} 
            className={`skeleton skeleton-text ${className}`}
            style={{ 
              width: width || '100%', 
              height: height || 20,
              marginBottom: 12 
            }}
          />
        ))}
      </>
    )
  }

  return renderSkeleton()
}

// Skeleton específico para cards de estatísticas
export const StatsCardSkeleton = () => (
  <div className="skeleton-stats-card">
    <div className="skeleton skeleton-circle" style={{ width: 48, height: 48 }} />
    <div className="skeleton-stats-content">
      <div className="skeleton skeleton-text" style={{ width: 80, height: 32 }} />
      <div className="skeleton skeleton-text" style={{ width: 120, height: 16 }} />
    </div>
  </div>
)

// Skeleton específico para dashboard
export const DashboardSkeleton = () => (
  <div className="skeleton-dashboard">
    <div className="skeleton-dashboard-header">
      <SkeletonLoader type="text" width={200} height={32} />
      <SkeletonLoader type="text" width={300} height={16} />
    </div>
    <div className="skeleton-dashboard-stats">
      {[1, 2, 3, 4].map((i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
    <div className="skeleton-dashboard-charts">
      <SkeletonLoader type="image" height={300} />
      <SkeletonLoader type="image" height={300} />
    </div>
  </div>
)
