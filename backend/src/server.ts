import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.routes';
import { alunosRouter } from './routes/alunos.routes';
import { professoresRouter } from './routes/professores.routes';
import { turmasRouter } from './routes/turmas.routes';
import { disciplinasRouter } from './routes/disciplinas.routes';
import { disciplinaTurmaRouter } from './routes/disciplinaTurma.routes';
import { notasRouter } from './routes/notas.routes';
import { frequenciasRouter } from './routes/frequencias.routes';
import { configuracoesRouter } from './routes/configuracoes.routes';
import { equipeDiretivaRouter } from './routes/equipeDiretiva.routes';
import { funcionariosRouter } from './routes/funcionarios.routes';
import { calendarioRouter } from './routes/calendario.routes';
import { gradeHorariaRouter } from './routes/grade-horaria.routes';
import { frequenciaRouter } from './routes/frequencia.routes';
import { pontoRouter } from './routes/ponto.routes';
import reconhecimentoFacialRouter from './routes/reconhecimento-facial.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://192.168.5.25:5173', 'http://192.168.5.25:5174']
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
app.use('/api/disciplinas-turmas', disciplinaTurmaRouter);
app.use('/api/notas', notasRouter);
app.use('/api/frequencias', frequenciasRouter);
app.use('/api/configuracoes', configuracoesRouter);
app.use('/api/equipe-diretiva', equipeDiretivaRouter);
app.use('/api/funcionarios', funcionariosRouter);
app.use('/api/calendario', calendarioRouter);
app.use('/api/grade-horaria', gradeHorariaRouter);
app.use('/api/registro-frequencia', frequenciaRouter);
app.use('/api/ponto', pontoRouter);
app.use('/api/reconhecimento-facial', reconhecimentoFacialRouter);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Acesse de outros dispositivos: http://192.168.5.25:${PORT}`);
});
