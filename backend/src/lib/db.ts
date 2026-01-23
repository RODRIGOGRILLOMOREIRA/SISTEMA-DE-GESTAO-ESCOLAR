import { Pool } from 'pg';

// Conexão direta ao PostgreSQL (alternativa ao Prisma quando necessário)
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'sge_user',
  password: process.env.POSTGRES_PASSWORD || 'sge_password',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'sge_db',
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Log de conexão
pool.on('connect', () => {
  console.log('✅ Pool PostgreSQL conectado');
});

pool.on('error', (err: Error) => {
  console.error('❌ Erro no pool PostgreSQL:', err);
});

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  
  async getUsers() {
    const result = await pool.query('SELECT * FROM usuarios');
    return result.rows;
  },
  
  async getUser(id: string) {
    const result = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    return result.rows[0];
  },
  
  async createNotification(data: {
    usuarioId: string;
    titulo: string;
    mensagem: string;
    tipo?: string;
  }) {
    const result = await pool.query(
      `INSERT INTO notificacoes (id, "usuarioId", titulo, mensagem, tipo, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [data.usuarioId, data.titulo, data.mensagem, data.tipo || 'INFO']
    );
    return result.rows[0];
  },
  
  async getNotifications(usuarioId: string) {
    const result = await pool.query(
      'SELECT * FROM notificacoes WHERE "usuarioId" = $1 ORDER BY "createdAt" DESC',
      [usuarioId]
    );
    return result.rows;
  },
  
  async markNotificationAsRead(id: string) {
    const result = await pool.query(
      `UPDATE notificacoes SET lida = true, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  },

  // Adicionar método para pool direto quando necessário
  getPool: () => pool,
};

export default db;
