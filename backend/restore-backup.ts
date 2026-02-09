/// <reference types="node" />

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execPromise = promisify(exec);

async function main() {
  console.log('♻️  Restaurando backup do banco de dados...\n');
  
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
    
    // Verificar se existe backup
    const backupDir = path.join(__dirname, 'backups');
    const lastBackupFile = path.join(backupDir, 'last-backup.txt');
    
    if (!fs.existsSync(lastBackupFile)) {
      console.error('❌ Nenhum backup encontrado!');
      console.log('💡 Execute primeiro: npm run backup:db\n');
      process.exit(1);
    }
    
    const backupFile = fs.readFileSync(lastBackupFile, 'utf-8').trim();
    
    if (!fs.existsSync(backupFile)) {
      console.error('❌ Arquivo de backup não encontrado:', backupFile);
      process.exit(1);
    }
    
    const stats = fs.statSync(backupFile);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log('📊 Informações do backup:');
    console.log(`   - Arquivo: ${path.basename(backupFile)}`);
    console.log(`   - Tamanho: ${fileSizeMB} MB`);
    console.log(`   - Database: ${database}\n`);
    
    console.log('⚠️  ATENÇÃO: Todos os dados atuais serão substituídos!');
    console.log('⏳ Aguarde 3 segundos para cancelar (Ctrl+C)...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Configurar variável de ambiente para senha
    process.env.PGPASSWORD = password;
    
    // Primeiro, dropar e recriar o banco
    console.log('\n🗑️  Limpando banco atual...');
    const dropCommand = `psql -h ${host} -p ${port} -U ${username} -d postgres -c "DROP DATABASE IF EXISTS ${database};"`;
    const createCommand = `psql -h ${host} -p ${port} -U ${username} -d postgres -c "CREATE DATABASE ${database};"`;
    
    try {
      await execPromise(dropCommand);
      await execPromise(createCommand);
    } catch (error: any) {
      console.warn('⚠️  Não foi possível recriar o banco, tentando restaurar diretamente...');
    }
    
    // Restaurar o backup
    console.log('⏳ Restaurando backup...');
    const restoreCommand = `psql -h ${host} -p ${port} -U ${username} -d ${database} -f "${backupFile}"`;
    
    await execPromise(restoreCommand);
    
    console.log('\n✅ Backup restaurado com sucesso!');
    console.log('📊 Banco de dados retornou ao estado do backup.\n');
    
  } catch (error: any) {
    console.error('❌ Erro ao restaurar backup:', error.message);
    process.exit(1);
  }
}

main();
