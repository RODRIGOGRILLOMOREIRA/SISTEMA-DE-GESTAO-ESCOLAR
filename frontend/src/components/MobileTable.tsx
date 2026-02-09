/**
 * Componente de Tabela Otimizada para Mobile
 * Converte tabelas em cards verticais em telas pequenas
 */

import { ReactNode } from 'react'
import { useIsMobile } from '../config/responsive'
import './MobileTable.css'

interface Column {
  key: string
  label: string
  render?: (value: any, row: any) => ReactNode
}

interface MobileTableProps {
  data: any[]
  columns: Column[]
  keyExtractor: (item: any) => string | number
  onRowClick?: (item: any) => void
  emptyMessage?: string
}

export const MobileTable = ({ 
  data, 
  columns, 
  keyExtractor, 
  onRowClick,
  emptyMessage = 'Nenhum registro encontrado' 
}: MobileTableProps) => {
  const isMobile = useIsMobile()

  if (data.length === 0) {
    return (
      <div className="mobile-table-empty">
        <p>{emptyMessage}</p>
      </div>
    )
  }

  // Renderização mobile - Cards verticais
  if (isMobile) {
    return (
      <div className="mobile-cards-container">
        {data.map((item) => (
          <div 
            key={keyExtractor(item)} 
            className="mobile-card"
            onClick={() => onRowClick?.(item)}
            style={{ cursor: onRowClick ? 'pointer' : 'default' }}
          >
            {columns.map((column) => (
              <div key={column.key} className="mobile-card-row">
                <span className="mobile-card-label">{column.label}:</span>
                <span className="mobile-card-value">
                  {column.render 
                    ? column.render(item[column.key], item)
                    : item[column.key]
                  }
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  // Renderização desktop - Tabela tradicional
  return (
    <div className="desktop-table-container">
      <table className="desktop-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr 
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render 
                    ? column.render(item[column.key], item)
                    : item[column.key]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
