/**
 * Configuração de Responsividade
 * Breakpoints padronizados para toda a aplicação
 */

export const breakpoints = {
  mobile: {
    min: 0,
    max: 767,
  },
  tablet: {
    min: 768,
    max: 1023,
  },
  desktop: {
    min: 1024,
    max: 1439,
  },
  desktopLarge: {
    min: 1440,
    max: Infinity,
  },
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Media queries para uso em styled-components ou CSS-in-JS
 */
export const mediaQueries = {
  mobile: `@media (max-width: ${breakpoints.mobile.max}px)`,
  tablet: `@media (min-width: ${breakpoints.tablet.min}px) and (max-width: ${breakpoints.tablet.max}px)`,
  desktop: `@media (min-width: ${breakpoints.desktop.min}px)`,
  desktopLarge: `@media (min-width: ${breakpoints.desktopLarge.min}px)`,
  
  // Queries úteis
  notMobile: `@media (min-width: ${breakpoints.tablet.min}px)`,
  mobileAndTablet: `@media (max-width: ${breakpoints.tablet.max}px)`,
} as const;

/**
 * Hook para detectar o breakpoint atual
 */
export const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint>('desktop');
  
  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width <= breakpoints.mobile.max) {
        setBreakpoint('mobile');
      } else if (width <= breakpoints.tablet.max) {
        setBreakpoint('tablet');
      } else if (width <= breakpoints.desktop.max) {
        setBreakpoint('desktop');
      } else {
        setBreakpoint('desktopLarge');
      }
    };
    
    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);
  
  return breakpoint;
};

/**
 * Hook para verificar se está em mobile
 */
export const useIsMobile = (): boolean => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'mobile';
};

/**
 * Hook para verificar se está em tablet
 */
export const useIsTablet = (): boolean => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'tablet';
};

/**
 * Hook para verificar se está em desktop
 */
export const useIsDesktop = (): boolean => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'desktop' || breakpoint === 'desktopLarge';
};

/**
 * Componente responsivo que renderiza diferentes componentes por breakpoint
 */
interface ResponsiveProps {
  mobile?: React.ReactNode;
  tablet?: React.ReactNode;
  desktop?: React.ReactNode;
  children?: React.ReactNode;
}

export const Responsive: React.FC<ResponsiveProps> = ({
  mobile,
  tablet,
  desktop,
  children,
}) => {
  const breakpoint = useBreakpoint();
  
  if (breakpoint === 'mobile' && mobile) return <>{mobile}</>;
  if (breakpoint === 'tablet' && tablet) return <>{tablet}</>;
  if ((breakpoint === 'desktop' || breakpoint === 'desktopLarge') && desktop) {
    return <>{desktop}</>;
  }
  
  return <>{children}</>;
};

// Adicionar React import
import React from 'react';
