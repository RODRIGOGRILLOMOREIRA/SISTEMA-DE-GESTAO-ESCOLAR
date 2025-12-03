import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.routes';
import { alunosRouter } from './routes/alunos.routes';
import { professoresRouter } from './routes/professores.routes';
import { turmasRouter } from './routes/turmas.routes';
import { disciplinasRouter } from './routes/disciplinas.routes';
import { notasRouter } from './routes/notas.routes';
import { frequenciasRouter } from './routes/frequencias.routes';
import { configuracoesRouter } from './routes/configuracoes.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
// Aumentar limite para aceitar imagens em base64
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'API Sistema de Gestão Escolar' });
});

app.use('/api/auth', authRouter);
app.use('/api/alunos', alunosRouter);
app.use('/api/professores', professoresRouter);
app.use('/api/turmas', turmasRouter);
app.use('/api/disciplinas', disciplinasRouter);
app.use('/api/notas', notasRouter);
app.use('/api/frequencias', frequenciasRouter);
app.use('/api/configuracoes', configuracoesRouter);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
