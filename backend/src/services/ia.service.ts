/**
 * Serviço de IA Conversacional com OpenAI GPT-4
 * Responde dúvidas sobre notas, frequências e informações escolares
 */

import axios from 'axios';
import { prisma } from '../lib/prisma';

export interface IARequest {
  usuarioId: string;
  tipoPerfil: 'GESTAO' | 'PROFESSOR' | 'RESPONSAVEL';
  mensagem: string;
  contexto?: any; // Dados adicionais (alunoId, disciplinaId, etc)
}

export interface IAResponse {
  resposta: string;
  sugestoes?: string[];
  acoes?: Array<{ tipo: string; label: string; data: any }>;
}

class IAService {
  private apiKey: string;
  private modelo: string;
  private ativo: boolean;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.modelo = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
    this.ativo = !!this.apiKey && process.env.IA_ENABLED !== 'false';

    if (this.ativo) {
      console.log(`🤖 IA Service inicializado: Modelo ${this.modelo}`);
    }
  }

  /**
   * Processar mensagem com IA
   */
  async processarMensagem(request: IARequest): Promise<IAResponse> {
    if (!this.ativo) {
      return {
        resposta: 'Desculpe, o serviço de IA não está disponível no momento. Entre em contato com a escola.'
      };
    }

    try {
      // Buscar contexto do usuário
      const contexto = await this.buscarContexto(request);
      
      // Construir prompt
      const prompt = this.construirPrompt(request, contexto);
      
      // Chamar OpenAI
      const resposta = await this.chamarOpenAI(prompt);
      
      return {
        resposta: resposta,
        sugestoes: this.gerarSugestoes(request.tipoPerfil)
      };
    } catch (error: any) {
      console.error('❌ Erro ao processar IA:', error.message);
      return {
        resposta: 'Desculpe, não consegui processar sua mensagem. Tente novamente ou entre em contato com a escola.'
      };
    }
  }

  /**
   * Buscar contexto do banco de dados
   */
  private async buscarContexto(request: IARequest): Promise<any> {
    const contexto: any = {
      nomeEscola: 'Escola',
      anoLetivo: 2026
    };

    try {
      // Buscar informações da escola
      const config = await prisma.configuracoes.findFirst();
      if (config) {
        contexto.nomeEscola = config.nomeEscola;
      }

      // Se for responsável, buscar dados dos alunos
      if (request.tipoPerfil === 'RESPONSAVEL' && request.contexto?.alunosIds) {
        const alunos = await prisma.alunos.findMany({
          where: {
            id: { in: request.contexto.alunosIds }
          },
          include: {
            turmas: true,
            notas: {
              where: { anoLetivo: 2026 },
              include: { disciplinas: true }
            }
          }
        });
        contexto.alunos = alunos;
      }

      // Se for professor, buscar suas disciplinas
      if (request.tipoPerfil === 'PROFESSOR' && request.usuarioId) {
        const professor = await prisma.professores.findFirst({
          where: { id: request.usuarioId },
          include: {
            disciplinas: true,
            turmas: true
          }
        });
        contexto.professor = professor;
      }
    } catch (error) {
      console.error('⚠️ Erro ao buscar contexto:', error);
    }

    return contexto;
  }

  /**
   * Construir prompt para OpenAI
   */
  private construirPrompt(request: IARequest, contexto: any): string {
    const sistema = this.getPromptSistema(request.tipoPerfil, contexto);
    const dados = this.formatarContexto(contexto);
    
    return `${sistema}

DADOS DISPONÍVEIS:
${dados}

PERGUNTA DO USUÁRIO:
${request.mensagem}

INSTRUÇÕES:
- Responda de forma clara, objetiva e amigável
- Use emojis apropriados para educação (📚, 📊, ✅, ⚠️)
- Se não souber, seja honesto e sugira contatar a escola
- Mantenha tom profissional mas acessível
- Limite a resposta a 300 caracteres para WhatsApp/SMS`;
  }

  /**
   * Prompt do sistema baseado no tipo de perfil
   */
  private getPromptSistema(tipo: string, contexto: any): string {
    const base = `Você é um assistente virtual inteligente da ${contexto.nomeEscola}.`;
    
    if (tipo === 'RESPONSAVEL') {
      return `${base} Ajude os pais a acompanhar a vida escolar de seus filhos: notas, frequências, calendário e dúvidas gerais.`;
    } else if (tipo === 'PROFESSOR') {
      return `${base} Auxilie professores com informações sobre suas turmas, disciplinas e alunos.`;
    } else {
      return `${base} Apoie a equipe gestora com visão geral da escola, estatísticas e relatórios.`;
    }
  }

  /**
   * Formatar contexto para o prompt
   */
  private formatarContexto(contexto: any): string {
    let texto = `Escola: ${contexto.nomeEscola}\nAno Letivo: ${contexto.anoLetivo}\n`;
    
    if (contexto.alunos && contexto.alunos.length > 0) {
      texto += '\nALUNOS:\n';
      contexto.alunos.forEach((aluno: any) => {
        texto += `- ${aluno.nome} (Turma: ${aluno.turmas?.nome || 'N/A'})\n`;
        if (aluno.notas && aluno.notas.length > 0) {
          texto += `  Notas recentes: ${aluno.notas.length} registros\n`;
        }
      });
    }

    if (contexto.professor) {
      texto += '\nPROFESSOR:\n';
      texto += `Nome: ${contexto.professor.nome}\n`;
      if (contexto.professor.disciplinas && contexto.professor.disciplinas.length > 0) {
        texto += `Disciplinas: ${contexto.professor.disciplinas.map((d: any) => d.nome).join(', ')}\n`;
      }
    }

    return texto;
  }

  /**
   * Chamar API da OpenAI
   */
  private async chamarOpenAI(prompt: string): Promise<string> {
    const url = 'https://api.openai.com/v1/chat/completions';
    
    const response = await axios.post(
      url,
      {
        model: this.modelo,
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente educacional útil e amigável.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  }

  /**
   * Gerar sugestões de perguntas
   */
  private gerarSugestoes(tipo: string): string[] {
    if (tipo === 'RESPONSAVEL') {
      return [
        'Como está a frequência do meu filho?',
        'Quais são as notas mais recentes?',
        'Quando é a próxima reunião de pais?',
        'Como calcular a média final?'
      ];
    } else if (tipo === 'PROFESSOR') {
      return [
        'Quantos alunos estão abaixo da média?',
        'Qual a frequência média da minha turma?',
        'Como lançar notas?'
      ];
    } else {
      return [
        'Quantos alunos estão em risco?',
        'Taxa de aprovação geral',
        'Relatório de frequências'
      ];
    }
  }

  /**
   * Verificar se serviço está ativo
   */
  isAtivo(): boolean {
    return this.ativo;
  }
}

// Singleton
export const iaService = new IAService();
export default iaService;
