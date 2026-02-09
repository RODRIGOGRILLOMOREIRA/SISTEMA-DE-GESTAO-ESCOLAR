/**
 * Configurações do Sistema de Reconhecimento Facial IA
 * Ajuste estes valores conforme necessário
 */

export const RECONHECIMENTO_CONFIG = {
  // Threshold de reconhecimento (0-1)
  // Menor = mais restritivo, Maior = mais permissivo
  THRESHOLD: 0.6,

  // FPS de detecção (em milissegundos)
  // 200ms = 5 FPS para evitar travamentos
  DETECTION_INTERVAL: 200,

  // Configuração do detector
  DETECTOR: {
    inputSize: 320,      // Reduzido para melhor performance
    scoreThreshold: 0.4  // Equilibrado para boa detecção sem sobrecarregar
  },

  // Critérios de auto-confirmação
  AUTO_CONFIRM: {
    confiancaMinima: 65,     // Otimizado para confirmar sem demora
    qualidadeMinima: 60,     // Balanceado
    vivacidadeMinima: 50,    // Balanceado
    framesConsecutivos: 2    // Reduzido para 2 frames (mais rápido)
  },

  // Configurações da câmera
  CAMERA: {
    width: { ideal: 960, max: 1280 },       // Reduzido para menos processamento
    height: { ideal: 540, max: 720 },       // Reduzido para melhor performance
    frameRate: { ideal: 24, max: 30 }       // FPS reduzido para menos carga
  },

  // Feature flags
  FEATURES: {
    autoStart: true,
    multiDetection: true,
    showMetrics: true,
    enableLiveness: true
  }
};

export default RECONHECIMENTO_CONFIG;
