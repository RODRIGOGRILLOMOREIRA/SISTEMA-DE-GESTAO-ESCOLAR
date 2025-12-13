import { useState } from 'react'
import { Calendar, Clock, CheckSquare, ArrowLeft } from 'lucide-react'
import CalendarioEscolar from '../components/CalendarioEscolar'
import GradeHoraria from '../components/GradeHoraria'
import RegistroFrequencia from '../components/RegistroFrequencia'
import './CommonPages.css'
import './Notas.css'

type ModuloFrequencia = 'calendario' | 'grade' | 'registro' | null

const Frequencia = () => {
  const [moduloAtivo, setModuloAtivo] = useState<ModuloFrequencia>(null)

  const voltarParaModulos = () => {
    setModuloAtivo(null)
  }

  // Se nenhum módulo está ativo, mostra os 3 botões de seleção
  if (!moduloAtivo) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Frequência</h1>
        </div>

        <div className="selection-section">
          <div className="selection-grid">
            <button 
              className="selection-btn"
              onClick={() => setModuloAtivo('calendario')}
            >
              <div className="selection-btn-content">
                <Calendar size={32} />
                <span className="selection-btn-title">Calendário Escolar</span>
              </div>
            </button>

            <button 
              className="selection-btn"
              onClick={() => setModuloAtivo('grade')}
            >
              <div className="selection-btn-content">
                <Clock size={32} />
                <span className="selection-btn-title">Grade Horária</span>
              </div>
            </button>

            <button 
              className="selection-btn"
              onClick={() => setModuloAtivo('registro')}
            >
              <div className="selection-btn-content">
                <CheckSquare size={32} />
                <span className="selection-btn-title">Registro de Frequência</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Renderizar módulo ativo
  return (
    <div className="page">
      <div className="page-header">
        <button className="btn-secondary" onClick={voltarParaModulos}>
          <ArrowLeft size={20} />
          Voltar
        </button>
        <h1>
          {moduloAtivo === 'calendario' && 'Calendário Escolar'}
          {moduloAtivo === 'grade' && 'Grade Horária'}
          {moduloAtivo === 'registro' && 'Registro de Frequência'}
        </h1>
      </div>

      <div className="content-container">
        {moduloAtivo === 'calendario' && <CalendarioEscolar />}

        {moduloAtivo === 'grade' && <GradeHoraria />}

        {moduloAtivo === 'registro' && <RegistroFrequencia />}
      </div>
    </div>
  )
}

export default Frequencia
