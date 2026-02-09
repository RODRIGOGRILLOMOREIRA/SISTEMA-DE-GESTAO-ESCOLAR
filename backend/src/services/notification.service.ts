/**
 * Serviço Central de Notificações Inteligentes
 * Orquestra WhatsApp, SMS, IA e sistema de permissões
 */

import { prisma } from '../lib/prisma';
import whatsappService from './whatsapp.service';
import smsService from './sms.service';
import iaService from './ia.service';
import eventsService, {
  EventoNotaLancada,
  EventoFrequenciaRegistrada,
  EventoAlertaMediaBaixa,
  EventoAlertaFrequenciaBaixa
} from './events.service';

class NotificationService {
  constructor() {
    this.inicializarListeners();
  }

  /**
   * Inicializar listeners de eventos
   */
  private inicializarListeners() {
    // Nota lançada
    eventsService.on('nota:lancada', async (evento: EventoNotaLancada) => {
      await this.handleNotaLancada(evento);
    });

    // Frequência registrada
    eventsService.on('frequencia:registrada', async (evento: EventoFrequenciaRegistrada) => {
      await this.handleFrequenciaRegistrada(evento);
    });

    // Alerta de média baixa
    eventsService.on('alerta:media-baixa', async (evento: EventoAlertaMediaBaixa) => {
      await this.handleAlertaMediaBaixa(evento);
    });

    // Alerta de frequência baixa
    eventsService.on('alerta:frequencia-baixa', async (evento: EventoAlertaFrequenciaBaixa) => {
      await this.handleAlertaFrequenciaBaixa(evento);
    });

    console.log('🔔 Notification Service: Listeners inicializados');
  }

  /**
   * Handler: Nota Lançada
   */
  private async handleNotaLancada(evento: EventoNotaLancada) {
    try {
      // 1. Notificar responsável do aluno
      await this.notificarResponsavel(evento.alunoId, {
        tipo: 'NOTA_LANCADA',
        conteudo: this.formatarMensagemNota(evento)
      });

      // 2. Se média baixa, enviar alerta
      if (evento.mediaAtual && evento.mediaAtual < evento.mediaMinima) {
        eventsService.emitirAlertaMediaBaixa({
          alunoId: evento.alunoId,
          alunoNome: evento.alunoNome,
          disciplinaId: evento.disciplinaId,
          disciplinaNome: evento.disciplinaNome,
          mediaAtual: evento.mediaAtual,
          mediaMinima: evento.mediaMinima,
          trimestre: evento.trimestre,
          turmaId: evento.turmaId,
          turmaNome: evento.turmaNome,
          gravidade: eventsService.calcularGravidadeMedia(evento.mediaAtual, evento.mediaMinima)
        });
      }

      // 3. Notificar gestão (se configurado para receber todas)
      await this.notificarGestao({
        tipo: 'NOTA_LANCADA',
        conteudo: `📊 Nota: ${evento.alunoNome} - ${evento.disciplinaNome} - ${evento.nota}`,
        metadata: evento
      });

      // 4. Registrar log
      await this.registrarLog('NOTA_LANCADA', evento.alunoId, this.formatarMensagemNota(evento));

    } catch (error) {
      console.error('❌ Erro ao processar nota lançada:', error);
    }
  }

  /**
   * Handler: Frequência Registrada
   */
  private async handleFrequenciaRegistrada(evento: EventoFrequenciaRegistrada) {
    try {
      // Só notifica faltas (ou se configurado para todas)
      const deveNotificar = !evento.presente || await this.deveNotificarPresenca(evento.alunoId);

      if (deveNotificar) {
        await this.notificarResponsavel(evento.alunoId, {
          tipo: evento.presente ? 'FREQUENCIA_PRESENCA' : 'FREQUENCIA_FALTA',
          conteudo: this.formatarMensagemFrequencia(evento)
        });
      }

      // Verificar se frequência está baixa
      if (evento.percentualFrequencia < evento.limiteMinimo || evento.percentualFrequencia < 80) {
        eventsService.emitirAlertaFrequenciaBaixa({
          alunoId: evento.alunoId,
          alunoNome: evento.alunoNome,
          disciplinaId: evento.disciplinaId,
          disciplinaNome: evento.disciplinaNome,
          turmaId: evento.turmaId,
          turmaNome: evento.turmaNome,
          percentualFrequencia: evento.percentualFrequencia,
          limiteMinimo: evento.limiteMinimo,
          totalFaltas: evento.totalFaltas,
          faltasRestantes: Math.floor((evento.totalAulas * 0.25) - evento.totalFaltas),
          gravidade: eventsService.calcularGravidadeFrequencia(evento.percentualFrequencia, evento.limiteMinimo)
        });
      }

      // Notificar gestão apenas de faltas
      if (!evento.presente) {
        await this.notificarGestao({
          tipo: 'FREQUENCIA_FALTA',
          conteudo: `⚠️ Falta: ${evento.alunoNome} - ${evento.disciplinaNome}`,
          metadata: evento
        });
      }

      await this.registrarLog(
        evento.presente ? 'FREQUENCIA_PRESENCA' : 'FREQUENCIA_FALTA',
        evento.alunoId,
        this.formatarMensagemFrequencia(evento)
      );

    } catch (error) {
      console.error('❌ Erro ao processar frequência:', error);
    }
  }

  /**
   * Handler: Alerta de Média Baixa
   */
  private async handleAlertaMediaBaixa(evento: EventoAlertaMediaBaixa) {
    try {
      const mensagem = `⚠️ ALERTA - Média Baixa

👨‍🎓 Aluno: ${evento.alunoNome}
📚 Disciplina: ${evento.disciplinaNome}
📊 Média atual: ${evento.mediaAtual.toFixed(1)}
🎯 Média mínima: ${evento.mediaMinima.toFixed(1)}
📉 Diferença: ${(evento.mediaMinima - evento.mediaAtual).toFixed(1)} pontos

${evento.gravidade === 'ALTA' ? '🚨 ATENÇÃO: Situação crítica!' : '⚠️ Acompanhamento necessário'}

Entre em contato com a escola para mais informações.`;

      await this.notificarResponsavel(evento.alunoId, {
        tipo: 'ALERTA_MEDIA_BAIXA',
        conteudo: mensagem
      });

      await this.notificarGestao({
        tipo: 'ALERTA_MEDIA_BAIXA',
        conteudo: `🚨 Alerta: ${evento.alunoNome} - ${evento.disciplinaNome} (${evento.mediaAtual})`,
        metadata: evento
      });

    } catch (error) {
      console.error('❌ Erro ao processar alerta de média:', error);
    }
  }

  /**
   * Handler: Alerta de Frequência Baixa
   */
  private async handleAlertaFrequenciaBaixa(evento: EventoAlertaFrequenciaBaixa) {
    try {
      const mensagem = `⚠️ ALERTA - Frequência Baixa

👨‍🎓 Aluno: ${evento.alunoNome}
${evento.disciplinaNome ? `📚 Disciplina: ${evento.disciplinaNome}` : '📚 Frequência Geral'}
📊 Frequência atual: ${evento.percentualFrequencia.toFixed(1)}%
🎯 Mínimo obrigatório: ${evento.limiteMinimo}%
📉 Total de faltas: ${evento.totalFaltas}
✅ Faltas restantes: ${evento.faltasRestantes}

${evento.gravidade === 'CRITICA' ? '🚨 CRÍTICO: Abaixo do limite!' : evento.gravidade === 'ALTA' ? '⚠️ ATENÇÃO: Próximo do limite!' : '⚠️ Acompanhamento recomendado'}

Justificar faltas pela plataforma ou contatar a escola.`;

      await this.notificarResponsavel(evento.alunoId, {
        tipo: 'ALERTA_FREQUENCIA_BAIXA',
        conteudo: mensagem
      });

      await this.notificarGestao({
        tipo: 'ALERTA_FREQUENCIA_BAIXA',
        conteudo: `🚨 Frequência: ${evento.alunoNome} (${evento.percentualFrequencia.toFixed(1)}%)`,
        metadata: evento
      });

    } catch (error) {
      console.error('❌ Erro ao processar alerta de frequência:', error);
    }
  }

  /**
   * Notificar responsável de um aluno
   */
  private async notificarResponsavel(alunoId: string, dados: any) {
    try {
      // Buscar dados do aluno
      const aluno = await prisma.alunos.findUnique({
        where: { id: alunoId }
      });

      if (!aluno || !aluno.telefoneResp) {
        console.log('⚠️ Aluno sem telefone do responsável:', alunoId);
        return;
      }

      // Buscar configuração de notificações
      const config = await prisma.configuracao_notificacao.findFirst({
        where: {
          usuarioId: alunoId, // Pode ser mapeado para o responsável
          tipoPerfil: 'RESPONSAVEL'
        }
      });

      // Verificar se deve enviar (horário, frequência, etc)
      if (config && !this.deveEnviarNotificacao(config, dados.tipo)) {
        console.log('⏭️ Notificação pulada por configuração:', alunoId);
        return;
      }

      // Tentar WhatsApp primeiro
      let enviado = false;
      if (!config || config.whatsappAtivo) {
        enviado = await whatsappService.enviarMensagem({
          to: aluno.telefoneResp,
          message: dados.conteudo
        });
      }

      // Se falhar, tentar SMS
      if (!enviado && (!config || config.smsAtivo)) {
        enviado = await smsService.enviarSMS({
          to: aluno.telefoneResp,
          message: dados.conteudo
        });
      }

      if (enviado) {
        console.log('✅ Notificação enviada:', aluno.nome);
      }

    } catch (error) {
      console.error('❌ Erro ao notificar responsável:', error);
    }
  }

  /**
   * Notificar equipe gestora
   */
  private async notificarGestao(dados: any) {
    try {
      // Buscar configurações da gestão
      const configs = await prisma.configuracao_notificacao.findMany({
        where: {
          tipoPerfil: 'GESTAO',
          notificarAlertas: true
        }
      });

      for (const config of configs) {
        // TODO: Buscar telefone da gestão e enviar
        console.log('📋 [GESTÃO]', dados.conteudo);
      }
    } catch (error) {
      console.error('❌ Erro ao notificar gestão:', error);
    }
  }

  /**
   * Verificar se deve enviar notificação baseado em configurações
   */
  private deveEnviarNotificacao(config: any, tipo: string): boolean {
    // Verificar horário
    if (config.horarioInicio && config.horarioFim) {
      const agora = new Date();
      const hora = agora.getHours();
      const [horaInicio] = config.horarioInicio.split(':').map(Number);
      const [horaFim] = config.horarioFim.split(':').map(Number);
      
      if (hora < horaInicio || hora > horaFim) {
        return false;
      }
    }

    // Verificar frequência de mensagens
    if (config.frequenciaMensagens === 'ALERTAS') {
      return tipo.includes('ALERTA');
    } else if (config.frequenciaMensagens === 'RESUMO') {
      return tipo === 'RESUMO_DIARIO';
    }

    return true;
  }

  /**
   * Verificar se deve notificar presenças
   */
  private async deveNotificarPresenca(alunoId: string): Promise<boolean> {
    const config = await prisma.configuracao_notificacao.findFirst({
      where: { usuarioId: alunoId }
    });
    return config?.frequenciaMensagens === 'TODAS';
  }

  /**
   * Registrar log de notificação
   */
  private async registrarLog(tipo: string, destinatarioId: string, conteudo: string) {
    try {
      await prisma.log_notificacao.create({
        data: {
          destinatarioId,
          tipoPerfil: 'RESPONSAVEL',
          canal: 'WHATSAPP',
          tipoEvento: tipo as any,
          conteudo,
          status: 'ENVIADO'
        }
      });
    } catch (error) {
      console.error('⚠️ Erro ao registrar log:', error);
    }
  }

  /**
   * Formatar mensagem de nota
   */
  private formatarMensagemNota(evento: EventoNotaLancada): string {
    return `📚 Nova Nota Lançada!

👨‍🎓 Aluno: ${evento.alunoNome}
📖 Disciplina: ${evento.disciplinaNome}
📝 Avaliação: ${evento.tipoAvaliacao}${evento.peso ? ` (Peso ${evento.peso})` : ''}
📊 Nota: ${evento.nota.toFixed(1)}
${evento.mediaAtual ? `📈 Média atual: ${evento.mediaAtual.toFixed(1)}` : ''}
${evento.mediaAtual && evento.mediaAtual >= evento.mediaMinima ? '✅ Aprovado parcialmente' : '⚠️ Abaixo da média'}

${evento.turmaNome} - ${evento.trimestre}º Trimestre`;
  }

  /**
   * Formatar mensagem de frequência
   */
  private formatarMensagemFrequencia(evento: EventoFrequenciaRegistrada): string {
    if (evento.presente) {
      return `✅ Presença Confirmada

👨‍🎓 Aluno: ${evento.alunoNome}
📚 Disciplina: ${evento.disciplinaNome}
📅 Data: ${evento.data.toLocaleDateString('pt-BR')}
${evento.periodo ? `🕐 Período: ${evento.periodo}` : ''}

📊 Frequência: ${evento.percentualFrequencia.toFixed(1)}% (${evento.totalAulas - evento.totalFaltas}/${evento.totalAulas} aulas)`;
    } else {
      return `⚠️ Falta Registrada

👨‍🎓 Aluno: ${evento.alunoNome}
📚 Disciplina: ${evento.disciplinaNome}
📅 Data: ${evento.data.toLocaleDateString('pt-BR')}
${evento.horario ? `🕐 Horário: ${evento.horario}` : ''}

📊 Frequência atual: ${evento.percentualFrequencia.toFixed(1)}%
📉 Faltas: ${evento.totalFaltas} de ${evento.totalAulas} aulas
${evento.percentualFrequencia < evento.limiteMinimo ? '🚨 ABAIXO DO LIMITE!' : evento.percentualFrequencia < 80 ? '⚠️ Atenção recomendada' : '✅ Dentro do limite'}`;
    }
  }
}

// Singleton
export const notificationService = new NotificationService();
export default notificationService;
