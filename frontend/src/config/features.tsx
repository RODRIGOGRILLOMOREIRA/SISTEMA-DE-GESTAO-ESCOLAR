/**
 * Configuração de Features Flags
 * Permite habilitar/desabilitar funcionalidades dinamicamente
 */

import React from 'react';

export interface FeatureFlags {
  // Módulos Principais
  alunos: boolean;
  professores: boolean;
  turmas: boolean;
  disciplinas: boolean;
  notas: boolean;
  frequencia: boolean;
  
  // Módulos Administrativos
  equipeDiretiva: boolean;
  funcionarios: boolean;
  calendario: boolean;
  gradeHoraria: boolean;
  ponto: boolean;
  
  // Funcionalidades Avançadas
  reconhecimentoFacial: boolean;
  relatorios: boolean;
  relatoriosAdministrativos: boolean;
  habilidadesBNCC: boolean;
  boletimDesempenho: boolean;
  
  // Módulos Futuros (desabilitados por padrão)
  financeiro: boolean;
  biblioteca: boolean;
  transporte: boolean;
  merenda: boolean;
  comunicacao: boolean;
  eventos: boolean;
  
  // Funcionalidades Experimentais
  notificacoesPush: boolean;
  chatInterno: boolean;
  appMobile: boolean;
  integracaoWhatsApp: boolean;
}

// Configuração padrão (pode ser sobrescrita por ambiente)
export const defaultFeatures: FeatureFlags = {
  // Módulos Principais - HABILITADOS
  alunos: true,
  professores: true,
  turmas: true,
  disciplinas: true,
  notas: true,
  frequencia: true,
  
  // Módulos Administrativos - HABILITADOS
  equipeDiretiva: true,
  funcionarios: true,
  calendario: true,
  gradeHoraria: true,
  ponto: true,
  
  // Funcionalidades Avançadas - HABILITADOS
  reconhecimentoFacial: true,
  relatorios: true,
  relatoriosAdministrativos: true,
  habilidadesBNCC: true,
  boletimDesempenho: true,
  
  // Módulos Futuros - DESABILITADOS
  financeiro: false,
  biblioteca: false,
  transporte: false,
  merenda: false,
  comunicacao: false,
  eventos: false,
  
  // Funcionalidades Experimentais - DESABILITADAS
  notificacoesPush: false,
  chatInterno: false,
  appMobile: false,
  integracaoWhatsApp: false,
};

// Carregar features do ambiente ou usar padrão
const loadFeatures = (): FeatureFlags => {
  try {
    const envFeatures = import.meta.env.VITE_FEATURES;
    if (envFeatures) {
      return { ...defaultFeatures, ...JSON.parse(envFeatures) };
    }
  } catch (error) {
    console.warn('Erro ao carregar features do ambiente, usando padrão:', error);
  }
  return defaultFeatures;
};

export const features = loadFeatures();

/**
 * Hook para verificar se uma feature está habilitada
 */
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return features[feature] ?? false;
};

/**
 * Componente HOC para renderizar apenas se feature estiver habilitada
 */
export const withFeature = <P extends object>(
  Component: React.ComponentType<P>,
  feature: keyof FeatureFlags
) => {
  return (props: P) => {
    if (!isFeatureEnabled(feature)) {
      return null;
    }
    return <Component {...props} />;
  };
};

/**
 * Hook React para features
 */
export const useFeature = (feature: keyof FeatureFlags): boolean => {
  return isFeatureEnabled(feature);
};
