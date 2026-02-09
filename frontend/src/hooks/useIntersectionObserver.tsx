/**
 * Hook para detectar quando um elemento está visível na tela
 * Útil para animações e lazy loading
 */

import { useEffect, useState, useRef } from 'react'

interface UseIntersectionObserverProps {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
  freezeOnceVisible?: boolean
}

export const useIntersectionObserver = ({
  threshold = 0.1,
  root = null,
  rootMargin = '0px',
  freezeOnceVisible = false,
}: UseIntersectionObserverProps = {}) => {
  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)
  const frozen = useRef(false)

  useEffect(() => {
    const element = elementRef.current
    const hasIOSupport = !!window.IntersectionObserver

    if (!hasIOSupport || !element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry)
        
        if (entry.isIntersecting) {
          setIsVisible(true)
          
          if (freezeOnceVisible) {
            frozen.current = true
            observer.unobserve(element)
          }
        } else if (!frozen.current) {
          setIsVisible(false)
        }
      },
      { threshold, root, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, root, rootMargin, freezeOnceVisible])

  return { elementRef, entry, isVisible }
}

/**
 * Componente para fade in quando visível
 */
interface FadeInWhenVisibleProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export const FadeInWhenVisible = ({ 
  children, 
  className = '',
  delay = 0 
}: FadeInWhenVisibleProps) => {
  const { elementRef, isVisible } = useIntersectionObserver({
    threshold: 0.2,
    freezeOnceVisible: true
  })

  return (
    <div
      ref={elementRef}
      className={`fade-in-element ${isVisible ? 'is-visible' : ''} ${className}`}
      style={{ 
        transitionDelay: `${delay}ms`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease'
      }}
    >
      {children}
    </div>
  )
}
