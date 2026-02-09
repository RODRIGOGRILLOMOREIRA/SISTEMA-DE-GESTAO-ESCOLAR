/**
 * Hook para Smooth Scroll otimizado
 * Melhora a experiência de navegação
 */

import { useEffect } from 'react'

export const useSmoothScroll = () => {
  useEffect(() => {
    // Habilitar scroll suave globalmente
    document.documentElement.style.scrollBehavior = 'smooth'

    return () => {
      document.documentElement.style.scrollBehavior = 'auto'
    }
  }, [])
}

/**
 * Função para scroll suave para um elemento
 */
export const scrollToElement = (
  elementId: string, 
  offset: number = 0,
  behavior: ScrollBehavior = 'smooth'
) => {
  const element = document.getElementById(elementId)
  
  if (element) {
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - offset
    
    window.scrollTo({
      top: offsetPosition,
      behavior
    })
  }
}

/**
 * Função para scroll suave para o topo
 */
export const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
  window.scrollTo({
    top: 0,
    behavior
  })
}

/**
 * Hook para botão "Voltar ao Topo"
 */
export const useScrollToTop = (threshold: number = 300) => {
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.pageYOffset > threshold)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return { showButton, scrollToTop }
}

/**
 * Componente de Botão "Voltar ao Topo"
 */
import { ArrowUp } from 'lucide-react'
import { useState } from 'react'
import './ScrollToTop.css'

export const ScrollToTopButton = () => {
  const { showButton, scrollToTop: scroll } = useScrollToTop()

  if (!showButton) return null

  return (
    <button 
      className="scroll-to-top-button"
      onClick={() => scroll()}
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
    >
      <ArrowUp size={24} />
    </button>
  )
}
