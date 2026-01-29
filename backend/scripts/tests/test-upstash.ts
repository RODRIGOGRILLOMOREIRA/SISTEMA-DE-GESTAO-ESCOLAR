import Redis from 'ioredis';
import * as dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Testando conexão com Upstash Redis...\n');

const upstashUrl = process.env.UPSTASH_REDIS_URL;

if (!upstashUrl) {
  console.error('❌ UPSTASH_REDIS_URL não encontrado no .env');
  process.exit(1);
}

console.log('📋 Configuração:');
console.log('   URL:', upstashUrl.replace(/:[^:]*@/, ':****@')); // Esconde senha
console.log('');

const url = new URL(upstashUrl);

const redis = new Redis({
  host: url.hostname,
  port: parseInt(url.port) || 6379,
  password: url.password || '',
  username: url.username || 'default',
  tls: upstashUrl.startsWith('rediss://') ? {
    rejectUnauthorized: false,
  } : undefined,
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    if (times > 3) return null;
    return Math.min(times * 50, 2000);
  },
  connectTimeout: 10000,
  commandTimeout: 5000,
  lazyConnect: false,
  enableOfflineQueue: true,
});

redis.on('connect', () => {
  console.log('🔄 Conectando ao Redis...');
});

redis.on('ready', () => {
  console.log('✅ Conexão estabelecida!\n');
  testCommands();
});

redis.on('error', (err) => {
  console.error('❌ Erro:', err.message);
  console.log('\n📝 Dicas:');
  console.log('   1. Verifique se a URL está correta no .env');
  console.log('   2. URL deve começar com rediss:// (com dois "s")');
  console.log('   3. Porta padrão Upstash: 6379');
  console.log('   4. Verifique sua conexão com internet');
  process.exit(1);
});

async function testCommands() {
  try {
    console.log('🧪 Executando testes...\n');
    
    // Teste 1: PING
    console.log('1️⃣ Teste PING...');
    const pong = await redis.ping();
    console.log('   Resposta:', pong);
    
    // Teste 2: SET
    console.log('\n2️⃣ Teste SET...');
    await redis.set('teste:conexao', 'funcionando', 'EX', 60);
    console.log('   Chave "teste:conexao" criada');
    
    // Teste 3: GET
    console.log('\n3️⃣ Teste GET...');
    const valor = await redis.get('teste:conexao');
    console.log('   Valor:', valor);
    
    // Teste 4: INFO
    console.log('\n4️⃣ Informações do servidor...');
    const info = await redis.info('server');
    const version = info.match(/redis_version:([^\r\n]+)/)?.[1];
    console.log('   Redis version:', version);
    
    console.log('\n✅ Todos os testes passaram!');
    console.log('🎉 Upstash Redis está funcionando perfeitamente!\n');
    
    await redis.quit();
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Erro nos testes:', error.message);
    process.exit(1);
  }
}

// Timeout de segurança
setTimeout(() => {
  console.error('\n⏰ Timeout: Conexão demorou mais de 30 segundos');
  process.exit(1);
}, 30000);
