import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AnoLetivoContextType {
  anoLetivo: number
  setAnoLetivo: (ano: number) => void
  anosDisponiveis: number[]
  setAnosDisponiveis: (anos: number[]) => void
}

const AnoLetivoContext = createContext<AnoLetivoContextType | undefined>(undefined)

interface AnoLetivoProviderProps {
  children: ReactNode
}

export const AnoLetivoProvider = ({ children }: AnoLetivoProviderProps) => {
  // Buscar ano do localStorage ou usar ano atual
  const getAnoInicial = () => {
    const anoSalvo = localStorage.getItem('anoLetivoAtivo')
    if (anoSalvo) {
      return parseInt(anoSalvo)
    }
    return new Date().getFullYear()
  }

  const [anoLetivo, setAnoLetivoState] = useState<number>(getAnoInicial())
  const [anosDisponiveis, setAnosDisponiveis] = useState<number[]>([])

  // Salvar no localStorage sempre que mudar
  const setAnoLetivo = (ano: number) => {
    setAnoLetivoState(ano)
    localStorage.setItem('anoLetivoAtivo', ano.toString())
    console.log('📅 Ano letivo alterado para:', ano)
  }

  // Carregar anos disponíveis na inicialização
  useEffect(() => {
    const carregarAnosDisponiveis = async () => {
      try {
        // Aqui você pode buscar do backend os anos que têm calendários cadastrados
        // Por enquanto, vamos gerar anos próximos ao atual
        const anoAtual = new Date().getFullYear()
        const anos = [anoAtual - 2, anoAtual - 1, anoAtual, anoAtual + 1, anoAtual + 2]
        setAnosDisponiveis(anos)
      } catch (error) {
        console.error('Erro ao carregar anos disponíveis:', error)
        // Fallback: anos próximos ao atual
        const anoAtual = new Date().getFullYear()
        setAnosDisponiveis([anoAtual - 1, anoAtual, anoAtual + 1])
      }
    }

    carregarAnosDisponiveis()
  }, [])

  return (
    <AnoLetivoContext.Provider value={{ anoLetivo, setAnoLetivo, anosDisponiveis, setAnosDisponiveis }}>
      {children}
    </AnoLetivoContext.Provider>
  )
}

export const useAnoLetivo = () => {
  const context = useContext(AnoLetivoContext)
  if (context === undefined) {
    throw new Error('useAnoLetivo deve ser usado dentro de um AnoLetivoProvider')
  }
  return context
}
