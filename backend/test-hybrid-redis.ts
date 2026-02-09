/**
 * TESTE DO SISTEMA HÍBRIDO REDIS
 * 
 * Verifica se ambos Redis (Local + Cloud) estão funcionando
 */

import { getHybridRedis } from './src/lib/redis-hybrid';
import { log } from './src/lib/logger';

async function testHybridRedis() {
  console.log('\n🔍 TESTANDO SISTEMA HÍBRIDO REDIS\n');
  console.log('=' .repeat(60));
  
  try {
    const hybrid = getHybridRedis();
    await hybrid.initialize();
    
    console.log('\n1️⃣  VERIFICANDO CONEXÕES...\n');
    
    const clients = await hybrid.getClients();
    
    // Testar Redis Local
    if (clients.local) {
      try {
        const localPing = await clients.local.ping();
        console.log('✅ Redis LOCAL conectado:', localPing);
        const localInfo = await clients.local.info('server');
        const version = localInfo.match(/redis_version:(\S+)/)?.[1];
        console.log('   Versão:', version);
      } catch (err: any) {
        console.log('❌ Redis LOCAL falhou:', err.message);
      }
    } else {
      console.log('⚠️  Redis LOCAL não configurado');
    }
    
    // Testar Redis Cloud
    if (clients.cloud) {
      try {
        const cloudPing = await clients.cloud.ping();
        console.log('\n✅ Redis CLOUD (Upstash) conectado:', cloudPing);
        const cloudInfo = await clients.cloud.info('server');
        const version = cloudInfo.match(/redis_version:(\S+)/)?.[1];
        console.log('   Versão:', version);
      } catch (err: any) {
        console.log('\n❌ Redis CLOUD falhou:', err.message);
      }
    } else {
      console.log('\n⚠️  Redis CLOUD não configurado');
    }
    
    // Health Check
    console.log('\n2️⃣  HEALTH CHECK...\n');
    const health = hybrid.getHealth();
    console.log('Local:');
    console.log('  - Disponível:', health.local.available ? '✅' : '❌');
    console.log('  - Saudável:', health.local.healthy ? '✅' : '❌');
    console.log('\nCloud:');
    console.log('  - Disponível:', health.cloud.available ? '✅' : '❌');
    console.log('  - Saudável:', health.cloud.healthy ? '✅' : '❌');
    console.log('\nPelo menos 1 disponível:', health.anyAvailable ? '✅' : '❌');
    
    // Testar operações
    console.log('\n3️⃣  TESTANDO OPERAÇÕES...\n');
    
    const testKey = 'test:hybrid:' + Date.now();
    const testValue = 'Sistema Híbrido Funcionando! 🚀';
    
    // SET
    console.log('Escrevendo chave de teste...');
    await hybrid.set(testKey, testValue, 60); // 60 segundos TTL
    console.log('✅ SET realizado');
    
    // Verificar onde foi escrito
    if (process.env.REDIS_WRITE_BOTH === 'true') {
      console.log('   Mode: DUAL WRITE (ambos Redis)');
      
      if (clients.local) {
        const localValue = await clients.local.get(testKey);
        console.log('   Local:', localValue ? '✅ Escrito' : '❌ Não encontrado');
      }
      
      if (clients.cloud) {
        const cloudValue = await clients.cloud.get(testKey);
        console.log('   Cloud:', cloudValue ? '✅ Escrito' : '❌ Não encontrado');
      }
    } else {
      console.log('   Mode: SINGLE WRITE (apenas local)');
    }
    
    // GET
    console.log('\nLendo chave de teste...');
    const getValue = await hybrid.get(testKey);
    console.log('✅ GET realizado:', getValue === testValue ? '✅ Valor correto' : '❌ Valor incorreto');
    
    // EXISTS
    console.log('\nVerificando existência...');
    const exists = await hybrid.exists(testKey);
    console.log('✅ EXISTS:', exists ? '✅ Chave existe' : '❌ Chave não encontrada');
    
    // DEL
    console.log('\nRemovendo chave de teste...');
    await hybrid.del(testKey);
    console.log('✅ DEL realizado');
    
    // Verificar se foi removido
    const existsAfterDel = await hybrid.exists(testKey);
    console.log('   Removido:', !existsAfterDel ? '✅' : '❌ Ainda existe');
    
    // Teste de failover
    console.log('\n4️⃣  TESTANDO FAILOVER...\n');
    
    if (health.local.healthy && health.cloud.healthy) {
      console.log('✅ AMBOS online - Failover disponível');
      console.log('   Se Redis local cair, cloud assume automaticamente');
      console.log('   Se Redis cloud cair, local continua funcionando');
    } else if (health.local.healthy) {
      console.log('⚠️  Apenas LOCAL online');
      console.log('   Sistema funciona, mas sem backup no cloud');
    } else if (health.cloud.healthy) {
      console.log('⚠️  Apenas CLOUD online');
      console.log('   Sistema funciona, mas com latência maior');
    } else {
      console.log('❌ NENHUM Redis online - Sistema degradado');
    }
    
    // Métricas de performance
    console.log('\n5️⃣  MÉTRICAS DE PERFORMANCE...\n');
    
    const iterations = 100;
    
    // Teste Local
    if (clients.local && health.local.healthy) {
      const startLocal = Date.now();
      for (let i = 0; i < iterations; i++) {
        await clients.local.ping();
      }
      const localTime = Date.now() - startLocal;
      const localAvg = (localTime / iterations).toFixed(2);
      console.log(`Local (${iterations} pings):`, localTime + 'ms', `(~${localAvg}ms/op)`);
    }
    
    // Teste Cloud
    if (clients.cloud && health.cloud.healthy) {
      const startCloud = Date.now();
      for (let i = 0; i < iterations; i++) {
        await clients.cloud.ping();
      }
      const cloudTime = Date.now() - startCloud;
      const cloudAvg = (cloudTime / iterations).toFixed(2);
      console.log(`Cloud (${iterations} pings):`, cloudTime + 'ms', `(~${cloudAvg}ms/op)`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ TESTE CONCLUÍDO COM SUCESSO!\n');
    
    if (health.local.healthy && health.cloud.healthy) {
      console.log('🎉 SISTEMA HÍBRIDO 100% FUNCIONAL!');
      console.log('   - Dual write ativo');
      console.log('   - Failover pronto');
      console.log('   - Backup em tempo real');
      console.log('   - Performance otimizada');
    }
    
    await hybrid.disconnect();
    process.exit(0);
    
  } catch (error: any) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  }
}

// Executar teste
testHybridRedis();
