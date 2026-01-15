/**
 * Sistema de Eventos para Notificações Inteligentes
 * Gerencia eventos de notas, frequências e alertas
 */

import { EventEmitter } from 'events';

export interface EventoNotaLancada {
  alunoId: string;
  alunoNome: string;
  disciplinaId: string;
  disciplinaNome: string;
  trimestre: number;
  tipoAvaliacao: string;
  nota: number;
  peso?: number;
  mediaAtual?: number;
  mediaMinima: number;
  anoLetivo: number;
  professorId: string;
  professorNome: string;
  turmaId: string;
  turmaNome: string;
}

export interface EventoFrequenciaRegistrada {
  alunoId: string;
  alunoNome: string;
  disciplinaId: string;
  disciplinaNome: string;
  turmaId: string;
  turmaNome: string;
  data: Date;
  presente: boolean;
  periodo?: string;
  horario?: string;
  professorId: string;
  professorNome: string;
  // Estatísticas de frequência
  totalAulas: number;
  totalFaltas: number;
  percentualFrequencia: number;
  limiteMinimo: number; // 75%
}

export interface EventoAlertaMediaBaixa {
  alunoId: string;
  alunoNome: string;
  disciplinaId: string;
  disciplinaNome: string;
  mediaAtual: number;
  mediaMinima: number;
  trimestre: number;
  turmaId: string;
  turmaNome: string;
  gravidade: 'BAIXA' | 'MEDIA' | 'ALTA';
}

export interface EventoAlertaFrequenciaBaixa {
  alunoId: string;
  alunoNome: string;
  disciplinaId?: string;
  disciplinaNome?: string;
  turmaId: string;
  turmaNome: string;
  percentualFrequencia: number;
  limiteMinimo: number;
  totalFaltas: number;
  faltasRestantes: number;
  gravidade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
}

export interface EventoResumoDiario {
  tipo: 'GESTAO' | 'PROFESSOR' | 'RESPONSAVEL';
  usuarioId: string;
  data: Date;
  dados: {
    notasLancadas?: number;
    faltasRegistradas?: number;
    presentesRegistrados?: number;
    alunosEmAlerta?: number;
    detalhesPorDisciplina?: any[];
    detalhesPorAluno?: any[];
  };
}

class EventsService extends EventEmitter {
  constructor() {
    super();
    // Aumentar limite para múltiplos listeners (evita warning de vazamento de memória)
    this.setMaxListeners(100); 
  }

  // Método para remover todos os listeners (útil para testes e cleanup)
  cleanup() {
    this.removeAllListeners();
  }

  // Eventos de Nota
  emitirNotaLancada(evento: EventoNotaLancada) {
    console.log(`📊 [EVENTO] Nota lançada: ${evento.alunoNome} - ${evento.disciplinaNome} - ${evento.nota}`);
    this.emit('nota:lancada', evento);
  }

  // Eventos de Frequência
  emitirFrequenciaRegistrada(evento: EventoFrequenciaRegistrada) {
    const tipo = evento.presente ? 'Presença' : 'Falta';
    console.log(`📅 [EVENTO] ${tipo} registrada: ${evento.alunoNome} - ${evento.disciplinaNome}`);
    this.emit('frequencia:registrada', evento);
  }

  emitirFaltaRegistrada(evento: { alunoId: string; alunoNome: string; turmaId: string; turmaNome: string; data: Date; observacao?: string }) {
    console.log(`❌ [EVENTO] Falta registrada: ${evento.alunoNome} - ${evento.turmaNome}`);
    this.emit('falta:registrada', evento);
  }

  // Eventos de Alerta
  emitirAlertaMediaBaixa(evento: EventoAlertaMediaBaixa) {
    console.log(`⚠️ [EVENTO] Alerta de média baixa: ${evento.alunoNome} - ${evento.disciplinaNome} (${evento.mediaAtual})`);
    this.emit('alerta:media-baixa', evento);
  }

  emitirAlertaFrequenciaBaixa(evento: EventoAlertaFrequenciaBaixa) {
    console.log(`⚠️ [EVENTO] Alerta de frequência baixa: ${evento.alunoNome} (${evento.percentualFrequencia}%)`);
    this.emit('alerta:frequencia-baixa', evento);
  }

  // Eventos de Resumo
  emitirResumoDiario(evento: EventoResumoDiario) {
    console.log(`📋 [EVENTO] Resumo diário: ${evento.tipo} - ${evento.usuarioId}`);
    this.emit('resumo:diario', evento);
  }

  // Helpers para cálculos
  calcularGravidadeMedia(mediaAtual: number, mediaMinima: number): 'BAIXA' | 'MEDIA' | 'ALTA' {
    const diferenca = mediaMinima - mediaAtual;
    if (diferenca >= 2) return 'ALTA';
    if (diferenca >= 1) return 'MEDIA';
    return 'BAIXA';
  }

  calcularGravidadeFrequencia(percentual: number, limiteMinimo: number): 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA' {
    const diferenca = percentual - limiteMinimo;
    if (percentual < limiteMinimo) return 'CRITICA';
    if (diferenca < 5) return 'ALTA';
    if (diferenca < 10) return 'MEDIA';
    return 'BAIXA';
  }
}

// Singleton
export const eventsService = new EventsService();
export default eventsService;
