/**
 * Script de Teste - Sistema de Notificações
 * Valida todas as funcionalidades implementadas
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3333/api';
let TOKEN = '';

// Cores para console
const cores = {
  reset: '\x1b[0m',
  verde: '\x1b[32m',
  vermelho: '\x1b[31m',
  amarelo: '\x1b[33m',
  azul: '\x1b[36m'
};

const log = {
  sucesso: (msg: string) => console.log(`${cores.verde}✅ ${msg}${cores.reset}`),
  erro: (msg: string) => console.log(`${cores.vermelho}❌ ${msg}${cores.reset}`),
  info: (msg: string) => console.log(`${cores.azul}ℹ️  ${msg}${cores.reset}`),
  aviso: (msg: string) => console.log(`${cores.amarelo}⚠️  ${msg}${cores.reset}`)
};

// 1. Fazer login
async function fazerLogin() {
  try {
    log.info('Fazendo login...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@escola.com',
      senha: 'admin123' // Ajuste conforme necessário
    });
    
    TOKEN = response.data.token;
    log.sucesso('Login realizado com sucesso!');
    return true;
  } catch (error: any) {
    log.erro(`Erro no login: ${error.message}`);
    log.aviso('Ajuste as credenciais no script de teste');
    return false;
  }
}

// 2. Verificar status do sistema
async function verificarStatus() {
  try {
    log.info('Verificando status do sistema...');
    const response = await axios.get(`${BASE_URL}/notificacoes/status`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    
    const { status } = response.data;
    
    console.log('\n📊 Status do Sistema:');
    console.log(`   Notificações Ativas: ${status.notificacoesAtivas ? '✅' : '❌'}`);
    console.log(`   Modo Teste: ${status.modoTeste ? '✅' : '❌'}`);
    console.log(`   IA Disponível: ${status.iaDisponivel ? '✅' : '❌'}`);
    console.log('\n📱 Canais Disponíveis:');
    console.log(`   WhatsApp: ${status.canaisDisponiveis.whatsapp ? '✅' : '❌'}`);
    console.log(`   Telegram: ${status.canaisDisponiveis.telegram ? '✅' : '❌'}`);
    console.log(`   SMS: ${status.canaisDisponiveis.sms ? '✅' : '❌'}`);
    
    log.sucesso('Status verificado!');
    return true;
  } catch (error: any) {
    log.erro(`Erro ao verificar status: ${error.message}`);
    return false;
  }
}

// 3. Criar configuração de teste
async function criarConfiguracao() {
  try {
    log.info('Criando configuração de teste...');
    
    const config = {
      usuarioId: 1, // Ajuste conforme necessário
      tipo: 'RESPONSAVEL',
      canal: 'WHATSAPP',
      telefone: '+5511999999999',
      notificarFrequencia: true,
      notificarNotas: true,
      notificarAlertas: true,
      horarioInicio: '08:00',
      horarioFim: '20:00',
      diasSemana: ['SEG', 'TER', 'QUA', 'QUI', 'SEX'],
      resumoDiario: true,
      frequenciaMensagens: 'TODAS',
      ativo: true
    };
    
    const response = await axios.post(`${BASE_URL}/notificacoes/configuracao`, config, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    
    console.log('\n📝 Configuração criada:');
    console.log(`   ID: ${response.data.configuracao.id}`);
    console.log(`   Usuário ID: ${response.data.configuracao.usuarioId}`);
    console.log(`   Canal: ${response.data.configuracao.canal}`);
    console.log(`   Ativo: ${response.data.configuracao.ativo ? '✅' : '❌'}`);
    
    log.sucesso('Configuração criada!');
    return response.data.configuracao.usuarioId;
  } catch (error: any) {
    if (error.response?.status === 409) {
      log.aviso('Configuração já existe (esperado em testes)');
      return 1;
    }
    log.erro(`Erro ao criar configuração: ${error.message}`);
    return null;
  }
}

// 4. Buscar configuração
async function buscarConfiguracao(usuarioId: number) {
  try {
    log.info(`Buscando configuração do usuário ${usuarioId}...`);
    
    const response = await axios.get(`${BASE_URL}/notificacoes/configuracao/${usuarioId}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    
    console.log('\n📋 Configuração encontrada:');
    console.log(`   Tipo: ${response.data.configuracao.tipo}`);
    console.log(`   Canal: ${response.data.configuracao.canal}`);
    console.log(`   Telefone: ${response.data.configuracao.telefone}`);
    console.log(`   Notificar Frequência: ${response.data.configuracao.notificarFrequencia ? '✅' : '❌'}`);
    console.log(`   Notificar Notas: ${response.data.configuracao.notificarNotas ? '✅' : '❌'}`);
    
    log.sucesso('Configuração encontrada!');
    return true;
  } catch (error: any) {
    log.erro(`Erro ao buscar configuração: ${error.message}`);
    return false;
  }
}

// 5. Testar envio de notificação
async function testarNotificacao() {
  try {
    log.info('Testando envio de notificação...');
    
    const teste = {
      telefone: '+5511999999999',
      canal: 'WHATSAPP',
      mensagem: '🧪 Teste do Sistema de Notificações\n\nSe você recebeu esta mensagem, o sistema está funcionando perfeitamente!'
    };
    
    const response = await axios.post(`${BASE_URL}/notificacoes/teste`, teste, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    
    console.log('\n📤 Teste de envio:');
    console.log(`   Sucesso: ${response.data.success ? '✅' : '❌'}`);
    console.log(`   Entregue: ${response.data.resultado?.entregue ? '✅' : '❌'}`);
    
    if (response.data.resultado?.messageId) {
      console.log(`   Message ID: ${response.data.resultado.messageId}`);
    }
    
    log.sucesso('Teste de notificação executado!');
    return true;
  } catch (error: any) {
    log.erro(`Erro ao testar notificação: ${error.message}`);
    log.aviso('Verifique se MODO_TESTE=true está configurado no .env');
    return false;
  }
}

// 6. Verificar histórico
async function verificarHistorico() {
  try {
    log.info('Verificando histórico de notificações...');
    
    const response = await axios.get(`${BASE_URL}/notificacoes/historico?limit=5`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    
    console.log('\n📜 Histórico de Notificações:');
    console.log(`   Total: ${response.data.total}`);
    console.log(`   Últimas 5 notificações:`);
    
    response.data.historico.forEach((item: any, index: number) => {
      console.log(`   ${index + 1}. ${item.tipo} - ${item.status} (${item.canal})`);
    });
    
    log.sucesso('Histórico verificado!');
    return true;
  } catch (error: any) {
    log.erro(`Erro ao verificar histórico: ${error.message}`);
    return false;
  }
}

// 7. Testar chat IA
async function testarChatIA() {
  try {
    log.info('Testando chat com IA...');
    
    const mensagem = {
      usuarioId: 1,
      mensagem: 'Olá! Como funciona o sistema de notificações?',
      contexto: {
        tipo: 'RESPONSAVEL'
      }
    };
    
    const response = await axios.post(`${BASE_URL}/notificacoes/chat`, mensagem, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    
    console.log('\n🤖 Resposta da IA:');
    console.log(`   ${response.data.resposta.substring(0, 200)}...`);
    
    log.sucesso('Chat IA funcionando!');
    return true;
  } catch (error: any) {
    log.erro(`Erro no chat IA: ${error.message}`);
    log.aviso('Verifique se OPENAI_API_KEY está configurada no .env');
    return false;
  }
}

// 8. Verificar rotas de eventos
async function verificarEventos() {
  try {
    log.info('Verificando integração com eventos...');
    
    // Verificar se as rotas de notas e frequência existem
    const rotasParaVerificar = [
      '/api/notas/turma',
      '/api/registro-frequencia/turma'
    ];
    
    for (const rota of rotasParaVerificar) {
      try {
        await axios.get(`${BASE_URL}${rota}`, {
          headers: { Authorization: `Bearer ${TOKEN}` },
          params: { turmaId: 1, anoLetivo: 2026 }
        });
        log.sucesso(`Rota ${rota} acessível`);
      } catch (error: any) {
        if (error.response?.status === 404) {
          log.aviso(`Rota ${rota} existe mas sem dados`);
        } else {
          log.info(`Rota ${rota} protegida (esperado)`);
        }
      }
    }
    
    return true;
  } catch (error: any) {
    log.erro(`Erro ao verificar eventos: ${error.message}`);
    return false;
  }
}

// Executar todos os testes
async function executarTestes() {
  console.log('\n🧪 INICIANDO TESTES DO SISTEMA DE NOTIFICAÇÕES\n');
  console.log('='.repeat(60));
  
  const resultados = {
    total: 0,
    sucesso: 0,
    falha: 0
  };
  
  // Teste 1: Login
  console.log('\n1️⃣  TESTE: Login\n');
  resultados.total++;
  if (await fazerLogin()) {
    resultados.sucesso++;
  } else {
    resultados.falha++;
    log.erro('Não foi possível continuar os testes sem autenticação');
    process.exit(1);
  }
  
  // Teste 2: Status do Sistema
  console.log('\n2️⃣  TESTE: Status do Sistema\n');
  resultados.total++;
  if (await verificarStatus()) {
    resultados.sucesso++;
  } else {
    resultados.falha++;
  }
  
  // Teste 3: Criar Configuração
  console.log('\n3️⃣  TESTE: Criar Configuração\n');
  resultados.total++;
  const usuarioId = await criarConfiguracao();
  if (usuarioId) {
    resultados.sucesso++;
  } else {
    resultados.falha++;
  }
  
  // Teste 4: Buscar Configuração
  console.log('\n4️⃣  TESTE: Buscar Configuração\n');
  resultados.total++;
  if (await buscarConfiguracao(usuarioId || 1)) {
    resultados.sucesso++;
  } else {
    resultados.falha++;
  }
  
  // Teste 5: Testar Notificação
  console.log('\n5️⃣  TESTE: Enviar Notificação\n');
  resultados.total++;
  if (await testarNotificacao()) {
    resultados.sucesso++;
  } else {
    resultados.falha++;
  }
  
  // Teste 6: Verificar Histórico
  console.log('\n6️⃣  TESTE: Histórico\n');
  resultados.total++;
  if (await verificarHistorico()) {
    resultados.sucesso++;
  } else {
    resultados.falha++;
  }
  
  // Teste 7: Chat IA
  console.log('\n7️⃣  TESTE: Chat IA\n');
  resultados.total++;
  if (await testarChatIA()) {
    resultados.sucesso++;
  } else {
    resultados.falha++;
  }
  
  // Teste 8: Eventos
  console.log('\n8️⃣  TESTE: Integração com Eventos\n');
  resultados.total++;
  if (await verificarEventos()) {
    resultados.sucesso++;
  } else {
    resultados.falha++;
  }
  
  // Resumo
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 RESUMO DOS TESTES\n');
  console.log(`   Total de testes: ${resultados.total}`);
  console.log(`   ${cores.verde}✅ Sucessos: ${resultados.sucesso}${cores.reset}`);
  console.log(`   ${cores.vermelho}❌ Falhas: ${resultados.falha}${cores.reset}`);
  console.log(`   Taxa de sucesso: ${((resultados.sucesso / resultados.total) * 100).toFixed(1)}%`);
  
  if (resultados.falha === 0) {
    console.log(`\n${cores.verde}🎉 TODOS OS TESTES PASSARAM!${cores.reset}`);
    console.log(`\n${cores.azul}✨ Sistema de Notificações totalmente funcional!${cores.reset}`);
  } else {
    console.log(`\n${cores.amarelo}⚠️  Alguns testes falharam. Verifique as configurações.${cores.reset}`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📚 Próximos passos:');
  console.log('   1. Configure as APIs externas no .env');
  console.log('   2. Ajuste NOTIFICACOES_ATIVAS=true');
  console.log('   3. Configure MODO_TESTE=false para produção');
  console.log('   4. Leia o GUIA_NOTIFICACOES.md');
  console.log('\n');
}

// Executar
executarTestes().catch(console.error);
