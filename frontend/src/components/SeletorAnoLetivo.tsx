import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Upload } from 'lucide-react'
import './SeletorAnoLetivo.css'

interface SeletorAnoLetivoProps {
  anoSelecionado: number
  onAnoChange: (ano: number) => void
  showImportButton?: boolean
  onImport?: () => void
  disabled?: boolean
}

const SeletorAnoLetivo = ({
  anoSelecionado,
  onAnoChange,
  showImportButton = false,
  onImport,
  disabled = false
}: SeletorAnoLetivoProps) => {
  
  const handleAnoAnterior = () => {
    if (!disabled) {
      onAnoChange(anoSelecionado - 1)
    }
  }

  const handleProximoAno = () => {
    if (!disabled) {
      onAnoChange(anoSelecionado + 1)
    }
  }

  return (
    <div className="seletor-ano-letivo-container">
      <div className="ano-selector">
        <button
          type="button"
          onClick={handleAnoAnterior}
          disabled={disabled}
          className="btn-ano"
          title="Ano anterior"
        >
          <ChevronLeft size={20} />
          <span className="btn-ano-text">{anoSelecionado - 1}</span>
        </button>

        <div className="ano-atual">
          <CalendarIcon size={20} className="ano-icon" />
          <span className="ano-label">Ano Letivo:</span>
          <span className="ano-numero">{anoSelecionado}</span>
        </div>

        <button
          type="button"
          onClick={handleProximoAno}
          disabled={disabled}
          className="btn-ano"
          title="Próximo ano"
        >
          <span className="btn-ano-text">{anoSelecionado + 1}</span>
          <ChevronRight size={20} />
        </button>
      </div>

      {showImportButton && onImport && (
        <button
          type="button"
          onClick={onImport}
          disabled={disabled}
          className="btn-importar"
          title="Importar calendário do Excel"
        >
          <Upload size={18} />
          <span className="btn-importar-text">Importar Excel</span>
        </button>
      )}
    </div>
  )
}

export default SeletorAnoLetivo
