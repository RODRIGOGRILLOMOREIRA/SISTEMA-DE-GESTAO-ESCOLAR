/**
 * Teste de Conexão Redis Upstash
 * Execute: npm run test:redis
 */

import dotenv from 'dotenv';

// Carregar .env ANTES de importar redis
dotenv.config();

import redis from './src/lib/redis';

async function testRedis() {
  console.log('\n🧪 TESTE DE CONEXÃO REDIS UPSTASH\n');
  console.log('='.repeat(60));

  try {
    // 1. Teste PING
    console.log('\n📡 Teste 1: PING');
    const pong = await redis.ping();
    console.log(`   ✅ Resposta: ${pong}`);

    // 2. Teste SET/GET
    console.log('\n💾 Teste 2: SET/GET');
    await redis.set('sge:teste', 'Redis funcionando!');
    const valor = await redis.get('sge:teste');
    console.log(`   ✅ Valor recuperado: ${valor}`);

    // 3. Teste SETEX (com expiração)
    console.log('\n⏱️  Teste 3: SETEX (expiração)');
    await redis.setex('sge:teste:temp', 10, 'expira em 10s');
    const temp = await redis.get('sge:teste:temp');
    console.log(`   ✅ Valor temporário: ${temp}`);
    const ttl = await redis.ttl('sge:teste:temp');
    console.log(`   ⏰ TTL: ${ttl} segundos`);

    // 4. Teste JSON (objeto complexo)
    console.log('\n📦 Teste 4: JSON (objeto complexo)');
    const dadosComplexos = {
      nome: 'Sistema de Gestão Escolar',
      versao: '1.0.0',
      funcionalidades: ['alunos', 'professores', 'turmas'],
      ativo: true,
      timestamp: new Date().toISOString()
    };
    await redis.set('sge:config', JSON.stringify(dadosComplexos));
    const configStr = await redis.get('sge:config');
    const config = JSON.parse(configStr!);
    console.log('   ✅ Objeto recuperado:', config);

    // 5. Teste HASH (dados estruturados)
    console.log('\n🗂️  Teste 5: HASH (dados estruturados)');
    await redis.hset('sge:aluno:123', {
      nome: 'João Silva',
      turma: '9A',
      matricula: '2024001'
    });
    const aluno = await redis.hgetall('sge:aluno:123');
    console.log('   ✅ Aluno recuperado:', aluno);

    // 6. Teste LIST (fila)
    console.log('\n📋 Teste 6: LIST (fila de notificações)');
    await redis.lpush('sge:notificacoes', 'Notificação 1', 'Notificação 2');
    const notif = await redis.rpop('sge:notificacoes');
    console.log(`   ✅ Notificação processada: ${notif}`);

    // 7. Teste SET (conjunto único)
    console.log('\n🎯 Teste 7: SET (usuários online)');
    await redis.sadd('sge:online', 'usuario1', 'usuario2', 'usuario3');
    const online = await redis.smembers('sge:online');
    console.log(`   ✅ Usuários online: ${online.join(', ')}`);

    // 8. Teste SORTED SET (ranking)
    console.log('\n🏆 Teste 8: SORTED SET (ranking de pontos)');
    await redis.zadd('sge:ranking', 100, 'aluno1', 85, 'aluno2', 95, 'aluno3');
    const top = await redis.zrevrange('sge:ranking', 0, 2, 'WITHSCORES');
    console.log('   ✅ Top 3 ranking:', top);

    // 9. Teste INCR (contador)
    console.log('\n🔢 Teste 9: INCR (contador de acessos)');
    await redis.set('sge:acessos', '0');
    await redis.incr('sge:acessos');
    await redis.incr('sge:acessos');
    await redis.incr('sge:acessos');
    const acessos = await redis.get('sge:acessos');
    console.log(`   ✅ Total de acessos: ${acessos}`);

    // 10. Informações do servidor
    console.log('\n📊 Teste 10: Informações do Servidor');
    const info = await redis.info();
    const lines = info.split('\n');
    const serverInfo = lines.find(l => l.startsWith('redis_version:'));
    const memory = lines.find(l => l.startsWith('used_memory_human:'));
    const connected = lines.find(l => l.startsWith('connected_clients:'));
    console.log(`   ✅ ${serverInfo}`);
    console.log(`   ✅ ${memory}`);
    console.log(`   ✅ ${connected}`);

    // Limpar dados de teste
    console.log('\n🧹 Limpando dados de teste...');
    await redis.del(
      'sge:teste',
      'sge:teste:temp',
      'sge:config',
      'sge:aluno:123',
      'sge:notificacoes',
      'sge:online',
      'sge:ranking',
      'sge:acessos'
    );
    console.log('   ✅ Dados de teste removidos');

    console.log('\n' + '='.repeat(60));
    console.log('\n✨ TODOS OS TESTES PASSARAM COM SUCESSO! ✨\n');
    console.log('🎉 Redis Upstash está 100% funcional!\n');
    console.log('📱 Pronto para usar no celular e notebook\n');

  } catch (error: any) {
    console.error('\n❌ ERRO NO TESTE:\n');
    console.error(error.message);
    console.error('\n📝 Verifique:');
    console.error('   1. UPSTASH_REDIS_URL no .env está correto');
    console.error('   2. URL completa: rediss://default:senha@host:port');
    console.error('   3. Conexão TLS está funcionando');
    console.error('   4. Upstash Console mostra database ativo\n');
    process.exit(1);
  } finally {
    // Fechar conexão
    await redis.quit();
    process.exit(0);
  }
}

// Executar testes
testRedis();
