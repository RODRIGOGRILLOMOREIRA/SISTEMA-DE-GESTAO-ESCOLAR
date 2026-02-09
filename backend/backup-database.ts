/// <reference types="node" />

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execPromise = promisify(exec);

async function main() {
  console.log('💾 Iniciando backup do banco de dados...\n');
  
  try {
    // Obter credenciais do .env
    const DATABASE_URL = process.env.DATABASE_URL;
    
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL não encontrada no arquivo .env');
    }
    
    // Parse da URL do banco
    const dbUrl = new URL(DATABASE_URL);
    const username = dbUrl.username;
    const password = dbUrl.password;
    const host = dbUrl.hostname;
    const port = dbUrl.port || '5432';
    const database = dbUrl.pathname.slice(1);
    
    // Criar diretório de backups se não existir
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Nome do arquivo de backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const backupFile = path.join(backupDir, `backup_${timestamp}.sql`);
    
    console.log('📊 Informações do backup:');
    console.log(`   - Host: ${host}`);
    console.log(`   - Porta: ${port}`);
    console.log(`   - Database: ${database}`);
    console.log(`   - Arquivo: ${backupFile}\n`);
    
    // Configurar variável de ambiente para senha
    process.env.PGPASSWORD = password;
    
    // Comando pg_dump
    const command = `pg_dump -h ${host} -p ${port} -U ${username} -d ${database} -F p -f "${backupFile}"`;
    
    console.log('⏳ Executando backup...');
    await execPromise(command);
    
    // Verificar se o arquivo foi criado
    if (fs.existsSync(backupFile)) {
      const stats = fs.statSync(backupFile);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      
      console.log('\n✅ Backup concluído com sucesso!');
      console.log(`📁 Arquivo: ${backupFile}`);
      console.log(`💾 Tamanho: ${fileSizeMB} MB\n`);
      
      // Salvar referência do último backup
      const lastBackupFile = path.join(backupDir, 'last-backup.txt');
      fs.writeFileSync(lastBackupFile, backupFile);
      
    } else {
      throw new Error('Arquivo de backup não foi criado');
    }
    
  } catch (error: any) {
    console.error('❌ Erro ao criar backup:', error.message);
    process.exit(1);
  }
}

main();
